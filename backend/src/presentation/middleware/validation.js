const { validationResult, body, param, query } = require('express-validator');

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Errores de validación',
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }))
    });
  }
  
  next();
};

// Validaciones para autenticación
const registerValidation = [
  body('nombre')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('El nombre debe tener entre 2 y 50 caracteres'),
  body('correo')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email inválido'),
  body('contraseña')
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('La contraseña debe contener al menos una letra minúscula, una mayúscula y un número'),
  body('telefono')
    .optional()
    .isMobilePhone('es-MX')
    .withMessage('Debe ser un número de teléfono válido de México')
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
    .withMessage('La nueva contraseña debe contener al menos una mayúscula, una minúscula y un número')
];

const resetPasswordValidation = [
  body('token')
    .notEmpty()
    .withMessage('El token es requerido'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('La nueva contraseña debe tener al menos 6 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('La nueva contraseña debe contener al menos una mayúscula, una minúscula y un número')
];

// Validaciones para productos
const addToCartValidation = [
  body('id_producto')
    .isMongoId()
    .withMessage('ID de producto inválido'),
  body('cantidad')
    .isInt({ min: 1, max: 99 })
    .withMessage('La cantidad debe estar entre 1 y 99')
];

const updateCartItemValidation = [
  param('itemId')
    .isMongoId()
    .withMessage('ID de item inválido'),
  body('cantidad')
    .isInt({ min: 1, max: 99 })
    .withMessage('La cantidad debe estar entre 1 y 99')
];

// Validaciones para paginación
const paginationValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('La página debe ser un número entero mayor a 0'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('El límite debe estar entre 1 y 100')
];

// Validaciones para búsqueda de productos
const productSearchValidation = [
  query('search')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('El término de búsqueda debe tener al menos 2 caracteres'),
  query('categoria')
    .optional()
    .isMongoId()
    .withMessage('ID de categoría inválido'),
  query('precio_min')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('El precio mínimo debe ser mayor o igual a 0'),
  query('precio_max')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('El precio máximo debe ser mayor o igual a 0')
];

// Validaciones para órdenes
const createOrderValidation = [
  body('items')
    .isArray({ min: 1 })
    .withMessage('Debe incluir al menos un producto'),
  body('items.*.id_producto')
    .isMongoId()
    .withMessage('ID de producto inválido'),
  body('items.*.cantidad')
    .isInt({ min: 1 })
    .withMessage('La cantidad debe ser mayor a 0'),
  body('payment_method_id')
    .optional()
    .isString()
    .withMessage('ID de método de pago inválido')
];

// Validaciones para notificaciones
const markNotificationsValidation = [
  body('notificationIds')
    .optional()
    .isArray()
    .withMessage('Los IDs de notificaciones deben ser un arreglo'),
  body('notificationIds.*')
    .isMongoId()
    .withMessage('ID de notificación inválido'),
  body('tipo')
    .optional()
    .isIn(['orden_pagada', 'orden_realizando', 'orden_entregada'])
    .withMessage('Tipo de notificación inválido')
];

// Validación de ObjectId
const objectIdValidation = (paramName) => [
  param(paramName)
    .isMongoId()
    .withMessage(`${paramName} debe ser un ObjectId válido`)
];

module.exports = {
  validateRequest,
  registerValidation,
  loginValidation,
  changePasswordValidation,
  resetPasswordValidation,
  addToCartValidation,
  updateCartItemValidation,
  paginationValidation,
  productSearchValidation,
  createOrderValidation,
  markNotificationsValidation,
  objectIdValidation
};