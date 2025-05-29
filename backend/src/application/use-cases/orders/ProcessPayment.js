const Order = require('../../../infrastructure/database/models/Order');
const Product = require('../../../infrastructure/database/models/Product');
const Cart = require('../../../infrastructure/database/models/Cart');
const PaymentService = require('../../../domain/services/PaymentService');
const CreateNotification = require('../notifications/CreateNotification');

class ProcessPayment {
    constructor() {
        this.paymentService = new PaymentService();
        this.createNotification = new CreateNotification();
    }

    async execute(orderId, paymentData) {
        const { paymentMethodId, returnUrl } = paymentData;

        // Buscar la orden
        const order = await Order.findById(orderId);
        if (!order) {
            throw new Error('Orden no encontrada');
        }

        // Verificar que la orden no haya sido pagada ya
        if (order.fecha_pago) {
            throw new Error('Esta orden ya ha sido pagada');
        }

        try {
            // Procesar pago con Stripe
            const paymentResult = await this.paymentService.processPayment({
                amount: Math.round(order.precio_total * 100), // Stripe usa centavos
                currency: 'usd',
                paymentMethodId,
                orderId: order._id.toString(),
                returnUrl
            });

            // Si el pago fue exitoso
            if (paymentResult.status === 'succeeded') {
                // Actualizar orden
                order.estado = 'pagado';
                order.fecha_pago = new Date();
                order.stripe_payment_id = paymentResult.paymentIntentId;
                await order.save();

                // Reducir stock de productos
                await this.updateProductStock(order.productos);

                // Limpiar carrito del usuario
                await Cart.findOneAndUpdate(
                    { id_usuario: order.id_usuario },
                    { items: [], total: 0 }
                );

                // Crear notificación de pago exitoso
                await this.createNotification.createOrderPaidNotification(
                    order.id_usuario,
                    order._id.toString(),
                    order.precio_total
                );

                return {
                    order: await Order.findById(order._id),
                    payment: paymentResult,
                    message: 'Pago procesado exitosamente'
                };
            } else if (paymentResult.status === 'requires_action') {
                // Pago requiere autenticación adicional (3D Secure)
                return {
                    requiresAction: true,
                    clientSecret: paymentResult.clientSecret,
                    message: 'Se requiere autenticación adicional'
                };
            } else {
                throw new Error('Error procesando el pago');
            }

        } catch (error) {
            console.error('Error procesando pago:', error);
            throw new Error(`Error procesando el pago: ${error.message}`);
        }
    }

    async updateProductStock(productos) {
        for (const item of productos) {
            await Product.findByIdAndUpdate(
                item.id_producto,
                { $inc: { cantidad_stock: -item.cantidad } }
            );
        }
    }

    // Confirmar pago cuando requiere autenticación adicional
    async confirmPayment(paymentIntentId) {
        try {
            const paymentResult = await this.paymentService.confirmPayment(paymentIntentId);

            if (paymentResult.status === 'succeeded') {
                // Buscar orden por payment intent
                const order = await Order.findOne({ stripe_payment_id: paymentIntentId });
                if (order) {
                    order.estado = 'pagado';
                    order.fecha_pago = new Date();
                    await order.save();

                    // Reducir stock y limpiar carrito
                    await this.updateProductStock(order.productos);
                    await Cart.findOneAndUpdate(
                        { id_usuario: order.id_usuario },
                        { items: [], total: 0 }
                    );

                    // Crear notificación
                    await this.createNotification.createOrderPaidNotification(
                        order.id_usuario,
                        order._id.toString(),
                        order.precio_total
                    );
                }

                return {
                    order,
                    payment: paymentResult,
                    message: 'Pago confirmado exitosamente'
                };
            } else {
                throw new Error('Falló la confirmación del pago');
            }

        } catch (error) {
            console.error('Error confirmando pago:', error);
            throw new Error(`Error confirmando el pago: ${error.message}`);
        }
    }
}

module.exports = ProcessPayment;