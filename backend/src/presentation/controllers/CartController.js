const AddToCart = require('../../application/use-cases/cart/AddToCart');
const GetCart = require('../../application/use-cases/cart/GetCart');
const UpdateCartItem = require('../../application/use-cases/cart/UpdateCartItem');
const RemoveFromCart = require('../../application/use-cases/cart/RemoveFromCart');
const ClearCart = require('../../application/use-cases/cart/ClearCart');

const MongoCartRepository = require('../../infrastructure/repositories/MongoCartRepository');
const MongoProductRepository = require('../../infrastructure/repositories/MongoProductRepository');

class CartController {
    constructor() {
        this.cartRepository = new MongoCartRepository();
        this.productRepository = new MongoProductRepository();
          // Inicializar casos de uso
        this.addToCartUseCase = new AddToCart(this.cartRepository, this.productRepository);
        this.getCartUseCase = new GetCart(this.cartRepository, this.productRepository);
        this.updateCartItemUseCase = new UpdateCartItem(this.cartRepository, this.productRepository);
        this.removeFromCartUseCase = new RemoveFromCart(this.cartRepository);
        this.clearCartUseCase = new ClearCart(this.cartRepository);
    }    // Obtener carrito del usuario
    async getCart(req, res, next) {
        try {
            const userId = req.user._id;
            const result = await this.getCartUseCase.execute(userId);
            
            res.status(200).json({
                success: true,
                message: 'Carrito obtenido exitosamente',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }    // Agregar producto al carrito
    async addToCart(req, res, next) {
        try {
            console.log('AddToCart - Request body:', req.body);
            console.log('AddToCart - User:', req.user?._id);
            
            const userId = req.user._id;
            const { id_producto, cantidad = 1, notas } = req.body;
            
            console.log('AddToCart - Extracted data:', { userId, id_producto, cantidad, notas });
            
            if (!id_producto) {
                console.log('AddToCart - Missing product ID');
                return res.status(400).json({
                    success: false,
                    message: 'ID del producto es requerido'
                });
            }

            if (cantidad <= 0) {
                console.log('AddToCart - Invalid quantity');
                return res.status(400).json({
                    success: false,
                    message: 'La cantidad debe ser mayor a 0'
                });
            }

            console.log('AddToCart - Calling use case...');
            const result = await this.addToCartUseCase.execute(userId, id_producto, cantidad, notas);
            
            console.log('AddToCart - Success:', result);
            res.status(200).json({
                success: true,
                message: 'Producto agregado al carrito exitosamente',
                data: result
            });
        } catch (error) {
            console.log('AddToCart - Error:', error);
            next(error);
        }
    }

    // Actualizar cantidad de un item en el carrito
    async updateCartItem(req, res, next) {
        try {
            const userId = req.user._id;
            const { itemId } = req.params;
            const { cantidad, notas } = req.body;
            
            if (!cantidad || cantidad <= 0) {
                return res.status(400).json({
                    success: false,
                    message: 'La cantidad debe ser mayor a 0'
                });
            }

            const result = await this.updateCartItemUseCase.execute(userId, itemId, cantidad, notas);
            
            if (!result) {
                return res.status(404).json({
                    success: false,
                    message: 'Item del carrito no encontrado'
                });
            }
            
            res.status(200).json({
                success: true,
                message: 'Item del carrito actualizado exitosamente',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    // Remover item del carrito
    async removeFromCart(req, res, next) {
        try {
            const userId = req.user._id;
            const { itemId } = req.params;
            
            const result = await this.removeFromCartUseCase.execute(userId, itemId);
            
            if (!result) {
                return res.status(404).json({
                    success: false,
                    message: 'Item del carrito no encontrado'
                });
            }
            
            res.status(200).json({
                success: true,
                message: 'Item removido del carrito exitosamente',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    // Limpiar todo el carrito
    async clearCart(req, res, next) {
        try {
            const userId = req.user._id;
            const result = await this.clearCartUseCase.execute(userId);
            
            res.status(200).json({
                success: true,
                message: 'Carrito limpiado exitosamente',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    // Actualizar producto específico en el carrito por ID de producto
    async updateProductInCart(req, res, next) {
        try {
            const userId = req.user._id;
            const { productId } = req.params;
            const { cantidad, notas } = req.body;
            
            if (!cantidad || cantidad <= 0) {
                return res.status(400).json({
                    success: false,
                    message: 'La cantidad debe ser mayor a 0'
                });
            }

            // Buscar el carrito del usuario
            const cart = await this.cartRepository.findByUserId(userId);
            if (!cart) {
                return res.status(404).json({
                    success: false,
                    message: 'Carrito no encontrado'
                });
            }

            // Encontrar el item por ID de producto
            const item = cart.items.find(item => item.id_producto.toString() === productId);
            if (!item) {
                return res.status(404).json({
                    success: false,
                    message: 'Producto no encontrado en el carrito'
                });
            }

            const result = await this.updateCartItemUseCase.execute(userId, item.id, cantidad, notas);
            
            res.status(200).json({
                success: true,
                message: 'Producto en el carrito actualizado exitosamente',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    // Remover producto específico del carrito por ID de producto
    async removeProductFromCart(req, res, next) {
        try {
            const userId = req.user._id;
            const { productId } = req.params;
            
            // Buscar el carrito del usuario
            const cart = await this.cartRepository.findByUserId(userId);
            if (!cart) {
                return res.status(404).json({
                    success: false,
                    message: 'Carrito no encontrado'
                });
            }

            // Encontrar el item por ID de producto
            const item = cart.items.find(item => item.id_producto.toString() === productId);
            if (!item) {
                return res.status(404).json({
                    success: false,
                    message: 'Producto no encontrado en el carrito'
                });
            }

            const result = await this.removeFromCartUseCase.execute(userId, item.id);
            
            res.status(200).json({
                success: true,
                message: 'Producto removido del carrito exitosamente',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    // Obtener resumen del carrito (cantidad de items y total)
    async getCartSummary(req, res, next) {
        try {
            const userId = req.user._id;
            const cart = await this.cartRepository.findByUserId(userId);
            
            if (!cart) {
                return res.status(200).json({
                    success: true,
                    message: 'Resumen del carrito obtenido',
                    data: {
                        totalItems: 0,
                        totalAmount: 0,
                        isEmpty: true
                    }
                });
            }

            const summary = {
                totalItems: cart.getTotalItems(),
                totalAmount: cart.getTotal(),
                isEmpty: cart.isEmpty(),
                itemCount: cart.items.length
            };
            
            res.status(200).json({
                success: true,
                message: 'Resumen del carrito obtenido exitosamente',
                data: summary
            });
        } catch (error) {
            next(error);
        }
    }

    // Validar carrito antes del checkout
    async validateCart(req, res, next) {
        try {
            const userId = req.user._id;
            const cart = await this.cartRepository.findByUserId(userId);
            
            if (!cart || cart.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'El carrito está vacío'
                });
            }

            // Verificar disponibilidad de productos
            const validationResults = [];
            let isValid = true;

            for (const item of cart.items) {
                const product = await this.productRepository.findById(item.id_producto);
                
                if (!product) {
                    validationResults.push({
                        itemId: item.id,
                        productId: item.id_producto,
                        issue: 'Producto no encontrado',
                        valid: false
                    });
                    isValid = false;
                    continue;
                }

                if (!product.activo || !product.disponible) {
                    validationResults.push({
                        itemId: item.id,
                        productId: item.id_producto,
                        productName: product.nombre,
                        issue: 'Producto no disponible',
                        valid: false
                    });
                    isValid = false;
                    continue;
                }

                if (product.stock < item.cantidad) {
                    validationResults.push({
                        itemId: item.id,
                        productId: item.id_producto,
                        productName: product.nombre,
                        issue: `Stock insuficiente. Disponible: ${product.stock}, solicitado: ${item.cantidad}`,
                        valid: false,
                        availableStock: product.stock
                    });
                    isValid = false;
                    continue;
                }

                validationResults.push({
                    itemId: item.id,
                    productId: item.id_producto,
                    productName: product.nombre,
                    valid: true
                });
            }

            res.status(200).json({
                success: true,
                message: 'Validación del carrito completada',
                data: {
                    isValid,
                    validationResults,
                    cart: isValid ? cart : null
                }
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = CartController;