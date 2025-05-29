const express = require('express');
const { body } = require('express-validator');
const { auth, adminAuth, optionalAuth } = require('../middleware/auth');
const { 
  validateRequest, 
  paginationValidation,
  objectIdValidation 
} = require('../middleware/validation');

const categoryController = require('../controllers/CategoryController');

const router = express.Router();

// Rutas públicas
// GET /api/categories - Obtener todas las categorías
router.get('/',
  paginationValidation,
  validateRequest,
  optionalAuth,
  async (req, res, next) => {
    await categoryController.getAll(req, res, next);
  }
);

// GET /api/categories/active - Obtener categorías activas
router.get('/active',
  async (req, res, next) => {
    await categoryController.getActive(req, res, next);
  }
);

// GET /api/categories/stats - Estadísticas de categorías (Admin)
router.get('/stats',
  adminAuth,
  async (req, res, next) => {
    await categoryController.getStats(req, res, next);
  }
);

// GET /api/categories/:id - Obtener detalles de una categoría
router.get('/:id',
  objectIdValidation('id'),
  validateRequest,
  optionalAuth,
  async (req, res, next) => {
    await categoryController.getById(req, res, next);
  }
);

// GET /api/categories/:id/delete-info - Información antes de eliminar
router.get('/:id/delete-info',
  objectIdValidation('id'),
  validateRequest,
  adminAuth,
  async (req, res, next) => {
    await categoryController.getDeleteInfo(req, res, next);
  }
);

// Rutas administrativas
// POST /api/categories - Crear nueva categoría
router.post('/',
  adminAuth,
  body('nombre_categoria')
    .trim()
    .isLength({ min: 2, max: 30 })
    .withMessage('El nombre debe tener entre 2 y 30 caracteres'),
  body('descripcion')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('La descripción no puede exceder 200 caracteres'),
  body('imagen_url')
    .optional()
    .isURL()
    .withMessage('La URL de imagen debe ser válida'),
  validateRequest,
  async (req, res, next) => {
    await categoryController.create(req, res, next);
  }
);

// PUT /api/categories/:id - Actualizar categoría
router.put('/:id',
  objectIdValidation('id'),
  adminAuth,
  body('nombre_categoria')
    .optional()
    .trim()
    .isLength({ min: 2, max: 30 })
    .withMessage('El nombre debe tener entre 2 y 30 caracteres'),
  body('descripcion')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('La descripción no puede exceder 200 caracteres'),
  body('imagen_url')
    .optional()
    .isURL()
    .withMessage('La URL de imagen debe ser válida'),
  body('activa')
    .optional()
    .isBoolean()
    .withMessage('El estado activo debe ser booleano'),
  validateRequest,
  async (req, res, next) => {
    await categoryController.update(req, res, next);
  }
);

// DELETE /api/categories/:id - Eliminar categoría
router.delete('/:id',
  objectIdValidation('id'),
  validateRequest,
  adminAuth,
  async (req, res, next) => {
    await categoryController.delete(req, res, next);
  }
);

// PATCH /api/categories/:id/activate - Activar categoría
router.patch('/:id/activate',
  objectIdValidation('id'),
  validateRequest,
  adminAuth,
  async (req, res, next) => {
    await categoryController.activate(req, res, next);
  }
);

// PATCH /api/categories/:id/deactivate - Desactivar categoría
router.patch('/:id/deactivate',
  objectIdValidation('id'),
  validateRequest,
  adminAuth,
  async (req, res, next) => {
    await categoryController.deactivate(req, res, next);
  }
);

module.exports = router;
