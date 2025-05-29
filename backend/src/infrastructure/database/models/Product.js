const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  nombre_producto: {
    type: String,
    required: [true, 'El nombre del producto es requerido'],
    trim: true,
    maxlength: [100, 'El nombre no puede exceder 100 caracteres']
  },
  precio: {
    type: Number,
    required: [true, 'El precio es requerido'],
    min: [0, 'El precio no puede ser negativo']
  },
  descripcion: {
    type: String,
    required: [true, 'La descripción es requerida'],
    trim: true,
    maxlength: [500, 'La descripción no puede exceder 500 caracteres']
  },
  calorias: {
    type: Number,
    required: [true, 'Las calorías son requeridas'],
    min: [0, 'Las calorías no pueden ser negativas']
  },
  cantidad_stock: {
    type: Number,
    required: [true, 'La cantidad en stock es requerida'],
    min: [0, 'El stock no puede ser negativo']
  },
  id_categoria: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'La categoría es requerida']
  },
  url_imagen: {
    type: String,
    required: [true, 'La imagen del producto es requerida']
  },
  activo: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  versionKey: false
});

// Índices
productSchema.index({ id_categoria: 1 });
productSchema.index({ activo: 1 });
productSchema.index({ nombre_producto: 'text', descripcion: 'text' });

// Populate automático de categoría
productSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'id_categoria',
    select: 'nombre_categoria descripcion imagen_url'
  });
  next();
});

module.exports = mongoose.model('Product', productSchema);