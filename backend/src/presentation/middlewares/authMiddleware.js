const jwt = require('jsonwebtoken');
const User = require('../../infrastructure/database/models/User');

// Middleware para autenticar usando JWT
const authenticateJWT = async (req, res, next) => {
  try {
    // Obtener el token del header Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Acceso no autorizado. Token no proporcionado o formato inválido'
      });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verificar que el token sea válido
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Acceso no autorizado. Token no proporcionado'
      });
    }
    
    // Verificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Verificar que el usuario exista en la base de datos
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no encontrado o token inválido'
      });
    }
    
    // Adjuntar la información del usuario al objeto request
    req.user = user;
    
    // Continuar con la siguiente función middleware
    next();
  } catch (error) {
    console.error('Error en authenticateJWT:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token inválido'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expirado. Por favor, inicie sesión nuevamente'
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Error al autenticar usuario'
    });
  }
};

// Middleware para verificar roles de usuario
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
    }
    
    if (!roles.includes(req.user.rol)) {
      return res.status(403).json({
        success: false,
        message: 'No tiene permiso para realizar esta acción'
      });
    }
    
    next();
  };
};

module.exports = {
  authenticateJWT,
  authorizeRoles
};
