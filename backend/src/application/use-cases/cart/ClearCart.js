const Cart = require('../../../domain/entities/Cart');

class ClearCart {
    constructor(cartRepository) {
        this.cartRepository = cartRepository;
    }

    async execute(userId) {
        try {
            // Validar entrada
            if (!userId) {
                throw new Error('ID de usuario es requerido');
            }

            // Buscar carrito del usuario
            const cartData = await this.cartRepository.findByUserId(userId);
            
            if (!cartData) {
                return {
                    success: true,
                    message: 'El carrito ya estaba vacío'
                };
            }

            // Crear entidad Cart y limpiar
            const cart = new Cart(cartData);
            cart.clear();

            // Guardar carrito vacío
            await this.cartRepository.update(userId, cart);

            return {
                success: true,
                message: 'Carrito vaciado exitosamente',
                cart: cart.toJSON()
            };

        } catch (error) {
            throw error;
        }
    }
}

module.exports = ClearCart;
