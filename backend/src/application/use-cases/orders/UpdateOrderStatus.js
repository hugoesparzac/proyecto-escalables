const Order = require('../../../infrastructure/database/models/Order');
const CreateNotification = require('../notifications/CreateNotification');

class UpdateOrderStatus {
    constructor() {
        this.createNotification = new CreateNotification();
    }

    async execute(orderId, newStatus, adminUserId) {
        // Validar estados permitidos
        const validStatuses = ['pagado', 'realizando', 'entregado'];
        if (!validStatuses.includes(newStatus)) {
            throw new Error('Estado de orden inválido');
        }

        // Buscar la orden
        const order = await Order.findById(orderId);
        if (!order) {
            throw new Error('Orden no encontrada');
        }

        // Validar transiciones de estado
        const currentStatus = order.estado;
        if (!this.isValidStatusTransition(currentStatus, newStatus)) {
            throw new Error(`No se puede cambiar de ${currentStatus} a ${newStatus}`);
        }

        // Actualizar estado y fechas correspondientes
        order.estado = newStatus;
        
        switch (newStatus) {
            case 'realizando':
                if (!order.fecha_preparacion) {
                    order.fecha_preparacion = new Date();
                }
                break;
            case 'entregado':
                if (!order.fecha_entrega) {
                    order.fecha_entrega = new Date();
                }
                break;
        }

        await order.save();

        // Crear notificación correspondiente
        await this.createStatusNotification(order, newStatus);

        return {
            order: await Order.findById(order._id),
            message: `Orden actualizada a estado: ${newStatus}`
        };
    }

    isValidStatusTransition(currentStatus, newStatus) {
        const transitions = {
            'pagado': ['realizando'],
            'realizando': ['entregado'],
            'entregado': [] // Estado final
        };

        return transitions[currentStatus]?.includes(newStatus) || false;
    }

    async createStatusNotification(order, status) {
        switch (status) {
            case 'realizando':
                await this.createNotification.createOrderInProgressNotification(
                    order.id_usuario,
                    order._id.toString()
                );
                break;
            case 'entregado':
                await this.createNotification.createOrderReadyNotification(
                    order.id_usuario,
                    order._id.toString()
                );
                break;
        }
    }

    // Método para que los administradores actualicen múltiples órdenes
    async updateMultipleOrders(orderIds, newStatus, adminUserId) {
        const results = [];
        
        for (const orderId of orderIds) {
            try {
                const result = await this.execute(orderId, newStatus, adminUserId);
                results.push({ orderId, success: true, order: result.order });
            } catch (error) {
                results.push({ orderId, success: false, error: error.message });
            }
        }

        return {
            results,
            message: `Procesadas ${results.length} órdenes`
        };
    }

    // Obtener órdenes por estado (para administradores)
    async getOrdersByStatus(status) {
        const validStatuses = ['pagado', 'realizando', 'entregado'];
        if (!validStatuses.includes(status)) {
            throw new Error('Estado de orden inválido');
        }

        const orders = await Order.find({ estado: status })
            .populate('id_usuario', 'nombre correo')
            .sort({ createdAt: -1 });

        return {
            orders,
            count: orders.length,
            status
        };
    }
}

module.exports = UpdateOrderStatus;