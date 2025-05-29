const NotificationService = require('../../domain/services/NotificationService');
const mongoose = require('mongoose');

class NotificationController {
  constructor() {}
  
  // Obtener notificaciones del usuario
  async getUserNotifications(req, res, next) {
    try {
      const userId = req.user._id;
      const limit = parseInt(req.query.limit) || 20;
      const skip = parseInt(req.query.skip) || 0;
      
      console.log(`🔔 Obteniendo notificaciones para usuario: ${userId}`);
      
      const notifications = await NotificationService.getUserNotifications(userId, limit, skip);
      
      res.status(200).json({
        success: true,
        message: 'Notificaciones obtenidas exitosamente',
        data: {
          notifications,
          count: notifications.length,
          hasMore: notifications.length === limit
        }
      });
    } catch (error) {
      console.error('❌ Error al obtener notificaciones:', error);
      next(error);
    }
  }

  // Obtener cantidad de notificaciones no leídas
  async getUnreadCount(req, res, next) {
    try {
      const userId = req.user._id;
      
      console.log(`🔢 Obteniendo cantidad de notificaciones no leídas para usuario: ${userId}`);
      
      const count = await NotificationService.getUnreadCount(userId);
      
      res.status(200).json({
        success: true,
        count
      });
    } catch (error) {
      console.error('❌ Error al obtener conteo de notificaciones:', error);
      next(error);
    }
  }

  // Marcar notificación como leída
  async markAsRead(req, res, next) {
    try {
      const userId = req.user._id;
      const notificationId = req.params.id;
      
      console.log(`📝 Marcando notificación ${notificationId} como leída para usuario: ${userId}`);
      
      if (!mongoose.Types.ObjectId.isValid(notificationId)) {
        return res.status(400).json({
          success: false,
          message: 'ID de notificación inválido'
        });
      }
      
      const notification = await NotificationService.markAsRead(notificationId, userId);
      
      if (!notification) {
        return res.status(404).json({
          success: false,
          message: 'Notificación no encontrada'
        });
      }
      
      res.status(200).json({
        success: true,
        message: 'Notificación marcada como leída',
        data: notification
      });
    } catch (error) {
      console.error('❌ Error al marcar notificación como leída:', error);
      next(error);
    }
  }

  // Marcar todas las notificaciones como leídas
  async markAllAsRead(req, res, next) {
    try {
      const userId = req.user._id;
      
      console.log(`📝 Marcando todas las notificaciones como leídas para usuario: ${userId}`);
      
      const result = await NotificationService.markAllAsRead(userId);
      
      res.status(200).json({
        success: true,
        message: 'Todas las notificaciones marcadas como leídas',
        data: result
      });
    } catch (error) {
      console.error('❌ Error al marcar todas las notificaciones como leídas:', error);
      next(error);
    }
  }
}

module.exports = NotificationController;