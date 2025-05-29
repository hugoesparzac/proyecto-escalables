const User = require('../../../infrastructure/database/models/User');
const AuthService = require('../../../domain/services/AuthService');
const EmailService = require('../../../domain/services/EmailService');

class RegisterUser {
  constructor() {
    this.emailService = new EmailService();
  }  async execute(userData) {
    const { nombre, correo, contraseña } = userData;

    // Verificar si el correo ya existe
    const existingUser = await User.findOne({ correo });
    if (existingUser) {
      throw new Error('El correo electrónico ya está registrado');
    }

    // Crear nuevo usuario
    const user = new User({
      nombre,
      correo,
      contraseña
    });

    // Generar token de validación
    const validationToken = AuthService.generateValidationToken();
    user.token = validationToken;

    // Guardar usuario
    await user.save();

    // Enviar email de validación
    try {
      await this.emailService.sendValidationEmail(correo, nombre, validationToken);
    } catch (error) {
      console.error('Error enviando email de validación:', error);
      // No fallar el registro si el email falla
    }

    return {
      user: user.toJSON(),
      message: 'Usuario registrado exitosamente. Por favor verifica tu correo electrónico.'
    };
  }
}

module.exports = RegisterUser;