const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  id_usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'El usuario es requerido']
  },
  fecha_hora: {
    type: Date,
    default: Date.now
  },
  estado: {
    type: String,
    enum: {
      values: ['leido', 'no_leido'],
      message: 'El estado debe ser leido o no_leido'
    },
    default: 'no_leido'
  },
  tipo: {
    type: String,
    enum: {
      values: ['orden_pagada', 'orden_realizando', 'orden_entregada'],
      message: 'El tipo debe ser: orden_pagada, orden_realizando o orden_entregada'
    },
    required: true
  },
  mensaje: {
    type: String,
    required: [true, 'El mensaje es requerido'],
    maxlength: [500, 'El mensaje no puede exceder 500 caracteres']
  },
  id_orden: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: [true, 'La orden es requerida']
  }
}, {
  timestamps: true,
  versionKey: false
});

notificationSchema.index({ id_usuario: 1 });
notificationSchema.index({ estado: 1 });
notificationSchema.index({ fecha_hora: -1 });

notificationSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'id_orden',
    select: 'numero_orden estado precio_total'
  });
  next();
});

module.exports = mongoose.model('Notification', notificationSchema);