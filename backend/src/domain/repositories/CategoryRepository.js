// Interface para el repositorio de categorías
// Define los métodos que deben implementar los repositorios concretos

class CategoryRepository {
    async create(category) {
        throw new Error('Method create must be implemented');
    }

    async findById(id) {
        throw new Error('Method findById must be implemented');
    }

    async findByName(name) {
        throw new Error('Method findByName must be implemented');
    }

    async findAll(filters = {}) {
        throw new Error('Method findAll must be implemented');
    }

    async findByFilters(filters, options = {}) {
        throw new Error('Method findByFilters must be implemented');
    }

    async update(id, category) {
        throw new Error('Method update must be implemented');
    }

    async delete(id) {
        throw new Error('Method delete must be implemented');
    }

    async activate(id) {
        throw new Error('Method activate must be implemented');
    }

    async deactivate(id) {
        throw new Error('Method deactivate must be implemented');
    }

    async count(filters = {}) {
        throw new Error('Method count must be implemented');
    }

    async getActiveCategories() {
        throw new Error('Method getActiveCategories must be implemented');
    }
}

module.exports = CategoryRepository;