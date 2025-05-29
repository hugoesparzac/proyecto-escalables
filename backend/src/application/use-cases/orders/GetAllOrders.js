/**
 * Caso de uso para obtener todas las órdenes (admin)
 */
class GetAllOrders {
    constructor(orderRepository, userRepository) {
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
    }

    async execute(filters = {}, options = {}) {
        try {
            // Obtener las órdenes según los filtros y opciones
            const { data: orders, pagination } = await this.orderRepository.findByFilters(filters, options);

            // Obtener información detallada de los usuarios
            const enrichedOrders = await Promise.all(orders.map(async order => {
                try {
                    const user = await this.userRepository.findById(order.id_usuario);

                    // Transformar la orden al formato esperado por el frontend
                    return {
                        _id: order._id || order.id,
                        numero_orden: order.numero_orden || `ORD-${String(order.id_orden || order._id || Date.now()).slice(-8)}`,
                        id_usuario: order.id_usuario,
                        usuario: user ? {
                            nombre: user.nombre,
                            correo: user.email
                        } : {
                            nombre: 'Usuario no encontrado',
                            correo: 'N/A'
                        },
                        items: Array.isArray(order.productos) ? order.productos.map(item => ({
                            id_producto: item.id_producto,
                            nombre_producto: item.nombre_producto,
                            cantidad: item.cantidad,
                            precio_unitario: item.precio_unitario,
                            subtotal: item.subtotal || (item.precio_unitario * item.cantidad)
                        })) : [],
                        total: order.precio_total || order.total ||
                              (Array.isArray(order.productos) ?
                                order.productos.reduce((sum, item) =>
                                  sum + (item.subtotal || (item.precio_unitario * item.cantidad)), 0) : 0),
                        estado: order.estado,
                        fecha_pedido: order.fecha_pedido || order.createdAt,
                        fecha_entrega: order.fecha_entrega || order.fecha_entregado,
                        notas: order.notas
                    };
                } catch (error) {
                    console.error(`Error al obtener usuario para orden ${order._id || order.id}:`, error);
                    return {
                        _id: order._id || order.id,
                        numero_orden: order.numero_orden || `ORD-${String(order.id_orden || order._id || Date.now()).slice(-8)}`,
                        id_usuario: order.id_usuario,
                        usuario: {
                            nombre: 'Error al cargar usuario',
                            correo: 'N/A'
                        },
                        items: Array.isArray(order.productos) ? order.productos.map(item => ({
                            id_producto: item.id_producto,
                            nombre_producto: item.nombre_producto,
                            cantidad: item.cantidad,
                            precio_unitario: item.precio_unitario,
                            subtotal: item.subtotal || (item.precio_unitario * item.cantidad)
                        })) : [],
                        total: order.precio_total || order.total ||
                              (Array.isArray(order.productos) ?
                                order.productos.reduce((sum, item) =>
                                  sum + (item.subtotal || (item.precio_unitario * item.cantidad)), 0) : 0),
                        estado: order.estado,
                        fecha_pedido: order.fecha_pedido || order.createdAt,
                        fecha_entrega: order.fecha_entrega || order.fecha_entregado,
                        notas: order.notas
                    };
                }
            }));

            return {
                orders: enrichedOrders,
                pagination
            };
        } catch (error) {
            console.error('Error en GetAllOrders.execute:', error);
            throw error;
        }
    }
}

module.exports = GetAllOrders;
