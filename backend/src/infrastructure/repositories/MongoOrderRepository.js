const OrderRepository = require('../../domain/repositories/OrderRepository');
const Order = require('../database/models/Order');
const OrderEntity = require('../../domain/entities/Order');

class MongoOrderRepository extends OrderRepository {
    async create(orderEntity) {
        try {
            const orderData = {
                id_usuario: orderEntity.id_usuario,
                estado: orderEntity.estado,
                fecha_pago: orderEntity.fecha_pago,
                fecha_realizando: orderEntity.fecha_realizando,
                fecha_entregado: orderEntity.fecha_entregado,
                precio_total: orderEntity.precio_total,
                productos: orderEntity.productos.map(item => ({
                    id_producto: item.id_producto,
                    nombre_producto: item.nombre_producto,
                    cantidad: item.cantidad,
                    precio_unitario: item.precio_unitario,
                    subtotal: item.subtotal
                })),
                stripe_payment_intent: orderEntity.stripe_payment_id || `pi_${Date.now()}`
            };

            const order = new Order(orderData);
            const savedOrder = await order.save();
            
            return this.toEntity(savedOrder);
        } catch (error) {
            throw error;
        }
    }

    async findById(id) {
        try {
            const order = await Order.findById(id);
            return order ? this.toEntity(order) : null;
        } catch (error) {
            throw error;
        }
    }

    async findByUserId(userId, options = {}) {
        try {
            const {
                page = 1,
                limit = 20,
                sortBy = 'createdAt',
                sortOrder = 'desc'
            } = options;

            const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

            const total = await Order.countDocuments({ id_usuario: userId });
            const orders = await Order.find({ id_usuario: userId })
                .sort(sort)
                .skip((page - 1) * limit)
                .limit(limit);

            const totalPages = Math.ceil(total / limit);

            return {
                data: orders.map(order => this.toEntity(order)),
                pagination: {
                    total,
                    page: parseInt(page),
                    totalPages,
                    hasNext: page < totalPages,
                    hasPrev: page > 1,
                    limit: parseInt(limit)
                }
            };
        } catch (error) {
            throw error;
        }
    }

    async findByFilters(filters = {}, options = {}) {
        try {
            const {
                page = 1,
                limit = 20,
                sortBy = 'createdAt',
                sortOrder = 'desc'
            } = options;

            const query = this.buildQuery(filters);
            const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

            const total = await Order.countDocuments(query);
            const orders = await Order.find(query)
                .sort(sort)
                .skip((page - 1) * limit)
                .limit(limit);

            const totalPages = Math.ceil(total / limit);

            return {
                data: orders.map(order => this.toEntity(order)),
                pagination: {
                    total,
                    page: parseInt(page),
                    totalPages,
                    hasNext: page < totalPages,
                    hasPrev: page > 1,
                    limit: parseInt(limit)
                }
            };
        } catch (error) {
            throw error;
        }
    }

    async update(id, orderData) {
        try {
            const order = await Order.findByIdAndUpdate(
                id,
                { ...orderData, updatedAt: new Date() },
                { new: true, runValidators: true }
            );
            
            return order ? this.toEntity(order) : null;
        } catch (error) {
            throw error;
        }
    }

    async delete(id) {
        try {
            const result = await Order.findByIdAndDelete(id);
            return !!result;
        } catch (error) {
            throw error;
        }
    }

    async updateStatus(id, status, timestamp = null) {
        try {
            // Log para depuración
            console.log(`Intentando actualizar orden con ID: "${id}" a estado: "${status}"`);

            // Validar que el ID no sea undefined o un valor inválido
            if (!id || id === 'undefined' || id === 'efined') {
                console.error(`ID de orden inválido: ${id}`);
                throw new Error(`ID de orden inválido: ${id}`);
            }

            const updateData = { estado: status };
            
            // Actualizar la fecha correspondiente según el estado
            const now = timestamp || new Date();
            switch (status) {
                case 'pendiente':
                    // No necesita fecha adicional, usa createdAt
                    break;
                case 'en_preparacion':
                    updateData.fecha_preparacion = now;
                    break;
                case 'listo':
                    updateData.fecha_listo = now;
                    break;
                case 'entregado':
                    updateData.fecha_entrega = now;
                    break;
                case 'cancelado':
                    updateData.fecha_cancelacion = now;
                    break;
                // Mantener compatibilidad con estados antiguos
                case 'pagado':
                    updateData.fecha_pago = now;
                    break;
                case 'realizando':
                    updateData.fecha_realizando = now;
                    break;
            }

            updateData.updatedAt = now;

            // Intentar encontrar la orden, primero por ID
            let order;
            try {
                order = await Order.findByIdAndUpdate(
                    id,
                    updateData,
                    { new: true, runValidators: true }
                );
            } catch (findError) {
                console.error(`Error al buscar por ID: ${findError.message}`);
                // Si falla, intentar buscar por número de orden
                if (id.includes('ORD-')) {
                    order = await Order.findOneAndUpdate(
                        { numero_orden: id },
                        updateData,
                        { new: true, runValidators: true }
                    );
                } else {
                    // Intentar con formato de número de orden
                    order = await Order.findOneAndUpdate(
                        { numero_orden: `ORD-${id}` },
                        updateData,
                        { new: true, runValidators: true }
                    );
                }
            }

            if (!order) {
                console.error(`Orden no encontrada con ID: ${id}`);
                throw new Error(`Orden no encontrada con ID: ${id}`);
            }

            return this.toEntity(order);
        } catch (error) {
            console.error('Error en updateStatus:', error);
            throw error;
        }
    }

    async findByStatus(status, options = {}) {
        try {
            const {
                page = 1,
                limit = 20,
                sortBy = 'createdAt',
                sortOrder = 'desc'
            } = options;

            const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

            const total = await Order.countDocuments({ estado: status });
            const orders = await Order.find({ estado: status })
                .sort(sort)
                .skip((page - 1) * limit)
                .limit(limit);

            const totalPages = Math.ceil(total / limit);

            return {
                data: orders.map(order => this.toEntity(order)),
                pagination: {
                    total,
                    page: parseInt(page),
                    totalPages,
                    hasNext: page < totalPages,
                    hasPrev: page > 1,
                    limit: parseInt(limit)
                }
            };
        } catch (error) {
            throw error;
        }
    }

    async countByUserId(userId) {
        try {
            return await Order.countDocuments({ id_usuario: userId });
        } catch (error) {
            throw error;
        }
    }

    async countByUserIdAndStatus(userId, statuses) {
        try {
            const query = { id_usuario: userId };
            
            if (Array.isArray(statuses)) {
                query.estado = { $in: statuses };
            } else {
                query.estado = statuses;
            }

            return await Order.countDocuments(query);
        } catch (error) {
            throw error;
        }
    }

    async getTotalSpentByUserId(userId) {
        try {
            const result = await Order.aggregate([
                { $match: { id_usuario: userId } },
                { $group: { _id: null, total: { $sum: '$precio_total' } } }
            ]);

            return result.length > 0 ? result[0].total : 0;
        } catch (error) {
            throw error;
        }
    }

    async findPendingOrders() {
        try {
            const orders = await Order.find({ estado: 'pagado' })
                .sort({ createdAt: 1 }); // Ordenar por fecha de creación, los más antiguos primero

            return orders.map(order => this.toEntity(order));
        } catch (error) {
            throw error;
        }
    }

    async findOrdersInProgress() {
        try {
            const orders = await Order.find({ estado: 'realizando' })
                .sort({ fecha_realizando: 1 }); // Ordenar por fecha de inicio de preparación

            return orders.map(order => this.toEntity(order));
        } catch (error) {
            throw error;
        }
    }

    async getOrderStatistics(startDate = null, endDate = null) {
        try {
            const matchQuery = {};
            
            if (startDate || endDate) {
                matchQuery.createdAt = {};
                if (startDate) matchQuery.createdAt.$gte = new Date(startDate);
                if (endDate) matchQuery.createdAt.$lte = new Date(endDate);
            }

            const pipeline = [
                { $match: matchQuery },
                {
                    $group: {
                        _id: null,
                        totalOrders: { $sum: 1 },
                        totalRevenue: { $sum: '$precio_total' },
                        averageOrderValue: { $avg: '$precio_total' },
                        ordersByStatus: {
                            $push: {
                                estado: '$estado',
                                count: 1
                            }
                        }
                    }
                }
            ];

            const statusPipeline = [
                { $match: matchQuery },
                {
                    $group: {
                        _id: '$estado',
                        count: { $sum: 1 },
                        revenue: { $sum: '$precio_total' }
                    }
                }
            ];

            const [generalStats, statusStats] = await Promise.all([
                Order.aggregate(pipeline),
                Order.aggregate(statusPipeline)
            ]);

            return {
                general: generalStats.length > 0 ? generalStats[0] : {
                    totalOrders: 0,
                    totalRevenue: 0,
                    averageOrderValue: 0
                },
                byStatus: statusStats.reduce((acc, stat) => {
                    acc[stat._id] = {
                        count: stat.count,
                        revenue: stat.revenue
                    };
                    return acc;
                }, {})
            };
        } catch (error) {
            throw error;
        }
    }

    async findByStripePaymentId(paymentId) {
        try {
            const order = await Order.findOne({ stripe_payment_intent: paymentId });
            return order ? this.toEntity(order) : null;
        } catch (error) {
            throw error;
        }
    }

    async findRecentOrders(limit = 10) {
        try {
            const orders = await Order.find()
                .sort({ createdAt: -1 })
                .limit(limit);

            return orders.map(order => this.toEntity(order));
        } catch (error) {
            throw error;
        }
    }

    // Métodos auxiliares
    buildQuery(filters) {
        const query = {};

        if (filters.id_usuario) {
            query.id_usuario = filters.id_usuario;
        }

        if (filters.estado) {
            if (Array.isArray(filters.estado)) {
                query.estado = { $in: filters.estado };
            } else {
                query.estado = filters.estado;
            }
        }

        if (filters.fechaDesde) {
            query.createdAt = { $gte: new Date(filters.fechaDesde) };
        }

        if (filters.fechaHasta) {
            if (query.createdAt) {
                query.createdAt.$lte = new Date(filters.fechaHasta);
            } else {
                query.createdAt = { $lte: new Date(filters.fechaHasta) };
            }
        }

        if (filters.precio_min !== undefined) {
            query.precio_total = { $gte: filters.precio_min };
        }

        if (filters.precio_max !== undefined) {
            if (query.precio_total) {
                query.precio_total.$lte = filters.precio_max;
            } else {
                query.precio_total = { $lte: filters.precio_max };
            }
        }

        if (filters.numero_orden) {
            query.numero_orden = { $regex: filters.numero_orden, $options: 'i' };
        }

        if (filters.stripe_payment_intent) {
            query.stripe_payment_intent = filters.stripe_payment_intent;
        }

        return query;
    }

    toEntity(mongoOrder) {
        if (!mongoOrder) return null;

        return new OrderEntity({
            id_orden: mongoOrder._id.toString(),
            numero_orden: mongoOrder.numero_orden,
            id_usuario: mongoOrder.id_usuario ? mongoOrder.id_usuario._id || mongoOrder.id_usuario : null,
            estado: mongoOrder.estado,
            fecha_pago: mongoOrder.fecha_pago,
            fecha_realizando: mongoOrder.fecha_realizando,
            fecha_entregado: mongoOrder.fecha_entregado,
            precio_total: mongoOrder.precio_total,
            productos: mongoOrder.productos.map(item => ({
                id_producto: item.id_producto.toString(),
                nombre_producto: item.nombre_producto,
                cantidad: item.cantidad,
                precio_unitario: item.precio_unitario,
                subtotal: item.subtotal
            })),
            metodo_pago: 'stripe',
            stripe_payment_id: mongoOrder.stripe_payment_intent,
            createdAt: mongoOrder.createdAt,
            updatedAt: mongoOrder.updatedAt
        });
    }
}

module.exports = MongoOrderRepository;

