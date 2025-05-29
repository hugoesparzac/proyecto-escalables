const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  nombre_categoria: {
    type: String,
    required: [true, 'El nombre de la categoría es requerido'],
    unique: true,
    trim: true,
    maxlength: [30, 'El nombre no puede exceder 30 caracteres']
  },
  descripcion: {
    type: String,
    trim: true,
    maxlength: [200, 'La descripción no puede exceder 200 caracteres']
  },
  imagen_url: {
    type: String,
    default: null
  },
  activa: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  versionKey: false
});

// El índice para nombre_categoria ya está definido por unique: true
categorySchema.index({ activa: 1 });

module.exports = mongoose.model('Category', categorySchema);