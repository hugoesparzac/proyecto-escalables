const CategoryRepository = require('../../domain/repositories/CategoryRepository');
const Category = require('../database/models/Category');
const CategoryEntity = require('../../domain/entities/Category');

class MongoCategoryRepository extends CategoryRepository {
    async create(categoryEntity) {
        try {
            const categoryData = {
                nombre_categoria: categoryEntity.nombre_categoria,
                descripcion: categoryEntity.descripcion,
                imagen_url: categoryEntity.imagen_url,
                activa: categoryEntity.activa
            };

            const category = new Category(categoryData);
            const savedCategory = await category.save();
            
            return this.toEntity(savedCategory);
        } catch (error) {
            if (error.code === 11000) {
                throw new Error('Ya existe una categoría con ese nombre');
            }
            throw error;
        }
    }

    async findById(id) {
        try {
            const category = await Category.findById(id);
            return category ? this.toEntity(category) : null;
        } catch (error) {
            throw error;
        }
    }

    async findByName(name) {
        try {
            const category = await Category.findOne({ nombre_categoria: name });
            return category ? this.toEntity(category) : null;
        } catch (error) {
            throw error;
        }
    }

    async update(id, categoryData) {
        try {
            const category = await Category.findByIdAndUpdate(
                id,
                { ...categoryData, updatedAt: new Date() },
                { new: true, runValidators: true }
            );
            
            return category ? this.toEntity(category) : null;
        } catch (error) {
            if (error.code === 11000) {
                throw new Error('Ya existe una categoría con ese nombre');
            }
            throw error;
        }
    }

    async delete(id) {
        try {
            const result = await Category.findByIdAndDelete(id);
            return !!result;
        } catch (error) {
            throw error;
        }
    }

    async findAll(filters = {}) {
        try {
            const query = this.buildQuery(filters);
            const categories = await Category.find(query).sort({ nombre_categoria: 1 });
            
            return categories.map(category => this.toEntity(category));
        } catch (error) {
            throw error;
        }
    }

    async findByFilters(filters = {}, options = {}) {
        try {
            const {
                page = 1,
                limit = 20,
                sortBy = 'nombre_categoria',
                sortOrder = 'asc'
            } = options;

            const query = this.buildQuery(filters);
            const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

            const total = await Category.countDocuments(query);
            const categories = await Category.find(query)
                .sort(sort)
                .skip((page - 1) * limit)
                .limit(limit);

            const totalPages = Math.ceil(total / limit);

            return {
                data: categories.map(category => this.toEntity(category)),
                pagination: {
                    total,
                    page: parseInt(page),
                    totalPages,
                    hasNext: page < totalPages,
                    hasPrev: page > 1,
                    limit: parseInt(limit)
                }
            };
        } catch (error) {
            throw error;
        }
    }

    async findActive() {
        try {
            const categories = await Category.find({ activa: true }).sort({ nombre_categoria: 1 });
            return categories.map(category => this.toEntity(category));
        } catch (error) {
            throw error;
        }
    }

    async findInactive() {
        try {
            const categories = await Category.find({ activa: false }).sort({ nombre_categoria: 1 });
            return categories.map(category => this.toEntity(category));
        } catch (error) {
            throw error;
        }
    }

    async activate(id) {
        try {
            const category = await Category.findByIdAndUpdate(
                id,
                { activa: true, updatedAt: new Date() },
                { new: true }
            );
            
            return category ? this.toEntity(category) : null;
        } catch (error) {
            throw error;
        }
    }

    async deactivate(id) {
        try {
            const category = await Category.findByIdAndUpdate(
                id,
                { activa: false, updatedAt: new Date() },
                { new: true }
            );
            
            return category ? this.toEntity(category) : null;
        } catch (error) {
            throw error;
        }
    }

    async count(filters = {}) {
        try {
            const query = this.buildQuery(filters);
            return await Category.countDocuments(query);
        } catch (error) {
            throw error;
        }
    }

    async getStats() {
        try {
            const [total, active, inactive] = await Promise.all([
                Category.countDocuments(),
                Category.countDocuments({ activa: true }),
                Category.countDocuments({ activa: false })
            ]);

            return { total, active, inactive };
        } catch (error) {
            throw error;
        }
    }

    // Métodos auxiliares
    buildQuery(filters) {
        const query = {};

        if (filters.activa !== undefined) {
            query.activa = filters.activa;
        }

        if (filters.nombre_categoria) {
            query.nombre_categoria = { $regex: filters.nombre_categoria, $options: 'i' };
        }

        if (filters.fechaDesde) {
            query.createdAt = { $gte: new Date(filters.fechaDesde) };
        }

        if (filters.fechaHasta) {
            if (query.createdAt) {
                query.createdAt.$lte = new Date(filters.fechaHasta);
            } else {
                query.createdAt = { $lte: new Date(filters.fechaHasta) };
            }
        }

        return query;
    }

    toEntity(mongoCategory) {
        return new CategoryEntity({
            id_categoria: mongoCategory._id.toString(),
            nombre_categoria: mongoCategory.nombre_categoria,
            descripcion: mongoCategory.descripcion,
            imagen_url: mongoCategory.imagen_url,
            activa: mongoCategory.activa,
            createdAt: mongoCategory.createdAt,
            updatedAt: mongoCategory.updatedAt
        });
    }
}

module.exports = MongoCategoryRepository;