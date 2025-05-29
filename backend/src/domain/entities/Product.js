class Product {
    constructor(data = {}) {
        this.id_producto = data.id_producto || null;
        this.nombre_producto = data.nombre_producto || '';
        this.precio = data.precio || 0;
        this.descripcion = data.descripcion || '';
        this.calorias = data.calorias || 0;
        this.cantidad_stock = data.cantidad_stock || 0;
        this.id_categoria = data.id_categoria || null;
        this.url_imagen = data.url_imagen || null;
        this.activo = data.activo !== undefined ? data.activo : true;
        this.createdAt = data.createdAt || new Date();
        this.updatedAt = data.updatedAt || new Date();
    }

    // Validaciones
    isValid() {
        return this.nombre_producto && 
               this.nombre_producto.trim().length > 0 &&
               this.precio >= 0 &&
               this.cantidad_stock >= 0 &&
               this.id_categoria &&
               this.calorias >= 0;
    }

    // Métodos de stock
    hasStock(quantity = 1) {
        return this.cantidad_stock >= quantity && this.activo;
    }

    reduceStock(quantity) {
        if (this.hasStock(quantity)) {
            this.cantidad_stock -= quantity;
            this.updatedAt = new Date();
            return true;
        }
        return false;
    }

    addStock(quantity) {
        if (quantity > 0) {
            this.cantidad_stock += quantity;
            this.updatedAt = new Date();
            return true;
        }
        return false;
    }

    // Métodos de estado
    activate() {
        this.activo = true;
        this.updatedAt = new Date();
    }

    deactivate() {
        this.activo = false;
        this.updatedAt = new Date();
    }

    isAvailable() {
        return this.activo && this.cantidad_stock > 0;
    }

    // Actualizar producto
    updateProduct(data) {
        if (data.nombre_producto !== undefined) {
            this.nombre_producto = data.nombre_producto;
        }
        if (data.precio !== undefined && data.precio >= 0) {
            this.precio = data.precio;
        }
        if (data.descripcion !== undefined) {
            this.descripcion = data.descripcion;
        }
        if (data.calorias !== undefined && data.calorias >= 0) {
            this.calorias = data.calorias;
        }
        if (data.cantidad_stock !== undefined && data.cantidad_stock >= 0) {
            this.cantidad_stock = data.cantidad_stock;
        }
        if (data.id_categoria !== undefined) {
            this.id_categoria = data.id_categoria;
        }
        if (data.url_imagen !== undefined) {
            this.url_imagen = data.url_imagen;
        }
        if (data.activo !== undefined) {
            this.activo = data.activo;
        }
        this.updatedAt = new Date();
    }

    // Calcular precio total
    calculateTotalPrice(quantity) {
        return this.precio * quantity;
    }

    toJSON() {
        return {
            id_producto: this.id_producto,
            nombre_producto: this.nombre_producto,
            precio: this.precio,
            descripcion: this.descripcion,
            calorias: this.calorias,
            cantidad_stock: this.cantidad_stock,
            id_categoria: this.id_categoria,
            url_imagen: this.url_imagen,
            activo: this.activo,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }
}

module.exports = Product;