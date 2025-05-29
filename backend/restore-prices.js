const mongoose = require('mongoose');

// Conectar a MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/cafeteria');

// Define un esquema simple para productos
const productSchema = new mongoose.Schema({
    nombre_producto: String,
    precio: Number,
    descripcion: String,
    calorias: Number,
    cantidad_stock: Number,
    id_categoria: mongoose.Schema.Types.ObjectId,
    url_imagen: String,
    activo: Boolean
}, { timestamps: true });

// Crear el modelo con el esquema
const Product = mongoose.model('Product', productSchema);

async function restorePrices() {
    try {
        console.log('Conectando a la base de datos...');
        
        // Obtener todos los productos
        const products = await Product.find({});
        console.log(`Encontrados ${products.length} productos`);
        
        // Restaurar precios a valores enteros
        for (const product of products) {
            // Restaurar el precio original (quitar el centavo extra)
            const currentPrice = product.precio;
            const originalPrice = Math.floor(currentPrice);
            
            product.precio = originalPrice;
            await product.save();
            console.log(`Restaurado: ${product.nombre_producto} - Precio: ${currentPrice} -> ${product.precio}`);
        }
        
        // Verificar los cambios
        const updatedProducts = await Product.find({}).limit(5);
        updatedProducts.forEach(product => {
            console.log(`
Producto: ${product.nombre_producto}
Precio: $${product.precio} (tipo: ${typeof product.precio})
---`);
        });
        
        await mongoose.connection.close();
        console.log('Precios restaurados y conexión cerrada');
    } catch (error) {
        console.error('Error:', error.message);
        await mongoose.connection.close();
    }
}

restorePrices();
