class Favorite {
    constructor(data = {}) {
        this.id_usuario = data.id_usuario || null;
        this.id_producto = data.id_producto || null;
        this.added_at = data.added_at || new Date();
    }

    // Validaciones
    isValid() {
        return this.id_usuario && this.id_producto;
    }

    // Crear identificador único para la combinación usuario-producto
    getUniqueId() {
        return `${this.id_usuario}_${this.id_producto}`;
    }

    // Verificar si el favorito pertenece a un usuario específico
    belongsToUser(userId) {
        return this.id_usuario === userId;
    }

    // Verificar si el favorito es de un producto específico
    isProductFavorite(productId) {
        return this.id_producto === productId;
    }

    toJSON() {
        return {
            id_usuario: this.id_usuario,
            id_producto: this.id_producto,
            added_at: this.added_at
        };
    }
}

module.exports = Favorite;