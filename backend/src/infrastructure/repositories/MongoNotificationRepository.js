// filepath: c:\Users\hugo\web-escalables\cafeteria-app\backend\src\infrastructure\repositories\MongoNotificationRepository.js
const NotificationRepository = require('../../domain/repositories/NotificationRepository');
const NotificationModel = require('../database/models/Notification');
const Notification = require('../../domain/entities/Notification');
const mongoose = require('mongoose');

class MongoNotificationRepository extends NotificationRepository {
    constructor() {
        super();
        this.model = NotificationModel;
    }

    // Crear una nueva notificación
    async create(notification) {
        try {
            if (!notification || !(notification instanceof Notification)) {
                throw new Error('Se requiere una instancia válida de Notification');
            }

            if (!notification.isValid()) {
                throw new Error('Los datos de la notificación no son válidos');
            }

            // Mapear tipo de notificación según el modelo de BD
            const tipoMapping = {
                'orden': this.getTipoOrdenByMetadata(notification.metadata),
                'cuenta': 'orden_pagada', // Default para cuentas
                'sistema': 'orden_pagada'  // Default para sistema
            };

            const notificationData = {
                id_usuario: new mongoose.Types.ObjectId(notification.id_usuario),
                fecha_hora: notification.fecha_hora,
                estado: notification.estado === 'leido' ? 'leido' : 'no_leido',
                tipo: tipoMapping[notification.tipo] || 'orden_pagada',
                mensaje: notification.mensaje,
                id_orden: notification.id_orden ? new mongoose.Types.ObjectId(notification.id_orden) : null
            };

            // Validar que id_orden existe si es requerido por el tipo
            if (!notificationData.id_orden) {
                throw new Error('La orden es requerida para notificaciones');
            }

            const savedNotification = await this.model.create(notificationData);
            return this.toEntity(savedNotification);
        } catch (error) {
            throw new Error(`Error al crear notificación: ${error.message}`);
        }
    }

    // Encontrar notificación por ID
    async findById(id) {
        try {
            if (!mongoose.Types.ObjectId.isValid(id)) {
                return null;
            }

            const notification = await this.model.findById(id);
            return notification ? this.toEntity(notification) : null;
        } catch (error) {
            throw new Error(`Error al buscar notificación por ID: ${error.message}`);
        }
    }

    // Encontrar notificaciones por ID de usuario
    async findByUserId(userId, options = {}) {
        try {
            if (!mongoose.Types.ObjectId.isValid(userId)) {
                throw new Error('ID de usuario inválido');
            }

            const {
                page = 1,
                limit = 10,
                estado = null,
                tipo = null,
                orderBy = 'fecha_hora',
                orderDirection = 'desc'
            } = options;

            const query = { id_usuario: new mongoose.Types.ObjectId(userId) };

            if (estado) {
                query.estado = estado;
            }

            if (tipo) {
                query.tipo = tipo;
            }

            const skip = (page - 1) * limit;
            const sortOrder = orderDirection === 'desc' ? -1 : 1;

            const [notifications, total] = await Promise.all([
                this.model
                    .find(query)
                    .sort({ [orderBy]: sortOrder })
                    .skip(skip)
                    .limit(limit)
                    .lean(),
                this.model.countDocuments(query)
            ]);

            const totalPages = Math.ceil(total / limit);

            return {
                notifications: notifications.map(n => this.toEntity(n)),
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalItems: total,
                    itemsPerPage: limit,
                    hasNext: page < totalPages,
                    hasPrev: page > 1
                }
            };
        } catch (error) {
            throw new Error(`Error al buscar notificaciones por usuario: ${error.message}`);
        }
    }

    // Encontrar notificaciones con filtros avanzados
    async findByFilters(filters, options = {}) {
        try {
            const {
                page = 1,
                limit = 10,
                orderBy = 'fecha_hora',
                orderDirection = 'desc'
            } = options;

            const query = this.buildQuery(filters);
            const skip = (page - 1) * limit;
            const sortOrder = orderDirection === 'desc' ? -1 : 1;

            const [notifications, total] = await Promise.all([
                this.model
                    .find(query)
                    .sort({ [orderBy]: sortOrder })
                    .skip(skip)
                    .limit(limit)
                    .lean(),
                this.model.countDocuments(query)
            ]);

            const totalPages = Math.ceil(total / limit);

            return {
                notifications: notifications.map(n => this.toEntity(n)),
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalItems: total,
                    itemsPerPage: limit,
                    hasNext: page < totalPages,
                    hasPrev: page > 1
                }
            };
        } catch (error) {
            throw new Error(`Error al buscar notificaciones con filtros: ${error.message}`);
        }
    }

    // Actualizar notificación
    async update(id, notificationData) {
        try {
            if (!mongoose.Types.ObjectId.isValid(id)) {
                throw new Error('ID de notificación inválido');
            }

            const updateData = { ...notificationData };
            
            // Convertir estado si es necesario
            if (updateData.estado) {
                updateData.estado = updateData.estado === 'leido' ? 'leido' : 'no_leido';
            }

            // Actualizar timestamp
            updateData.updatedAt = new Date();

            const updatedNotification = await this.model.findByIdAndUpdate(
                id,
                updateData,
                { new: true, runValidators: true }
            );

            return updatedNotification ? this.toEntity(updatedNotification) : null;
        } catch (error) {
            throw new Error(`Error al actualizar notificación: ${error.message}`);
        }
    }

    // Eliminar notificación
    async delete(id) {
        try {
            if (!mongoose.Types.ObjectId.isValid(id)) {
                throw new Error('ID de notificación inválido');
            }

            const deletedNotification = await this.model.findByIdAndDelete(id);
            return !!deletedNotification;
        } catch (error) {
            throw new Error(`Error al eliminar notificación: ${error.message}`);
        }
    }

    // Marcar notificación como leída
    async markAsRead(id) {
        try {
            if (!mongoose.Types.ObjectId.isValid(id)) {
                throw new Error('ID de notificación inválido');
            }

            const updatedNotification = await this.model.findByIdAndUpdate(
                id,
                { 
                    estado: 'leido',
                    updatedAt: new Date()
                },
                { new: true }
            );

            return updatedNotification ? this.toEntity(updatedNotification) : null;
        } catch (error) {
            throw new Error(`Error al marcar notificación como leída: ${error.message}`);
        }
    }

    // Marcar notificación como no leída
    async markAsUnread(id) {
        try {
            if (!mongoose.Types.ObjectId.isValid(id)) {
                throw new Error('ID de notificación inválido');
            }

            const updatedNotification = await this.model.findByIdAndUpdate(
                id,
                { 
                    estado: 'no_leido',
                    updatedAt: new Date()
                },
                { new: true }
            );

            return updatedNotification ? this.toEntity(updatedNotification) : null;
        } catch (error) {
            throw new Error(`Error al marcar notificación como no leída: ${error.message}`);
        }
    }

    // Marcar todas las notificaciones de un usuario como leídas
    async markAllAsReadByUserId(userId, tipo = null) {
        try {
            if (!mongoose.Types.ObjectId.isValid(userId)) {
                throw new Error('ID de usuario inválido');
            }

            const query = { 
                id_usuario: new mongoose.Types.ObjectId(userId),
                estado: 'no_leido'
            };

            if (tipo) {
                query.tipo = tipo;
            }

            const result = await this.model.updateMany(
                query,
                { 
                    estado: 'leido',
                    updatedAt: new Date()
                }
            );

            return result.modifiedCount;
        } catch (error) {
            throw new Error(`Error al marcar todas las notificaciones como leídas: ${error.message}`);
        }
    }

    // Contar notificaciones por usuario
    async countByUserId(userId) {
        try {
            if (!mongoose.Types.ObjectId.isValid(userId)) {
                throw new Error('ID de usuario inválido');
            }

            const count = await this.model.countDocuments({
                id_usuario: new mongoose.Types.ObjectId(userId)
            });

            return count;
        } catch (error) {
            throw new Error(`Error al contar notificaciones por usuario: ${error.message}`);
        }
    }

    // Contar notificaciones no leídas por usuario
    async countUnreadByUserId(userId) {
        try {
            if (!mongoose.Types.ObjectId.isValid(userId)) {
                throw new Error('ID de usuario inválido');
            }

            const count = await this.model.countDocuments({
                id_usuario: new mongoose.Types.ObjectId(userId),
                estado: 'no_leido'
            });

            return count;
        } catch (error) {
            throw new Error(`Error al contar notificaciones no leídas: ${error.message}`);
        }
    }

    // Contar notificaciones recientes por usuario
    async countRecentByUserId(userId, hours = 24) {
        try {
            if (!mongoose.Types.ObjectId.isValid(userId)) {
                throw new Error('ID de usuario inválido');
            }

            const dateThreshold = new Date();
            dateThreshold.setHours(dateThreshold.getHours() - hours);

            const count = await this.model.countDocuments({
                id_usuario: new mongoose.Types.ObjectId(userId),
                fecha_hora: { $gte: dateThreshold }
            });

            return count;
        } catch (error) {
            throw new Error(`Error al contar notificaciones recientes: ${error.message}`);
        }
    }

    // Eliminar notificaciones por usuario
    async deleteByUserId(userId) {
        try {
            if (!mongoose.Types.ObjectId.isValid(userId)) {
                throw new Error('ID de usuario inválido');
            }

            const result = await this.model.deleteMany({
                id_usuario: new mongoose.Types.ObjectId(userId)
            });

            return result.deletedCount;
        } catch (error) {
            throw new Error(`Error al eliminar notificaciones por usuario: ${error.message}`);
        }
    }

    // Eliminar notificaciones antiguas
    async deleteOldNotifications(daysOld = 30) {
        try {
            const dateThreshold = new Date();
            dateThreshold.setDate(dateThreshold.getDate() - daysOld);

            const result = await this.model.deleteMany({
                fecha_hora: { $lt: dateThreshold }
            });

            return result.deletedCount;
        } catch (error) {
            throw new Error(`Error al eliminar notificaciones antiguas: ${error.message}`);
        }
    }

    // Encontrar notificaciones por ID de orden
    async findByOrderId(orderId) {
        try {
            if (!mongoose.Types.ObjectId.isValid(orderId)) {
                throw new Error('ID de orden inválido');
            }

            const notifications = await this.model
                .find({ id_orden: new mongoose.Types.ObjectId(orderId) })
                .sort({ fecha_hora: -1 })
                .lean();

            return notifications.map(n => this.toEntity(n));
        } catch (error) {
            throw new Error(`Error al buscar notificaciones por orden: ${error.message}`);
        }
    }

    // Construir query para filtros avanzados
    buildQuery(filters) {
        const query = {};

        if (filters.userId) {
            if (!mongoose.Types.ObjectId.isValid(filters.userId)) {
                throw new Error('ID de usuario inválido en filtros');
            }
            query.id_usuario = new mongoose.Types.ObjectId(filters.userId);
        }

        if (filters.estado) {
            if (Array.isArray(filters.estado)) {
                query.estado = { $in: filters.estado };
            } else {
                query.estado = filters.estado;
            }
        }

        if (filters.tipo) {
            if (Array.isArray(filters.tipo)) {
                query.tipo = { $in: filters.tipo };
            } else {
                query.tipo = filters.tipo;
            }
        }

        if (filters.orderId) {
            if (!mongoose.Types.ObjectId.isValid(filters.orderId)) {
                throw new Error('ID de orden inválido en filtros');
            }
            query.id_orden = new mongoose.Types.ObjectId(filters.orderId);
        }

        // Filtros de fecha
        if (filters.startDate || filters.endDate) {
            query.fecha_hora = {};
            if (filters.startDate) {
                query.fecha_hora.$gte = new Date(filters.startDate);
            }
            if (filters.endDate) {
                query.fecha_hora.$lte = new Date(filters.endDate);
            }
        }

        // Filtro de notificaciones recientes
        if (filters.isRecent) {
            const dateThreshold = new Date();
            dateThreshold.setHours(dateThreshold.getHours() - 24);
            query.fecha_hora = { $gte: dateThreshold };
        }

        return query;
    }

    // Determinar tipo de notificación de orden basado en metadata
    getTipoOrdenByMetadata(metadata) {
        if (!metadata || !metadata.estado_orden) {
            return 'orden_pagada';
        }

        const estadoMapping = {
            'pagado': 'orden_pagada',
            'realizando': 'orden_realizando',
            'entregado': 'orden_entregada'
        };

        return estadoMapping[metadata.estado_orden] || 'orden_pagada';
    }

    // Convertir modelo de MongoDB a entidad de dominio
    toEntity(mongoNotification) {
        if (!mongoNotification) return null;

        // Mapear tipo de BD a tipo de entidad
        const tipoMapping = {
            'orden_pagada': 'orden',
            'orden_realizando': 'orden',
            'orden_entregada': 'orden'
        };

        // Crear metadata basado en el tipo
        const metadata = this.createMetadataFromTipo(mongoNotification.tipo, mongoNotification);

        return new Notification({
            id_notificacion: mongoNotification._id?.toString(),
            id_usuario: mongoNotification.id_usuario?.toString(),
            fecha_hora: mongoNotification.fecha_hora,
            estado: mongoNotification.estado === 'leido' ? 'leido' : 'no leido',
            mensaje: mongoNotification.mensaje,
            tipo: tipoMapping[mongoNotification.tipo] || 'orden',
            id_orden: mongoNotification.id_orden?.toString(),
            metadata: metadata,
            createdAt: mongoNotification.createdAt,
            updatedAt: mongoNotification.updatedAt
        });
    }

    // Crear metadata basado en el tipo de notificación
    createMetadataFromTipo(tipo, mongoNotification) {
        const metadata = {};

        switch (tipo) {
            case 'orden_pagada':
                metadata.estado_orden = 'pagado';
                break;
            case 'orden_realizando':
                metadata.estado_orden = 'realizando';
                metadata.tiempo_estimado = '15-20 minutos';
                break;
            case 'orden_entregada':
                metadata.estado_orden = 'entregado';
                break;
        }

        if (mongoNotification.id_orden) {
            metadata.orden_id = mongoNotification.id_orden.toString();
        }

        // Si hay información de orden poblada, agregarla
        if (mongoNotification.id_orden && mongoNotification.id_orden.numero_orden) {
            metadata.numero_orden = mongoNotification.id_orden.numero_orden;
            metadata.precio_total = mongoNotification.id_orden.precio_total;
        }

        return metadata;
    }
}

module.exports = MongoNotificationRepository;