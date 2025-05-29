const Product = require('../../../infrastructure/database/models/Product');
const Category = require('../../../infrastructure/database/models/Category');

class GetProductsByCategory {
    async execute(categoryId, filters = {}) {
        const {
            sortBy = 'nombre_producto',
            sortOrder = 'asc',
            minPrice,
            maxPrice,
            inStock = true,
            page = 1,
            limit = 12,
            userId = null
        } = filters;

        // Verificar que la categoría existe y está activa
        const category = await Category.findOne({ _id: categoryId, activa: true });
        if (!category) {
            throw new Error('Categoría no encontrada o no activa');
        }

        // Construir query
        const query = { 
            id_categoria: categoryId, 
            activo: true 
        };

        // Filtrar por stock si se requiere
        if (inStock) {
            query.cantidad_stock = { $gt: 0 };
        }

        // Filtrar por rango de precios
        if (minPrice !== undefined || maxPrice !== undefined) {
            query.precio = {};
            if (minPrice !== undefined) query.precio.$gte = parseFloat(minPrice);
            if (maxPrice !== undefined) query.precio.$lte = parseFloat(maxPrice);
        }

        // Construir ordenamiento
        const sort = {};
        switch (sortBy) {
            case 'precio_asc':
                sort.precio = 1;
                break;
            case 'precio_desc':
                sort.precio = -1;
                break;
            case 'nombre':
                sort.nombre_producto = sortOrder === 'desc' ? -1 : 1;
                break;
            case 'stock':
                sort.cantidad_stock = sortOrder === 'desc' ? -1 : 1;
                break;
            default:
                sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
        }

        // Calcular paginación
        const skip = (page - 1) * limit;

        // Ejecutar consultas
        const [products, total] = await Promise.all([
            Product.find(query)
                .sort(sort)
                .skip(skip)
                .limit(parseInt(limit))
                .populate('id_categoria', 'nombre_categoria descripcion'),
            Product.countDocuments(query)
        ]);

        // Si hay usuario, obtener favoritos para marcar productos
        let favoriteProductIds = [];
        if (userId) {
            const Favorite = require('../../../infrastructure/database/models/Favorite');
            const favorites = await Favorite.find({ id_usuario: userId });
            favoriteProductIds = favorites.map(fav => fav.id_producto.toString());
        }

        // Enriquecer productos con información adicional
        const enrichedProducts = products.map(product => {
            const productObj = product.toJSON();
            return {
                ...productObj,
                isAvailable: product.cantidad_stock > 0 && product.activo,
                isFavorite: favoriteProductIds.includes(product._id.toString()),
                stockStatus: this.getStockStatus(product.cantidad_stock)
            };
        });

        // Obtener estadísticas de la categoría
        const categoryStats = await this.getCategoryStats(categoryId);

        return {
            products: enrichedProducts,
            category: {
                ...category.toJSON(),
                stats: categoryStats
            },
            pagination: {
                current: parseInt(page),
                pages: Math.ceil(total / limit),
                total,
                hasNext: page * limit < total,
                hasPrev: page > 1
            },
            appliedFilters: {
                sortBy,
                sortOrder,
                minPrice,
                maxPrice,
                inStock
            }
        };
    }

    getStockStatus(stock) {
        if (stock === 0) return 'agotado';
        if (stock <= 5) return 'pocas_unidades';
        if (stock <= 20) return 'stock_medio';
        return 'stock_alto';
    }

    async getCategoryStats(categoryId) {
        const stats = await Product.aggregate([
            { $match: { id_categoria: categoryId, activo: true } },
            {
                $group: {
                    _id: null,
                    totalProducts: { $sum: 1 },
                    availableProducts: {
                        $sum: {
                            $cond: [{ $gt: ['$cantidad_stock', 0] }, 1, 0]
                        }
                    },
                    avgPrice: { $avg: '$precio' },
                    minPrice: { $min: '$precio' },
                    maxPrice: { $max: '$precio' },
                    totalStock: { $sum: '$cantidad_stock' }
                }
            }
        ]);

        return stats[0] || {
            totalProducts: 0,
            availableProducts: 0,
            avgPrice: 0,
            minPrice: 0,
            maxPrice: 0,
            totalStock: 0
        };
    }

    // Obtener todas las categorías con conteo de productos
    async getAllCategoriesWithProducts() {
        const categories = await Category.aggregate([
            { $match: { activa: true } },
            {
                $lookup: {
                    from: 'products',
                    localField: '_id',
                    foreignField: 'id_categoria',
                    as: 'productos'
                }
            },
            {
                $addFields: {
                    totalProducts: { $size: '$productos' },
                    availableProducts: {
                        $size: {
                            $filter: {
                                input: '$productos',
                                cond: { 
                                    $and: [
                                        { $eq: ['$$item.activo', true] },
                                        { $gt: ['$$item.cantidad_stock', 0] }
                                    ]
                                }
                            }
                        }
                    }
                }
            },
            {
                $project: {
                    productos: 0
                }
            },
            { $sort: { nombre_categoria: 1 } }
        ]);

        return categories;
    }
}

module.exports = GetProductsByCategory;