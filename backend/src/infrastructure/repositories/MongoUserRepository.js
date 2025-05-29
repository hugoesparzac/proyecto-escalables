const UserRepository = require('../../domain/repositories/UserRepository');
const User = require('../database/models/User');
const UserEntity = require('../../domain/entities/User');

class MongoUserRepository extends UserRepository {
    async create(userEntity) {
        try {
            const userData = {
                nombre: userEntity.nombre,
                correo: userEntity.correo,
                contraseña: userEntity.contraseña,
                token: userEntity.token,
                validada: userEntity.validada,
                rol: userEntity.rol,
                foto_perfil: userEntity.foto_perfil
            };

            const user = new User(userData);
            const savedUser = await user.save();
            
            return this.toEntity(savedUser);
        } catch (error) {
            if (error.code === 11000) {
                throw new Error('El correo electrónico ya está registrado');
            }
            throw error;
        }
    }

    async findById(id) {
        try {
            const user = await User.findById(id);
            return user ? this.toEntity(user) : null;
        } catch (error) {
            throw error;
        }
    }

    async findByEmail(email) {
        try {
            const user = await User.findOne({ correo: email });
            return user ? this.toEntity(user) : null;
        } catch (error) {
            throw error;
        }
    }

    async findByToken(token) {
        try {
            const user = await User.findOne({ token: token });
            return user ? this.toEntity(user) : null;
        } catch (error) {
            throw error;
        }
    }

    async update(id, userData) {
        try {
            const user = await User.findByIdAndUpdate(
                id, 
                { ...userData, updatedAt: new Date() },
                { new: true, runValidators: true }
            );
            
            return user ? this.toEntity(user) : null;
        } catch (error) {
            if (error.code === 11000) {
                throw new Error('El correo electrónico ya está registrado');
            }
            throw error;
        }
    }

    async delete(id) {
        try {
            const result = await User.findByIdAndDelete(id);
            return !!result;
        } catch (error) {
            throw error;
        }
    }

    async validateEmail(id) {
        try {
            const user = await User.findByIdAndUpdate(
                id,
                { 
                    validada: true, 
                    token: null, 
                    updatedAt: new Date() 
                },
                { new: true }
            );
            
            return user ? this.toEntity(user) : null;
        } catch (error) {
            throw error;
        }
    }

    async updatePassword(id, hashedPassword) {
        try {
            const user = await User.findByIdAndUpdate(
                id,
                { 
                    contraseña: hashedPassword, 
                    updatedAt: new Date() 
                },
                { new: true }
            );
            
            return user ? this.toEntity(user) : null;
        } catch (error) {
            throw error;
        }
    }

    async findAll(filters = {}) {
        try {
            const query = this.buildQuery(filters);
            const users = await User.find(query).sort({ createdAt: -1 });
            
            return users.map(user => this.toEntity(user));
        } catch (error) {
            throw error;
        }
    }

    // Métodos adicionales útiles
    async findByFilters(filters = {}, options = {}) {
        try {
            const {
                page = 1,
                limit = 20,
                sortBy = 'createdAt',
                sortOrder = 'desc'
            } = options;

            const query = this.buildQuery(filters);
            const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

            const total = await User.countDocuments(query);
            const users = await User.find(query)
                .sort(sort)
                .skip((page - 1) * limit)
                .limit(limit);

            const totalPages = Math.ceil(total / limit);

            return {
                data: users.map(user => this.toEntity(user)),
                pagination: {
                    total,
                    page: parseInt(page),
                    totalPages,
                    hasNext: page < totalPages,
                    hasPrev: page > 1,
                    limit: parseInt(limit)
                }
            };
        } catch (error) {
            throw error;
        }
    }

    async countByRole(role) {
        try {
            return await User.countDocuments({ rol: role });
        } catch (error) {
            throw error;
        }
    }

    async findValidatedUsers() {
        try {
            const users = await User.find({ validada: true }).sort({ createdAt: -1 });
            return users.map(user => this.toEntity(user));
        } catch (error) {
            throw error;
        }
    }

    async findPendingValidation() {
        try {
            const users = await User.find({ validada: false }).sort({ createdAt: -1 });
            return users.map(user => this.toEntity(user));
        } catch (error) {
            throw error;
        }
    }

    // Métodos auxiliares
    buildQuery(filters) {
        const query = {};

        if (filters.rol) {
            query.rol = filters.rol;
        }

        if (filters.validada !== undefined) {
            query.validada = filters.validada;
        }

        if (filters.nombre) {
            query.nombre = { $regex: filters.nombre, $options: 'i' };
        }

        if (filters.correo) {
            query.correo = { $regex: filters.correo, $options: 'i' };
        }

        if (filters.fechaDesde) {
            query.createdAt = { $gte: new Date(filters.fechaDesde) };
        }

        if (filters.fechaHasta) {
            if (query.createdAt) {
                query.createdAt.$lte = new Date(filters.fechaHasta);
            } else {
                query.createdAt = { $lte: new Date(filters.fechaHasta) };
            }
        }

        return query;
    }

    toEntity(mongoUser) {
        return new UserEntity({
            id_usuario: mongoUser._id.toString(),
            nombre: mongoUser.nombre,
            correo: mongoUser.correo,
            contraseña: mongoUser.contraseña,
            token: mongoUser.token,
            validada: mongoUser.validada,
            rol: mongoUser.rol,
            foto_perfil: mongoUser.foto_perfil,
            createdAt: mongoUser.createdAt,
            updatedAt: mongoUser.updatedAt
        });
    }
}

module.exports = MongoUserRepository;