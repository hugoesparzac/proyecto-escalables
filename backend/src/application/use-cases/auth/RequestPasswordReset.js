const User = require('../../../domain/entities/User');
const AuthService = require('../../../domain/services/AuthService');

class RequestPasswordReset {
    constructor(userRepository, emailService) {
        this.userRepository = userRepository;
        this.emailService = emailService;
    }

    async execute(email) {
        try {
            // Validar entrada
            if (!email) {
                throw new Error('El email es requerido');
            }

            // Buscar usuario por email
            const user = await this.userRepository.findByEmail(email);
            if (!user) {
                // Por seguridad, no revelamos si el email existe o no
                return {
                    success: true,
                    message: 'Si el email existe, recibirás instrucciones para restablecer tu contraseña'
                };
            }

            // Verificar que la cuenta esté validada
            if (!user.validada) {
                throw new Error('Debes validar tu cuenta antes de cambiar la contraseña');
            }

            // Generar token de restablecimiento
            const userEntity = new User(user);
            const resetToken = userEntity.generateToken();

            // Actualizar usuario con el token
            await this.userRepository.update(user.id_usuario, {
                token: resetToken,
                updatedAt: new Date()
            });

            // Enviar email con el token
            try {
                await this.emailService.sendPasswordResetEmail(user.correo, user.nombre, resetToken);
            } catch (emailError) {
                console.error('Error enviando email de restablecimiento:', emailError);
                throw new Error('Error enviando email de restablecimiento. Intenta de nuevo más tarde.');
            }

            return {
                success: true,
                message: 'Si el email existe, recibirás instrucciones para restablecer tu contraseña'
            };

        } catch (error) {
            throw error;
        }
    }
}

module.exports = RequestPasswordReset;
