const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre es requerido'],
    trim: true,
    maxlength: [50, 'El nombre no puede exceder 50 caracteres']
  },
  correo: {
    type: String,
    required: [true, 'El correo es requerido'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Por favor ingresa un correo válido']
  },
  contraseña: {
    type: String,
    required: [true, 'La contraseña es requerida'],
    minlength: [6, 'La contraseña debe tener al menos 6 caracteres'],
    select: false
  },
  token: {
    type: String,
    default: null
  },
  validada: {
    type: Boolean,
    default: false
  },
  rol: {
    type: String,
    enum: {
      values: ['admin', 'cliente'],
      message: 'El rol debe ser admin o cliente'
    },
    default: 'cliente'
  },
  foto_perfil: {
    type: String,
    default: null
  }
}, {
  timestamps: true,
  versionKey: false
});

// Los índices ya están definidos implícitamente por unique: true
userSchema.index({ token: 1 });

userSchema.pre('save', async function(next) {
  if (!this.isModified('contraseña')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.contraseña = await bcrypt.hash(this.contraseña, salt);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.contraseña);
};

userSchema.methods.generateValidationToken = function() {
  const token = Math.random().toString(36).substring(2, 15) + 
                Math.random().toString(36).substring(2, 15);
  this.token = token;
  return token;
};

userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.contraseña;
  delete user.token;
  return user;
};

module.exports = mongoose.model('User', userSchema);