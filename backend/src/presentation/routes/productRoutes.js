const express = require('express');
const ProductController = require('../controllers/ProductController');
const { auth, adminAuth, optionalAuth } = require('../middleware/auth');
const { 
  validateRequest, 
  paginationValidation, 
  productSearchValidation,
  objectIdValidation 
} = require('../middleware/validation');

const router = express.Router();
const productController = new ProductController();

// Rutas públicas (no requieren autenticación)
// GET /api/products - Obtener productos con filtros y paginación
router.get('/', 
  [...paginationValidation, ...productSearchValidation],
  validateRequest,
  optionalAuth,
  async (req, res, next) => {
    await productController.getProducts(req, res, next);
  }
);

// GET /api/products/search - Búsqueda de productos
router.get('/search',
  [...paginationValidation, ...productSearchValidation],
  validateRequest,
  optionalAuth,
  async (req, res, next) => {
    await productController.searchProducts(req, res, next);
  }
);

// GET /api/products/:id - Obtener detalles de un producto
router.get('/:id',
  objectIdValidation('id'),
  validateRequest,
  optionalAuth,
  async (req, res, next) => {
    await productController.getProductById(req, res, next);
  }
);

// Rutas que requieren autenticación de administrador
// POST /api/products - Crear nuevo producto
router.post('/',
  adminAuth,
  async (req, res, next) => {
    await productController.createProduct(req, res, next);
  }
);

// PUT /api/products/:id - Actualizar producto
router.put('/:id',
  objectIdValidation('id'),
  validateRequest,
  adminAuth,
  async (req, res, next) => {
    await productController.updateProduct(req, res, next);
  }
);

// DELETE /api/products/:id - Eliminar producto
router.delete('/:id',
  objectIdValidation('id'),
  validateRequest,
  adminAuth,
  async (req, res, next) => {
    await productController.deleteProduct(req, res, next);
  }
);

// PUT /api/products/:id/activate - Activar producto
router.put('/:id/activate',
  objectIdValidation('id'),
  validateRequest,
  adminAuth,
  async (req, res, next) => {
    await productController.activateProduct(req, res, next);
  }
);

// PUT /api/products/:id/deactivate - Desactivar producto
router.put('/:id/deactivate',
  objectIdValidation('id'),
  validateRequest,
  adminAuth,
  async (req, res, next) => {
    await productController.deactivateProduct(req, res, next);
  }
);

// PUT /api/products/:id/stock - Actualizar stock
router.put('/:id/stock',
  objectIdValidation('id'),
  validateRequest,
  adminAuth,
  async (req, res, next) => {
    await productController.updateStock(req, res, next);
  }
);

// GET /api/products/category/:categoryId - Obtener productos por categoría
router.get('/category/:categoryId',
  objectIdValidation('categoryId'),
  [...paginationValidation],
  validateRequest,
  optionalAuth,
  async (req, res, next) => {
    await productController.getProductsByCategory(req, res, next);
  }
);

module.exports = router;