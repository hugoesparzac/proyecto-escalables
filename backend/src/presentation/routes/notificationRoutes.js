const express = require('express');
const NotificationController = require('../controllers/NotificationController');
const { authenticateJWT } = require('../middlewares/authMiddleware');
const router = express.Router();
const notificationController = new NotificationController();

// Rutas protegidas (requieren autenticación)
router.use(authenticateJWT);

// Obtener notificaciones del usuario
router.get('/', notificationController.getUserNotifications.bind(notificationController));

// Obtener cantidad de notificaciones no leídas
router.get('/unread-count', notificationController.getUnreadCount.bind(notificationController));

// Marcar una notificación como leída
router.patch('/:id/read', notificationController.markAsRead.bind(notificationController));

// Marcar todas las notificaciones como leídas
router.patch('/mark-all-read', notificationController.markAllAsRead.bind(notificationController));

module.exports = router;