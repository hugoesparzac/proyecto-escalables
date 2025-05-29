require('dotenv').config();
const mongoose = require('mongoose');

// Importar modelos
const User = require('../infrastructure/database/models/User');
const Category = require('../infrastructure/database/models/Category');
const Product = require('../infrastructure/database/models/Product');

async function seedDatabase() {
    try {
        // Conectar a la base de datos
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cafeteria');
        console.log('✅ Conectado a MongoDB');

        // Limpiar datos existentes
        await User.deleteMany({});
        await Category.deleteMany({});
        await Product.deleteMany({});
        console.log('🧹 Base de datos limpia');        // Crear usuario administrador
        const admin = await User.create({
            nombre: 'Administrador',
            correo: 'admin@cafeteria.com',
            contraseña: 'admin123', // El modelo se encargará del hash
            rol: 'admin',
            validada: true
        });
        console.log('👨‍💼 Usuario administrador creado');

        // Crear categorías
        const categorias = await Category.create([
            {
                nombre_categoria: 'Desayunos',
                descripcion: 'Deliciosos desayunos para comenzar el día',
                imagen_url: '/assets/images/categories/desayunos.jpg'
            },
            {
                nombre_categoria: 'Comidas',
                descripcion: 'Platillos principales para el almuerzo',
                imagen_url: '/assets/images/categories/comidas.jpg'
            },
            {
                nombre_categoria: 'Bebidas',
                descripcion: 'Bebidas calientes y frías',
                imagen_url: '/assets/images/categories/bebidas.jpg'
            },
            {
                nombre_categoria: 'Postres',
                descripcion: 'Dulces tentaciones para terminar',
                imagen_url: '/assets/images/categories/postres.jpg'
            }
        ]);
        console.log('📂 Categorías creadas');

        // Crear productos de ejemplo
        const productos = [];
        
        // Desayunos
        productos.push(
            {
                nombre_producto: 'Molletes de Frijol',
                precio: 45.00,
                descripcion: 'Bolillo tostado con frijoles refritos, queso y pico de gallo',
                calorias: 320,
                cantidad_stock: 20,
                id_categoria: categorias[0]._id,
                url_imagen: '/assets/images/products/molletes.jpg'
            },
            {
                nombre_producto: 'Quesadillas de Queso',
                precio: 35.00,
                descripcion: 'Tortilla de maíz con queso Oaxaca derretido',
                calorias: 280,
                cantidad_stock: 15,
                id_categoria: categorias[0]._id,
                url_imagen: '/assets/images/products/quesadillas.jpg'
            }
        );

        // Comidas
        productos.push(
            {
                nombre_producto: 'Tacos de Pastor',
                precio: 55.00,
                descripcion: 'Tres tacos de pastor con piña, cebolla y cilantro',
                calorias: 420,
                cantidad_stock: 25,
                id_categoria: categorias[1]._id,
                url_imagen: '/assets/images/products/tacos-pastor.jpg'
            },
            {
                nombre_producto: 'Torta de Jamón',
                precio: 60.00,
                descripcion: 'Torta con jamón, queso, lechuga, tomate y aguacate',
                calorias: 380,
                cantidad_stock: 12,
                id_categoria: categorias[1]._id,
                url_imagen: '/assets/images/products/torta-jamon.jpg'
            }
        );

        // Bebidas
        productos.push(
            {
                nombre_producto: 'Café Americano',
                precio: 25.00,
                descripcion: 'Café negro recién molido',
                calorias: 5,
                cantidad_stock: 50,
                id_categoria: categorias[2]._id,
                url_imagen: '/assets/images/products/cafe-americano.jpg'
            },
            {
                nombre_producto: 'Agua de Horchata',
                precio: 30.00,
                descripcion: 'Refrescante agua de horchata con canela',
                calorias: 150,
                cantidad_stock: 30,
                id_categoria: categorias[2]._id,
                url_imagen: '/assets/images/products/horchata.jpg'
            }
        );

        // Postres
        productos.push(
            {
                nombre_producto: 'Flan Napolitano',
                precio: 40.00,
                descripcion: 'Cremoso flan casero con caramelo',
                calorias: 250,
                cantidad_stock: 8,
                id_categoria: categorias[3]._id,
                url_imagen: '/assets/images/products/flan.jpg'
            },
            {
                nombre_producto: 'Gelatina de Leche',
                precio: 35.00,
                descripcion: 'Suave gelatina de leche condensada',
                calorias: 180,
                cantidad_stock: 10,
                id_categoria: categorias[3]._id,
                url_imagen: '/assets/images/products/gelatina.jpg'
            }
        );

        await Product.create(productos);
        console.log('🍽️ Productos creados');

        console.log('\n✅ Base de datos poblada exitosamente');
        console.log('📊 Datos creados:');
        console.log(`   - 1 Usuario administrador (admin@cafeteria.com / admin123)`);
        console.log(`   - ${categorias.length} Categorías`);
        console.log(`   - ${productos.length} Productos`);

    } catch (error) {
        console.error('❌ Error poblando la base de datos:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Desconectado de MongoDB');
        process.exit(0);
    }
}

// NOTA: No se incluyen los campos 'activo' ni 'disponible' en los productos de ejemplo, ya que no se requieren ni se usan en la lógica de stock.

seedDatabase();
