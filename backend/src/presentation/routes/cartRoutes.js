const express = require('express');
const CartController = require('../controllers/CartController');
const { auth } = require('../middleware/auth');
const { 
  validateRequest, 
  addToCartValidation,
  updateCartItemValidation,
  objectIdValidation 
} = require('../middleware/validation');

const router = express.Router();
const cartController = new CartController();

// Todas las rutas del carrito requieren autenticación
router.use(auth);

// GET /api/cart - Obtener carrito del usuario
router.get('/',
  async (req, res, next) => {
    await cartController.getCart(req, res, next);
  }
);

// POST /api/cart/items - Agregar producto al carrito
router.post('/items',
  addToCartValidation,
  validateRequest,
  async (req, res, next) => {
    await cartController.addToCart(req, res, next);
  }
);

// PUT /api/cart/items/:itemId - Actualizar cantidad de un item
router.put('/items/:itemId',
  updateCartItemValidation,
  validateRequest,
  async (req, res, next) => {
    await cartController.updateCartItem(req, res, next);
  }
);

// DELETE /api/cart/items/:itemId - Remover item del carrito
router.delete('/items/:itemId',
  objectIdValidation('itemId'),
  validateRequest,
  async (req, res, next) => {
    await cartController.removeFromCart(req, res, next);
  }
);

// DELETE /api/cart - Limpiar carrito completo
router.delete('/',
  async (req, res, next) => {
    await cartController.clearCart(req, res, next);
  }
);

// GET /api/cart/summary - Obtener resumen del carrito
router.get('/summary',
  async (req, res, next) => {
    await cartController.getCartSummary(req, res, next);
  }
);

module.exports = router;