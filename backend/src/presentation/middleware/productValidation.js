const { body, param, validationResult } = require('express-validator');
const mongoose = require('mongoose');

const validateProductId = [
    param('id')
        .isMongoId()
        .withMessage('ID de producto inválido')
];

const validateCreateProduct = [
    body('nombre_producto')
        .trim()
        .notEmpty()
        .withMessage('El nombre del producto es requerido')
        .isLength({ max: 100 })
        .withMessage('El nombre no debe exceder 100 caracteres'),
    
    body('descripcion')
        .trim()
        .notEmpty()
        .withMessage('La descripción es requerida')
        .isLength({ max: 500 })
        .withMessage('La descripción no debe exceder 500 caracteres'),
    
    body('precio')
        .isNumeric()
        .withMessage('El precio debe ser un número')
        .custom(value => value > 0)
        .withMessage('El precio debe ser mayor a 0'),
    
    body('calorias')
        .isNumeric()
        .withMessage('Las calorías deben ser un número')
        .custom(value => value >= 0)
        .withMessage('Las calorías no pueden ser negativas'),
    
    body('cantidad_stock')
        .isNumeric()
        .withMessage('La cantidad de stock debe ser un número')
        .custom(value => value >= 0)
        .withMessage('La cantidad de stock no puede ser negativa'),
    
    body('id_categoria')
        .notEmpty()
        .withMessage('La categoría es requerida')
        .custom(value => {
            // Skip if empty (will be caught by notEmpty check)
            if (!value) return true;
            
            // Check if it's a valid MongoDB ObjectId
            try {
                if (mongoose.Types.ObjectId.isValid(value)) {
                    return true;
                }
                return false;
            } catch (error) {
                return false;
            }
        })
        .withMessage('ID de categoría inválido'),
    
    body('url_imagen')
        .trim()
        .notEmpty()
        .withMessage('La URL de la imagen es requerida')
        .isURL()
        .withMessage('La URL de la imagen debe ser válida')
];

const validateUpdateProduct = [
    ...validateProductId,
    
    body('nombre_producto')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('El nombre del producto no puede estar vacío')
        .isLength({ max: 100 })
        .withMessage('El nombre no debe exceder 100 caracteres'),
    
    body('descripcion')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('La descripción no debe exceder 500 caracteres'),
    
    body('precio')
        .optional()
        .isNumeric()
        .withMessage('El precio debe ser un número')
        .custom(value => value > 0)
        .withMessage('El precio debe ser mayor a 0'),
    
    body('calorias')
        .optional()
        .isNumeric()
        .withMessage('Las calorías deben ser un número')
        .custom(value => value >= 0)
        .withMessage('Las calorías no pueden ser negativas'),
    
    body('cantidad_stock')
        .optional()
        .isNumeric()
        .withMessage('La cantidad de stock debe ser un número')
        .custom(value => value >= 0)
        .withMessage('La cantidad de stock no puede ser negativa'),
    
    body('id_categoria')
        .optional()
        .custom(value => {
            // Allow null/undefined on updates
            if (value === null || value === undefined) return true;
            
            // Reject 'undefined' string
            if (value === 'undefined') return false;
            
            // Check if it's a valid MongoDB ObjectId
            try {
                if (mongoose.Types.ObjectId.isValid(value)) {
                    return true;
                }
                return false;
            } catch (error) {
                return false;
            }
        })
        .withMessage('ID de categoría inválido'),
    
    body('url_imagen')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('La URL de la imagen no puede estar vacía')
        .isURL()
        .withMessage('La URL de la imagen debe ser válida')
];

const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(error => error.msg);
        
        return res.status(400).json({
            success: false,
            message: errorMessages[0],
            errors: errorMessages
        });
    }
    
    next();
};

module.exports = {
    validateProductId,
    validateCreateProduct,
    validateUpdateProduct,
    handleValidationErrors
};
