const Category = require('../../../domain/entities/Category');

class GetCategories {
    constructor(categoryRepository, productRepository) {
        this.categoryRepository = categoryRepository;
        this.productRepository = productRepository;
    }

    async execute(options = {}) {
        try {
            const {
                includeInactive = false,
                includeProductCount = true,
                onlyWithProducts = false
            } = options;

            // Construir filtros
            const filters = {};
            if (!includeInactive) {
                filters.activa = true;
            }

            // Obtener categorías
            const categoriesResult = await this.categoryRepository.findByFilters(filters, {
                sortBy: 'nombre_categoria',
                sortOrder: 'asc'
            });

            // Manejar diferentes tipos de respuesta del repositorio
            let categoriesData = [];
            if (categoriesResult && categoriesResult.data) {
                categoriesData = categoriesResult.data;
            } else if (Array.isArray(categoriesResult)) {
                categoriesData = categoriesResult;
            } else {
                console.log('Unexpected repository response:', categoriesResult);
                categoriesData = [];
            }

            // Procesar cada categoría
            const categoriesWithDetails = await Promise.all(
                categoriesData.map(async (categoryData) => {
                    const category = new Category(categoryData);
                    const categoryJson = category.toJSON();

                    // Agregar conteo de productos si se solicita
                    if (includeProductCount) {
                        try {
                            const productCount = await this.productRepository.countByCategory(
                                category.id_categoria,
                                { activo: true }
                            );
                            categoryJson.product_count = productCount;
                        } catch (error) {
                            console.error(`Error contando productos para categoría ${category.id_categoria}:`, error);
                            categoryJson.product_count = 0;
                        }
                    }

                    return categoryJson;
                })
            );

            // Filtrar categorías que tienen productos si se solicita
            let filteredCategories = categoriesWithDetails;
            if (onlyWithProducts && includeProductCount) {
                filteredCategories = categoriesWithDetails.filter(cat => cat.product_count > 0);
            }

            return {
                categories: filteredCategories,
                total: filteredCategories.length,
                filters_applied: {
                    includeInactive,
                    includeProductCount,
                    onlyWithProducts
                }
            };

        } catch (error) {
            throw error;
        }
    }

    // Método específico para obtener categorías para el menú público
    async getPublicCategories() {
        return this.execute({
            includeInactive: false,
            includeProductCount: true,
            onlyWithProducts: true
        });
    }

    // Método para obtener una categoría específica con sus productos
    async getCategoryWithProducts(categoryId, options = {}) {
        try {
            const {
                page = 1,
                limit = 20,
                includeInactive = false
            } = options;

            // Obtener categoría
            const categoryData = await this.categoryRepository.findById(categoryId);
            if (!categoryData) {
                throw new Error('Categoría no encontrada');
            }

            const category = new Category(categoryData);

            // Verificar si la categoría está activa (si no es admin)
            if (!includeInactive && !category.activa) {
                throw new Error('Categoría no disponible');
            }

            // Obtener productos de la categoría
            const productFilters = { id_categoria: categoryId };
            if (!includeInactive) {
                productFilters.activo = true;
            }

            const products = await this.productRepository.findByFilters(productFilters, {
                page: parseInt(page),
                limit: parseInt(limit),
                sortBy: 'nombre_producto',
                sortOrder: 'asc'
            });

            return {
                category: category.toJSON(),
                products: {
                    data: products.data,
                    pagination: {
                        total: products.total,
                        page: products.page,
                        totalPages: products.totalPages,
                        hasNext: products.hasNext,
                        hasPrev: products.hasPrev,
                        limit: products.limit
                    }
                }
            };

        } catch (error) {
            throw error;
        }
    }
}

module.exports = GetCategories;
