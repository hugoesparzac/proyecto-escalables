const Notification = require('../../infrastructure/database/models/Notification');
const mongoose = require('mongoose');

class NotificationService {
  static async createOrderNotification(userId, orderId, tipo, orderNumber, amount = null) {
    try {
      // Validar que userId y orderId sean válidos
      if (!userId) {
        throw new Error('userId es requerido para crear una notificación');
      }
      
      // Convertir a ObjectId si es un string
      let userObjectId = userId;
      if (typeof userId === 'string' && mongoose.Types.ObjectId.isValid(userId)) {
        userObjectId = new mongoose.Types.ObjectId(userId);
      }
      
      // Igual para orderId
      let orderObjectId = orderId;
      if (typeof orderId === 'string' && mongoose.Types.ObjectId.isValid(orderId)) {
        orderObjectId = new mongoose.Types.ObjectId(orderId);
      }
      
      let mensaje;
      switch (tipo) {
        case 'orden_pagada':
          mensaje = `Ha realizado la orden ${orderNumber} y hemos recibido el pago de $${amount}. Le avisaremos cuando pueda pasar a recoger su comida.`;
          break;
        case 'orden_realizando':
          mensaje = `¡Buenas noticias! Tu orden #${orderNumber} está siendo preparada. Te notificaremos cuando esté lista.`;
          break;
        case 'orden_entregada':
          mensaje = `Tu orden #${orderNumber} está lista para recoger. ¡Disfruta tu pedido!`;
          break;
        default:
          throw new Error('Tipo de notificación inválido');
      }
  
      const notification = new Notification({
        id_usuario: userObjectId,
        tipo,
        mensaje,
        id_orden: orderObjectId,
        estado: 'no_leido'
      });
  
      return await notification.save();
    } catch (error) {
      console.error('Error al crear notificación:', error);
      throw error;
    }
  }

  static async getUserNotifications(userId, limit = 20, skip = 0) {
    return await Notification.find({ id_usuario: userId })
      .sort({ fecha_hora: -1 })
      .limit(limit)
      .skip(skip);
  }

  static async markAsRead(notificationId, userId) {
    return await Notification.findOneAndUpdate(
      { _id: notificationId, id_usuario: userId },
      { estado: 'leido' },
      { new: true }
    );
  }

  static async markAllAsRead(userId) {
    const result = await Notification.updateMany(
      { id_usuario: userId, estado: 'no_leido' },
      { estado: 'leido' }
    );
    
    return {
      modifiedCount: result.modifiedCount
    };
  }
  
  static async getUnreadCount(userId) {
    return await Notification.countDocuments({
      id_usuario: userId,
      estado: 'no_leido'
    });
  }
}

module.exports = NotificationService;