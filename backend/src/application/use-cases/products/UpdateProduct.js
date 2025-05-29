const Product = require('../../../domain/entities/Product');

class UpdateProduct {
    constructor(productRepository, categoryRepository) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
    }

    async execute(productId, updateData, adminUserId) {
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

            // Validar datos de actualización
            const validFields = [
                'nombre_producto', 
                'precio', 
                'descripcion', 
                'calorias', 
                'cantidad_stock', 
                'id_categoria',
                'url_imagen',
                'activo'
            ];

            const updateFields = {};

            // Validar y procesar cada campo
            for (const [key, value] of Object.entries(updateData)) {
                if (!validFields.includes(key)) {
                    continue; // Ignorar campos no válidos
                }

                switch (key) {
                    case 'nombre_producto':
                        if (value && value.trim().length > 0) {
                            // Verificar que no exista otro producto con el mismo nombre
                            const productWithName = await this.productRepository.findByName(value.trim());
                            if (productWithName && productWithName.id_producto !== productId) {
                                throw new Error('Ya existe un producto con ese nombre');
                            }
                            updateFields.nombre_producto = value.trim();
                        }
                        break;                    case 'precio':
                        if (value !== undefined) {
                            const precio = parseFloat(value);
                            if (precio <= 0) {
                                throw new Error('El precio debe ser mayor a 0');
                            }
                            updateFields.precio = precio;
                        }
                        break;

                    case 'descripcion':
                        if (value !== undefined) {
                            updateFields.descripcion = value.trim();
                        }
                        break;

                    case 'calorias':
                        if (value !== undefined) {
                            const calorias = Number(value);
                            if (calorias < 0) {
                                throw new Error('Las calorías no pueden ser negativas');
                            }
                            updateFields.calorias = calorias;
                        }
                        break;

                    case 'cantidad_stock':
                        if (value !== undefined) {
                            const stock = Number(value);
                            if (stock < 0) {
                                throw new Error('El stock no puede ser negativo');
                            }
                            updateFields.cantidad_stock = stock;
                        }
                        break;

                    case 'id_categoria':
                        if (value) {
                            // Verificar que la categoría existe y está activa
                            const category = await this.categoryRepository.findById(value);
                            if (!category) {
                                throw new Error('La categoría especificada no existe');
                            }
                            if (!category.activa) {
                                throw new Error('La categoría especificada no está activa');
                            }
                            updateFields.id_categoria = value;
                        }
                        break;

                    case 'url_imagen':
                        updateFields.url_imagen = value;
                        break;

                    case 'activo':
                        if (typeof value === 'boolean') {
                            updateFields.activo = value;
                        }
                        break;
                }
            }

            if (Object.keys(updateFields).length === 0) {
                throw new Error('No se proporcionaron campos válidos para actualizar');
            }

            // Actualizar producto
            const updatedProduct = await this.productRepository.update(productId, updateFields);

            if (!updatedProduct) {
                throw new Error('Error al actualizar el producto');
            }

            return {
                success: true,
                message: 'Producto actualizado exitosamente',
                product: updatedProduct
            };

        } catch (error) {
            throw error;
        }
    }
}

module.exports = UpdateProduct;
