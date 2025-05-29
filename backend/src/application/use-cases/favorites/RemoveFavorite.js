const Favorite = require('../../../infrastructure/database/models/Favorite');

class RemoveFavorite {
    async execute(userId, productId) {
        // Buscar el favorito
        const favorite = await Favorite.findOne({
            id_usuario: userId,
            id_producto: productId
        });

        if (!favorite) {
            throw new Error('El producto no está en favoritos');
        }

        // Eliminar favorito
        await Favorite.findByIdAndDelete(favorite._id);

        return {
            message: 'Producto removido de favoritos exitosamente'
        };
    }
}

module.exports = RemoveFavorite;
