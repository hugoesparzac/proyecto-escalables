const mongoose = require('mongoose');

const orderProductSchema = new mongoose.Schema({
  id_producto: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  nombre_producto: {
    type: String,
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
  subtotal: {
    type: Number,
    required: true,
    min: [0, 'El subtotal no puede ser negativo']
  }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  numero_orden: {
    type: String,
    unique: true,
    required: true
  },
  id_usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'El usuario es requerido']
  },
  estado: {
    type: String,
    enum: {
      values: ['pendiente', 'pagado', 'en_preparacion', 'realizando', 'listo', 'entregado', 'cancelado'],
      message: 'El estado debe ser uno de los valores permitidos'
    },
    default: 'pendiente'
  },
  fecha_pago: {
    type: Date,
    default: Date.now
  },
  fecha_realizando: {
    type: Date,
    default: null
  },
  fecha_entregado: {
    type: Date,
    default: null
  },
  precio_total: {
    type: Number,
    required: [true, 'El precio total es requerido'],
    min: [0, 'El precio total no puede ser negativo']
  },
  productos: [orderProductSchema],
  stripe_payment_intent: {
    type: String,
    required: true
  }
}, {
  timestamps: true,
  versionKey: false
});

// El índice para numero_orden ya está definido por unique: true
orderSchema.index({ id_usuario: 1 });
orderSchema.index({ estado: 1 });
orderSchema.index({ createdAt: -1 });

// Generar número de orden automáticamente y validar productos
orderSchema.pre('save', async function(next) {
  try {
    // Generar número de orden si no existe
    if (!this.numero_orden) {
      const timestamp = Date.now().toString();
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      this.numero_orden = `ORD-${timestamp}-${random}`;
    }
    
    // Validar y corregir productos
    if (this.productos && this.productos.length > 0) {
      // Convertir cada id_producto a ObjectId si es necesario
      this.productos.forEach(producto => {
        if (!producto.id_producto) {
          throw new Error('Todos los productos deben tener un id_producto válido');
        }
        
        // Si es string, convertir a ObjectId
        if (typeof producto.id_producto === 'string') {
          producto.id_producto = new mongoose.Types.ObjectId(producto.id_producto);
        }
        
        // Si es un objeto con _id, extraer el _id
        if (typeof producto.id_producto === 'object' && producto.id_producto._id) {
          producto.id_producto = producto.id_producto._id;
        }
      });
    } else {
      throw new Error('La orden debe tener al menos un producto');
    }
    
    next();
  } catch (error) {
    next(error);
  }
});
  
  // Añadir un método para verificar y corregir los productos antes de guardar
  orderSchema.methods.validateProducts = function() {
  if (!this.productos || this.productos.length === 0) {
    throw new Error('La orden debe tener al menos un producto');
  }
  
  // Validar y corregir cada producto
  this.productos = this.productos.map(producto => {
    // Si id_producto es un objeto con _id, extraer el _id
    if (producto.id_producto && typeof producto.id_producto === 'object' && producto.id_producto._id) {
      producto.id_producto = producto.id_producto._id;
    }
    
    // Asegurarse de que id_producto sea un ObjectId válido
    if (producto.id_producto && typeof producto.id_producto === 'string') {
      producto.id_producto = new mongoose.Types.ObjectId(producto.id_producto);
    }
    
    return producto;
  });
  
  // Filtrar productos sin id_producto válido
  this.productos = this.productos.filter(producto => producto.id_producto);
  
  return this.productos.length > 0;
  };

// Populate automático de usuario
orderSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'id_usuario',
    select: 'nombre correo'
  });
  next();
});

module.exports = mongoose.model('Order', orderSchema);

