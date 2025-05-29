const express = require('express');
const OrderController = require('../controllers/OrderController');
const { auth, adminAuth } = require('../middleware/auth');
const { 
  validateRequest, 
  createOrderValidation,
  paginationValidation,
  objectIdValidation 
} = require('../middleware/validation');

const router = express.Router();
const orderController = new OrderController();

// Todas las rutas de órdenes requieren autenticación
router.use(auth);

// POST /api/orders - Crear nueva orden
router.post('/',
  createOrderValidation,
  validateRequest,
  async (req, res, next) => {
    await orderController.createOrder(req, res, next);
  }
);

// GET /api/orders - Obtener órdenes del usuario
router.get('/',
  paginationValidation,
  validateRequest,
  async (req, res, next) => {
    await orderController.getUserOrders(req, res, next);
  }
);

// GET /api/orders/:id - Obtener detalles de una orden
router.get('/:id',
  objectIdValidation('id'),
  validateRequest,
  async (req, res, next) => {
    await orderController.getOrderDetails(req, res, next);
  }
);

// POST /api/orders/:id/cancel - Cancelar orden
router.post('/:id/cancel',
  objectIdValidation('id'),
  validateRequest,
  async (req, res, next) => {
    await orderController.cancelOrder(req, res, next);
  }
);

// GET /api/orders/:id/tracking - Obtener estado de seguimiento
router.get('/:id/tracking',
  objectIdValidation('id'),
  validateRequest,
  async (req, res, next) => {
    await orderController.trackOrder(req, res, next);
  }
);

// Rutas administrativas
// Nueva ruta: Actualizar estado de orden por ID de usuario (admin)
router.put('/user/:userId/update-status',
  objectIdValidation('userId'),
  validateRequest,
  adminAuth,
  async (req, res, next) => {
    await orderController.updateOrderStatusByUserId(req, res, next);
  }
);

// GET /api/orders/admin/all - Obtener todas las órdenes (admin)
router.get('/admin/all',
  adminAuth,
  paginationValidation,
  validateRequest,
  async (req, res, next) => {
    await orderController.getAllOrders(req, res, next);
  }
);

// PUT /api/orders/:id/status - Actualizar estado de orden (admin)
router.put('/:id/status',
  objectIdValidation('id'),
  validateRequest,
  adminAuth,
  async (req, res, next) => {
    await orderController.updateOrderStatus(req, res, next);
  }
);

// GET /api/orders/admin/statistics - Obtener estadísticas (admin)
router.get('/admin/statistics',
  adminAuth,
  async (req, res, next) => {
    await orderController.getOrderStatistics(req, res, next);
  }
);

// GET /api/orders/admin/pending - Obtener órdenes pendientes (admin)
router.get('/admin/pending',
  adminAuth,
  paginationValidation,
  validateRequest,
  async (req, res, next) => {
    await orderController.getPendingOrders(req, res, next);
  }
);

// GET /api/orders/admin/in-progress - Obtener órdenes en progreso (admin)
router.get('/admin/in-progress',
  adminAuth,
  paginationValidation,
  validateRequest,
  async (req, res, next) => {
    await orderController.getOrdersInProgress(req, res, next);
  }
);

module.exports = router;

