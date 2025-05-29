class Cart {
    constructor(data = {}) {
        this.id_usuario = data.id_usuario || null;
        this.productos = data.productos || []; // Array de {id_producto, cantidad, precio_unitario}
        this.createdAt = data.createdAt || new Date();
        this.updatedAt = data.updatedAt || new Date();
    }

    // Validaciones
    isValid() {
        return this.id_usuario && Array.isArray(this.productos);
    }

    // Verificar si el carrito pertenece a un usuario
    belongsToUser(userId) {
        return this.id_usuario === userId;
    }

    // Agregar producto al carrito
    addProduct(productId, cantidad, precio_unitario) {
        if (!productId || cantidad <= 0 || precio_unitario < 0) {
            return false;
        }

        const existingProductIndex = this.productos.findIndex(
            item => item.id_producto === productId
        );

        if (existingProductIndex !== -1) {
            // Si el producto ya existe, actualizar la cantidad
            this.productos[existingProductIndex].cantidad += cantidad;
        } else {
            // Si es un nuevo producto, agregarlo
            this.productos.push({
                id_producto: productId,
                cantidad: cantidad,
                precio_unitario: precio_unitario
            });
        }

        this.updatedAt = new Date();
        return true;
    }

    // Actualizar cantidad de un producto
    updateProductQuantity(productId, nuevaCantidad) {
        if (nuevaCantidad <= 0) {
            return this.removeProduct(productId);
        }

        const productIndex = this.productos.findIndex(
            item => item.id_producto === productId
        );

        if (productIndex !== -1) {
            this.productos[productIndex].cantidad = nuevaCantidad;
            this.updatedAt = new Date();
            return true;
        }

        return false;
    }

    // Remover producto del carrito
    removeProduct(productId) {
        const initialLength = this.productos.length;
        this.productos = this.productos.filter(
            item => item.id_producto !== productId
        );

        if (this.productos.length < initialLength) {
            this.updatedAt = new Date();
            return true;
        }

        return false;
    }

    // Obtener producto específico del carrito
    getProduct(productId) {
        return this.productos.find(item => item.id_producto === productId);
    }

    // Verificar si un producto está en el carrito
    hasProduct(productId) {
        return this.productos.some(item => item.id_producto === productId);
    }

    // Calcular precio total del carrito
    calculateTotal() {
        return this.productos.reduce((total, item) => {
            return total + (item.cantidad * item.precio_unitario);
        }, 0);
    }

    // Obtener cantidad total de productos
    getTotalQuantity() {
        return this.productos.reduce((total, item) => {
            return total + item.cantidad;
        }, 0);
    }

    // Verificar si el carrito está vacío
    isEmpty() {
        return this.productos.length === 0;
    }

    // Limpiar carrito
    clear() {
        this.productos = [];
        this.updatedAt = new Date();
    }

    // Obtener resumen del carrito
    getSummary() {
        return {
            totalItems: this.getTotalQuantity(),
            totalPrice: this.calculateTotal(),
            productCount: this.productos.length,
            isEmpty: this.isEmpty()
        };
    }

    toJSON() {
        return {
            id_usuario: this.id_usuario,
            productos: this.productos,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            summary: this.getSummary()
        };
    }
}

module.exports = Cart;