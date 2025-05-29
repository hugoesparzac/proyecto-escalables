const Product = require('../../../infrastructure/database/models/Product');

class GetProducts {
  async execute(filters = {}) {
    const {
      categoria,
      search,
      minPrice,
      maxPrice,
      sortBy = 'nombre_producto',
      sortOrder = 'asc',
      page = 1,
      limit = 12
    } = filters;

    // Construir query
    const query = { activo: true };

    if (categoria) {
      query.id_categoria = categoria;
    }

    if (search) {
      query.$text = { $search: search };
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

module.exports = GetProducts;