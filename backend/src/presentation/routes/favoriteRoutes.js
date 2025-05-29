const express = require('express');
const favoriteController = require('../controllers/FavoriteController');
const { auth } = require('../middleware/auth');
const { 
  validateRequest, 
  paginationValidation,
  objectIdValidation 
} = require('../middleware/validation');
const { body } = require('express-validator');

const router = express.Router();

// Todas las rutas de favoritos requieren autenticación
router.use(auth);

// GET /api/favorites - Obtener favoritos del usuario
router.get('/',
  paginationValidation,
  validateRequest,
  async (req, res, next) => {
    await favoriteController.getUserFavorites(req, res, next);
  }
);

// POST /api/favorites - Agregar producto a favoritos
router.post('/',
  body('id_producto')
    .isMongoId()
    .withMessage('ID de producto inválido'),
  validateRequest,
  async (req, res, next) => {
    await favoriteController.addFavorite(req, res, next);
  }
);

// DELETE /api/favorites/:productId - Remover producto de favoritos
router.delete('/:productId',
  objectIdValidation('productId'),
  validateRequest,
  async (req, res, next) => {
    await favoriteController.removeFavorite(req, res, next);
  }
);

// GET /api/favorites/check/:productId - Verificar si producto está en favoritos
router.get('/check/:productId',
  objectIdValidation('productId'),
  validateRequest,
  async (req, res, next) => {
    await favoriteController.checkFavorite(req, res, next);
  }
);

// DELETE /api/favorites - Limpiar todos los favoritos
// router.delete('/',
//   async (req, res, next) => {
//     await favoriteController.clearFavorites(req, res, next);
//   }
// );

// GET /api/favorites/count - Obtener conteo de favoritos
// router.get('/count',
//   async (req, res, next) => {
//     await favoriteController.getFavoritesCount(req, res, next);
//   }
// );

module.exports = router;