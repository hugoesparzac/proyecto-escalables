const mongoose = require('mongoose');

class DatabaseConnection {
    constructor() {
        this.connection = null;
        this.isConnected = false;
    }

    async connect() {
        try {
            // Configuración de la URL de conexión
            const mongoURL = process.env.MONGODB_URI || 'mongodb://localhost:27017/cafeteria-app';
            
            // Opciones de conexión para MongoDB
            const options = {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                maxPoolSize: 10, // Mantener hasta 10 conexiones en el pool
                serverSelectionTimeoutMS: 5000, // Timeout después de 5s en lugar de 30s
                socketTimeoutMS: 45000, // Cerrar sockets después de 45s de inactividad
                family: 4, // Usar IPv4, skip trying IPv6
                retryWrites: true,
                writeConcern: {
                    w: 'majority'
                }
            };

            console.log('🔄 Conectando a MongoDB...');
            console.log(`📍 URL: ${mongoURL.replace(/\/\/.*@/, '//***:***@')}`); // Ocultar credenciales en logs

            this.connection = await mongoose.connect(mongoURL, options);
            this.isConnected = true;

            console.log('✅ Conexión a MongoDB establecida exitosamente');
            console.log(`📂 Base de datos: ${this.connection.connection.name}`);
            console.log(`🌐 Host: ${this.connection.connection.host}:${this.connection.connection.port}`);

            // Configurar eventos de conexión
            this.setupConnectionEvents();

            return this.connection;
        } catch (error) {
            this.isConnected = false;
            console.error('❌ Error al conectar con MongoDB:', error.message);
            
            // Log detalles específicos del error
            if (error.code === 'ENOTFOUND') {
                console.error('🔍 Verificar que MongoDB esté ejecutándose y la URL sea correcta');
            } else if (error.code === 'ECONNREFUSED') {
                console.error('🔍 Verificar que el puerto de MongoDB esté disponible');
            }
            
            throw error;
        }
    }

    setupConnectionEvents() {
        const db = mongoose.connection;

        // Evento de conexión exitosa
        db.on('connected', () => {
            console.log('📡 Mongoose conectado a MongoDB');
        });

        // Evento de error
        db.on('error', (error) => {
            console.error('❌ Error de conexión a MongoDB:', error);
            this.isConnected = false;
        });

        // Evento de desconexión
        db.on('disconnected', () => {
            console.log('📡 Mongoose desconectado de MongoDB');
            this.isConnected = false;
        });

        // Evento de reconexión
        db.on('reconnected', () => {
            console.log('🔄 Mongoose reconectado a MongoDB');
            this.isConnected = true;
        });

        // Manejo de cierre de aplicación
        process.on('SIGINT', async () => {
            await this.disconnect();
            process.exit(0);
        });

        process.on('SIGTERM', async () => {
            await this.disconnect();
            process.exit(0);
        });
    }

    async disconnect() {
        try {
            if (this.connection && this.isConnected) {
                console.log('🔄 Cerrando conexión a MongoDB...');
                await mongoose.connection.close();
                this.isConnected = false;
                this.connection = null;
                console.log('✅ Conexión a MongoDB cerrada exitosamente');
            }
        } catch (error) {
            console.error('❌ Error al cerrar la conexión a MongoDB:', error.message);
            throw error;
        }
    }

    async reconnect() {
        try {
            console.log('🔄 Intentando reconectar a MongoDB...');
            await this.disconnect();
            await this.connect();
        } catch (error) {
            console.error('❌ Error al reconectar a MongoDB:', error.message);
            throw error;
        }
    }

    getConnection() {
        return this.connection;
    }

    isConnectionHealthy() {
        return this.isConnected && mongoose.connection.readyState === 1;
    }

    async checkConnection() {
        try {
            if (!this.isConnectionHealthy()) {
                throw new Error('No hay conexión activa a MongoDB');
            }

            // Ping a la base de datos para verificar conectividad
            await mongoose.connection.db.admin().ping();
            return true;
        } catch (error) {
            console.error('❌ Health check falló:', error.message);
            return false;
        }
    }

    getConnectionStatus() {
        const states = {
            0: 'disconnected',
            1: 'connected',
            2: 'connecting',
            3: 'disconnecting'
        };

        return {
            isConnected: this.isConnected,
            readyState: mongoose.connection.readyState,
            readyStateText: states[mongoose.connection.readyState] || 'unknown',
            host: mongoose.connection.host,
            port: mongoose.connection.port,
            name: mongoose.connection.name
        };
    }

    // Método para obtener estadísticas de la base de datos
    async getDatabaseStats() {
        try {
            if (!this.isConnectionHealthy()) {
                throw new Error('No hay conexión activa a MongoDB');
            }

            const stats = await mongoose.connection.db.stats();
            return {
                collections: stats.collections,
                dataSize: stats.dataSize,
                indexSize: stats.indexSize,
                storageSize: stats.storageSize,
                objects: stats.objects
            };
        } catch (error) {
            console.error('❌ Error al obtener estadísticas de la base de datos:', error.message);
            throw error;
        }
    }
}

// Crear instancia singleton
const databaseConnection = new DatabaseConnection();

module.exports = databaseConnection;