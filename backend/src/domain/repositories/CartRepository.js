// Interface para el repositorio de carritos
// Define los métodos que deben implementar los repositorios concretos

class CartRepository {
    async create(cart) {
        throw new Error('Method create must be implemented');
    }

    async findByUserId(userId) {
        throw new Error('Method findByUserId must be implemented');
    }

    async update(userId, cart) {
        throw new Error('Method update must be implemented');
    }

    async delete(userId) {
        throw new Error('Method delete must be implemented');
    }

    async addItem(userId, productId, quantity, unitPrice) {
        throw new Error('Method addItem must be implemented');
    }

    async updateItem(userId, productId, quantity) {
        throw new Error('Method updateItem must be implemented');
    }

    async removeItem(userId, productId) {
        throw new Error('Method removeItem must be implemented');
    }

    async clear(userId) {
        throw new Error('Method clear must be implemented');
    }

    async getItemCount(userId) {
        throw new Error('Method getItemCount must be implemented');
    }

    async calculateTotal(userId) {
        throw new Error('Method calculateTotal must be implemented');
    }
}

module.exports = CartRepository;