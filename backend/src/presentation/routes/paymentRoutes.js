const express = require('express');
const { auth, optionalAuth } = require('../middleware/auth');
const PaymentController = require('../controllers/PaymentController');
const { validateRequest } = require('../middleware/validation');

const router = express.Router();
const paymentController = new PaymentController();

// POST /api/payments/create-intent - Crear payment intent de Stripe
router.post('/create-intent', auth, async (req, res, next) => {
  await paymentController.createPaymentIntent(req, res, next);
});

// POST /api/payments/process-cart - Procesar pago del carrito
// Usamos optionalAuth para desarrollo y pruebas
router.post('/process-cart', optionalAuth, async (req, res, next) => {
  // Si no hay usuario autenticado en modo desarrollo, simulamos uno
  if (!req.user) {
    console.log('⚠️ Usuario no autenticado en /process-cart, usando usuario de prueba');
    // Este es un usuario de prueba para desarrollo
    req.user = { _id: '65b12a44e52e5c3a2b1ab123' };
  }
  await paymentController.processCartPayment(req, res, next);
});

// POST /api/payments/confirm - Confirmar pago
router.post('/confirm/:paymentIntentId', auth, async (req, res, next) => {
  await paymentController.confirmPayment(req, res, next);
});

module.exports = router;
