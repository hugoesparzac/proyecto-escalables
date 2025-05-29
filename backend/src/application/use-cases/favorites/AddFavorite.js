const Favorite = require('../../../infrastructure/database/models/Favorite');
const Product = require('../../../infrastructure/database/models/Product');

class AddFavorite {
    async execute(userId, productId) {
        // Verificar que el producto existe y está activo
        const product = await Product.findOne({ _id: productId, activo: true });
        if (!product) {
            throw new Error('Producto no encontrado o no disponible');
        }

        // Verificar si ya está en favoritos
        const existingFavorite = await Favorite.findOne({
            id_usuario: userId,
            id_producto: productId
        });

        if (existingFavorite) {
            throw new Error('El producto ya está en favoritos');
        }

        // Crear nuevo favorito
        const favorite = new Favorite({
            id_usuario: userId,
            id_producto: productId,
            added_at: new Date()
        });

        await favorite.save();

        return {
            favorite: await Favorite.findById(favorite._id).populate('id_producto'),
            message: 'Producto agregado a favoritos exitosamente'
        };
    }
}

module.exports = AddFavorite;
