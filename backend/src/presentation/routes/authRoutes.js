const express = require('express');
const { body } = require('express-validator');
const AuthController = require('../controllers/AuthController');
const { auth } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validation');

const router = express.Router();
const authController = new AuthController();

// Validaciones
const registerValidation = [
    body('nombre')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('El nombre debe tener entre 2 y 50 caracteres'),
    body('correo')
        .isEmail()
        .normalizeEmail()
        .withMessage('Email inválido'),    body('contraseña')
        .isLength({ min: 6 })
        .withMessage('La contraseña debe tener al menos 6 caracteres'),
    body('telefono')
        .optional()
        .isMobilePhone('es-MX')
        .withMessage('Número de teléfono inválido'),
    body('direccion')
        .optional()
        .trim()
        .isLength({ max: 200 })
        .withMessage('La dirección no puede exceder 200 caracteres')
];

const loginValidation = [
    body('correo')
        .isEmail()
        .normalizeEmail()
        .withMessage('Email inválido'),
    body('contraseña')
        .notEmpty()
        .withMessage('La contraseña es requerida')
];

const changePasswordValidation = [
    body('currentPassword')
        .notEmpty()
        .withMessage('La contraseña actual es requerida'),
    body('newPassword')
        .isLength({ min: 6 })
        .withMessage('La nueva contraseña debe tener al menos 6 caracteres')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('La nueva contraseña debe contener al menos una letra minúscula, una mayúscula y un número')
];

const resetPasswordValidation = [
    body('contraseña')
        .isLength({ min: 6 })
        .withMessage('La contraseña debe tener al menos 6 caracteres')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('La contraseña debe contener al menos una letra minúscula, una mayúscula y un número')
];

const updateProfileValidation = [
    body('nombre')
        .optional()
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('El nombre debe tener entre 2 y 50 caracteres'),
    body('telefono')
        .optional()
        .isMobilePhone('es-MX')
        .withMessage('Número de teléfono inválido'),
    body('direccion')
        .optional()
        .trim()
        .isLength({ max: 200 })
        .withMessage('La dirección no puede exceder 200 caracteres')
];

const requestPasswordResetValidation = [
    body('correo')
        .isEmail()
        .normalizeEmail()
        .withMessage('Email inválido')
];

// Rutas públicas
router.post('/register', registerValidation, validateRequest, (req, res, next) => {
    authController.register(req, res, next);
});

router.post('/login', loginValidation, validateRequest, (req, res, next) => {
    authController.login(req, res, next);
});

router.get('/validate-email/:token', (req, res, next) => {
    authController.validateEmail(req, res, next);
});

router.get('/validate-email', (req, res, next) => {
    authController.validateEmail(req, res, next);
});

router.post('/request-password-reset', requestPasswordResetValidation, validateRequest, (req, res, next) => {
    authController.requestPasswordReset(req, res, next);
});

router.post('/reset-password/:token', resetPasswordValidation, validateRequest, (req, res, next) => {
    authController.resetPassword(req, res, next);
});

// Rutas protegidas
router.use(auth); // Middleware de autenticación para las siguientes rutas

router.get('/profile', (req, res, next) => {
    authController.getProfile(req, res, next);
});

router.put('/profile', updateProfileValidation, validateRequest, (req, res, next) => {
    authController.updateProfile(req, res, next);
});

router.post('/change-password', changePasswordValidation, validateRequest, (req, res, next) => {
    authController.changePassword(req, res, next);
});

router.post('/logout', (req, res, next) => {
    authController.logout(req, res, next);
});

router.get('/check', (req, res, next) => {
    authController.checkAuth(req, res, next);
});

module.exports = router;