const Product = require('../../../infrastructure/database/models/Product');
const Category = require('../../../infrastructure/database/models/Category');
const Favorite = require('../../../infrastructure/database/models/Favorite');

class GetProductDetails {
    async execute(productId, userId = null) {
        // Buscar producto con información de categoría
        const product = await Product.findOne({ _id: productId, activo: true })
            .populate('id_categoria', 'nombre_categoria descripcion');

        if (!product) {
            throw new Error('Producto no encontrado o no disponible');
        }

        // Si hay usuario, verificar si está en favoritos
        let isFavorite = false;
        if (userId) {
            const favorite = await Favorite.findOne({
                id_usuario: userId,
                id_producto: productId
            });
            isFavorite = !!favorite;
        }

        // Obtener productos relacionados de la misma categoría
        const relatedProducts = await Product.find({
            id_categoria: product.id_categoria._id,
            _id: { $ne: productId },
            activo: true
        })
        .limit(4)
        .select('nombre_producto precio url_imagen');

        return {
            product: {
                ...product.toJSON(),
                isFavorite,
                isAvailable: product.cantidad_stock > 0
            },
            relatedProducts,
            category: product.id_categoria
        };
    }

    // Obtener productos por categoría con filtros
    async getByCategory(categoryId, filters = {}) {
        const {
            sortBy = 'nombre_producto',
            sortOrder = 'asc',
            minPrice,
            maxPrice,
            inStock = true,
            page = 1,
            limit = 12
        } = filters;

        // Verificar que la categoría existe
        const category = await Category.findOne({ _id: categoryId, activa: true });
        if (!category) {
            throw new Error('Categoría no encontrada');
        }

        // Construir query
        const query = { 
            id_categoria: categoryId, 
            activo: true 
        };

        if (inStock) {
            query.cantidad_stock = { $gt: 0 };
        }

        if (minPrice !== undefined || maxPrice !== undefined) {
            query.precio = {};
            if (minPrice !== undefined) query.precio.$gte = minPrice;
            if (maxPrice !== undefined) query.precio.$lte = maxPrice;
        }

        // Construir sort
        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

        // Ejecutar query con paginación
        const skip = (page - 1) * limit;
        
        const [products, total] = await Promise.all([
            Product.find(query)
                .sort(sort)
                .skip(skip)
                .limit(parseInt(limit)),
            Product.countDocuments(query)
        ]);

        return {
            products,
            category,
            pagination: {
                current: parseInt(page),
                pages: Math.ceil(total / limit),
                total,
                hasNext: page * limit < total,
                hasPrev: page > 1
            }
        };
    }

    // Buscar productos por texto
    async searchProducts(searchTerm, filters = {}) {
        const {
            categoria,
            sortBy = 'relevance',
            sortOrder = 'desc',
            page = 1,
            limit = 12
        } = filters;

        // Construir query de búsqueda
        const query = {
            activo: true,
            $or: [
                { nombre_producto: { $regex: searchTerm, $options: 'i' } },
                { descripcion: { $regex: searchTerm, $options: 'i' } }
            ]
        };

        if (categoria) {
            query.id_categoria = categoria;
        }

        // Construir sort
        let sort = {};
        if (sortBy === 'relevance') {
            // Priorizar coincidencias en el nombre
            sort = { score: { $meta: 'textScore' } };
            query.$text = { $search: searchTerm };
        } else {
            sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
        }

        // Ejecutar query
        const skip = (page - 1) * limit;
        
        const [products, total] = await Promise.all([
            Product.find(query)
                .sort(sort)
                .skip(skip)
                .limit(parseInt(limit))
                .populate('id_categoria', 'nombre_categoria'),
            Product.countDocuments(query)
        ]);

        return {
            products,
            searchTerm,
            pagination: {
                current: parseInt(page),
                pages: Math.ceil(total / limit),
                total,
                hasNext: page * limit < total,
                hasPrev: page > 1
            }
        };
    }
}

module.exports = GetProductDetails;