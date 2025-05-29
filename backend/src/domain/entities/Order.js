class Order {
    constructor(data = {}) {
        this.id_orden = data.id_orden || null;
        this.id_usuario = data.id_usuario || null;
        this.estado = data.estado || 'pagado'; // pagado, realizando, entregado
        this.fecha_pago = data.fecha_pago || null;
        this.fecha_preparacion = data.fecha_preparacion || null;
        this.fecha_entrega = data.fecha_entrega || null;
        this.precio_total = data.precio_total || 0;
        this.productos = data.productos || []; // Array de {id_producto, nombre_producto, cantidad, precio_unitario, subtotal}
        this.metodo_pago = data.metodo_pago || 'stripe';
        this.stripe_payment_id = data.stripe_payment_id || null;
        this.createdAt = data.createdAt || new Date();
        this.updatedAt = data.updatedAt || new Date();
    }

    // Validaciones
    isValid() {
        return this.id_usuario && 
               this.productos.length > 0 && 
               this.precio_total > 0 &&
               this.isValidEstado();
    }

    isValidEstado() {
        const validEstados = ['pagado', 'realizando', 'entregado'];
        return validEstados.includes(this.estado);
    }

    // Verificar si la orden pertenece a un usuario
    belongsToUser(userId) {
        return this.id_usuario === userId;
    }

    // Métodos de estado
    isPagado() {
        return this.estado === 'pagado';
    }

    isRealizando() {
        return this.estado === 'realizando';
    }

    isEntregado() {
        return this.estado === 'entregado';
    }

    // Actualizar estado de la orden
    markAsPaid() {
        if (!this.fecha_pago) {
            this.estado = 'pagado';
            this.fecha_pago = new Date();
            this.updatedAt = new Date();
            return true;
        }
        return false;
    }

    markAsInProgress() {
        if (this.isPagado() && !this.fecha_preparacion) {
            this.estado = 'realizando';
            this.fecha_preparacion = new Date();
            this.updatedAt = new Date();
            return true;
        }
        return false;
    }

    markAsDelivered() {
        if (this.isRealizando() && !this.fecha_entrega) {
            this.estado = 'entregado';
            this.fecha_entrega = new Date();
            this.updatedAt = new Date();
            return true;
        }
        return false;
    }

    // Agregar producto a la orden
    addProduct(productData) {
        const { id_producto, nombre_producto, cantidad, precio_unitario } = productData;
        
        if (!id_producto || !nombre_producto || cantidad <= 0 || precio_unitario < 0) {
            return false;
        }

        const subtotal = cantidad * precio_unitario;
        
        this.productos.push({
            id_producto,
            nombre_producto,
            cantidad,
            precio_unitario,
            subtotal
        });

        this.calculateTotal();
        this.updatedAt = new Date();
        return true;
    }

    // Calcular total de la orden
    calculateTotal() {
        this.precio_total = this.productos.reduce((total, item) => {
            return total + item.subtotal;
        }, 0);
        return this.precio_total;
    }

    // Obtener cantidad total de productos
    getTotalQuantity() {
        return this.productos.reduce((total, item) => {
            return total + item.cantidad;
        }, 0);
    }

    // Obtener resumen de la orden
    getSummary() {
        return {
            id_orden: this.id_orden,
            estado: this.estado,
            precio_total: this.precio_total,
            totalItems: this.getTotalQuantity(),
            productCount: this.productos.length,
            fecha_pago: this.fecha_pago,
            fecha_preparacion: this.fecha_preparacion,
            fecha_entrega: this.fecha_entrega
        };
    }

    // Obtener tiempo estimado según el estado
    getEstimatedTime() {
        switch (this.estado) {
            case 'pagado':
                return 'Preparando tu orden...';
            case 'realizando':
                return '15-20 minutos';
            case 'entregado':
                return 'Orden lista para recoger';
            default:
                return 'Estado desconocido';
        }
    }

    // Establecer información de pago de Stripe
    setStripePayment(paymentId) {
        this.stripe_payment_id = paymentId;
        this.metodo_pago = 'stripe';
        this.updatedAt = new Date();
    }

    toJSON() {
        return {
            id_orden: this.id_orden,
            id_usuario: this.id_usuario,
            estado: this.estado,
            fecha_pago: this.fecha_pago,
            fecha_preparacion: this.fecha_preparacion,
            fecha_entrega: this.fecha_entrega,
            precio_total: this.precio_total,
            productos: this.productos,
            metodo_pago: this.metodo_pago,
            stripe_payment_id: this.stripe_payment_id,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            summary: this.getSummary(),
            estimatedTime: this.getEstimatedTime()
        };
    }
}

module.exports = Order;