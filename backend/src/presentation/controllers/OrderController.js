const CreateOrder = require('../../application/use-cases/orders/CreateOrder');
const GetOrderDetails = require('../../application/use-cases/orders/GetOrderDetails');
const UpdateOrderStatus = require('../../application/use-cases/orders/UpdateOrderStatus');
const GetUserOrders = require('../../application/use-cases/orders/GetUserOrders');
const ProcessPayment = require('../../application/use-cases/orders/ProcessPayment');
const GetAllOrders = require('../../application/use-cases/orders/GetAllOrders');

const MongoOrderRepository = require('../../infrastructure/repositories/MongoOrderRepository');
const MongoCartRepository = require('../../infrastructure/repositories/MongoCartRepository');
const MongoProductRepository = require('../../infrastructure/repositories/MongoProductRepository');
const MongoUserRepository = require('../../infrastructure/repositories/MongoUserRepository');
const MongoNotificationRepository = require('../../infrastructure/repositories/MongoNotificationRepository');

const PaymentService = require('../../domain/services/PaymentService');
const NotificationService = require('../../domain/services/NotificationService');

class OrderController {
    constructor() {
        this.orderRepository = new MongoOrderRepository();
        this.cartRepository = new MongoCartRepository();
        this.productRepository = new MongoProductRepository();
        this.userRepository = new MongoUserRepository();
        this.notificationRepository = new MongoNotificationRepository();
        
        this.paymentService = new PaymentService();
        this.notificationService = new NotificationService();
        
        // Inicializar casos de uso
        this.createOrderUseCase = new CreateOrder(
            this.orderRepository,
            this.cartRepository, 
            this.productRepository,
            this.paymentService
        );
        this.getOrderDetailsUseCase = new GetOrderDetails(
            this.orderRepository,
            this.productRepository, 
            this.userRepository
        );
        this.updateOrderStatusUseCase = new UpdateOrderStatus(
            this.orderRepository,
            this.notificationService
        );
        this.getUserOrdersUseCase = new GetUserOrders(this.orderRepository);
        this.processPaymentUseCase = new ProcessPayment(
            this.orderRepository,
            this.paymentService, 
            this.notificationService
        );
        this.getAllOrdersUseCase = new GetAllOrders(
            this.orderRepository,
            this.userRepository
        );
    }

    // Crear nueva orden
    async createOrder(req, res, next) {
        try {
            const userId = req.user._id;
            const { metodo_pago, direccion_entrega, notas } = req.body;
            
            if (!metodo_pago) {
                return res.status(400).json({
                    success: false,
                    message: 'Método de pago es requerido'
                });
            }

            const orderData = {
                metodo_pago,
                direccion_entrega,
                notas
            };

            const result = await this.createOrderUseCase.execute(userId, orderData);

            res.status(201).json({
                success: true,
                message: 'Orden creada exitosamente',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    // Obtener detalles de una orden
    async getOrderById(req, res, next) {
        try {
            const { id } = req.params;
            const userId = req.user._id;
            const isAdmin = req.user.rol === 'admin';
            
            const result = await this.getOrderDetailsUseCase.execute(id, userId, isAdmin);

            if (!result) {
                return res.status(404).json({
                    success: false,
                    message: 'Orden no encontrada'
                });
            }
            
            res.status(200).json({
                success: true,
                message: 'Orden obtenida exitosamente',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    // Obtener órdenes del usuario
    async getUserOrders(req, res, next) {
        try {
            const userId = req.user._id;
            const {
                page = 1,
                limit = 10,
                estado,
                startDate,
                endDate,
                orderBy,
                orderDirection
            } = req.query;

            const filters = {};
            if (estado) filters.estado = estado;
            if (startDate) filters.startDate = startDate;
            if (endDate) filters.endDate = endDate;

            const options = {
                page: parseInt(page),
                limit: parseInt(limit),
                orderBy: orderBy || 'fecha_pedido',
                orderDirection: orderDirection || 'desc'
            };

            const result = await this.getUserOrdersUseCase.execute(userId, filters, options);

            res.status(200).json({
                success: true,
                message: 'Órdenes obtenidas exitosamente',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    // Procesar pago de una orden
    async processPayment(req, res, next) {
        try {
            const { id } = req.params;
            const userId = req.user._id;
            const { payment_method_id, save_payment_method = false } = req.body;
            
            if (!payment_method_id) {
                return res.status(400).json({
                    success: false,
                    message: 'Método de pago es requerido'
                });
            }

            const result = await this.processPaymentUseCase.execute(
                id,
                userId, 
                payment_method_id, 
                save_payment_method
            );
            
            res.status(200).json({
                success: true,
                message: 'Pago procesado exitosamente',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    // Actualizar estado de orden (solo admin)
    async updateOrderStatus(req, res, next) {
        try {
            const { id } = req.params;
            const { estado, notas_admin } = req.body;
            
            if (!estado) {
                return res.status(400).json({
                    success: false,
                    message: 'Estado es requerido'
                });
            }

            const result = await this.updateOrderStatusUseCase.execute(id, estado, notas_admin);

            if (!result) {
                return res.status(404).json({
                    success: false,
                    message: 'Orden no encontrada'
                });
            }
            
            res.status(200).json({
                success: true,
                message: 'Estado de orden actualizado exitosamente',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    // Actualizar estado de orden por ID de usuario (solo admin)
    async updateOrderStatusByUserId(req, res, next) {
        try {
            const { userId } = req.params;
            const { estado, notas_admin } = req.body;

            if (!estado) {
                return res.status(400).json({
                    success: false,
                    message: 'Estado es requerido'
                });
            }

            // Validar que el estado sea válido
            const validStatuses = ['pendiente', 'pagado', 'en_preparacion', 'realizando', 'listo', 'entregado', 'cancelado'];
            if (!validStatuses.includes(estado)) {
                return res.status(400).json({
                    success: false,
                    message: `Estado inválido: ${estado}. Estados válidos: ${validStatuses.join(', ')}`
                });
            }

            console.log(`Buscando órdenes del usuario con ID: ${userId} para actualizar a estado: ${estado}`);

            // Buscar órdenes del usuario
            const userOrders = await this.orderRepository.findByUserId(userId, { limit: 1 });

            if (!userOrders || !userOrders.data || userOrders.data.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: `No se encontraron órdenes para el usuario con ID: ${userId}`
                });
            }

            // Tomar la primera orden del usuario (la más reciente)
            const order = userOrders.data[0];
            console.log(`Orden encontrada: ${order.id_orden}, actualizando estado a: ${estado}`);

            // Actualizar el estado de la orden
            const result = await this.orderRepository.updateStatus(order.id_orden, estado);

            if (!result) {
                return res.status(404).json({
                    success: false,
                    message: 'Error al actualizar el estado de la orden'
                });
            }

            res.status(200).json({
                success: true,
                message: 'Estado de orden actualizado exitosamente',
                data: result
            });
        } catch (error) {
            console.error('Error en updateOrderStatusByUserId:', error);
            next(error);
        }
    }

    // Obtener todas las órdenes (solo admin)
    async getAllOrders(req, res, next) {
        try {
            const {
                page = 1,
                limit = 20,
                estado,
                userId,
                startDate,
                endDate,
                orderBy,
                orderDirection,
                numeroOrden
            } = req.query;

            const filters = {};
            if (estado) {
                if (Array.isArray(estado)) {
                    filters.estado = estado;
                } else {
                    filters.estado = [estado];
                }
            }
            if (userId) filters.userId = userId;
            if (startDate) filters.startDate = startDate;
            if (endDate) filters.endDate = endDate;
            if (numeroOrden) filters.numeroOrden = numeroOrden;

            const options = {
                page: parseInt(page),
                limit: parseInt(limit),
                orderBy: orderBy || 'fecha_pedido',
                orderDirection: orderDirection || 'desc'
            };

            const result = await this.getAllOrdersUseCase.execute(filters, options);

            res.status(200).json({
                success: true,
                message: 'Órdenes obtenidas exitosamente',
                data: result
            });
        } catch (error) {
            console.error('Error al obtener todas las órdenes:', error);
            next(error);
        }
    }

    // Obtener estadísticas de órdenes (solo admin)
    async getOrderStatistics(req, res, next) {
        try {
            const { startDate, endDate } = req.query;
            
            const filters = {};
            if (startDate) filters.startDate = new Date(startDate);
            if (endDate) filters.endDate = new Date(endDate);

            const result = await this.orderRepository.getOrderStatistics(filters);
            
            res.status(200).json({
                success: true,
                message: 'Estadísticas obtenidas exitosamente',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    // Obtener órdenes pendientes (solo admin)
    async getPendingOrders(req, res, next) {
        try {
            const { page = 1, limit = 20 } = req.query;
            
            const options = {
                page: parseInt(page),
                limit: parseInt(limit)
            };

            const result = await this.orderRepository.findPendingOrders(options);
            
            res.status(200).json({
                success: true,
                message: 'Órdenes pendientes obtenidas exitosamente',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    // Obtener órdenes en progreso (solo admin)
    async getOrdersInProgress(req, res, next) {
        try {
            const { page = 1, limit = 20 } = req.query;
            
            const options = {
                page: parseInt(page),
                limit: parseInt(limit)
            };

            const result = await this.orderRepository.findOrdersInProgress(options);
            
            res.status(200).json({
                success: true,
                message: 'Órdenes en progreso obtenidas exitosamente',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    // Cancelar orden
    async cancelOrder(req, res, next) {
        try {
            const { id } = req.params;
            const userId = req.user._id;
            const isAdmin = req.user.rol === 'admin';
            const { razon } = req.body;

            // Obtener la orden
            const order = await this.orderRepository.findById(id);
            
            if (!order) {
                return res.status(404).json({
                    success: false,
                    message: 'Orden no encontrada'
                });
            }

            // Verificar permisos
            if (!isAdmin && order.id_usuario.toString() !== userId.toString()) {
                return res.status(403).json({
                    success: false,
                    message: 'No autorizado para cancelar esta orden'
                });
            }

            // Verificar si se puede cancelar
            if (!['pendiente', 'pagado'].includes(order.estado)) {
                return res.status(400).json({
                    success: false,
                    message: 'No se puede cancelar una orden en este estado'
                });
            }

            const result = await this.updateOrderStatusUseCase.execute(id, 'cancelado', razon);

            res.status(200).json({
                success: true,
                message: 'Orden cancelada exitosamente',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    // Reordenar (crear nueva orden basada en una anterior)
    async reorder(req, res, next) {
        try {
            const { id } = req.params;
            const userId = req.user._id;

            // Obtener la orden original
            const originalOrder = await this.orderRepository.findById(id);
            
            if (!originalOrder) {
                return res.status(404).json({
                    success: false,
                    message: 'Orden no encontrada'
                });
            }

            // Verificar que la orden pertenezca al usuario
            if (originalOrder.id_usuario.toString() !== userId.toString()) {
                return res.status(403).json({
                    success: false,
                    message: 'No autorizado para reordenar esta orden'
                });
            }

            // Limpiar carrito actual
            await this.cartRepository.clearCart(userId);

            // Agregar productos de la orden original al carrito
            for (const item of originalOrder.items) {
                // Verificar que el producto aún exista y esté disponible
                const product = await this.productRepository.findById(item.id_producto);
                
                if (product && product.activo && product.disponible && product.stock >= item.cantidad) {
                    await this.cartRepository.addItem(userId, {
                        id_producto: item.id_producto,
                        cantidad: item.cantidad,
                        precio_unitario: product.precio, // Usar precio actual
                        notas: item.notas
                    });
                }
            }

            // Obtener carrito actualizado
            const cart = await this.cartRepository.findByUserId(userId);
            
            res.status(200).json({
                success: true,
                message: 'Productos agregados al carrito exitosamente',
                data: {
                    cart,
                    originalOrder: {
                        id: originalOrder.id_orden,
                        numero_orden: originalOrder.numero_orden,
                        fecha_pedido: originalOrder.fecha_pedido
                    }
                }
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = OrderController;

