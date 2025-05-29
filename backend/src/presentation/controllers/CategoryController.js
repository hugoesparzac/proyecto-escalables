const CreateCategory = require('../../application/use-cases/categories/CreateCategory');
const GetCategories = require('../../application/use-cases/categories/GetCategories');
const UpdateCategory = require('../../application/use-cases/categories/UpdateCategory');
const DeleteCategory = require('../../application/use-cases/categories/DeleteCategory');

const MongoCategoryRepository = require('../../infrastructure/repositories/MongoCategoryRepository');
const MongoProductRepository = require('../../infrastructure/repositories/MongoProductRepository');

class CategoryController {
    constructor() {
        this.categoryRepository = new MongoCategoryRepository();
        this.productRepository = new MongoProductRepository();
        
        this.createCategory = new CreateCategory(this.categoryRepository);
        this.getCategories = new GetCategories(this.categoryRepository, this.productRepository);
        this.updateCategory = new UpdateCategory(this.categoryRepository);
        this.deleteCategory = new DeleteCategory(this.categoryRepository, this.productRepository);
    }

    // POST /api/categories - Crear una nueva categoría (Admin)
    async create(req, res, next) {
        try {
            const categoryData = req.body;
            const adminUserId = req.user.id;

            const result = await this.createCategory.execute(categoryData, adminUserId);

            res.status(201).json(result);
        } catch (error) {
            next(error);
        }
    }    // GET /api/categories - Obtener todas las categorías
    async getAll(req, res, next) {
        try {
            const options = {
                includeInactive: req.query.includeInactive === 'true',
                includeProductCount: req.query.includeProductCount !== 'false',
                onlyWithProducts: req.query.onlyWithProducts === 'true'
            };

            const result = await this.getCategories.execute(options);

            res.status(200).json({
                success: true,
                message: 'Categorías obtenidas exitosamente',
                ...result
            });
        } catch (error) {
            next(error);
        }
    }    // GET /api/categories/active - Obtener categorías activas (público)
    async getActive(req, res, next) {
        try {
            const result = await this.getCategories.getPublicCategories();

            res.status(200).json({
                success: true,
                message: 'Categorías activas obtenidas exitosamente',
                ...result
            });
        } catch (error) {
            next(error);
        }
    }

    // GET /api/categories/:id - Obtener categoría por ID
    async getById(req, res, next) {
        try {
            const { id } = req.params;

            const category = await this.categoryRepository.findById(id);

            if (!category) {
                return res.status(404).json({
                    success: false,
                    message: 'Categoría no encontrada'
                });
            }

            res.status(200).json({
                success: true,
                message: 'Categoría obtenida exitosamente',
                category
            });
        } catch (error) {
            next(error);
        }
    }

    // PUT /api/categories/:id - Actualizar categoría (Admin)
    async update(req, res, next) {
        try {
            const { id } = req.params;
            const updateData = req.body;
            const adminUserId = req.user.id;

            const result = await this.updateCategory.execute(id, updateData, adminUserId);

            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    // DELETE /api/categories/:id - Eliminar categoría (Admin)
    async delete(req, res, next) {
        try {
            const { id } = req.params;
            const adminUserId = req.user.id;
            const options = {
                force: req.query.force === 'true'
            };

            const result = await this.deleteCategory.execute(id, adminUserId, options);

            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    // GET /api/categories/:id/delete-info - Información antes de eliminar
    async getDeleteInfo(req, res, next) {
        try {
            const { id } = req.params;
            const adminUserId = req.user.id;

            const result = await this.deleteCategory.getDeleteInfo(id, adminUserId);

            res.status(200).json({
                success: true,
                message: 'Información de eliminación obtenida',
                ...result
            });
        } catch (error) {
            next(error);
        }
    }

    // PATCH /api/categories/:id/activate - Activar categoría (Admin)
    async activate(req, res, next) {
        try {
            const { id } = req.params;

            const category = await this.categoryRepository.activate(id);

            if (!category) {
                return res.status(404).json({
                    success: false,
                    message: 'Categoría no encontrada'
                });
            }

            res.status(200).json({
                success: true,
                message: 'Categoría activada exitosamente',
                category
            });
        } catch (error) {
            next(error);
        }
    }

    // PATCH /api/categories/:id/deactivate - Desactivar categoría (Admin)
    async deactivate(req, res, next) {
        try {
            const { id } = req.params;

            const category = await this.categoryRepository.deactivate(id);

            if (!category) {
                return res.status(404).json({
                    success: false,
                    message: 'Categoría no encontrada'
                });
            }

            res.status(200).json({
                success: true,
                message: 'Categoría desactivada exitosamente',
                category
            });
        } catch (error) {
            next(error);
        }
    }

    // GET /api/categories/stats - Estadísticas de categorías (Admin)
    async getStats(req, res, next) {
        try {
            const stats = await this.categoryRepository.getStats();

            res.status(200).json({
                success: true,
                message: 'Estadísticas obtenidas exitosamente',
                stats
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new CategoryController();
