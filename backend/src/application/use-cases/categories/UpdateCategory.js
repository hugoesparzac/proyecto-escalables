const Category = require('../../../domain/entities/Category');

class UpdateCategory {
    constructor(categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    async execute(categoryId, updateData, adminUserId) {
        try {
            // Validar que el usuario sea admin
            if (!adminUserId) {
                throw new Error('Se requieren permisos de administrador');
            }

            // Validar entrada
            if (!categoryId) {
                throw new Error('ID de categoría es requerido');
            }

            // Obtener categoría existente
            const existingCategoryData = await this.categoryRepository.findById(categoryId);
            if (!existingCategoryData) {
                throw new Error('Categoría no encontrada');
            }

            // Crear entidad con datos existentes
            const category = new Category(existingCategoryData);

            // Validar y preparar datos de actualización
            const allowedFields = ['nombre_categoria', 'descripcion', 'imagen_url', 'activa'];
            const filteredUpdateData = {};

            for (const [key, value] of Object.entries(updateData)) {
                if (allowedFields.includes(key)) {
                    filteredUpdateData[key] = value;
                }
            }

            // Validar nombre si se está actualizando
            if (filteredUpdateData.nombre_categoria !== undefined) {
                if (!filteredUpdateData.nombre_categoria || filteredUpdateData.nombre_categoria.trim().length === 0) {
                    throw new Error('El nombre de la categoría no puede estar vacío');
                }

                filteredUpdateData.nombre_categoria = filteredUpdateData.nombre_categoria.trim();

                // Verificar que no exista otra categoría con el mismo nombre
                if (filteredUpdateData.nombre_categoria !== category.nombre_categoria) {
                    const existingCategory = await this.categoryRepository.findByName(filteredUpdateData.nombre_categoria);
                    if (existingCategory && existingCategory.id_categoria !== categoryId) {
                        throw new Error('Ya existe una categoría con ese nombre');
                    }
                }
            }

            // Actualizar entidad
            category.updateCategory(filteredUpdateData);

            // Validar entidad actualizada
            if (!category.isValid()) {
                throw new Error('Datos de categoría inválidos');
            }

            // Guardar cambios
            const updatedCategory = await this.categoryRepository.update(categoryId, category);

            return {
                success: true,
                message: 'Categoría actualizada exitosamente',
                category: updatedCategory,
                changes: filteredUpdateData
            };

        } catch (error) {
            throw error;
        }
    }

    // Método específico para activar/desactivar categoría
    async toggleStatus(categoryId, adminUserId) {
        try {
            // Validar permisos
            if (!adminUserId) {
                throw new Error('Se requieren permisos de administrador');
            }

            // Obtener categoría
            const existingCategoryData = await this.categoryRepository.findById(categoryId);
            if (!existingCategoryData) {
                throw new Error('Categoría no encontrada');
            }

            const category = new Category(existingCategoryData);
            const newStatus = !category.activa;

            // Cambiar estado
            if (newStatus) {
                category.activate();
            } else {
                category.deactivate();
            }

            // Guardar cambios
            const updatedCategory = await this.categoryRepository.update(categoryId, category);

            return {
                success: true,
                message: `Categoría ${newStatus ? 'activada' : 'desactivada'} exitosamente`,
                category: updatedCategory,
                previous_status: !newStatus,
                new_status: newStatus
            };

        } catch (error) {
            throw error;
        }
    }
}

module.exports = UpdateCategory;
