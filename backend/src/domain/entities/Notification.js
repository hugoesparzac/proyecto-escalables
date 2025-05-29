class Notification {
    constructor(data = {}) {
        this.id_notificacion = data.id_notificacion || null;
        this.id_usuario = data.id_usuario || null;
        this.fecha_hora = data.fecha_hora || new Date();
        this.estado = data.estado || 'no leido'; // leido, no leido
        this.mensaje = data.mensaje || '';
        this.tipo = data.tipo || 'orden'; // orden, cuenta, sistema
        this.id_orden = data.id_orden || null; // Para notificaciones relacionadas con órdenes
        this.metadata = data.metadata || {}; // Información adicional (precio, número de orden, etc.)
        this.createdAt = data.createdAt || new Date();
        this.updatedAt = data.updatedAt || new Date();
    }

    // Validaciones
    isValid() {
        return this.id_usuario && 
               this.mensaje && 
               this.mensaje.trim().length > 0 &&
               this.isValidEstado() &&
               this.isValidTipo();
    }

    isValidEstado() {
        const validEstados = ['leido', 'no leido'];
        return validEstados.includes(this.estado);
    }

    isValidTipo() {
        const validTipos = ['orden', 'cuenta', 'sistema'];
        return validTipos.includes(this.tipo);
    }

    // Verificar si la notificación pertenece a un usuario
    belongsToUser(userId) {
        return this.id_usuario === userId;
    }

    // Métodos de estado
    isRead() {
        return this.estado === 'leido';
    }

    isUnread() {
        return this.estado === 'no leido';
    }

    // Marcar como leída
    markAsRead() {
        if (this.isUnread()) {
            this.estado = 'leido';
            this.updatedAt = new Date();
            return true;
        }
        return false;
    }

    // Marcar como no leída
    markAsUnread() {
        if (this.isRead()) {
            this.estado = 'no leido';
            this.updatedAt = new Date();
            return true;
        }
        return false;
    }

    // Métodos para crear diferentes tipos de notificaciones
    static createOrderPaidNotification(userId, orderId, totalAmount) {
        return new Notification({
            id_usuario: userId,
            tipo: 'orden',
            id_orden: orderId,
            mensaje: `Tu orden #${orderId} ha sido pagada correctamente por $${totalAmount.toFixed(2)}. ¡Comenzaremos a prepararla enseguida!`,
            metadata: {
                orden_id: orderId,
                monto: totalAmount,
                estado_orden: 'pagado'
            }
        });
    }

    static createOrderInProgressNotification(userId, orderId) {
        return new Notification({
            id_usuario: userId,
            tipo: 'orden',
            id_orden: orderId,
            mensaje: `¡Buenas noticias! Tu orden #${orderId} ya está siendo preparada. Tiempo estimado: 15-20 minutos.`,
            metadata: {
                orden_id: orderId,
                estado_orden: 'realizando',
                tiempo_estimado: '15-20 minutos'
            }
        });
    }

    static createOrderReadyNotification(userId, orderId) {
        return new Notification({
            id_usuario: userId,
            tipo: 'orden',
            id_orden: orderId,
            mensaje: `¡Tu orden #${orderId} está lista! Puedes pasar a recogerla en el mostrador.`,
            metadata: {
                orden_id: orderId,
                estado_orden: 'entregado'
            }
        });
    }

    static createAccountValidationNotification(userId) {
        return new Notification({
            id_usuario: userId,
            tipo: 'cuenta',
            mensaje: '¡Bienvenido! Tu cuenta ha sido validada correctamente. Ya puedes realizar pedidos.',
            metadata: {
                tipo_validacion: 'email'
            }
        });
    }

    static createPasswordChangeNotification(userId) {
        return new Notification({
            id_usuario: userId,
            tipo: 'cuenta',
            mensaje: 'Tu contraseña ha sido cambiada exitosamente. Si no fuiste tú, contacta al soporte.',
            metadata: {
                tipo_cambio: 'contraseña'
            }
        });
    }

    static createEmailChangeNotification(userId, newEmail) {
        return new Notification({
            id_usuario: userId,
            tipo: 'cuenta',
            mensaje: `Tu correo electrónico ha sido actualizado a ${newEmail}. Por favor, valida tu nuevo correo.`,
            metadata: {
                tipo_cambio: 'email',
                nuevo_email: newEmail
            }
        });
    }

    // Obtener información resumida
    getSummary() {
        return {
            id_notificacion: this.id_notificacion,
            tipo: this.tipo,
            estado: this.estado,
            fecha_hora: this.fecha_hora,
            isRead: this.isRead(),
            hasOrder: !!this.id_orden
        };
    }

    // Verificar si es una notificación reciente (menos de 24 horas)
    isRecent() {
        const now = new Date();
        const diffInHours = (now - this.fecha_hora) / (1000 * 60 * 60);
        return diffInHours < 24;
    }

    toJSON() {
        return {
            id_notificacion: this.id_notificacion,
            id_usuario: this.id_usuario,
            fecha_hora: this.fecha_hora,
            estado: this.estado,
            mensaje: this.mensaje,
            tipo: this.tipo,
            id_orden: this.id_orden,
            metadata: this.metadata,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            summary: this.getSummary(),
            isRecent: this.isRecent()
        };
    }
}

module.exports = Notification;