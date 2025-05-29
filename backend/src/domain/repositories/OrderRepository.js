// Interface para el repositorio de órdenes
// Define los métodos que deben implementar los repositorios concretos

class OrderRepository {
    async create(order) {
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

    async update(id, orderData) {
        throw new Error('Method update must be implemented');
    }

    async delete(id) {
        throw new Error('Method delete must be implemented');
    }

    async updateStatus(id, status, timestamp = null) {
        throw new Error('Method updateStatus must be implemented');
    }

    async findByStatus(status, options = {}) {
        throw new Error('Method findByStatus must be implemented');
    }

    async countByUserId(userId) {
        throw new Error('Method countByUserId must be implemented');
    }

    async countByUserIdAndStatus(userId, statuses) {
        throw new Error('Method countByUserIdAndStatus must be implemented');
    }

    async getTotalSpentByUserId(userId) {
        throw new Error('Method getTotalSpentByUserId must be implemented');
    }

    async findPendingOrders() {
        throw new Error('Method findPendingOrders must be implemented');
    }

    async findOrdersInProgress() {
        throw new Error('Method findOrdersInProgress must be implemented');
    }

    async getOrderStatistics(startDate = null, endDate = null) {
        throw new Error('Method getOrderStatistics must be implemented');
    }

    async findByStripePaymentId(paymentId) {
        throw new Error('Method findByStripePaymentId must be implemented');
    }

    async findRecentOrders(limit = 10) {
        throw new Error('Method findRecentOrders must be implemented');
    }
}

module.exports = OrderRepository;