const User = require('../../../domain/entities/User');
const AuthService = require('../../../domain/services/AuthService');

class ResetPassword {
    constructor(userRepository, emailService) {
        this.userRepository = userRepository;
        this.emailService = emailService;
    }

    async execute(token, newPassword) {
        try {
            // Validar entrada
            if (!token || !newPassword) {
                throw new Error('Token y nueva contraseña son requeridos');
            }

            if (newPassword.length < 6) {
                throw new Error('La nueva contraseña debe tener al menos 6 caracteres');
            }

            // Buscar usuario por token
            const user = await this.userRepository.findByToken(token);
            if (!user) {
                throw new Error('Token inválido o expirado');
            }

            // Verificar que la cuenta esté validada
            if (!user.validada) {
                throw new Error('La cuenta debe estar validada para cambiar la contraseña');
            }

            // Encriptar nueva contraseña
            const hashedPassword = await AuthService.hashPassword(newPassword);

            // Actualizar contraseña y limpiar token
            await this.userRepository.update(user.id_usuario, {
                contraseña: hashedPassword,
                token: null,
                updatedAt: new Date()
            });

            // Enviar confirmación por email
            try {
                await this.emailService.sendPasswordChangeNotification(user.correo, user.nombre);
            } catch (emailError) {
                console.error('Error enviando email de confirmación:', emailError);
                // No lanzar error, la contraseña ya fue cambiada exitosamente
            }

            return {
                success: true,
                message: 'Contraseña restablecida exitosamente'
            };

        } catch (error) {
            throw error;
        }
    }
}

module.exports = ResetPassword;
