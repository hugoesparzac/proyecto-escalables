const Cart = require('../../../infrastructure/database/models/Cart');
const Product = require('../../../infrastructure/database/models/Product');

class AddToCart {
  async execute(userId, productId, cantidad) {
    // Verificar que el producto existe y está activo
    const product = await Product.findOne({ _id: productId, activo: true });
    if (!product) {
      throw new Error('Producto no encontrado o no disponible');
    }

    // Verificar stock disponible
    if (product.cantidad_stock < cantidad) {
      throw new Error(`Stock insuficiente. Solo quedan ${product.cantidad_stock} unidades`);
    }

    // Buscar o crear carrito del usuario
    let cart = await Cart.findOne({ id_usuario: userId });
    if (!cart) {
      cart = new Cart({ id_usuario: userId, items: [] });
    }

    // Verificar si el producto ya está en el carrito
    const existingItemIndex = cart.items.findIndex(
      item => item.id_producto.toString() === productId
    );

    if (existingItemIndex > -1) {
      // Actualizar cantidad del producto existente
      const newQuantity = cart.items[existingItemIndex].cantidad + cantidad;
      
      if (newQuantity > product.cantidad_stock) {
        throw new Error(`Stock insuficiente. Solo quedan ${product.cantidad_stock} unidades`);
      }
      
      cart.items[existingItemIndex].cantidad = newQuantity;
    } else {
      // Agregar nuevo producto al carrito
      cart.items.push({
        id_producto: productId,
        cantidad,
        precio_unitario: product.precio
      });
    }

    // Calcular total y guardar
    cart.calculateTotal();
    await cart.save();

    return await Cart.findById(cart._id);
  }
}

module.exports = AddToCart;