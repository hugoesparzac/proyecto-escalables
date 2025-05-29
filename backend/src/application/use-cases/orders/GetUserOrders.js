const Order = require('../../../domain/entities/Order');

class GetUserOrders {
    constructor(orderRepository, productRepository) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
    }

    async execute(userId, options = {}) {
        try {
            // Validar entrada
            if (!userId) {
                throw new Error('ID de usuario es requerido');
            }

            const {
                page = 1,
                limit = 10,
                estado = null, // 'pagado', 'realizando', 'entregado'
                fechaDesde = null,
                fechaHasta = null,
                includeProducts = true
            } = options;

            // Construir filtros
            const filters = { id_usuario: userId };
            
            if (estado) {
                filters.estado = estado;
            }

            if (fechaDesde) {
                filters.fecha_pago = { $gte: new Date(fechaDesde) };
            }

            if (fechaHasta) {
                if (filters.fecha_pago) {
                    filters.fecha_pago.$lte = new Date(fechaHasta);
                } else {
                    filters.fecha_pago = { $lte: new Date(fechaHasta) };
                }
            }

            // Obtener órdenes con paginación
            const orders = await this.orderRepository.findByFilters(filters, {
                page: parseInt(page),
                limit: parseInt(limit),
                sortBy: 'createdAt',
                sortOrder: 'desc'
            });

            // Procesar cada orden
            const ordersWithDetails = await Promise.all(
                orders.data.map(async (orderData) => {
                    const order = new Order(orderData);
                    const orderJson = order.toJSON();

                    // Si se solicita, obtener información detallada de productos
                    if (includeProducts && order.productos.length > 0) {
                        try {
                            const productosDetallados = await Promise.all(
                                order.productos.map(async (item) => {
                                    try {
                                        const producto = await this.productRepository.findById(item.id_producto);
                                        return {
                                            ...item,
                                            producto_actual: producto ? {
                                                nombre_producto: producto.nombre_producto,
                                                precio_actual: producto.precio,
                                                url_imagen: producto.url_imagen,
                                                activo: producto.activo
                                            } : null,
                                            producto_disponible: !!producto && producto.activo
                                        };
                                    } catch (error) {
                                        console.error(`Error obteniendo detalles del producto ${item.id_producto}:`, error);
                                        return {
                                            ...item,
                                            producto_actual: null,
                                            producto_disponible: false
                                        };
                                    }
                                })
                            );

                            orderJson.productos = productosDetallados;
                        } catch (error) {
                            console.error(`Error obteniendo detalles de productos para orden ${order.id_orden}:`, error);
                        }
                    }

                    // Agregar información adicional
                    orderJson.timeAgo = this.getTimeAgo(order.createdAt);
                    orderJson.canCancel = this.canCancelOrder(order);
                    orderJson.canReorder = this.canReorderOrder(order);

                    return orderJson;
                })
            );

            // Obtener estadísticas del usuario
            const stats = await this.getUserOrderStats(userId);

            return {
                orders: ordersWithDetails,
                pagination: {
                    total: orders.total,
                    page: orders.page,
                    totalPages: orders.totalPages,
                    hasNext: orders.hasNext,
                    hasPrev: orders.hasPrev,
                    limit: orders.limit
                },
                stats
            };

        } catch (error) {
            throw error;
        }
    }

    async getUserOrderStats(userId) {
        try {
            const [totalOrders, pendingOrders, completedOrders, totalSpent] = await Promise.all([
                this.orderRepository.countByUserId(userId),
                this.orderRepository.countByUserIdAndStatus(userId, ['pagado', 'realizando']),
                this.orderRepository.countByUserIdAndStatus(userId, ['entregado']),
                this.orderRepository.getTotalSpentByUserId(userId)
            ]);

            return {
                totalOrders,
                pendingOrders,
                completedOrders,
                totalSpent: totalSpent || 0
            };
        } catch (error) {
            console.error('Error obteniendo estadísticas de órdenes:', error);
            return {
                totalOrders: 0,
                pendingOrders: 0,
                completedOrders: 0,
                totalSpent: 0
            };
        }
    }

    canCancelOrder(order) {
        // Solo se pueden cancelar órdenes que están pagadas pero no han comenzado a prepararse
        return order.estado === 'pagado' && !order.fecha_preparacion;
    }

    canReorderOrder(order) {
        // Se puede reordenar cualquier orden entregada
        return order.estado === 'entregado';
    }

    getTimeAgo(date) {
        const now = new Date();
        const diffInMinutes = Math.floor((now - new Date(date)) / (1000 * 60));

        if (diffInMinutes < 1) return 'Ahora';
        if (diffInMinutes < 60) return `Hace ${diffInMinutes} minuto${diffInMinutes !== 1 ? 's' : ''}`;

        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `Hace ${diffInHours} hora${diffInHours !== 1 ? 's' : ''}`;

        const diffInDays = Math.floor(diffInHours / 24);
        return `Hace ${diffInDays} día${diffInDays !== 1 ? 's' : ''}`;
    }
}

module.exports = GetUserOrders;
