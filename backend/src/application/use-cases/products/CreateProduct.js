const Product = require('../../../domain/entities/Product');

class CreateProduct {
    constructor(productRepository, categoryRepository) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
    }

    async execute(productData, adminUserId) {
        try {
            // Validar que el usuario sea admin (esto debería verificarse en el middleware)
            if (!adminUserId) {
                throw new Error('Se requieren permisos de administrador');
            }

            // Validar datos requeridos
            const { 
                nombre_producto, 
                precio, 
                descripcion, 
                calorias, 
                cantidad_stock, 
                id_categoria,
                url_imagen 
            } = productData;

            if (!nombre_producto || nombre_producto.trim().length === 0) {
                throw new Error('El nombre del producto es requerido');
            }

            if (!precio || precio <= 0) {
                throw new Error('El precio debe ser mayor a 0');
            }

            if (!id_categoria) {
                throw new Error('La categoría es requerida');
            }

            // Verificar que la categoría existe y está activa
            const category = await this.categoryRepository.findById(id_categoria);
            if (!category) {
                throw new Error('La categoría especificada no existe');
            }

            if (!category.activa) {
                throw new Error('La categoría especificada no está activa');
            }            // Crear entidad Product
            const product = new Product({
                nombre_producto: nombre_producto.trim(),
                precio: parseFloat(precio),
                descripcion: descripcion?.trim() || '',
                calorias: Number(calorias) || 0,
                cantidad_stock: Number(cantidad_stock) || 0,
                id_categoria,
                url_imagen: url_imagen || null,
                activo: true
            });

            // Validar la entidad
            if (!product.isValid()) {
                throw new Error('Datos de producto inválidos');
            }

            // Verificar que no exista un producto con el mismo nombre
            const existingProduct = await this.productRepository.findByName(product.nombre_producto);
            if (existingProduct) {
                throw new Error('Ya existe un producto con ese nombre');
            }

            // Guardar producto
            const savedProduct = await this.productRepository.create(product);

            return {
                success: true,
                message: 'Producto creado exitosamente',
                product: savedProduct
            };

        } catch (error) {
            throw error;
        }
    }
}

module.exports = CreateProduct;
