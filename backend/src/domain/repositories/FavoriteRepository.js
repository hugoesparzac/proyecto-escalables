// Interface para el repositorio de favoritos
// Define los métodos que deben implementar los repositorios concretos

class FavoriteRepository {
    async create(favorite) {
        throw new Error('Method create must be implemented');
    }

    async findByUserId(userId, options = {}) {
        throw new Error('Method findByUserId must be implemented');
    }

    async findByUserIdAndProductId(userId, productId) {
        throw new Error('Method findByUserIdAndProductId must be implemented');
    }

    async remove(userId, productId) {
        throw new Error('Method remove must be implemented');
    }

    async removeByUserId(userId) {
        throw new Error('Method removeByUserId must be implemented');
    }

    async removeByProductId(productId) {
        throw new Error('Method removeByProductId must be implemented');
    }

    async exists(userId, productId) {
        throw new Error('Method exists must be implemented');
    }

    async count(userId) {
        throw new Error('Method count must be implemented');
    }

    async findByFilters(filters, options = {}) {
        throw new Error('Method findByFilters must be implemented');
    }

    async getMostFavorited(limit = 10) {
        throw new Error('Method getMostFavorited must be implemented');
    }

    async getUsersByFavoriteProduct(productId) {
        throw new Error('Method getUsersByFavoriteProduct must be implemented');
    }
}

module.exports = FavoriteRepository;