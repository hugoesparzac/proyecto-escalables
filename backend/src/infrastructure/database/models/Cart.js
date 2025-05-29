const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  id_producto: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  cantidad: {
    type: Number,
    required: true,
    min: [1, 'La cantidad debe ser al menos 1']
  },
  precio_unitario: {
    type: Number,
    required: true,
    min: [0, 'El precio no puede ser negativo']
  },
  added_at: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const cartSchema = new mongoose.Schema({
  id_usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'El usuario es requerido'],
    unique: true
  },
  items: [cartItemSchema],
  total: {
    type: Number,
    default: 0,
    min: [0, 'El total no puede ser negativo']
  }
}, {
  timestamps: true,
  versionKey: false
});

cartSchema.methods.calculateTotal = function() {
  this.total = this.items.reduce((sum, item) => {
    return sum + (item.cantidad * item.precio_unitario);
  }, 0);
  return this.total;
};

cartSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'items.id_producto',
    select: 'nombre_producto precio url_imagen cantidad_stock activo'
  });
  next();
});

module.exports = mongoose.model('Cart', cartSchema);