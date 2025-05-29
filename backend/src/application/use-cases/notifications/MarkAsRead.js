const Notification = require('../../../infrastructure/database/models/Notification');

class MarkAsRead {
    async execute(userId, notificationId) {
        // Buscar la notificación
        const notification = await Notification.findOne({
            _id: notificationId,
            id_usuario: userId
        });

        if (!notification) {
            throw new Error('Notificación no encontrada');
        }

        // Marcar como leída si no lo está ya
        if (notification.estado === 'no leido') {
            notification.estado = 'leido';
            notification.updatedAt = new Date();
            await notification.save();
        }

        return {
            notification,
            message: 'Notificación marcada como leída'
        };
    }

    // Marcar múltiples notificaciones como leídas
    async markMultipleAsRead(userId, notificationIds) {
        const result = await Notification.updateMany(
            {
                _id: { $in: notificationIds },
                id_usuario: userId,
                estado: 'no leido'
            },
            {
                estado: 'leido',
                updatedAt: new Date()
            }
        );

        return {
            modifiedCount: result.modifiedCount,
            message: `${result.modifiedCount} notificaciones marcadas como leídas`
        };
    }

    // Marcar todas las notificaciones de un usuario como leídas
    async markAllAsRead(userId) {
        const result = await Notification.updateMany(
            {
                id_usuario: userId,
                estado: 'no leido'
            },
            {
                estado: 'leido',
                updatedAt: new Date()
            }
        );

        return {
            modifiedCount: result.modifiedCount,
            message: `${result.modifiedCount} notificaciones marcadas como leídas`
        };
    }
}

module.exports = MarkAsRead;