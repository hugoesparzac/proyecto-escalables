const Cart = require('../../../infrastructure/database/models/Cart');

class RemoveFromCart {
    async execute(userId, productId) {
        // Buscar carrito del usuario
        const cart = await Cart.findOne({ id_usuario: userId });
        if (!cart) {
            throw new Error('Carrito no encontrado');
        }        // Verificar si el producto está en el carrito
        // Handle both populated and non-populated id_producto fields
        const itemIndex = cart.items.findIndex(item => {
            let itemProductId;
            if (typeof item.id_producto === 'object' && item.id_producto._id) {
                // Populated field - extract the actual ObjectId
                itemProductId = item.id_producto._id.toString();
            } else {
                // Direct ObjectId
                itemProductId = item.id_producto.toString();
            }
            return itemProductId === productId;
        });

        if (itemIndex === -1) {
            throw new Error('Producto no encontrado en el carrito');
        }

        // Remover el producto del carrito
        cart.items.splice(itemIndex, 1);

        // Recalcular total y guardar
        cart.calculateTotal();
        await cart.save();

        return {
            cart: await Cart.findById(cart._id),
            message: 'Producto removido del carrito exitosamente'
        };
    }
}

module.exports = RemoveFromCart;