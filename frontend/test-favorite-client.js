// Este script de prueba verificará el estado actual de la funcionalidad de favoritos usando solo Axios
const axios = require('axios');

const startTime = new Date();
console.log(`📋 Test de Favoritos - Inicio: ${startTime.toISOString()}`);

async function runTest() {
  // URL base del backend
  const baseUrl = 'http://localhost:3002/api';
  let authToken = null;

  try {
    // 1. Iniciar sesión para obtener el token
    console.log('\n🔑 1. Autenticación:');
    const loginRes = await axios.post(`${baseUrl}/auth/login`, {
      correo: 'azrapseoguh@gmail.com',
      contraseña: 'Daishinyuu_134'
    });
    const loginData = loginRes.data;
    if (!loginData?.data?.token) {
      console.error('❌ No se pudo obtener el token de autenticación');
      console.log('Respuesta completa:', JSON.stringify(loginData, null, 2));
      return;
    }
    authToken = loginData.data.token;
    console.log('✅ Sesión iniciada correctamente');
    console.log('🔑 Token obtenido:', authToken ? 'Sí' : 'No');

    // 2. Obtener favoritos del usuario
    console.log('\n❤️ 2. Obtener favoritos:');
    const favRes = await axios.get(`${baseUrl}/favorites`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    const favData = favRes.data;
    console.log('Respuesta completa de favoritos:', JSON.stringify(favData, null, 2));
    const productos = favData?.data?.productos || [];
    const total = favData?.data?.total || 0;
    console.log(`✅ Se encontraron ${total} favoritos`);
    if (productos.length > 0) {
      console.log('📋 Lista de productos favoritos:');
      productos.forEach((producto, index) => {
        console.log(`   ${index+1}. ${producto.nombre_producto} - $${producto.precio} (ID: ${producto._id || producto.id_producto})`);
      });
    } else {
      console.log('⚠️ No se encontraron productos favoritos');
    }

    // 3. Obtener todos los productos para probar agregar favoritos
    console.log('\n🛒 3. Obtener productos disponibles:');
    const prodRes = await axios.get(`${baseUrl}/products`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    const allProducts = prodRes.data?.data?.products || [];
    console.log('Respuesta completa de productos:', JSON.stringify(prodRes.data, null, 2));
    console.log(`✅ Se encontraron ${allProducts.length} productos disponibles`);

    // 4. Probar agregar un producto a favoritos (si no está ya en favoritos)
    if (allProducts.length > 0) {
      console.log('\n➕ 4. Agregar un producto a favoritos:');
      const existingFavoriteIds = productos.map(p => p._id || p.id_producto);
      const productToAdd = allProducts.find(p => !existingFavoriteIds.includes(p._id));
      if (productToAdd) {
        console.log(`   Intentando agregar: ${productToAdd.nombre_producto} (ID: ${productToAdd._id})`);
        try {
          const addRes = await axios.post(`${baseUrl}/favorites`, { id_producto: productToAdd._id }, {
            headers: { Authorization: `Bearer ${authToken}` }
          });
          console.log('✅ Producto agregado a favoritos correctamente');
        } catch (err) {
          if (err.response) {
            console.log('❌ Error al agregar producto a favoritos:', err.response.data);
          } else {
            console.log('❌ Error de red al agregar producto a favoritos:', err.message);
          }
        }
      } else {
        console.log('⚠️ Todos los productos ya están en favoritos');
      }
    }

    // 5. Verificar los favoritos actualizados
    console.log('\n🔄 5. Verificar favoritos actualizados:');
    const updatedFavRes = await axios.get(`${baseUrl}/favorites`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    const updatedData = updatedFavRes.data?.data || {};
    const updatedProductos = updatedData.productos || [];
    const updatedTotal = updatedData.total || 0;
    console.log('Respuesta completa de favoritos actualizados:', JSON.stringify(updatedFavRes.data, null, 2));
    console.log(`✅ Se encontraron ${updatedTotal} favoritos después de la operación`);
    if (updatedProductos.length > 0) {
      console.log('📋 Lista actualizada de productos favoritos:');
      updatedProductos.forEach((producto, index) => {
        console.log(`   ${index+1}. ${producto.nombre_producto} - $${producto.precio} (ID: ${producto._id || producto.id_producto})`);
      });
    } else {
      console.log('⚠️ No se encontraron productos favoritos');
    }

  } catch (error) {
    if (error.response) {
      console.error('❌ Error durante la prueba:', error.response.data);
    } else {
      console.error('❌ Error durante la prueba:', error.message);
    }
  }

  // Calcular duración total
  const endTime = new Date();
  const duration = (endTime - startTime) / 1000;
  console.log(`\n📋 Test de Favoritos - Finalizado: ${endTime.toISOString()}`);
  console.log(`⏱️ Duración total: ${duration} segundos`);
}

// Ejecutar la prueba
runTest();
