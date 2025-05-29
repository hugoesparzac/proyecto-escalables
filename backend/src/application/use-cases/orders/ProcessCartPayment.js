const Order = require('../../../infrastructure/database/models/Order');
const Product = require('../../../infrastructure/database/models/Product');
const Cart = require('../../../infrastructure/database/models/Cart');
const Notification = require('../../../infrastructure/database/models/Notification');
const mongoose = require('mongoose');

class ProcessCartPayment {
    constructor(orderRepository, cartRepository, productRepository, paymentService, notificationService) {
        this.orderRepository = orderRepository;
        this.cartRepository = cartRepository;
        this.productRepository = productRepository;
        this.paymentService = paymentService;
        this.notificationService = notificationService;
    }

    async execute(userId) {
        try {
            console.log(` Procesando pago del carrito para usuario: ${userId}`);
            
            // 1. Obtener el carrito del usuario
            let cart = await this.cartRepository.findByUserId(userId);
            console.log(` Estado del carrito:`, cart ? `Encontrado con ${cart.productos?.length || 0} productos` : 'No encontrado');
            
            // Si no hay carrito (en desarrollo/pruebas), crear uno simulado
            if (!cart || !cart.productos || cart.productos.length === 0) {
                console.log(' Carrito vac�o o no encontrado');
                
                if (process.env.NODE_ENV !== 'production') {
                    console.log(' Modo desarrollo: Simulando carrito para pruebas');
                    // Simular un carrito para pruebas
                    try {
                        console.log(` Buscando producto para simular carrito...`);
                        // Intentar encontrar un producto activo con stock
                        const mockProduct = await Product.findOne({ activo: true, cantidad_stock: { $gt: 0 } });
                        console.log(` Producto para simular:`, mockProduct ? `${mockProduct._id} (${mockProduct.nombre_producto})` : 'No encontrado');
                        
                        if (mockProduct) {
                            console.log(` Usando producto real de la base de datos`);
                            cart = {
                                id_usuario: userId,
                                productos: [{
                                    id_producto: mockProduct._id,
                                    producto: mockProduct,
                                    cantidad: 1,
                                    precio_actual: mockProduct.precio,
                                    disponible: true,
                                    stock_disponible: mockProduct.cantidad_stock,
                                    stock_suficiente: true
                                }]
                            };
                        } else {
                            // Si no encontramos un producto real, creamos uno simulado
                            console.log(` No se encontraron productos reales, creando uno simulado`);
                            const mockId = new mongoose.Types.ObjectId();
                            const simulatedProduct = {
                                _id: mockId,
                                nombre_producto: "Caf� Simulado",
                                precio: 50,
                                cantidad_stock: 100,
                                activo: true
                            };
                            
                            cart = {
                                id_usuario: userId,
                                productos: [{
                                    id_producto: mockId,
                                    producto: simulatedProduct,
                                    cantidad: 1,
                                    precio_actual: 50,
                                    disponible: true,
                                    stock_disponible: 100,
                                    stock_suficiente: true
                                }]
                            };
                        }
                        console.log(' Carrito simulado creado con �xito');
                    } catch (err) {
                        console.error(' Error al simular carrito:', err);
                        throw new Error('Error al simular carrito para pruebas: ' + err.message);
                    }
                } else {
                    throw new Error('El carrito est� vac�o');
                }
            }
            
            // 2. Verificar stock y disponibilidad de productos
            const outOfStockProducts = [];
            const cartProducts = [];

            console.log(` Verificando disponibilidad de ${cart.productos.length} productos`);
            for (const item of cart.productos) {
                try {
                    console.log(` Procesando producto:`, item.id_producto, `(cantidad: ${item.cantidad})`);
                    
                    // Asegurarnos de que tenemos un id_producto válido
                    let productId = item.id_producto;
                    
                    // Si viene como objeto, extraer el _id
                    if (productId && typeof productId === 'object' && productId._id) {
                        console.log(` id_producto es un objeto, extrayendo _id`);
                        productId = productId._id;
                    }
                    
                    // Si no tenemos productId, intentar desde item.producto
                    if (!productId && item.producto && item.producto._id) {
                        console.log(` Usando item.producto._id como fallback para id_producto`);
                        productId = item.producto._id;
                    }
                    
                    // Validar que tengamos un ID
                    if (!productId) {
                        console.error(` ID de producto no encontrado:`, item);
                        outOfStockProducts.push('Producto con ID inválido');
                        continue;
                    }
                    
                    // Convertir a ObjectId si es string
                    if (typeof productId === 'string') {
                        productId = new mongoose.Types.ObjectId(productId);
                    }
                    
                    // Buscar el producto usando el ID validado
                    const product = await this.productRepository.findById(productId);
                    
                    if (!product || !product.activo) {
                        console.log(` Producto no disponible: ${productId}`);
                        outOfStockProducts.push(item.producto?.nombre_producto || 'Producto no disponible');
                    } else if (product.cantidad_stock < item.cantidad) {
                        console.log(` Stock insuficiente: ${product.nombre_producto} (disponible: ${product.cantidad_stock}, solicitado: ${item.cantidad})`);
                        outOfStockProducts.push(`${product.nombre_producto} (stock: ${product.cantidad_stock})`);
                    } else {
                        console.log(` Producto disponible: ${product.nombre_producto}`);
                        // Asegurarnos de que id_producto es un ObjectId
                        const productObjectId = new mongoose.Types.ObjectId(product._id);
                        console.log(` Creando producto para carrito con id: ${productObjectId}`);
                        
                        cartProducts.push({
                            id_producto: productObjectId, // Forzar como ObjectId
                            nombre_producto: product.nombre_producto,
                            cantidad: item.cantidad,
                            precio_unitario: product.precio,
                            subtotal: item.cantidad * product.precio
                        });
                    }
                } catch (err) {
                    console.error(` Error procesando producto ${item.id_producto}:`, err);
                    outOfStockProducts.push('Error al procesar producto');
                }
            }

            if (outOfStockProducts.length > 0) {
                throw new Error(`Productos no disponibles: ${outOfStockProducts.join(', ')}`);
            }

            // 3. Calcular el total
            const totalAmount = cartProducts.reduce((sum, item) => sum + item.subtotal, 0);

            // 4. Crear un payment intent con Stripe (o simulado)
            console.log(` Creando payment intent por $${totalAmount}`);
            const paymentIntent = await this.paymentService.createPaymentIntent(
                totalAmount,
                'mxn',
                { userId: userId.toString() }
            );
            console.log(` Payment intent creado:`, paymentIntent.id);

            // 5. Crear la orden en estado pagado
            console.log(` Creando orden para usuario ${userId}`);
            const timestamp = Date.now().toString();
            const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
            const orderNumber = `ORD-${timestamp}-${random}`;
            
            // Declarar la orden fuera del bloque try para que esté disponible después
            let order;
            
            try {
                // Verificar que todos los productos tengan id_producto válido
                if (cartProducts.length === 0) {
                    throw new Error('No hay productos válidos para crear la orden');
                }
                
                if (cartProducts.some(product => !product.id_producto)) {
                    throw new Error('Todos los productos deben tener un id_producto válido');
                }
                
                // Forzar la validación de productos para asegurar que tienen id_producto válido
                const validatedProducts = cartProducts.map(producto => {
                    // Validar cada producto individualmente
                    if (!producto.id_producto) {
                        console.error(` Producto sin id_producto válido:`, producto);
                        throw new Error(`Producto ${producto.nombre_producto} no tiene id_producto válido`);
                    }
                    
                    // Asegurar que sea un ObjectId
                    let productId = producto.id_producto;
                    if (typeof productId === 'string') {
                        productId = new mongoose.Types.ObjectId(productId);
                    } else if (typeof productId === 'object' && productId._id) {
                        productId = productId._id;
                    }
                    
                    // Retornar producto con id_producto validado
                    return {
                        ...producto,
                        id_producto: productId
                    };
                });
                
                // Verificar que todos los productos tengan id_producto
                const allValid = validatedProducts.every(p => p.id_producto);
                if (!allValid) {
                    throw new Error('Hay productos sin id_producto válido después de la validación');
                }
                
                console.log(` Creando orden con ${validatedProducts.length} productos validados`);
                
                order = new Order({
                    numero_orden: orderNumber,
                    id_usuario: userId,
                    estado: 'pagado',
                    fecha_pago: new Date(),
                    precio_total: totalAmount,
                    productos: validatedProducts,
                    stripe_payment_intent: paymentIntent.id
                });
                
                // Imprimir la estructura de la orden para debug
                console.log(` Estructura de la orden a guardar:`, JSON.stringify({
                    numero_orden: order.numero_orden,
                    id_usuario: order.id_usuario,
                    precio_total: order.precio_total,
                    productos: order.productos.map(p => ({
                        id_producto: p.id_producto,
                        nombre_producto: p.nombre_producto,
                        cantidad: p.cantidad
                    }))
                }));
            
                await order.save();
                console.log(` Orden ${orderNumber} creada exitosamente`);
            } catch (orderError) {
                console.error(` Error al guardar la orden:`, orderError);
                throw new Error(`Error al crear la orden: ${orderError.message}`);
            }

            // 6. Reducir el stock de los productos
            console.log(` Actualizando stock de productos...`);
            for (const item of cartProducts) {
                await Product.findByIdAndUpdate(
                    item.id_producto,
                    { $inc: { cantidad_stock: -item.cantidad } }
                );
            }

            // 7. Crear notificación para el usuario usando el servicio
            if (order && order._id) {
                console.log(` Creando notificación para usuario ${userId}`);
                try {
                    await this.notificationService.createOrderNotification(
                        userId,
                        order._id,
                        'orden_pagada',
                        order.numero_orden,
                        totalAmount
                    );
                    console.log(` Notificación creada exitosamente`);
                } catch (notificationError) {
                    console.error(` Error al crear la notificación:`, notificationError);
                    // Continuar con el proceso aunque falle la notificación
                }
            } else {
                console.error(` No se pudo crear notificación: orden no disponible`);
            }
            
            // 8. Limpiar el carrito
            try {
                await this.cartRepository.clear(userId);
                console.log(` Carrito limpiado exitosamente`);
            } catch (clearError) {
                console.error(` Error al limpiar el carrito:`, clearError);
                // Continuar con el proceso aunque falle la limpieza del carrito
            }

            // 9. Devolver respuesta exitosa
            return {
                order: order ? {
                    id: order._id,
                    numero_orden: order.numero_orden,
                    total: order.precio_total,
                    fecha: order.fecha_pago,
                    estado: order.estado
                } : {
                    mensaje: 'No se pudo crear la orden pero el pago fue procesado'
                },
                payment: {
                    id: paymentIntent.id,
                    status: paymentIntent.status,
                    client_secret: paymentIntent.client_secret
                }
            };
        } catch (error) {
            throw error;
        }
    }
}

module.exports = ProcessCartPayment;
