const Category = require('../../../domain/entities/Category');

class CreateCategory {
    constructor(categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    async execute(categoryData, adminUserId) {
        try {
            // Validar que el usuario sea admin (esto debería verificarse en el middleware)
            if (!adminUserId) {
                throw new Error('Se requieren permisos de administrador');
            }

            // Validar datos requeridos
            const { nombre_categoria, descripcion, imagen_url } = categoryData;

            if (!nombre_categoria || nombre_categoria.trim().length === 0) {
                throw new Error('El nombre de la categoría es requerido');
            }

            // Crear entidad Category
            const category = new Category({
                nombre_categoria: nombre_categoria.trim(),
                descripcion: descripcion?.trim() || '',
                imagen_url: imagen_url || null,
                activa: true
            });

            // Validar la entidad
            if (!category.isValid()) {
                throw new Error('Datos de categoría inválidos');
            }

            // Verificar que no exista una categoría con el mismo nombre
            const existingCategory = await this.categoryRepository.findByName(category.nombre_categoria);
            if (existingCategory) {
                throw new Error('Ya existe una categoría con ese nombre');
            }

            // Guardar categoría
            const savedCategory = await this.categoryRepository.create(category);

            return {
                success: true,
                message: 'Categoría creada exitosamente',
                category: savedCategory
            };

        } catch (error) {
            throw error;
        }
    }
}

module.exports = CreateCategory;
