const Cart = require('../../../domain/entities/Cart');

class GetCart {
    constructor(cartRepository, productRepository) {
        this.cartRepository = cartRepository;
        this.productRepository = productRepository;
    }

    async execute(userId) {
        try {
            // Validar entrada
            if (!userId) {
                throw new Error('ID de usuario es requerido');
            }

            // Buscar carrito del usuario
            let cartData = await this.cartRepository.findByUserId(userId);
            
            if (!cartData) {
                // Si no existe carrito, crear uno vacío
                const emptyCart = new Cart({ id_usuario: userId });
                return emptyCart.toJSON();
            }

            // Crear entidad Cart
            const cart = new Cart(cartData);

            // Obtener información detallada de cada producto
            const productosDetallados = await Promise.all(
                cart.productos.map(async (item) => {
                    try {
                        console.log('🔍 GetCart Debug - Processing item:', {
                            id_producto: item.id_producto,
                            id_type: typeof item.id_producto,
                            cantidad: item.cantidad
                        });
                        
                        const producto = await this.productRepository.findById(item.id_producto);
                        
                        console.log('🔍 GetCart Debug - Product result:', {
                            found: !!producto,
                            product_id: producto?.id_producto,
                            product_name: producto?.nombre_producto
                        });
                        
                        if (!producto) {
                            // Si el producto ya no existe, marcarlo para eliminación
                            console.log('❌ GetCart Debug - Product not found, marking for removal');
                            return {
                                ...item,
                                producto: null,
                                disponible: false,
                                error: 'Producto no disponible'
                            };
                        }

                        // Verificar disponibilidad
                        const disponible = producto.isAvailable() && producto.hasStock(item.cantidad);
                        
                        return {
                            ...item,
                            producto: {
                                id_producto: producto.id_producto,
                                nombre_producto: producto.nombre_producto,
                                precio: producto.precio,
                                url_imagen: producto.url_imagen,
                                cantidad_stock: producto.cantidad_stock,
                                activo: producto.activo
                            },
                            disponible,
                            precio_actual: producto.precio,
                            cambio_precio: item.precio_unitario !== producto.precio,
                            stock_disponible: producto.cantidad_stock,
                            stock_suficiente: producto.hasStock(item.cantidad)
                        };                    } catch (error) {
                        console.error('❌ GetCart Debug - Error in productRepository.findById:');
                        console.error('   Item ID:', item.id_producto);
                        console.error('   Error:', error.message);
                        console.error('   Stack:', error.stack);
                        return {
                            ...item,
                            producto: null,
                            disponible: false,
                            error: 'Error obteniendo información del producto'
                        };
                    }
                })
            );

            // Filtrar productos que ya no existen o no están disponibles
            const productosValidos = productosDetallados.filter(item => item.disponible);
            const productosNoDisponibles = productosDetallados.filter(item => !item.disponible);

            // Si hay productos no disponibles, actualizar el carrito
            if (productosNoDisponibles.length > 0) {
                for (const item of productosNoDisponibles) {
                    cart.removeProduct(item.id_producto);
                }
                // Guardar carrito actualizado
                await this.cartRepository.update(userId, cart);
            }

            // Actualizar precios si han cambiado
            const productosConCambiosPrecio = productosValidos.filter(item => item.cambio_precio);
            if (productosConCambiosPrecio.length > 0) {
                for (const item of productosConCambiosPrecio) {
                    cart.productos.find(p => p.id_producto === item.id_producto).precio_unitario = item.precio_actual;
                }
                await this.cartRepository.update(userId, cart);
            }

            return {
                ...cart.toJSON(),
                productos: productosValidos,
                productos_removidos: productosNoDisponibles,
                cambios_realizados: productosNoDisponibles.length > 0 || productosConCambiosPrecio.length > 0
            };

        } catch (error) {
            throw error;
        }
    }
}

module.exports = GetCart;
