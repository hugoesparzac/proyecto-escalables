const Cart = require('../../../infrastructure/database/models/Cart');
const Product = require('../../../infrastructure/database/models/Product');

class UpdateCartItem {
    async execute(userId, productId, newQuantity) {
        // Validar que la cantidad sea válida
        if (newQuantity < 0) {
            throw new Error('La cantidad debe ser mayor o igual a 0');
        }

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

        // Si la cantidad es 0, remover el producto
        if (newQuantity === 0) {
            cart.items.splice(itemIndex, 1);
        } else {
            // Verificar stock disponible del producto
            const product = await Product.findOne({ _id: productId, activo: true });
            if (!product) {
                throw new Error('Producto no encontrado o no disponible');
            }

            if (product.cantidad_stock < newQuantity) {
                throw new Error(`Stock insuficiente. Solo quedan ${product.cantidad_stock} unidades`);
            }

            // Actualizar cantidad
            cart.items[itemIndex].cantidad = newQuantity;
        }

        // Recalcular total y guardar
        cart.calculateTotal();
        await cart.save();

        return {
            cart: await Cart.findById(cart._id),
            message: newQuantity === 0 ? 'Producto removido del carrito' : 'Cantidad actualizada exitosamente'
        };
    }
}

module.exports = UpdateCartItem;