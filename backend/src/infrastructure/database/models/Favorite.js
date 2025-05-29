const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
  id_usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'El usuario es requerido']
  },
  id_producto: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'El producto es requerido']
  },
  added_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  versionKey: false
});

favoriteSchema.index({ id_usuario: 1, id_producto: 1 }, { unique: true });

favoriteSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'id_producto',
    select: 'nombre_producto precio url_imagen id_categoria',
    populate: {
      path: 'id_categoria',
      select: 'nombre_categoria'
    }
  });
  next();
});

module.exports = mongoose.model('Favorite', favoriteSchema);