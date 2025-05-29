const Category = require('../../../domain/entities/Category');

class DeleteCategory {
    constructor(categoryRepository, productRepository) {
        this.categoryRepository = categoryRepository;
        this.productRepository = productRepository;
    }

    async execute(categoryId, adminUserId, options = {}) {
        try {
            // Validar permisos
            if (!adminUserId) {
                throw new Error('Se requieren permisos de administrador');
            }

            // Validar entrada
            if (!categoryId) {
                throw new Error('ID de categoría es requerido');
            }

            const { force = false } = options;

            // Obtener categoría
            const existingCategoryData = await this.categoryRepository.findById(categoryId);
            if (!existingCategoryData) {
                throw new Error('Categoría no encontrada');
            }

            const category = new Category(existingCategoryData);

            // Verificar si la categoría tiene productos asociados
            const productCount = await this.productRepository.countByCategory(categoryId);
            
            if (productCount > 0 && !force) {
                return {
                    success: false,
                    canDelete: false,
                    message: `No se puede eliminar la categoría porque tiene ${productCount} producto(s) asociado(s)`,
                    productCount,
                    suggestions: [
                        'Mover los productos a otra categoría',
                        'Eliminar primero los productos',
                        'Desactivar la categoría en lugar de eliminarla',
                        'Usar la opción force para eliminar forzadamente'
                    ]
                };
            }

            // Si hay productos y se usa force, manejar los productos
            if (productCount > 0 && force) {
                try {
                    // Opción 1: Desactivar productos de la categoría
                    await this.productRepository.deactivateByCategory(categoryId);
                    
                    // Opción 2: O eliminar productos (más drástico)
                    // await this.productRepository.deleteByCategory(categoryId);
                    
                } catch (error) {
                    console.error('Error manejando productos de la categoría:', error);
                    throw new Error('Error procesando productos de la categoría');
                }
            }

            // Eliminar categoría
            await this.categoryRepository.delete(categoryId);

            return {
                success: true,
                message: 'Categoría eliminada exitosamente',
                category: category.toJSON(),
                productsAffected: productCount,
                wasForced: force && productCount > 0
            };

        } catch (error) {
            throw error;
        }
    }

    // Método para obtener información antes de eliminar
    async getDeleteInfo(categoryId, adminUserId) {
        try {
            // Validar permisos
            if (!adminUserId) {
                throw new Error('Se requieren permisos de administrador');
            }

            // Obtener categoría
            const existingCategoryData = await this.categoryRepository.findById(categoryId);
            if (!existingCategoryData) {
                throw new Error('Categoría no encontrada');
            }

            const category = new Category(existingCategoryData);

            // Obtener estadísticas
            const [
                totalProducts,
                activeProducts,
                inactiveProducts
            ] = await Promise.all([
                this.productRepository.countByCategory(categoryId),
                this.productRepository.countByCategory(categoryId, { activo: true }),
                this.productRepository.countByCategory(categoryId, { activo: false })
            ]);

            // Determinar si se puede eliminar
            const canDelete = totalProducts === 0;
            const requiresForce = totalProducts > 0;

            return {
                category: category.toJSON(),
                canDelete,
                requiresForce,
                statistics: {
                    totalProducts,
                    activeProducts,
                    inactiveProducts
                },
                warnings: totalProducts > 0 ? [
                    `La categoría tiene ${totalProducts} producto(s) asociado(s)`,
                    activeProducts > 0 ? `${activeProducts} producto(s) están activos` : null,
                    'Eliminar la categoría desactivará todos sus productos'
                ].filter(Boolean) : [],
                recommendations: totalProducts > 0 ? [
                    'Considera mover los productos a otra categoría',
                    'O desactivar la categoría en lugar de eliminarla',
                    'Los productos se desactivarán automáticamente si eliminas con force'
                ] : []
            };

        } catch (error) {
            throw error;
        }
    }
}

module.exports = DeleteCategory;
