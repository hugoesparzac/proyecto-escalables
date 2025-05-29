const express = require('express');
const { body } = require('express-validator');
const AdminController = require('../controllers/AdminController');
const { auth, adminAuth } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validation');

const router = express.Router();
const adminController = new AdminController();

// Todas las rutas requieren autenticación y rol admin
router.use(auth, adminAuth);

// Listar administradores
router.get('/', (req, res, next) => adminController.getAll(req, res, next));

// Obtener un administrador por ID
router.get('/:id', (req, res, next) => adminController.getById(req, res, next));

// Crear un nuevo administrador
router.post('/',
    body('nombre').isLength({ min: 2 }).withMessage('Nombre requerido'),
    body('correo').isEmail().withMessage('Correo inválido'),
    body('contraseña').isLength({ min: 6 }).withMessage('Contraseña mínima 6 caracteres'),
    validateRequest,
    (req, res, next) => adminController.create(req, res, next)
);

// Actualizar un administrador
router.put('/:id',
    body('nombre').optional().isLength({ min: 2 }),
    body('correo').optional().isEmail(),
    validateRequest,
    (req, res, next) => adminController.update(req, res, next)
);

// Eliminar un administrador
router.delete('/:id', (req, res, next) => adminController.delete(req, res, next));

module.exports = router;
