const FavoriteRepository = require('../../domain/repositories/FavoriteRepository');
const Favorite = require('../database/models/Favorite');
const FavoriteEntity = require('../../domain/entities/Favorite');

class MongoFavoriteRepository extends FavoriteRepository {
    async create(favoriteEntity) {
        try {
            const favoriteData = {
                id_usuario: favoriteEntity.id_usuario,
                id_producto: favoriteEntity.id_producto,
                added_at: favoriteEntity.added_at
            };

            const favorite = new Favorite(favoriteData);
            const savedFavorite = await favorite.save();
            
            return this.toEntity(savedFavorite);
        } catch (error) {
            if (error.code === 11000) {
                throw new Error('El producto ya está en favoritos');
            }
            throw error;
        }
    }

    async findByUserId(userId, options = {}) {
        try {
            const {
                page = 1,
                limit = 20,
                sortBy = 'added_at',
                sortOrder = 'desc'
            } = options;

            const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

            const total = await Favorite.countDocuments({ id_usuario: userId });
            const favorites = await Favorite.find({ id_usuario: userId })
                .sort(sort)
                .skip((page - 1) * limit)
                .limit(limit);

            const totalPages = Math.ceil(total / limit);

            return {
                data: favorites.map(favorite => this.toEntity(favorite)),
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

    async findByUserIdAndProductId(userId, productId) {
        try {
            const favorite = await Favorite.findOne({
                id_usuario: userId,
                id_producto: productId
            });
            
            return favorite ? this.toEntity(favorite) : null;
        } catch (error) {
            throw error;
        }
    }

    async remove(userId, productId) {
        try {
            const result = await Favorite.findOneAndDelete({
                id_usuario: userId,
                id_producto: productId
            });
            
            return !!result;
        } catch (error) {
            throw error;
        }
    }

    async removeByUserId(userId) {
        try {
            const result = await Favorite.deleteMany({ id_usuario: userId });
            return result.deletedCount;
        } catch (error) {
            throw error;
        }
    }

    async removeByProductId(productId) {
        try {
            const result = await Favorite.deleteMany({ id_producto: productId });
            return result.deletedCount;
        } catch (error) {
            throw error;
        }
    }

    async exists(userId, productId) {
        try {
            const favorite = await Favorite.findOne({
                id_usuario: userId,
                id_producto: productId
            });
            
            return !!favorite;
        } catch (error) {
            throw error;
        }
    }

    async count(userId) {
        try {
            return await Favorite.countDocuments({ id_usuario: userId });
        } catch (error) {
            throw error;
        }
    }

    async findByFilters(filters = {}, options = {}) {
        try {
            const {
                page = 1,
                limit = 20,
                sortBy = 'added_at',
                sortOrder = 'desc'
            } = options;

            const query = this.buildQuery(filters);
            const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

            const total = await Favorite.countDocuments(query);
            const favorites = await Favorite.find(query)
                .sort(sort)
                .skip((page - 1) * limit)
                .limit(limit);

            const totalPages = Math.ceil(total / limit);

            return {
                data: favorites.map(favorite => this.toEntity(favorite)),
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

    async getMostFavorited(limit = 10) {
        try {
            const favorites = await Favorite.aggregate([
                {
                    $group: {
                        _id: '$id_producto',
                        count: { $sum: 1 },
                        first_added: { $min: '$added_at' }
                    }
                },
                {
                    $sort: { count: -1, first_added: 1 }
                },
                {
                    $limit: limit
                },
                {
                    $lookup: {
                        from: 'products',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $unwind: '$product'
                }
            ]);

            return favorites.map(item => ({
                product_id: item._id.toString(),
                favorite_count: item.count,
                product: item.product
            }));
        } catch (error) {
            throw error;
        }
    }

    async getUsersByFavoriteProduct(productId) {
        try {
            const favorites = await Favorite.find({ id_producto: productId })
                .populate('id_usuario', 'nombre correo')
                .sort({ added_at: -1 });

            return favorites.map(favorite => ({
                user: favorite.id_usuario,
                added_at: favorite.added_at
            }));
        } catch (error) {
            throw error;
        }
    }

    // Métodos auxiliares
    buildQuery(filters) {
        const query = {};

        if (filters.id_usuario) {
            query.id_usuario = filters.id_usuario;
        }

        if (filters.id_producto) {
            query.id_producto = filters.id_producto;
        }

        if (filters.fechaDesde) {
            query.added_at = { $gte: new Date(filters.fechaDesde) };
        }

        if (filters.fechaHasta) {
            if (query.added_at) {
                query.added_at.$lte = new Date(filters.fechaHasta);
            } else {
                query.added_at = { $lte: new Date(filters.fechaHasta) };
            }
        }

        return query;
    }

    toEntity(mongoFavorite) {
        // Check if id_producto is a string representation of a product object
        let productId = mongoFavorite.id_producto;
        
        // If it's already a string, leave it as is
        if (typeof productId === 'object' && productId !== null) {
            // If it's an object (MongoDB ObjectId), convert to string
            productId = productId.toString();
        }
        
        return new FavoriteEntity({
            id_usuario: mongoFavorite.id_usuario.toString(),
            id_producto: productId,
            added_at: mongoFavorite.added_at
        });
    }
}

module.exports = MongoFavoriteRepository;