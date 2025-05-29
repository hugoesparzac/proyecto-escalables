const User = require('../../../domain/entities/User');
const AuthService = require('../../../domain/services/AuthService');

class ChangePassword {
    constructor(userRepository, emailService) {
        this.userRepository = userRepository;
        this.emailService = emailService;
    }

    async execute(userId, currentPassword, newPassword) {
        try {
            // Validar entrada
            if (!userId || !currentPassword || !newPassword) {
                throw new Error('Todos los campos son requeridos');
            }

            if (newPassword.length < 6) {
                throw new Error('La nueva contraseña debe tener al menos 6 caracteres');
            }

            // Buscar usuario
            const user = await this.userRepository.findById(userId);
            if (!user) {
                throw new Error('Usuario no encontrado');
            }

            // Verificar contraseña actual
            const isCurrentPasswordValid = await AuthService.comparePassword(currentPassword, user.contraseña);
            if (!isCurrentPasswordValid) {
                throw new Error('La contraseña actual es incorrecta');
            }

            // Verificar que la nueva contraseña sea diferente
            const isSamePassword = await AuthService.comparePassword(newPassword, user.contraseña);
            if (isSamePassword) {
                throw new Error('La nueva contraseña debe ser diferente a la actual');
            }

            // Encriptar nueva contraseña
            const hashedNewPassword = await AuthService.hashPassword(newPassword);

            // Actualizar contraseña
            await this.userRepository.updatePassword(userId, hashedNewPassword);

            // Enviar notificación por email
            try {
                await this.emailService.sendPasswordChangeNotification(user.correo, user.nombre);
            } catch (emailError) {
                console.error('Error enviando email de confirmación:', emailError);
                // No lanzar error, la contraseña ya fue cambiada exitosamente
            }

            return {
                success: true,
                message: 'Contraseña actualizada exitosamente'
            };

        } catch (error) {
            throw error;
        }
    }
}

module.exports = ChangePassword;
