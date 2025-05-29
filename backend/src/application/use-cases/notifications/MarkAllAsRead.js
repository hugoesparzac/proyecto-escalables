const Notification = require('../../../domain/entities/Notification');

class MarkAllAsRead {
    constructor(notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    async execute(userId, options = {}) {
        try {
            // Validar entrada
            if (!userId) {
                throw new Error('ID de usuario es requerido');
            }

            const { tipo = null } = options;

            // Construir filtros para las notificaciones a marcar como leídas
            const filters = {
                id_usuario: userId,
                estado: 'no leido'
            };

            if (tipo) {
                filters.tipo = tipo;
            }

            // Obtener todas las notificaciones no leídas que coinciden con los filtros
            const unreadNotifications = await this.notificationRepository.findByFilters(filters, {
                page: 1,
                limit: 1000, // Límite alto para obtener todas
                sortBy: 'fecha_hora',
                sortOrder: 'desc'
            });

            if (unreadNotifications.data.length === 0) {
                return {
                    success: true,
                    message: 'No hay notificaciones por marcar como leídas',
                    markedCount: 0
                };
            }

            // Marcar todas como leídas
            let markedCount = 0;
            const errors = [];

            for (const notifData of unreadNotifications.data) {
                try {
                    const notification = new Notification(notifData);
                    
                    if (notification.markAsRead()) {
                        await this.notificationRepository.update(
                            notification.id_notificacion, 
                            {
                                estado: notification.estado,
                                updatedAt: notification.updatedAt
                            }
                        );
                        markedCount++;
                    }
                } catch (error) {
                    console.error(`Error marcando notificación ${notifData.id_notificacion} como leída:`, error);
                    errors.push({
                        id_notificacion: notifData.id_notificacion,
                        error: error.message
                    });
                }
            }

            // Alternativa: actualización masiva (más eficiente para muchas notificaciones)
            if (markedCount === 0 && unreadNotifications.data.length > 0) {
                try {
                    markedCount = await this.notificationRepository.markAllAsReadByUserId(userId, tipo);
                } catch (bulkError) {
                    console.error('Error en actualización masiva:', bulkError);
                    throw new Error('Error marcando notificaciones como leídas');
                }
            }

            return {
                success: true,
                message: `${markedCount} notificaciones marcadas como leídas`,
                markedCount,
                errors: errors.length > 0 ? errors : undefined
            };

        } catch (error) {
            throw error;
        }
    }

    // Método para marcar notificaciones específicas como leídas
    async markSpecificNotifications(userId, notificationIds) {
        try {
            if (!userId || !Array.isArray(notificationIds) || notificationIds.length === 0) {
                throw new Error('ID de usuario y lista de notificaciones son requeridos');
            }

            let markedCount = 0;
            const errors = [];

            for (const notificationId of notificationIds) {
                try {
                    const notifData = await this.notificationRepository.findById(notificationId);
                    
                    if (!notifData) {
                        errors.push({
                            id_notificacion: notificationId,
                            error: 'Notificación no encontrada'
                        });
                        continue;
                    }

                    const notification = new Notification(notifData);

                    // Verificar que pertenece al usuario
                    if (!notification.belongsToUser(userId)) {
                        errors.push({
                            id_notificacion: notificationId,
                            error: 'No tienes permisos para esta notificación'
                        });
                        continue;
                    }

                    // Marcar como leída si no lo está ya
                    if (notification.markAsRead()) {
                        await this.notificationRepository.update(notificationId, {
                            estado: notification.estado,
                            updatedAt: notification.updatedAt
                        });
                        markedCount++;
                    }

                } catch (error) {
                    console.error(`Error marcando notificación ${notificationId}:`, error);
                    errors.push({
                        id_notificacion: notificationId,
                        error: error.message
                    });
                }
            }

            return {
                success: true,
                message: `${markedCount} notificaciones marcadas como leídas`,
                markedCount,
                requested: notificationIds.length,
                errors: errors.length > 0 ? errors : undefined
            };

        } catch (error) {
            throw error;
        }
    }
}

module.exports = MarkAllAsRead;
