const User = require('../../../infrastructure/database/models/User');
const AuthService = require('../../../domain/services/AuthService');

class LoginUser {
  async execute(credentials) {
    const { correo, contraseña } = credentials;

    // Buscar usuario con contraseña
    const user = await User.findOne({ correo }).select('+contraseña');
    if (!user) {
      throw new Error('Credenciales inválidas');
    }

    // Verificar contraseña
    const isValidPassword = await user.comparePassword(contraseña);
    if (!isValidPassword) {
      throw new Error('Credenciales inválidas');
    }

    // Verificar si el email está validado
    if (!user.validada) {
      throw new Error('Por favor valida tu correo electrónico antes de iniciar sesión');
    }

    // Generar token JWT
    const token = AuthService.generateToken(user._id);

    return {
      user: user.toJSON(),
      token,
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    };
  }
}

module.exports = LoginUser;