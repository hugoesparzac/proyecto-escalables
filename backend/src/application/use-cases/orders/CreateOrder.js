const Order = require('../../../infrastructure/database/models/Order');
const Cart = require('../../../infrastructure/database/models/Cart');
const Product = require('../../../infrastructure/database/models/Product');

class CreateOrder {
    async execute(userId) {
        // Buscar carrito del usuario
        const cart = await Cart.findOne({ id_usuario: userId }).populate('items.id_producto');
        if (!cart || cart.items.length === 0) {
            throw new Error('El carrito está vacío');
        }

        // Verificar stock de todos los productos
        const outOfStockProducts = [];
        for (const item of cart.items) {
            const product = await Product.findById(item.id_producto._id);
            if (!product || !product.activo) {
                outOfStockProducts.push(item.id_producto.nombre_producto);
            } else if (product.cantidad_stock < item.cantidad) {
                outOfStockProducts.push(`${product.nombre_producto} (stock: ${product.cantidad_stock})`);
            }
        }

        if (outOfStockProducts.length > 0) {
            throw new Error(`Productos sin stock disponible: ${outOfStockProducts.join(', ')}`);
        }

        // Crear la orden
        const orderData = {
            id_usuario: userId,
            estado: 'pagado', // Se marca como pagado después del pago exitoso
            productos: cart.items.map(item => ({
                id_producto: item.id_producto._id,
                nombre_producto: item.id_producto.nombre_producto,
                cantidad: item.cantidad,
                precio_unitario: item.precio_unitario,
                subtotal: item.cantidad * item.precio_unitario
            })),
            precio_total: cart.total,
            fecha_pago: null, // Se establecerá cuando se procese el pago
            metodo_pago: 'stripe'
        };

        const order = new Order(orderData);
        await order.save();

        return {
            order: await Order.findById(order._id),
            message: 'Orden creada exitosamente, proceder al pago'
        };
    }

    // Crear orden desde productos específicos (no desde carrito)
    async createFromProducts(userId, products) {
        // Validar productos
        if (!products || products.length === 0) {
            throw new Error('Debe especificar al menos un producto');
        }

        const orderProducts = [];
        let totalPrice = 0;

        for (const productData of products) {
            const { id_producto, cantidad } = productData;
            
            const product = await Product.findOne({ _id: id_producto, activo: true });
            if (!product) {
                throw new Error(`Producto ${id_producto} no encontrado o no disponible`);
            }

            if (product.cantidad_stock < cantidad) {
                throw new Error(`Stock insuficiente para ${product.nombre_producto}`);
            }

            const subtotal = product.precio * cantidad;
            totalPrice += subtotal;

            orderProducts.push({
                id_producto: product._id,
                nombre_producto: product.nombre_producto,
                cantidad,
                precio_unitario: product.precio,
                subtotal
            });
        }

        // Crear la orden
        const order = new Order({
            id_usuario: userId,
            estado: 'pagado',
            productos: orderProducts,
            precio_total: totalPrice,
            fecha_pago: null,
            metodo_pago: 'stripe'
        });

        await order.save();

        return {
            order: await Order.findById(order._id),
            message: 'Orden creada exitosamente, proceder al pago'
        };
    }
}

module.exports = CreateOrder;