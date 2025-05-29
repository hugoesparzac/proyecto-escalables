const AddFavorite = require('../../application/use-cases/favorites/AddFavorite');
const RemoveFavorite = require('../../application/use-cases/favorites/RemoveFavorite');
const GetUserFavorites = require('../../application/use-cases/favorites/GetUserFavorites');
const ToggleFavorite = require('../../application/use-cases/favorites/ToggleFavorite');

const MongoFavoriteRepository = require('../../infrastructure/repositories/MongoFavoriteRepository');
const MongoProductRepository = require('../../infrastructure/repositories/MongoProductRepository');

class FavoriteController {    constructor() {
        this.favoriteRepository = new MongoFavoriteRepository();
        this.productRepository = new MongoProductRepository();
        // Cambiar nombres para no sobrescribir métodos
        this.addFavoriteUseCase = new AddFavorite(this.favoriteRepository, this.productRepository);
        this.removeFavoriteUseCase = new RemoveFavorite(this.favoriteRepository);
        this.getUserFavoritesUseCase = new GetUserFavorites(this.favoriteRepository, this.productRepository);
        this.toggleFavoriteUseCase = new ToggleFavorite(this.favoriteRepository, this.productRepository);
    }    // Obtener favoritos del usuario
    async getUserFavorites(req, res, next) {
        try {
            const userId = req.user._id;
            const {
                page = 1,
                limit = 12,
                categoria,
                disponible,
                orderBy,
                orderDirection
            } = req.query;

            const options = {
                page: parseInt(page),
                limit: parseInt(limit),
                categoria: categoria || null,
                includeUnavailable: disponible !== 'false'
            };

            const result = await this.getUserFavoritesUseCase.execute(userId, options);
            
            res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
            res.set('Pragma', 'no-cache');
            res.set('Expires', '0');
            res.set('Surrogate-Control', 'no-store');
            res.status(200).json({
                success: true,
                message: 'Favoritos obtenidos exitosamente',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    // Agregar producto a favoritos
    async addFavorite(req, res, next) {
        try {
            const userId = req.user._id;
            const productId = req.body.id_producto;
            
            if (!productId) {
                return res.status(400).json({
                    success: false,
                    message: 'ID del producto es requerido'
                });
            }

            const result = await this.addFavoriteUseCase.execute(userId, productId);
            
            res.status(201).json({
                success: true,
                message: 'Producto agregado a favoritos exitosamente',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    // Remover producto de favoritos
    async removeFavorite(req, res, next) {
        try {
            const userId = req.user._id;
            const { productId } = req.params;
            
            if (!productId) {
                return res.status(400).json({
                    success: false,
                    message: 'ID del producto es requerido'
                });
            }

            const result = await this.removeFavoriteUseCase.execute(userId, productId);
            
            if (!result) {
                return res.status(404).json({
                    success: false,
                    message: 'Favorito no encontrado'
                });
            }
            
            res.status(200).json({
                success: true,
                message: 'Producto removido de favoritos exitosamente'
            });
        } catch (error) {
            next(error);
        }
    }

    // Toggle favorito (agregar si no existe, remover si existe)
    async toggleFavorite(req, res, next) {
        try {
            const userId = req.user._id;
            const { productId } = req.params;
            
            if (!productId) {
                return res.status(400).json({
                    success: false,
                    message: 'ID del producto es requerido'
                });
            }

            const result = await this.toggleFavoriteUseCase.execute(userId, productId);
            
            const message = result.added 
                ? 'Producto agregado a favoritos exitosamente'
                : 'Producto removido de favoritos exitosamente';
            
            res.status(200).json({
                success: true,
                message,
                data: {
                    isFavorite: result.added,
                    favorite: result.favorite
                }
            });
        } catch (error) {
            next(error);
        }
    }

    // Verificar si un producto es favorito
    async checkFavorite(req, res, next) {
        try {
            const userId = req.user._id;
            const { productId } = req.params;
            
            if (!productId) {
                return res.status(400).json({
                    success: false,
                    message: 'ID del producto es requerido'
                });
            }

            // const favorite = await this.favoriteRepository.findByUserAndProduct(userId, productId);
            const favorite = await this.favoriteRepository.findByUserIdAndProductId(userId, productId);
            
            res.status(200).json({
                success: true,
                message: 'Estado de favorito verificado',
                data: {
                    isFavorite: !!favorite,
                    favoriteId: favorite?.id_favorito || null
                }
            });
        } catch (error) {
            next(error);
        }
    }

    // Obtener resumen de favoritos del usuario
    async getFavoritesSummary(req, res, next) {
        try {
            const userId = req.user._id;
            
            const totalFavorites = await this.favoriteRepository.countByUserId(userId);
            const recentFavorites = await this.favoriteRepository.getRecentFavorites(userId, 7); // Últimos 7 días
            
            res.status(200).json({
                success: true,
                message: 'Resumen de favoritos obtenido exitosamente',
                data: {
                    totalFavorites,
                    recentCount: recentFavorites.length,
                    recentFavorites: recentFavorites.slice(0, 3) // Solo los 3 más recientes
                }
            });
        } catch (error) {
            next(error);
        }
    }

    // Obtener categorías de productos favoritos
    async getFavoriteCategories(req, res, next) {
        try {
            const userId = req.user._id;
            
            const favorites = await this.favoriteRepository.findByUserId(userId, {
                page: 1,
                limit: 1000 // Obtener todos para análisis
            });

            // Agrupar por categorías
            const categoriesMap = new Map();
            
            favorites.favorites.forEach(favorite => {
                if (favorite.product && favorite.product.categoria) {
                    const categoria = favorite.product.categoria;
                    const count = categoriesMap.get(categoria) || 0;
                    categoriesMap.set(categoria, count + 1);
                }
            });

            const categories = Array.from(categoriesMap.entries()).map(([name, count]) => ({
                categoria: name,
                count
            })).sort((a, b) => b.count - a.count);

            res.status(200).json({
                success: true,
                message: 'Categorías de favoritos obtenidas exitosamente',
                data: {
                    categories,
                    totalCategories: categories.length,
                    mostFavoriteCategory: categories[0] || null
                }
            });
        } catch (error) {
            next(error);
        }
    }

    // Limpiar favoritos (remover productos no disponibles)
    async cleanupFavorites(req, res, next) {
        try {
            const userId = req.user._id;
            
            const favorites = await this.favoriteRepository.findByUserId(userId, {
                page: 1,
                limit: 1000
            });

            let removedCount = 0;
            const removedItems = [];

            for (const favorite of favorites.favorites) {
                const product = await this.productRepository.findById(favorite.id_producto);
                
                // Remover si el producto no existe o no está activo
                if (!product || !product.activo) {
                    await this.favoriteRepository.delete(favorite.id_favorito);
                    removedCount++;
                    removedItems.push({
                        favoriteId: favorite.id_favorito,
                        productId: favorite.id_producto,
                        reason: !product ? 'Producto eliminado' : 'Producto desactivado'
                    });
                }
            }

            res.status(200).json({
                success: true,
                message: `Limpieza de favoritos completada. ${removedCount} items removidos.`,
                data: {
                    removedCount,
                    removedItems,
                    remainingFavorites: favorites.pagination.totalItems - removedCount
                }
            });
        } catch (error) {
            next(error);
        }
    }

    // Agregar múltiples productos a favoritos
    async addMultipleFavorites(req, res, next) {
        try {
            const userId = req.user._id;
            const { productIds } = req.body;
            
            if (!Array.isArray(productIds) || productIds.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Se requiere un array de IDs de productos'
                });
            }

            const results = [];
            const errors = [];

            for (const productId of productIds) {
                try {
                    const result = await this.addFavoriteUseCase.execute(userId, productId);
                    results.push({
                        productId,
                        success: true,
                        favorite: result
                    });
                } catch (error) {
                    errors.push({
                        productId,
                        success: false,
                        error: error.message
                    });
                }
            }

            res.status(200).json({
                success: true,
                message: `${results.length} productos agregados a favoritos, ${errors.length} errores`,
                data: {
                    successful: results,
                    errors,
                    summary: {
                        total: productIds.length,
                        successful: results.length,
                        failed: errors.length
                    }
                }
            });
        } catch (error) {
            next(error);
        }
    }
}

// Exportar solo la instancia para evitar confusión en require
module.exports = new FavoriteController();