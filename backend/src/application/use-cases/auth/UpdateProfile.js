const User = require('../../../infrastructure/database/models/User');
const AuthService = require('../../../domain/services/AuthService');
const EmailService = require('../../../domain/services/EmailService');

class UpdateProfile {
    constructor() {
        this.emailService = new EmailService();
    }

    async execute(userId, updateData) {
        const { nombre, correo, foto_perfil, currentPassword, newPassword } = updateData;

        // Buscar usuario actual
        const user = await User.findById(userId).select('+contraseña');
        if (!user) {
            throw new Error('Usuario no encontrado');
        }

        let emailChanged = false;

        // Si se va a cambiar el correo electrónico
        if (correo && correo !== user.correo) {
            // Verificar que el nuevo correo no esté en uso
            const existingUser = await User.findOne({ correo, _id: { $ne: userId } });
            if (existingUser) {
                throw new Error('El correo electrónico ya está en uso');
            }

            // Generar token de validación para el nuevo correo
            const validationToken = AuthService.generateValidationToken();
            user.correo = correo;
            user.token = validationToken;
            user.validada = false; // Debe validar el nuevo correo
            emailChanged = true;

            // Enviar email de validación al nuevo correo
            try {
                await this.emailService.sendValidationEmail(correo, user.nombre, validationToken);
            } catch (error) {
                console.error('Error enviando email de validación:', error);
            }
        }

        // Si se va a cambiar la contraseña
        if (newPassword) {
            if (!currentPassword) {
                throw new Error('Debe proporcionar la contraseña actual');
            }

            // Verificar contraseña actual
            const isValidPassword = await user.comparePassword(currentPassword);
            if (!isValidPassword) {
                throw new Error('La contraseña actual es incorrecta');
            }

            user.contraseña = newPassword;
        }

        // Actualizar otros campos
        if (nombre !== undefined) {
            user.nombre = nombre;
        }

        if (foto_perfil !== undefined) {
            user.foto_perfil = foto_perfil;
        }

        // Guardar cambios
        await user.save();

        // Preparar respuesta
        const response = {
            user: user.toJSON(),
            message: 'Perfil actualizado exitosamente'
        };

        if (emailChanged) {
            response.message = 'Perfil actualizado. Por favor verifica tu nuevo correo electrónico.';
            response.emailChanged = true;
        }

        return response;
    }
}

module.exports = UpdateProfile;