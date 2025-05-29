class User {
    constructor(data = {}) {
        this.id_usuario = data.id_usuario || null;
        this.nombre = data.nombre || '';
        this.correo = data.correo || '';
        this.contraseña = data.contraseña || '';
        this.token = data.token || null;
        this.validada = data.validada || false;
        this.rol = data.rol || 'cliente'; // admin, cliente
        this.foto_perfil = data.foto_perfil || null;
        this.createdAt = data.createdAt || new Date();
        this.updatedAt = data.updatedAt || new Date();
    }

    // Validaciones
    isValid() {
        return this.nombre && 
               this.correo && 
               this.contraseña && 
               this.isValidEmail() &&
               this.isValidRole();
    }

    isValidEmail() {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(this.correo);
    }

    isValidRole() {
        const validRoles = ['admin', 'cliente'];
        return validRoles.includes(this.rol);
    }

    isEmailValidated() {
        return this.validada === true;
    }

    isAdmin() {
        return this.rol === 'admin';
    }

    isCliente() {
        return this.rol === 'cliente';
    }

    // Métodos para actualizar datos
    updateProfile(data) {
        if (data.nombre !== undefined) this.nombre = data.nombre;
        if (data.foto_perfil !== undefined) this.foto_perfil = data.foto_perfil;
        this.updatedAt = new Date();
    }

    validateEmail() {
        this.validada = true;
        this.token = null;
        this.updatedAt = new Date();
    }

    generateToken() {
        this.token = Math.random().toString(36).substring(2, 15) + 
                    Math.random().toString(36).substring(2, 15);
        this.updatedAt = new Date();
        return this.token;
    }

    toJSON() {
        return {
            id_usuario: this.id_usuario,
            nombre: this.nombre,
            correo: this.correo,
            validada: this.validada,
            rol: this.rol,
            foto_perfil: this.foto_perfil,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }
}

module.exports = User;