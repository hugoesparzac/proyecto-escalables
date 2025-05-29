const Favorite = require('../../../infrastructure/database/models/Favorite');
const Product = require('../../../infrastructure/database/models/Product');

class ToggleFavorite {
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
            // Si existe, eliminarlo
            await Favorite.findByIdAndDelete(existingFavorite._id);
            return {
                action: 'removed',
                message: 'Producto removido de favoritos exitosamente',
                isFavorite: false
            };
        } else {
            // Si no existe, agregarlo
            const favorite = new Favorite({
                id_usuario: userId,
                id_producto: productId,
                added_at: new Date()
            });

            await favorite.save();

            return {
                action: 'added',
                favorite: await Favorite.findById(favorite._id).populate('id_producto'),
                message: 'Producto agregado a favoritos exitosamente',
                isFavorite: true
            };
        }
    }
}

module.exports = ToggleFavorite;
