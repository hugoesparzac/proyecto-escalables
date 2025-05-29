class Category {
    constructor(data = {}) {
        this.id_categoria = data.id_categoria || null;
        this.nombre_categoria = data.nombre_categoria || '';
        this.descripcion = data.descripcion || '';
        this.imagen_url = data.imagen_url || null;
        this.activa = data.activa !== undefined ? data.activa : true;
        this.createdAt = data.createdAt || new Date();
        this.updatedAt = data.updatedAt || new Date();
    }

    // Validaciones
    isValid() {
        return this.nombre_categoria && 
               this.nombre_categoria.trim().length > 0;
    }

    // Métodos de utilidad
    activate() {
        this.activa = true;
        this.updatedAt = new Date();
    }

    deactivate() {
        this.activa = false;
        this.updatedAt = new Date();
    }

    updateCategory(data) {
        if (data.nombre_categoria !== undefined) {
            this.nombre_categoria = data.nombre_categoria;
        }
        if (data.descripcion !== undefined) {
            this.descripcion = data.descripcion;
        }
        if (data.imagen_url !== undefined) {
            this.imagen_url = data.imagen_url;
        }
        if (data.activa !== undefined) {
            this.activa = data.activa;
        }
        this.updatedAt = new Date();
    }

    toJSON() {
        return {
            id_categoria: this.id_categoria,
            nombre_categoria: this.nombre_categoria,
            descripcion: this.descripcion,
            imagen_url: this.imagen_url,
            activa: this.activa,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }
}

module.exports = Category;