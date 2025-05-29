// Interface para el repositorio de usuarios
// Define los métodos que deben implementar los repositorios concretos

class UserRepository {
    async create(user) {
        throw new Error('Method create must be implemented');
    }

    async findById(id) {
        throw new Error('Method findById must be implemented');
    }

    async findByEmail(email) {
        throw new Error('Method findByEmail must be implemented');
    }

    async findByToken(token) {
        throw new Error('Method findByToken must be implemented');
    }

    async update(id, userData) {
        throw new Error('Method update must be implemented');
    }

    async delete(id) {
        throw new Error('Method delete must be implemented');
    }

    async validateEmail(id) {
        throw new Error('Method validateEmail must be implemented');
    }

    async updatePassword(id, hashedPassword) {
        throw new Error('Method updatePassword must be implemented');
    }

    async findAll(filters = {}) {
        throw new Error('Method findAll must be implemented');
    }
}

module.exports = UserRepository;