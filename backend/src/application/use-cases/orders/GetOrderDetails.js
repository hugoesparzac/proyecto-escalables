const Order = require('../../../domain/entities/Order');

class GetOrderDetails {
    constructor(orderRepository, productRepository, userRepository) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    async execute(orderId, userId, isAdmin = false) {
        try {
            // Validar entrada
            if (!orderId) {
                throw new Error('ID de orden es requerido');
            }

            // Obtener orden
            const orderData = await this.orderRepository.findById(orderId);
            if (!orderData) {
                throw new Error('Orden no encontrada');
            }

            const order = new Order(orderData);

            // Verificar permisos
            if (!isAdmin && !order.belongsToUser(userId)) {
                throw new Error('No tienes permisos para ver esta orden');
            }

            // Obtener información del usuario (si es admin)
            let userInfo = null;
            if (isAdmin && order.id_usuario) {
                try {
                    const user = await this.userRepository.findById(order.id_usuario);
                    if (user) {
                        userInfo = {
                            id_usuario: user.id_usuario,
                            nombre: user.nombre,
                            correo: user.correo
                        };
                    }
                } catch (error) {
                    console.error('Error obteniendo información del usuario:', error);
                }
            }

            // Obtener información detallada de cada producto
            const productosDetallados = await Promise.all(
                order.productos.map(async (item) => {
                    try {
                        const producto = await this.productRepository.findById(item.id_producto);
                        
                        return {
                            ...item,
                            producto_actual: producto ? {
                                id_producto: producto.id_producto,
                                nombre_producto: producto.nombre_producto,
                                descripcion: producto.descripcion,
                                precio_actual: producto.precio,
                                url_imagen: producto.url_imagen,
                                activo: producto.activo,
                                cantidad_stock: producto.cantidad_stock
                            } : null,
                            producto_disponible: !!producto && producto.activo,
                            cambio_precio: producto ? item.precio_unitario !== producto.precio : false
                        };
                    } catch (error) {
                        console.error(`Error obteniendo producto ${item.id_producto}:`, error);
                        return {
                            ...item,
                            producto_actual: null,
                            producto_disponible: false,
                            cambio_precio: false
                        };
                    }
                })
            );

            // Calcular tiempos de procesamiento
            const tiempos = this.calculateProcessingTimes(order);

            // Preparar respuesta
            const orderDetails = {
                ...order.toJSON(),
                productos: productosDetallados,
                usuario: userInfo,
                tiempos,
                timeline: this.createOrderTimeline(order),
                acciones_disponibles: this.getAvailableActions(order, isAdmin),
                resumen: {
                    total_productos: order.getTotalQuantity(),
                    tipos_productos: order.productos.length,
                    productos_disponibles: productosDetallados.filter(p => p.producto_disponible).length,
                    productos_no_disponibles: productosDetallados.filter(p => !p.producto_disponible).length,
                    cambios_precio: productosDetallados.filter(p => p.cambio_precio).length
                }
            };

            return orderDetails;

        } catch (error) {
            throw error;
        }
    }

    calculateProcessingTimes(order) {
        const now = new Date();
        const tiempos = {
            tiempo_total: null,
            tiempo_preparacion: null,
            tiempo_entrega: null,
            tiempo_transcurrido: null
        };

        if (order.fecha_pago) {
            tiempos.tiempo_transcurrido = Math.floor((now - new Date(order.fecha_pago)) / (1000 * 60)); // en minutos
        }

        if (order.fecha_pago && order.fecha_preparacion) {
            tiempos.tiempo_preparacion = Math.floor(
                (new Date(order.fecha_preparacion) - new Date(order.fecha_pago)) / (1000 * 60)
            );
        }

        if (order.fecha_preparacion && order.fecha_entrega) {
            tiempos.tiempo_entrega = Math.floor(
                (new Date(order.fecha_entrega) - new Date(order.fecha_preparacion)) / (1000 * 60)
            );
        }

        if (order.fecha_pago && order.fecha_entrega) {
            tiempos.tiempo_total = Math.floor(
                (new Date(order.fecha_entrega) - new Date(order.fecha_pago)) / (1000 * 60)
            );
        }

        return tiempos;
    }

    createOrderTimeline(order) {
        const timeline = [];

        if (order.fecha_pago) {
            timeline.push({
                estado: 'pagado',
                fecha: order.fecha_pago,
                titulo: 'Orden Pagada',
                descripcion: `Pago procesado correctamente por $${order.precio_total.toFixed(2)}`,
                completado: true
            });
        }

        if (order.fecha_preparacion) {
            timeline.push({
                estado: 'realizando',
                fecha: order.fecha_preparacion,
                titulo: 'Preparando Orden',
                descripcion: 'Tu orden está siendo preparada por nuestro equipo',
                completado: true
            });
        } else if (order.isPagado()) {
            timeline.push({
                estado: 'realizando',
                fecha: null,
                titulo: 'Preparando Orden',
                descripcion: 'Tiempo estimado: 15-20 minutos',
                completado: false
            });
        }

        if (order.fecha_entrega) {
            timeline.push({
                estado: 'entregado',
                fecha: order.fecha_entrega,
                titulo: 'Orden Lista',
                descripcion: 'Tu orden está lista para recoger',
                completado: true
            });
        } else if (order.fecha_preparacion) {
            timeline.push({
                estado: 'entregado',
                fecha: null,
                titulo: 'Lista para Recoger',
                descripcion: 'Te notificaremos cuando esté lista',
                completado: false
            });
        }

        return timeline;
    }

    getAvailableActions(order, isAdmin) {
        const actions = [];

        if (isAdmin) {
            if (order.isPagado() && !order.fecha_preparacion) {
                actions.push({
                    action: 'mark_in_progress',
                    label: 'Marcar como En Preparación',
                    description: 'Indica que la orden ha comenzado a prepararse'
                });
            }

            if (order.isRealizando() && !order.fecha_entrega) {
                actions.push({
                    action: 'mark_ready',
                    label: 'Marcar como Lista',
                    description: 'Indica que la orden está lista para recoger'
                });
            }
        } else {
            // Acciones para clientes
            if (order.isEntregado()) {
                actions.push({
                    action: 'reorder',
                    label: 'Volver a Pedir',
                    description: 'Agregar los mismos productos al carrito'
                });
            }

            if (order.isPagado() && !order.fecha_preparacion) {
                actions.push({
                    action: 'request_cancel',
                    label: 'Solicitar Cancelación',
                    description: 'Contactar soporte para cancelar la orden'
                });
            }
        }

        return actions;
    }
}

module.exports = GetOrderDetails;
