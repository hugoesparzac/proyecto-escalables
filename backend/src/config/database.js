const mongoose = require('mongoose');

class DatabaseConnection {
  static async connect() {
    try {
      const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/cafeteria';
        await mongoose.connect(mongoUri);
      
      console.log('✅ MongoDB conectado exitosamente');
      
      // Configurar eventos de conexión
      mongoose.connection.on('error', (err) => {
        console.error('❌ Error de MongoDB:', err);
      });
      
      mongoose.connection.on('disconnected', () => {
        console.log('⚠️ MongoDB desconectado');
      });
      
    } catch (error) {
      console.error('❌ Error conectando a MongoDB:', error);
      process.exit(1);
    }
  }
  
  static async disconnect() {
    try {
      await mongoose.disconnect();
      console.log('✅ MongoDB desconectado correctamente');
    } catch (error) {
      console.error('❌ Error desconectando MongoDB:', error);
    }
  }
}

module.exports = DatabaseConnection;