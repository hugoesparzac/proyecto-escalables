// Este script prueba SOLO el flujo de compra: login, obtener productos, simular carrito y crear orden.
const axios = require('axios');

(async function() {
  const baseUrl = 'http://localhost:3002/api';
  let token;
  try {
    // 1. Login
    const login = await axios.post(`${baseUrl}/auth/login`, {
      correo: 'azrapseoguh@gmail.com',
      contraseña: 'Daishinyuu_134'
    });
    token = login.data?.data?.token;
    if (!token) throw new Error('No se obtuvo token');
    console.log('✅ Login OK');

    // 2. Obtener productos
    const prodRes = await axios.get(`${baseUrl}/products`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const productos = prodRes.data?.data?.products || [];
    if (productos.length < 2) throw new Error('No hay suficientes productos');
    console.log(`✅ Productos obtenidos: ${productos.length}`);

    // 3. Simular carrito
    const cart = [
      { id_producto: productos[0]._id, cantidad: 2 },
      { id_producto: productos[1]._id, cantidad: 1 }
    ];
    const total = cart.reduce((sum, item) => {
      const p = productos.find(x => x._id === item.id_producto);
      return sum + (p ? p.precio * item.cantidad : 0);
    }, 0);

    // 3.1 Agregar productos al carrito en backend
    for (const item of cart) {
      try {
        await axios.post(`${baseUrl}/cart/items`, {
          id_producto: item.id_producto,
          cantidad: item.cantidad
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (e) {
        if (e.response) {
          console.error('❌ Error al agregar al carrito:', e.response.data);
        } else {
          console.error('❌ Error al agregar al carrito:', e.message);
        }
      }
    }
    console.log('✅ Productos agregados al carrito en backend');

    // 3.2 Verificar carrito en backend
    try {
      const cartRes = await axios.get(`${baseUrl}/cart`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('🛒 Carrito actual en backend:');
      console.log(JSON.stringify(cartRes.data, null, 2));
    } catch (e) {
      if (e.response) {
        console.error('❌ Error al obtener el carrito:', e.response.data);
      } else {
        console.error('❌ Error al obtener el carrito:', e.message);
      }
    }

    // 4. Crear orden
    try {
      const orderRes = await axios.post(`${baseUrl}/orders`, {
        metodo_pago: 'stripe'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Orden creada. Respuesta:');
      console.log(JSON.stringify(orderRes.data, null, 2));
    } catch (e) {
      if (e.response) {
        console.error('❌ Error al crear la orden:', e.response.data);
      } else {
        console.error('❌ Error al crear la orden:', e.message);
      }
    }
  } catch (e) {
    if (e.response) {
      console.error('❌ Error:', e.response.data);
    } else {
      console.error('❌ Error:', e.message);
    }
  }
})();
