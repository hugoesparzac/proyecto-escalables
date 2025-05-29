require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');

// Debug: Verificar variables de entorno críticas
console.log('🔍 Debug - Variables de entorno:');
console.log('PORT:', process.env.PORT);
console.log('JWT_SECRET existe:', !!process.env.JWT_SECRET);
console.log('JWT_SECRET length:', process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 0);
console.log('MONGODB_URI existe:', !!process.env.MONGODB_URI);

const DatabaseConnection = require('./config/database');
const errorHandler = require('./presentation/middleware/errorHandler');

const authRoutes = require('./presentation/routes/authRoutes');
const productRoutes = require('./presentation/routes/productRoutes');
const cartRoutes = require('./presentation/routes/cartRoutes');
const favoriteRoutes = require('./presentation/routes/favoriteRoutes');
const orderRoutes = require('./presentation/routes/orderRoutes');
const notificationRoutes = require('./presentation/routes/notificationRoutes');
const categoryRoutes = require('./presentation/routes/categoryRoutes');
const adminRoutes = require('./presentation/routes/adminRoutes');
const paymentRoutes = require('./presentation/routes/paymentRoutes');

class App {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3000;
    
    this.initializeDatabase();
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  async initializeDatabase() {
    await DatabaseConnection.connect();
  }

  initializeMiddlewares() {
    this.app.use(helmet());
    
    const limiter = rateLimit({
      windowMs: 1 * 60 * 1000, // 1 minuto
      max: 10000, // máximo 100 requests por IP
      message: {
        success: false,
        message: 'Demasiadas solicitudes. Intenta de nuevo en 15 minutos.'
      },
      handler: (req, res, next, options) => {
        console.warn(`🚫 Rate limit alcanzado para IP: ${req.ip}`);
        res.status(options.statusCode).json(options.message);
      }    });
    this.app.use(limiter);
    
    this.app.use(cors({
      origin: [
        process.env.FRONTEND_URL || 'http://localhost:4200',
        'http://localhost:4201',
        'http://localhost:4202',
        'http://localhost:4203'
      ],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      allowedHeaders: ['Content-Type', 'Authorization']
    }));

    this.app.use(compression());

    if (process.env.NODE_ENV === 'development') {
      this.app.use(morgan('dev'));
    }

    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    this.app.use('/uploads', express.static('uploads'));
  }

  initializeRoutes() {
    this.app.get('/health', (req, res) => {
      res.status(200).json({
        success: true,
        message: 'API funcionando correctamente',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV
      });    });
    
    this.app.use('/api/auth', authRoutes);
    this.app.use('/api/products', productRoutes);
    this.app.use('/api/cart', cartRoutes);
    this.app.use('/api/favorites', favoriteRoutes);    this.app.use('/api/orders', orderRoutes);
    this.app.use('/api/notifications', notificationRoutes);
    this.app.use('/api/categories', categoryRoutes);
    this.app.use('/api/admins', adminRoutes);
    this.app.use('/api/payments', paymentRoutes);

    this.app.all('*', (req, res) => {
      res.status(404).json({
        success: false,
        message: `Ruta ${req.originalUrl} no encontrada`
      });
    });
  }

  initializeErrorHandling() {
    this.app.use(errorHandler);
  }

  listen() {
    this.app.listen(this.port, () => {
      console.log(`🚀 Servidor corriendo en puerto ${this.port}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
      console.log(`📊 Health check: http://localhost:${this.port}/health`);
    });
  }

  getApp() {
    return this.app;
  }
}

const app = new App();

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('SIGTERM', async () => {
  console.log('SIGTERM recibido. Cerrando servidor...');
  await DatabaseConnection.disconnect();
  process.exit(0);
});

module.exports = app;