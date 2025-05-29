const GetProducts = require('../../application/use-cases/products/GetProducts');
const GetProductDetails = require('../../application/use-cases/products/GetProductDetails');
const CreateProduct = require('../../application/use-cases/products/CreateProduct');
const UpdateProduct = require('../../application/use-cases/products/UpdateProduct');
const DeleteProduct = require('../../application/use-cases/products/DeleteProduct');
const SearchProducts = require('../../application/use-cases/products/SearchProducts');

const MongoProductRepository = require('../../infrastructure/repositories/MongoProductRepository');
const MongoCategoryRepository = require('../../infrastructure/repositories/MongoCategoryRepository');

class ProductController {    constructor() {
        this.productRepository = new MongoProductRepository();
        this.categoryRepository = new MongoCategoryRepository();
        
        // Inicializar casos de uso
        this.getProductsUseCase = new GetProducts(this.productRepository);
        this.getProductDetailsUseCase = new GetProductDetails(this.productRepository);
        this.createProductUseCase = new CreateProduct(this.productRepository, this.categoryRepository);
        this.updateProductUseCase = new UpdateProduct(this.productRepository, this.categoryRepository);
        this.deleteProductUseCase = new DeleteProduct(this.productRepository);
        this.searchProductsUseCase = new SearchProducts(this.productRepository);
    }

    // Obtener todos los productos con filtros y paginación
    async getProducts(req, res, next) {
        try {
            const {
                page = 1,
                limit = 12,
                categoria,
                activo,
                disponible,
                minPrice,
                maxPrice,
                orderBy,
                orderDirection,
                featured
            } = req.query;

            const filters = {};
            
            if (categoria) filters.categoria = categoria;
            if (activo !== undefined) filters.activo = activo === 'true';
            if (disponible !== undefined) filters.disponible = disponible === 'true';
            if (minPrice) filters.minPrice = parseFloat(minPrice);
            if (maxPrice) filters.maxPrice = parseFloat(maxPrice);
            if (featured !== undefined) filters.destacado = featured === 'true';

            const options = {
                page: parseInt(page),
                limit: parseInt(limit),
                orderBy: orderBy || 'fecha_creacion',                orderDirection: orderDirection || 'desc'
            };

            const result = await this.getProductsUseCase.execute(filters, options);
            
            res.status(200).json({
                success: true,
                message: 'Productos obtenidos exitosamente',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    // Obtener detalles de un producto específico
    async getProductById(req, res, next) {        try {
            const { id } = req.params;
            const result = await this.getProductDetailsUseCase.execute(id);
            
            if (!result) {
                return res.status(404).json({
                    success: false,
                    message: 'Producto no encontrado'
                });
            }
            
            res.status(200).json({
                success: true,
                message: 'Producto obtenido exitosamente',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    // Buscar productos
    async searchProducts(req, res, next) {
        try {
            const {
                q: query,
                page = 1,
                limit = 12,
                categoria,
                minPrice,
                maxPrice
            } = req.query;

            if (!query) {
                return res.status(400).json({
                    success: false,
                    message: 'Parámetro de búsqueda requerido'
                });
            }

            const filters = { categoria, minPrice, maxPrice };
            const options = {
                page: parseInt(page),
                limit: parseInt(limit)
            };

            const result = await this.searchProductsUseCase.execute(query, filters, options);
            
            res.status(200).json({
                success: true,
                message: 'Búsqueda completada exitosamente',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    // Crear nuevo producto (solo admin)
    async createProduct(req, res, next) {
        try {
            const productData = req.body;
            
            // Agregar imagen si se subió
            if (req.file) {
                productData.imagen = `/uploads/${req.file.filename}`;
            }
            
            const result = await this.createProductUseCase.execute(productData);
            
            res.status(201).json({
                success: true,
                message: 'Producto creado exitosamente',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    // Actualizar producto (solo admin)
    async updateProduct(req, res, next) {
        try {
            const { id } = req.params;
            const updateData = req.body;
              // Agregar imagen si se subió
            if (req.file) {
                updateData.imagen = `/uploads/${req.file.filename}`;
            }
            // PASAR EL ID DEL ADMIN AUTENTICADO
            const result = await this.updateProductUseCase.execute(id, updateData, req.user._id);
            if (!result) {
                return res.status(404).json({
                    success: false,
                    message: 'Producto no encontrado'
                });
            }
            res.status(200).json({
                success: true,
                message: 'Producto actualizado exitosamente',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    // Eliminar producto (solo admin)
    async deleteProduct(req, res, next) {        try {
            const { id } = req.params;
            const result = await this.deleteProductUseCase.execute(id);
            
            if (!result) {
                return res.status(404).json({
                    success: false,
                    message: 'Producto no encontrado'
                });
            }
            
            res.status(200).json({
                success: true,
                message: 'Producto eliminado exitosamente'
            });
        } catch (error) {
            next(error);
        }
    }

    // Obtener productos por categoría
    async getProductsByCategory(req, res, next) {
        try {
            const { categoryId } = req.params;
            const {
                page = 1,
                limit = 12,
                activo,
                disponible,
                orderBy,
                orderDirection
            } = req.query;

            const filters = { categoria: categoryId };
            if (activo !== undefined) filters.activo = activo === 'true';
            if (disponible !== undefined) filters.disponible = disponible === 'true';

            const options = {
                page: parseInt(page),
                limit: parseInt(limit),
                orderBy: orderBy || 'fecha_creacion',
                orderDirection: orderDirection || 'desc'            };

            const result = await this.getProductsUseCase.execute(filters, options);
            
            res.status(200).json({
                success: true,
                message: 'Productos de la categoría obtenidos exitosamente',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    // Obtener productos destacados
    async getFeaturedProducts(req, res, next) {
        try {
            const { limit = 6 } = req.query;
            
            const filters = { destacado: true, activo: true, disponible: true };
            const options = {
                page: 1,
                limit: parseInt(limit),
                orderBy: 'fecha_creacion',
                orderDirection: 'desc'            };

            const result = await this.getProductsUseCase.execute(filters, options);
            
            res.status(200).json({
                success: true,
                message: 'Productos destacados obtenidos exitosamente',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    // Cambiar estado activo del producto (solo admin)
    async toggleActiveStatus(req, res, next) {
        try {
            const { id } = req.params;
            const product = await this.productRepository.findById(id);
            
            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: 'Producto no encontrado'
                });
            }            const updateData = { activo: !product.activo };
            const result = await this.updateProductUseCase.execute(id, updateData);
            
            res.status(200).json({
                success: true,
                message: `Producto ${result.activo ? 'activado' : 'desactivado'} exitosamente`,
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    // Actualizar stock del producto (solo admin)
    async updateStock(req, res, next) {
        try {
            const { id } = req.params;
            const { stock } = req.body;
            
            if (stock === undefined || stock < 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Stock inválido'
                });
            }

            const updateData = { 
                stock: parseInt(stock),
                disponible: parseInt(stock) > 0            };
            
            const result = await this.updateProductUseCase.execute(id, updateData);
            
            if (!result) {
                return res.status(404).json({
                    success: false,
                    message: 'Producto no encontrado'
                });
            }
            
            res.status(200).json({
                success: true,
                message: 'Stock actualizado exitosamente',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = ProductController;