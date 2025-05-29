const Notification = require('../../../infrastructure/database/models/Notification');

class CreateNotification {
    async execute(notificationData) {
        const { id_usuario, tipo, mensaje, id_orden, metadata } = notificationData;

        // Validar datos requeridos
        if (!id_usuario || !mensaje) {
            throw new Error('ID de usuario y mensaje son requeridos');
        }

        // Crear nueva notificación
        const notification = new Notification({
            id_usuario,
            tipo: tipo || 'sistema',
            mensaje,
            id_orden,
            metadata: metadata || {},
            estado: 'no leido',
            fecha_hora: new Date()
        });

        await notification.save();

        return {
            notification: await Notification.findById(notification._id),
            message: 'Notificación creada exitosamente'
        };
    }

    // Métodos específicos para diferentes tipos de notificaciones
    async createOrderPaidNotification(userId, orderId, totalAmount) {
        return this.execute({
            id_usuario: userId,
            tipo: 'orden',
            mensaje: `Tu orden #${orderId} ha sido pagada correctamente por $${totalAmount.toFixed(2)}. ¡Comenzaremos a prepararla enseguida!`,
            id_orden: orderId,
            metadata: {
                orden_id: orderId,
                monto: totalAmount,
                estado_orden: 'pagado'
            }
        });
    }

    async createOrderInProgressNotification(userId, orderId) {
        return this.execute({
            id_usuario: userId,
            tipo: 'orden',
            mensaje: `¡Buenas noticias! Tu orden #${orderId} ya está siendo preparada. Tiempo estimado: 15-20 minutos.`,
            id_orden: orderId,
            metadata: {
                orden_id: orderId,
                estado_orden: 'realizando',
                tiempo_estimado: '15-20 minutos'
            }
        });
    }

    async createOrderReadyNotification(userId, orderId) {
        return this.execute({
            id_usuario: userId,
            tipo: 'orden',
            mensaje: `¡Tu orden #${orderId} está lista! Puedes pasar a recogerla en el mostrador.`,
            id_orden: orderId,
            metadata: {
                orden_id: orderId,
                estado_orden: 'entregado'
            }
        });
    }

    async createAccountValidationNotification(userId) {
        return this.execute({
            id_usuario: userId,
            tipo: 'cuenta',
            mensaje: '¡Bienvenido! Tu cuenta ha sido validada correctamente. Ya puedes realizar pedidos.',
            metadata: {
                tipo_validacion: 'email'
            }
        });
    }

    async createPasswordChangeNotification(userId) {
        return this.execute({
            id_usuario: userId,
            tipo: 'cuenta',
            mensaje: 'Tu contraseña ha sido cambiada exitosamente. Si no fuiste tú, contacta al soporte.',
            metadata: {
                tipo_cambio: 'contraseña'
            }
        });
    }

    async createEmailChangeNotification(userId, newEmail) {
        return this.execute({
            id_usuario: userId,
            tipo: 'cuenta',
            mensaje: `Tu correo electrónico ha sido actualizado a ${newEmail}. Por favor, valida tu nuevo correo.`,
            metadata: {
                tipo_cambio: 'email',
                nuevo_email: newEmail
            }
        });
    }
}

module.exports = CreateNotification;