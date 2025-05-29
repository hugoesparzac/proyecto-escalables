const MongoUserRepository = require('../../infrastructure/repositories/MongoUserRepository');
const UserEntity = require('../../domain/entities/User');
const EmailService = require('../../domain/services/EmailService');

class AdminController {
    constructor() {
        this.userRepository = new MongoUserRepository();
        this.emailService = new EmailService();
    }

    // Listar administradores
    async getAll(req, res, next) {
        try {
            const admins = await this.userRepository.findByFilters({ rol: 'admin' });
            res.status(200).json({ success: true, data: admins.data || admins });
        } catch (error) {
            next(error);
        }
    }

    // Obtener un administrador por ID
    async getById(req, res, next) {
        try {
            const { id } = req.params;
            const admin = await this.userRepository.findById(id);
            if (!admin || admin.rol !== 'admin') {
                return res.status(404).json({ success: false, message: 'Administrador no encontrado' });
            }
            res.status(200).json({ success: true, data: admin });
        } catch (error) {
            next(error);
        }
    }    // Crear un nuevo administrador
    async create(req, res, next) {
        try {
            const data = req.body;
            data.rol = 'admin';
            data.validada = false; // El email no está validado hasta que el usuario lo haga
            
            const adminEntity = new UserEntity(data);
            
            if (!adminEntity.isValid()) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Datos inválidos. Debe proporcionar nombre, correo y contraseña válidos.' 
                });
            }
            
            // Generar token de validación
            const token = adminEntity.generateToken();
            
            // Crear el administrador en la base de datos
            const admin = await this.userRepository.create(adminEntity);
            
            // Enviar correo de validación
            try {
                await this.emailService.sendValidationEmail(
                    adminEntity.correo,
                    adminEntity.nombre,
                    token
                );
                
                console.log(`📧 Correo de validación enviado a ${adminEntity.correo}`);
            } catch (emailError) {
                console.error('Error al enviar el correo de validación:', emailError);
                // No interrumpimos el flujo por error de correo, pero lo registramos
            }
            
            res.status(201).json({ 
                success: true, 
                data: admin, 
                message: 'Administrador creado correctamente. Se ha enviado un correo para validar la cuenta.' 
            });
        } catch (error) {
            next(error);
        }
    }

    // Actualizar un administrador
    async update(req, res, next) {
        try {
            const { id } = req.params;
            const data = req.body;
            if (data.rol && data.rol !== 'admin') {
                return res.status(400).json({ success: false, message: 'Solo se permite rol admin' });
            }
            const admin = await this.userRepository.update(id, data);
            if (!admin || admin.rol !== 'admin') {
                return res.status(404).json({ success: false, message: 'Administrador no encontrado' });
            }
            res.status(200).json({ success: true, data: admin });
        } catch (error) {
            next(error);
        }
    }

    // Eliminar un administrador
    async delete(req, res, next) {
        try {
            const { id } = req.params;
            const admin = await this.userRepository.findById(id);
            if (!admin || admin.rol !== 'admin') {
                return res.status(404).json({ success: false, message: 'Administrador no encontrado' });
            }
            await this.userRepository.delete(id);
            res.status(200).json({ success: true, message: 'Administrador eliminado' });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = AdminController;
