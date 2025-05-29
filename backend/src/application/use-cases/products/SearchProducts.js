class SearchProducts {
    constructor(productRepository) {
        this.productRepository = productRepository;
    }

    async execute(searchQuery, options = {}) {
        try {
            const {
                page = 1,
                limit = 20,
                sortBy = 'nombre_producto',
                sortOrder = 'asc',
                categoria = null,
                precioMin = null,
                precioMax = null,
                includeInactive = false
            } = options;

            // Validar parámetros de búsqueda
            if (!searchQuery || searchQuery.trim().length === 0) {
                throw new Error('Se requiere un término de búsqueda');
            }

            if (searchQuery.trim().length < 2) {
                throw new Error('El término de búsqueda debe tener al menos 2 caracteres');
            }

            // Construir filtros de búsqueda
            const filters = {
                search: searchQuery.trim(),
                activo: !includeInactive // Solo productos activos por defecto
            };

            // Agregar filtros adicionales
            if (categoria) {
                filters.id_categoria = categoria;
            }

            if (precioMin !== null && precioMin >= 0) {
                filters.precioMin = Number(precioMin);
            }

            if (precioMax !== null && precioMax >= 0) {
                filters.precioMax = Number(precioMax);
            }

            // Validar rango de precios
            if (filters.precioMin && filters.precioMax && filters.precioMin > filters.precioMax) {
                throw new Error('El precio mínimo no puede ser mayor al precio máximo');
            }

            // Opciones de paginación y ordenamiento
            const searchOptions = {
                page: parseInt(page),
                limit: parseInt(limit),
                sortBy,
                sortOrder
            };

            // Realizar búsqueda
            const result = await this.productRepository.search(filters, searchOptions);

            return {
                success: true,
                message: `Se encontraron ${result.pagination.total} productos`,
                query: searchQuery,
                filters: {
                    categoria,
                    precioMin,
                    precioMax,
                    includeInactive
                },
                ...result
            };

        } catch (error) {
            throw error;
        }
    }

    // Método para obtener sugerencias de búsqueda
    async getSuggestions(partialQuery, limit = 5) {
        try {
            if (!partialQuery || partialQuery.trim().length < 2) {
                return {
                    success: true,
                    suggestions: []
                };
            }

            const suggestions = await this.productRepository.getSuggestions(partialQuery.trim(), limit);

            return {
                success: true,
                suggestions
            };

        } catch (error) {
            throw error;
        }
    }

    // Método para búsqueda avanzada con múltiples criterios
    async advancedSearch(criteria) {
        try {
            const {
                nombre,
                categoria,
                precioMin,
                precioMax,
                caloriasMin,
                caloriasMax,
                enStock = true,
                activo = true,
                page = 1,
                limit = 20,
                sortBy = 'nombre_producto',
                sortOrder = 'asc'
            } = criteria;

            const filters = {};

            if (nombre && nombre.trim().length >= 2) {
                filters.search = nombre.trim();
            }

            if (categoria) {
                filters.id_categoria = categoria;
            }

            if (precioMin !== undefined && precioMin >= 0) {
                filters.precioMin = Number(precioMin);
            }

            if (precioMax !== undefined && precioMax >= 0) {
                filters.precioMax = Number(precioMax);
            }

            if (caloriasMin !== undefined && caloriasMin >= 0) {
                filters.caloriasMin = Number(caloriasMin);
            }

            if (caloriasMax !== undefined && caloriasMax >= 0) {
                filters.caloriasMax = Number(caloriasMax);
            }

            if (enStock) {
                filters.enStock = true;
            }

            filters.activo = activo;

            const searchOptions = {
                page: parseInt(page),
                limit: parseInt(limit),
                sortBy,
                sortOrder
            };

            const result = await this.productRepository.findByFilters(filters, searchOptions);

            return {
                success: true,
                message: `Búsqueda avanzada completada: ${result.pagination.total} productos encontrados`,
                criteria,
                ...result
            };

        } catch (error) {
            throw error;
        }
    }
}

module.exports = SearchProducts;
