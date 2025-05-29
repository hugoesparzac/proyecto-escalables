const Notification = require('../../../domain/entities/Notification');

class GetUserNotifications {
    constructor(notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    async execute(userId, options = {}) {
        try {
            // Validar entrada
            if (!userId) {
                throw new Error('ID de usuario es requerido');
            }

            const {
                page = 1,
                limit = 20,
                onlyUnread = false,
                tipo = null // 'orden', 'cuenta', 'sistema'
            } = options;

            // Construir filtros
            const filters = { id_usuario: userId };
            
            if (onlyUnread) {
                filters.estado = 'no leido';
            }
            
            if (tipo) {
                filters.tipo = tipo;
            }

            // Obtener notificaciones con paginación
            const notifications = await this.notificationRepository.findByFilters(
                filters, 
                {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    sortBy: 'fecha_hora',
                    sortOrder: 'desc'
                }
            );

            // Convertir a entidades y agregar información adicional
            const notificationsWithDetails = (notifications && Array.isArray(notifications.data) ? notifications.data : []).map(notifData => {
                const notification = new Notification(notifData);
                return {
                    ...notification.toJSON(),
                    timeAgo: this.getTimeAgo(notification.fecha_hora),
                    isToday: this.isToday(notification.fecha_hora)
                };
            });

            // Obtener estadísticas
            const stats = await this.getNotificationStats(userId);

            return {
                notifications: notificationsWithDetails,
                pagination: {
                    total: notifications.total,
                    page: notifications.page,
                    totalPages: notifications.totalPages,
                    hasNext: notifications.hasNext,
                    hasPrev: notifications.hasPrev,
                    limit: notifications.limit
                },
                stats
            };

        } catch (error) {
            throw error;
        }
    }

    async getNotificationStats(userId) {
        try {
            const [totalCount, unreadCount, recentCount] = await Promise.all([
                this.notificationRepository.countByUserId(userId),
                this.notificationRepository.countUnreadByUserId(userId),
                this.notificationRepository.countRecentByUserId(userId, 24) // últimas 24 horas
            ]);

            return {
                total: totalCount,
                unread: unreadCount,
                recent: recentCount,
                read: totalCount - unreadCount
            };
        } catch (error) {
            console.error('Error obteniendo estadísticas de notificaciones:', error);
            return {
                total: 0,
                unread: 0,
                recent: 0,
                read: 0
            };
        }
    }

    getTimeAgo(date) {
        const now = new Date();
        const diffInMinutes = Math.floor((now - new Date(date)) / (1000 * 60));

        if (diffInMinutes < 1) return 'Ahora';
        if (diffInMinutes < 60) return `Hace ${diffInMinutes} minuto${diffInMinutes !== 1 ? 's' : ''}`;

        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `Hace ${diffInHours} hora${diffInHours !== 1 ? 's' : ''}`;

        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 30) return `Hace ${diffInDays} día${diffInDays !== 1 ? 's' : ''}`;

        const diffInMonths = Math.floor(diffInDays / 30);
        return `Hace ${diffInMonths} mes${diffInMonths !== 1 ? 'es' : ''}`;
    }

    isToday(date) {
        const today = new Date();
        const compareDate = new Date(date);
        
        return today.getDate() === compareDate.getDate() &&
               today.getMonth() === compareDate.getMonth() &&
               today.getFullYear() === compareDate.getFullYear();
    }
}

module.exports = GetUserNotifications;
