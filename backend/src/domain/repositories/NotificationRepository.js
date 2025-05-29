// Interface para el repositorio de notificaciones
// Define los métodos que deben implementar los repositorios concretos

class NotificationRepository {
    async create(notification) {
        throw new Error('Method create must be implemented');
    }

    async findById(id) {
        throw new Error('Method findById must be implemented');
    }

    async findByUserId(userId, options = {}) {
        throw new Error('Method findByUserId must be implemented');
    }

    async findByFilters(filters, options = {}) {
        throw new Error('Method findByFilters must be implemented');
    }

    async update(id, notificationData) {
        throw new Error('Method update must be implemented');
    }

    async delete(id) {
        throw new Error('Method delete must be implemented');
    }

    async markAsRead(id) {
        throw new Error('Method markAsRead must be implemented');
    }

    async markAsUnread(id) {
        throw new Error('Method markAsUnread must be implemented');
    }

    async markAllAsReadByUserId(userId, tipo = null) {
        throw new Error('Method markAllAsReadByUserId must be implemented');
    }

    async countByUserId(userId) {
        throw new Error('Method countByUserId must be implemented');
    }

    async countUnreadByUserId(userId) {
        throw new Error('Method countUnreadByUserId must be implemented');
    }

    async countRecentByUserId(userId, hours = 24) {
        throw new Error('Method countRecentByUserId must be implemented');
    }

    async deleteByUserId(userId) {
        throw new Error('Method deleteByUserId must be implemented');
    }

    async deleteOldNotifications(daysOld = 30) {
        throw new Error('Method deleteOldNotifications must be implemented');
    }

    async findByOrderId(orderId) {
        throw new Error('Method findByOrderId must be implemented');
    }
}

module.exports = NotificationRepository;