class DeleteProduct {
    constructor(productRepository) {
        this.productRepository = productRepository;
    }

    async execute(productId, adminUserId, options = {}) {
        try {
            // Validar que el usuario sea admin
            if (!adminUserId) {
                throw new Error('Se requieren permisos de administrador');
            }

            // Verificar que el producto existe
            const existingProduct = await this.productRepository.findById(productId);
            if (!existingProduct) {
                throw new Error('Producto no encontrado');
            }

            // Verificar si el producto está en uso (en carritos, órdenes, etc.)
            const isInUse = await this.productRepository.isProductInUse(productId);
            
            if (isInUse && !options.force) {
                // En lugar de eliminar físicamente, desactivar el producto
                const deactivatedProduct = await this.productRepository.update(productId, { 
                    activo: false 
                });

                return {
                    success: true,
                    message: 'Producto desactivado debido a que está en uso. Use force=true para eliminación completa.',
                    action: 'deactivated',
                    product: deactivatedProduct
                };
            }

            // Eliminación física del producto
            const deleted = await this.productRepository.delete(productId);

            if (!deleted) {
                throw new Error('Error al eliminar el producto');
            }

            return {
                success: true,
                message: 'Producto eliminado exitosamente',
                action: 'deleted',
                productId
            };

        } catch (error) {
            throw error;
        }
    }

    // Método para obtener información antes de eliminar
    async getDeleteInfo(productId, adminUserId) {
        try {
            // Validar que el usuario sea admin
            if (!adminUserId) {
                throw new Error('Se requieren permisos de administrador');
            }

            // Verificar que el producto existe
            const product = await this.productRepository.findById(productId);
            if (!product) {
                throw new Error('Producto no encontrado');
            }

            // Obtener información de uso del producto
            const isInUse = await this.productRepository.isProductInUse(productId);

            return {
                product,
                isInUse,
                canDelete: !isInUse,
                recommendation: isInUse 
                    ? 'Se recomienda desactivar el producto en lugar de eliminarlo'
                    : 'El producto puede ser eliminado de forma segura'
            };

        } catch (error) {
            throw error;
        }
    }
}

module.exports = DeleteProduct;
