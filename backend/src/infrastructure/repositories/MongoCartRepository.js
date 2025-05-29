const CartRepository = require('../../domain/repositories/CartRepository');
const Cart = require('../database/models/Cart');
const CartEntity = require('../../domain/entities/Cart');

class MongoCartRepository extends CartRepository {
    async create(cartEntity) {
        try {
            const cartData = {
                id_usuario: cartEntity.id_usuario,
                items: cartEntity.productos.map(item => ({
                    id_producto: item.id_producto,
                    cantidad: item.cantidad,
                    precio_unitario: item.precio_unitario
                }))
            };

            const cart = new Cart(cartData);
            cart.calculateTotal();
            const savedCart = await cart.save();
            
            return this.toEntity(savedCart);
        } catch (error) {
            throw error;
        }
    }

    async findByUserId(userId) {
        try {
            const cart = await Cart.findOne({ id_usuario: userId });
            return cart ? this.toEntity(cart) : null;
        } catch (error) {
            throw error;
        }
    }

    async update(userId, cartEntity) {
        try {
            const updateData = {
                items: cartEntity.productos.map(item => ({
                    id_producto: item.id_producto,
                    cantidad: item.cantidad,
                    precio_unitario: item.precio_unitario
                })),
                updatedAt: new Date()
            };

            const cart = await Cart.findOneAndUpdate(
                { id_usuario: userId },
                updateData,
                { new: true, upsert: true }
            );

            if (cart) {
                cart.calculateTotal();
                await cart.save();
            }

            return cart ? this.toEntity(cart) : null;
        } catch (error) {
            throw error;
        }
    }

    async delete(userId) {
        try {
            const result = await Cart.findOneAndDelete({ id_usuario: userId });
            return !!result;
        } catch (error) {
            throw error;
        }
    }

    async addItem(userId, productId, quantity, unitPrice) {
        try {
            let cart = await Cart.findOne({ id_usuario: userId });
            
            if (!cart) {
                cart = new Cart({
                    id_usuario: userId,
                    items: []
                });
            }

            // Verificar si el producto ya existe en el carrito
            const existingItemIndex = cart.items.findIndex(
                item => item.id_producto.toString() === productId
            );

            if (existingItemIndex !== -1) {
                // Actualizar cantidad del producto existente
                cart.items[existingItemIndex].cantidad += quantity;
            } else {
                // Agregar nuevo producto
                cart.items.push({
                    id_producto: productId,
                    cantidad: quantity,
                    precio_unitario: unitPrice
                });
            }

            cart.calculateTotal();
            const savedCart = await cart.save();
            
            return this.toEntity(savedCart);
        } catch (error) {
            throw error;
        }
    }

    async updateItem(userId, productId, quantity) {
        try {
            const cart = await Cart.findOne({ id_usuario: userId });
            
            if (!cart) {
                throw new Error('Carrito no encontrado');
            }

            const itemIndex = cart.items.findIndex(
                item => item.id_producto.toString() === productId
            );

            if (itemIndex === -1) {
                throw new Error('Producto no encontrado en el carrito');
            }

            if (quantity <= 0) {
                // Remover el producto si la cantidad es 0 o menor
                cart.items.splice(itemIndex, 1);
            } else {
                // Actualizar la cantidad
                cart.items[itemIndex].cantidad = quantity;
            }

            cart.calculateTotal();
            const savedCart = await cart.save();
            
            return this.toEntity(savedCart);
        } catch (error) {
            throw error;
        }
    }

    async removeItem(userId, productId) {
        try {
            const cart = await Cart.findOne({ id_usuario: userId });
            
            if (!cart) {
                throw new Error('Carrito no encontrado');
            }

            const initialLength = cart.items.length;
            cart.items = cart.items.filter(
                item => item.id_producto.toString() !== productId
            );

            if (cart.items.length === initialLength) {
                throw new Error('Producto no encontrado en el carrito');
            }

            cart.calculateTotal();
            const savedCart = await cart.save();
            
            return this.toEntity(savedCart);
        } catch (error) {
            throw error;
        }
    }

    async clear(userId) {
        try {
            const cart = await Cart.findOne({ id_usuario: userId });
            
            if (!cart) {
                return true; // Si no existe carrito, consideramos que ya está limpio
            }

            cart.items = [];
            cart.total = 0;
            await cart.save();
            
            return true;
        } catch (error) {
            throw error;
        }
    }

    async getItemCount(userId) {
        try {
            const cart = await Cart.findOne({ id_usuario: userId });
            
            if (!cart) {
                return 0;
            }

            return cart.items.reduce((total, item) => total + item.cantidad, 0);
        } catch (error) {
            throw error;
        }
    }

    async calculateTotal(userId) {
        try {
            const cart = await Cart.findOne({ id_usuario: userId });
            
            if (!cart) {
                return 0;
            }

            const total = cart.items.reduce((sum, item) => {
                return sum + (item.cantidad * item.precio_unitario);
            }, 0);

            // Actualizar el total en la base de datos
            cart.total = total;
            await cart.save();
            
            return total;
        } catch (error) {
            throw error;
        }
    }    // Método auxiliar para convertir del modelo MongoDB a entidad del dominio
    toEntity(mongoCart) {
        if (!mongoCart) return null;

        return new CartEntity({
            id_usuario: mongoCart.id_usuario.toString(),
            productos: mongoCart.items.map(item => {
                // Handle both populated and non-populated product IDs
                let productId;
                if (typeof item.id_producto === 'object' && item.id_producto._id) {
                    // Populated product object
                    productId = item.id_producto._id.toString();
                } else {
                    // Direct ObjectId
                    productId = item.id_producto.toString();
                }
                
                return {
                    id_producto: productId,
                    cantidad: item.cantidad,
                    precio_unitario: item.precio_unitario
                };
            }),
            createdAt: mongoCart.createdAt,
            updatedAt: mongoCart.updatedAt
        });
    }
}

module.exports = MongoCartRepository;