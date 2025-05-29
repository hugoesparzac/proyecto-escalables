const Favorite = require('../../../domain/entities/Favorite');

class GetUserFavorites {
    constructor(favoriteRepository, productRepository) {
        this.favoriteRepository = favoriteRepository;
        this.productRepository = productRepository;
    }

    async execute(userId, options = {}) {
        console.log('[GetUserFavorites] Ejecutando para userId:', userId, 'options:', options);
        try {
            // Validar entrada
            if (!userId) {
                throw new Error('ID de usuario es requerido');
            }

            const { 
                page = 1, 
                limit = 20, 
                categoria = null,
                includeUnavailable = false 
            } = options;

            // Obtener favoritos del usuario
            const favoritesResult = await this.favoriteRepository.findByUserId(userId);
            const favorites = Array.isArray(favoritesResult?.data) ? favoritesResult.data : [];

            if (!favorites || favorites.length === 0) {
                return {
                    favorites: [],
                    total: 0,
                    page: parseInt(page),
                    totalPages: 0,
                    hasNext: false,
                    hasPrev: false
                };
            }
            
            // Obtener información detallada de cada producto favorito
            const favoritesDetallados = await Promise.all(
                favorites.map(async (favorite) => {
                    try {
                        // Extract product ID if it's stored as a string representation
                        let productId = favorite.id_producto;
                        
                        // If productId is a string and contains ObjectId, extract the ID
                        if (typeof productId === 'string' && productId.includes('ObjectId')) {
                            console.log(`Extracting ObjectId from string: ${productId.substring(0, 50)}...`);
                            const match = productId.match(/ObjectId\(['"]([^'"]+)['"]\)/);
                            if (match && match[1]) {
                                productId = match[1];
                                console.log(`Extracted product ID: ${productId}`);
                            }
                        }
                        
                        console.log(`Buscando producto con ID: ${productId}`);
                        const producto = await this.productRepository.findById(productId);
                        console.log(`Resultado de buscar producto ${productId}:`, producto ? 'Encontrado' : 'No encontrado');
                        
                        if (!producto) {
                            return {
                                favorite,
                                producto: null,
                                disponible: false,
                                added_at: favorite.added_at
                            };
                        }

                        // Verificar si el producto está disponible
                        const disponible = producto.isAvailable();
                        console.log(`Producto ${producto.nombre_producto} disponible: ${disponible}`);

                        return {
                            favorite,
                            producto: {
                                _id: producto.id || producto._id || producto.id_producto, // Ensure _id exists
                                id_producto: producto.id_producto,
                                nombre_producto: producto.nombre_producto,
                                precio: producto.precio,
                                descripcion: producto.descripcion,
                                calorias: producto.calorias,
                                cantidad_stock: producto.cantidad_stock,
                                id_categoria: producto.id_categoria,
                                url_imagen: producto.url_imagen,
                                activo: producto.activo
                            },
                            disponible,
                            added_at: favorite.added_at
                        };
                    } catch (error) {
                        console.error(`Error obteniendo producto favorito ${favorite.id_producto}:`, error);
                        return {
                            favorite,
                            producto: null,
                            disponible: false,
                            added_at: favorite.added_at
                        };
                    }
                })
            );

            // Filtrar productos según preferencias
            let filteredFavorites = favoritesDetallados;

            // Filtrar por disponibilidad
            if (!includeUnavailable) {
                filteredFavorites = filteredFavorites.filter(item => 
                    item.disponible && item.producto
                );
            }            // Filtrar por categoría
            if (categoria) {
                filteredFavorites = filteredFavorites.filter(item => 
                    item.producto && 
                    (item.producto.id_categoria ? item.producto.id_categoria.toString() === categoria.toString() : false)
                );
            }

            // Ordenar por fecha de agregado (más recientes primero)
            filteredFavorites.sort((a, b) => new Date(b.added_at) - new Date(a.added_at));

            // Paginación
            const startIndex = (page - 1) * limit;
            const endIndex = startIndex + limit;
            const paginatedFavorites = filteredFavorites.slice(startIndex, endIndex);            const total = filteredFavorites.length;
            const totalPages = Math.ceil(total / limit);

            // Limpiar favoritos de productos que ya no existen
            const favoritesToRemove = favoritesDetallados.filter(item => !item.producto);
            if (favoritesToRemove.length > 0) {
                console.log(`Hay ${favoritesToRemove.length} favoritos a remover por productos no existentes`);
                for (const item of favoritesToRemove) {
                    try {
                        await this.favoriteRepository.remove(userId, item.favorite.id_producto);
                    } catch (error) {
                        console.error(`Error removiendo favorito inválido:`, error);
                    }
                }
            }

            // Depuración: log de favoritos y paginados
            console.log('favorites:', favorites);
            console.log('favoritesDetallados:', favoritesDetallados);
            console.log('filteredFavorites:', filteredFavorites);
            console.log('paginatedFavorites:', paginatedFavorites);
            // Depuración: log detallado de la respuesta
            console.log('RESPONSE FAVORITOS:', {
                productos: paginatedFavorites.map(item => item.producto).filter(Boolean),
                total,
                page: parseInt(page),
                totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1,
                removedCount: favoritesToRemove.length
            });            return {
                favorites: paginatedFavorites,
                productos: paginatedFavorites
                    .filter(item => item.producto) // Filter out null products
                    .map(item => {
                        // Ensure _id exists and is in the correct format
                        const producto = item.producto;
                        return {
                            ...producto,
                            _id: producto._id || producto.id_producto
                        };
                    }),
                total,
                page: parseInt(page),
                totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1,
                removedCount: favoritesToRemove.length
            };

        } catch (error) {
            throw error;
        }
    }
}

module.exports = GetUserFavorites;
