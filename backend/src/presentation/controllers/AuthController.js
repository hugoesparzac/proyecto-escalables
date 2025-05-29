const RegisterUser = require('../../application/use-cases/auth/RegisterUser');
const LoginUser = require('../../application/use-cases/auth/LoginUser');
const ValidateEmail = require('../../application/use-cases/auth/ValidateEmail');
const RequestPasswordReset = require('../../application/use-cases/auth/RequestPasswordReset');
const ResetPassword = require('../../application/use-cases/auth/ResetPassword');
const ChangePassword = require('../../application/use-cases/auth/ChangePassword');
const UpdateProfile = require('../../application/use-cases/auth/UpdateProfile');

const MongoUserRepository = require('../../infrastructure/repositories/MongoUserRepository');
const EmailService = require('../../domain/services/EmailService');
const AuthService = require('../../domain/services/AuthService');

class AuthController {    constructor() {
        this.userRepository = new MongoUserRepository();
        this.emailService = new EmailService();
        this.authService = new AuthService();
        // Inicializar casos de uso
        this.registerUser = new RegisterUser(this.userRepository, this.emailService);
        this.loginUser = new LoginUser(this.userRepository, this.authService);
        this.validateEmailUseCase = new ValidateEmail(this.userRepository); // Renombrado para evitar conflicto
        this.requestPasswordReset = new RequestPasswordReset(this.userRepository, this.emailService);
        this.resetPassword = new ResetPassword(this.userRepository);
        this.changePassword = new ChangePassword(this.userRepository, this.authService);
        this.updateProfileUseCase = new UpdateProfile(this.userRepository); // Renombrado para evitar conflicto
    }// Registro de usuario
    async register(req, res, next) {
        try {
            const userData = req.body;
            const result = await this.registerUser.execute(userData);
            
            res.status(201).json({
                success: true,
                message: 'Usuario registrado exitosamente. Revisa tu correo para validar tu cuenta.',
                data: {
                    user: result.user,
                    token: result.token
                }
            });
        } catch (error) {
            next(error);
        }
    }    // Login de usuario
    async login(req, res, next) {
        try {
            const credentials = req.body;
            const result = await this.loginUser.execute(credentials);
            
            res.status(200).json({
                success: true,
                message: 'Login exitoso',
                data: {
                    user: result.user,
                    token: result.token
                }
            });
        } catch (error) {
            next(error);
        }
    }    // Validar email
    async validateEmail(req, res, next) {
        try {
            // Permitir token por params o query
            const token = req.params.token || req.query.token;
            
            console.log('🔄 Solicitud de validación de correo con token:', token);
            
            const result = await this.validateEmailUseCase.execute(token);
            
            console.log('✅ Resultado de validación:', result);
            
            res.status(200).json({
                success: true,
                message: 'Email validado exitosamente',
                data: result
            });
        } catch (error) {
            console.error('❌ Error al validar email:', error.message);
            res.status(400).json({
                success: false,
                message: error.message || 'Error al validar el correo electrónico'
            });
        }
    }

    // Solicitar reset de contraseña
    async requestPasswordReset(req, res, next) {
        try {
            const { email } = req.body;
            await this.requestPasswordReset.execute(email);
            
            res.status(200).json({
                success: true,
                message: 'Se ha enviado un correo con las instrucciones para restablecer tu contraseña'
            });
        } catch (error) {
            next(error);
        }
    }

    // Reset de contraseña
    async resetPassword(req, res, next) {
        try {
            const { token } = req.params;
            const { password } = req.body;
            const result = await this.resetPassword.execute(token, password);
            
            res.status(200).json({
                success: true,
                message: 'Contraseña restablecida exitosamente',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    // Cambiar contraseña (usuario autenticado)
    async changePassword(req, res, next) {
        try {
            const userId = req.user._id;
            const { currentPassword, newPassword } = req.body;
            
            const result = await this.changePassword.execute(userId, currentPassword, newPassword);
            
            res.status(200).json({
                success: true,
                message: 'Contraseña cambiada exitosamente',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    // Actualizar perfil
    async updateProfile(req, res, next) {
        try {
            const userId = req.user._id;
            const updateData = req.body;
            const result = await this.updateProfileUseCase.execute(userId, updateData); // Usar el nuevo nombre
            res.status(200).json({
                success: true,
                message: 'Perfil actualizado exitosamente',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    // Obtener perfil del usuario actual
    async getProfile(req, res, next) {
        try {
            const user = req.user;
            
            res.status(200).json({                success: true,
                message: 'Perfil obtenido exitosamente',
                data: {
                    id: user._id,
                    nombre: user.nombre,
                    correo: user.correo || user.email,
                    telefono: user.telefono,
                    direccion: user.direccion,
                    fecha_registro: user.fecha_registro,
                    validada: user.validada,
                    rol: user.rol
                }
            });
        } catch (error) {
            next(error);
        }
    }

    // Cerrar sesión (opcional - principalmente para frontend)
    async logout(req, res, next) {
        try {
            res.status(200).json({
                success: true,
                message: 'Sesión cerrada exitosamente'
            });
        } catch (error) {
            next(error);
        }
    }

    // Verificar estado de autenticación
    async checkAuth(req, res, next) {
        try {
            const user = req.user;
            
            res.status(200).json({
                success: true,
                message: 'Usuario autenticado',
                data: {
                    isAuthenticated: true,                    user: {
                        id: user._id,
                        nombre: user.nombre,
                        email: user.email,
                        rol: user.rol,
                        validada: user.validada
                    }
                }
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = AuthController;