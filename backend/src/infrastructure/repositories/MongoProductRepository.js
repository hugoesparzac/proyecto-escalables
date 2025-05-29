const ProductRepository = require('../../domain/repositories/ProductRepository');
const Product = require('../database/models/Product');
const ProductEntity = require('../../domain/entities/Product');

class MongoProductRepository extends ProductRepository {
    async create(productEntity) {
        try {
            const productData = {
                nombre_producto: productEntity.nombre_producto,
                precio: productEntity.precio,
                descripcion: productEntity.descripcion,
                calorias: productEntity.calorias,
                cantidad_stock: productEntity.cantidad_stock,
                id_categoria: productEntity.id_categoria,
                url_imagen: productEntity.url_imagen,
                activo: productEntity.activo
            };

            const product = new Product(productData);
            const savedProduct = await product.save();
            
            return this.toEntity(savedProduct);
        } catch (error) {
            throw error;
        }
    }

    async findById(id) {
        try {
            // Check if id is a string representation of a product object
            let productId = id;
            let productFromString = null;
            
            // If it's a string that looks like a stringified product object
            if (typeof productId === 'string' && productId.includes('_id')) {
                console.log(`Product ID appears to be a stringified product object: ${productId.substring(0, 50)}...`);
                
                try {
                    // Try to extract the product object directly from the string
                    // Extract _id for lookup
                    const idMatch = productId.match(/ObjectId\(['"]([^'"]+)['"]\)/);
                    if (idMatch && idMatch[1]) {
                        const extractedId = idMatch[1];
                        console.log(`Extracted ID from string: ${extractedId}`);
                        productId = extractedId;
                        
                        // Also try to extract product data directly from the string
                        // This is a fallback in case we can't find the product in the database
                        const nameMatch = productId.match(/nombre_producto: '([^']+)'/);
                        const priceMatch = productId.match(/precio: (\d+)/);
                        const urlMatch = productId.match(/url_imagen: '([^']+)'/);
                        
                        if (nameMatch && priceMatch) {
                            productFromString = {
                                _id: extractedId,
                                nombre_producto: nameMatch[1],
                                precio: parseInt(priceMatch[1]),
                                url_imagen: urlMatch ? urlMatch[1] : ''
                            };
                            console.log(`Extracted product data from string:`, productFromString);
                        }
                    }
                } catch (parseError) {
                    console.error(`Error parsing product string:`, parseError);
                }
            }
            
            // Try to find the product in the database
            const product = await Product.findById(productId);
            
            if (product) {
                console.log(`Product found in database: ${product.nombre_producto}`);
                return this.toEntity(product);
            } else if (productFromString) {
                // If we couldn't find it in the database but extracted data from the string
                console.log(`Using extracted product data as fallback`);
                return productFromString;
            }
            
            return null;
        } catch (error) {
            console.error(`Error in findById(${id}):`, error);
            
            // If there was an error but we have extracted product data, return it
            if (typeof id === 'string' && id.includes('nombre_producto')) {
                try {
                    const nameMatch = id.match(/nombre_producto: '([^']+)'/);
                    const priceMatch = id.match(/precio: (\d+)/);
                    const idMatch = id.match(/ObjectId\(['"]([^'"]+)['"]\)/);
                    const urlMatch = id.match(/url_imagen: '([^']+)'/);
                    
                    if (nameMatch && priceMatch && idMatch) {
                        const extractedProduct = {
                            _id: idMatch[1],
                            nombre_producto: nameMatch[1],
                            precio: parseInt(priceMatch[1]),
                            url_imagen: urlMatch ? urlMatch[1] : ''
                        };
                        console.log(`Extracted product as error fallback:`, extractedProduct);
                        return extractedProduct;
                    }
                } catch (parseError) {
                    console.error(`Error in fallback extraction:`, parseError);
                }
            }
            
            throw error;
        }
    }

    async findBySlug(slug) {
        try {
            // Asumiendo que el slug se genera a partir del nombre
            const product = await Product.findOne({ 
                nombre_producto: { $regex: slug, $options: 'i' }
            });
            return product ? this.toEntity(product) : null;
        } catch (error) {
            throw error;
        }
    }

    async findByCategory(categoryId, options = {}) {
        try {
            const {
                page = 1,
                limit = 20,
                sortBy = 'nombre_producto',
                sortOrder = 'asc'
            } = options;

            const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

            const products = await Product.find({ 
                id_categoria: categoryId,
                activo: true 
            })
                .sort(sort)
                .skip((page - 1) * limit)
                .limit(limit);

            return products.map(product => this.toEntity(product));
        } catch (error) {
            throw error;
        }
    }

    async findWithFilters(filters = {}, options = {}) {
        try {
            const {
                page = 1,
                limit = 20,
                sortBy = 'nombre_producto',
                sortOrder = 'asc'
            } = options;

            const query = this.buildQuery(filters);
            const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

            const total = await Product.countDocuments(query);
            const products = await Product.find(query)
                .sort(sort)
                .skip((page - 1) * limit)
                .limit(limit);

            const totalPages = Math.ceil(total / limit);

            return {
                products: products.map(product => this.toEntity(product)),
                total,
                page: parseInt(page),
                totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1,
                limit: parseInt(limit)
            };
        } catch (error) {
            throw error;
        }
    }

    async searchProducts(query, options = {}) {
        try {
            const {
                page = 1,
                limit = 20,
                sortBy = 'nombre_producto',
                sortOrder = 'asc'
            } = options;

            const searchQuery = {
                $and: [
                    { activo: true },
                    {
                        $or: [
                            { nombre_producto: { $regex: query, $options: 'i' } },
                            { descripcion: { $regex: query, $options: 'i' } }
                        ]
                    }
                ]
            };

            const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

            const total = await Product.countDocuments(searchQuery);
            const products = await Product.find(searchQuery)
                .sort(sort)
                .skip((page - 1) * limit)
                .limit(limit);

            const totalPages = Math.ceil(total / limit);

            return {
                products: products.map(product => this.toEntity(product)),
                total,
                page: parseInt(page),
                totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1,
                limit: parseInt(limit)
            };
        } catch (error) {
            throw error;
        }
    }

    async getFeatured(limit = 10) {
        try {
            // Obtener productos con mayor stock o más vendidos (simulado con random por ahora)
            const products = await Product.aggregate([
                { $match: { activo: true, cantidad_stock: { $gt: 0 } } },
                { $sample: { size: limit } }
            ]);

            return products.map(product => this.toEntity(product));
        } catch (error) {
            throw error;
        }
    }

    async getOnSale(options = {}) {
        try {
            const {
                page = 1,
                limit = 20
            } = options;

            // Por ahora retornamos productos activos, en el futuro se podría agregar un campo 'en_oferta'
            const products = await Product.find({ 
                activo: true,
                cantidad_stock: { $gt: 0 }
            })
                .sort({ precio: 1 })
                .skip((page - 1) * limit)
                .limit(limit);

            return products.map(product => this.toEntity(product));
        } catch (error) {
            throw error;
        }
    }

    async getLowStock(threshold = 10) {
        try {
            const products = await Product.find({
                activo: true,
                cantidad_stock: { $lte: threshold }
            }).sort({ cantidad_stock: 1 });

            return products.map(product => this.toEntity(product));
        } catch (error) {
            throw error;
        }
    }

    async update(id, updateData) {
        try {
            const product = await Product.findByIdAndUpdate(
                id,
                { ...updateData, updatedAt: new Date() },
                { new: true, runValidators: true }
            );

            return product ? this.toEntity(product) : null;
        } catch (error) {
            throw error;
        }
    }

    async delete(id) {
        try {
            const result = await Product.findByIdAndDelete(id);
            return !!result;
        } catch (error) {
            throw error;
        }
    }

    async updateStock(id, quantity) {
        try {
            const product = await Product.findByIdAndUpdate(
                id,
                { $inc: { cantidad_stock: quantity }, updatedAt: new Date() },
                { new: true }
            );

            return product ? this.toEntity(product) : null;
        } catch (error) {
            throw error;
        }
    }

    async bulkUpdateStock(updates) {
        try {
            const bulkOps = updates.map(update => ({
                updateOne: {
                    filter: { _id: update.id },
                    update: { 
                        $inc: { cantidad_stock: update.quantity },
                        updatedAt: new Date()
                    }
                }
            }));

            const result = await Product.bulkWrite(bulkOps);
            
            // Obtener los productos actualizados
            const productIds = updates.map(update => update.id);
            const products = await Product.find({ _id: { $in: productIds } });
            
            return products.map(product => this.toEntity(product));
        } catch (error) {
            throw error;
        }
    }

    async checkAvailability(productIds) {
        try {
            const products = await Product.find({
                _id: { $in: productIds },
                activo: true,
                cantidad_stock: { $gt: 0 }
            });

            return products.map(product => this.toEntity(product));
        } catch (error) {
            throw error;
        }
    }

    async findByIds(ids) {
        try {
            const products = await Product.find({
                _id: { $in: ids }
            });

            return products.map(product => this.toEntity(product));
        } catch (error) {
            throw error;
        }
    }

    async countByCategory(categoryId) {
        try {
            return await Product.countDocuments({
                id_categoria: categoryId,
                activo: true
            });
        } catch (error) {
            throw error;
        }
    }

    async findByName(nombre_producto) {
        try {
            const product = await Product.findOne({ nombre_producto: { $regex: `^${nombre_producto}$`, $options: 'i' } });
            return product ? this.toEntity(product) : null;
        } catch (error) {
            throw error;
        }
    }

    // Métodos auxiliares
    buildQuery(filters) {
        const query = {};

        if (filters.activo !== undefined) {
            query.activo = filters.activo;
        }

        if (filters.id_categoria) {
            query.id_categoria = filters.id_categoria;
        }

        if (filters.nombre_producto) {
            query.nombre_producto = { $regex: filters.nombre_producto, $options: 'i' };
        }

        if (filters.precioMin !== undefined || filters.precioMax !== undefined) {
            query.precio = {};
            if (filters.precioMin !== undefined) {
                query.precio.$gte = filters.precioMin;
            }
            if (filters.precioMax !== undefined) {
                query.precio.$lte = filters.precioMax;
            }
        }

        if (filters.stockMin !== undefined) {
            query.cantidad_stock = { $gte: filters.stockMin };
        }

        if (filters.conStock) {
            query.cantidad_stock = { $gt: 0 };
        }

        return query;
    }    toEntity(mongoProduct) {
        return new ProductEntity({
            id_producto: mongoProduct._id.toString(),
            nombre_producto: mongoProduct.nombre_producto,
            precio: mongoProduct.precio,
            descripcion: mongoProduct.descripcion,
            calorias: mongoProduct.calorias,
            cantidad_stock: mongoProduct.cantidad_stock,
            id_categoria: mongoProduct.id_categoria ? 
                (mongoProduct.id_categoria._id ? mongoProduct.id_categoria._id.toString() : mongoProduct.id_categoria.toString()) 
                : null,
            url_imagen: mongoProduct.url_imagen,
            activo: mongoProduct.activo,
            createdAt: mongoProduct.createdAt,
            updatedAt: mongoProduct.updatedAt
        });
    }
}

module.exports = MongoProductRepository;