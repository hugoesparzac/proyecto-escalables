import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { Category, ApiResponse } from '../../../core/models/interfaces';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.css'
})
export class CategoriesComponent implements OnInit {
  private adminService = inject(AdminService);

  categories: Category[] = [];
  isLoading = true;
  error: string | null = null;
  isCreating = false;

  // Modal states
  showCreateModal = false;
  showEditModal = false;
  showDeleteModal = false;
  selectedCategory: Category | null = null;

  // Form data
  categoryForm = {
    nombre_categoria: '',
    descripcion: '',
    imagen_url: '',
    activa: true
  };

  async ngOnInit() {
    await this.loadCategories();
  }

  async loadCategories() {
    try {
      this.isLoading = true;
      this.error = null;

      const response = await this.adminService.getCategories(true).toPromise();
      if (response && response.success) {
        this.categories = response.data.categories;
      } else {
        this.error = 'Error al cargar las categorías';
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      this.error = 'Error al cargar las categorías';
    } finally {
      this.isLoading = false;
    }
  }

  openCreateModal() {
    this.resetForm();
    this.showCreateModal = true;
  }

  openEditModal(category: Category) {
    this.selectedCategory = category;
    this.categoryForm = {
      nombre_categoria: category.nombre_categoria,
      descripcion: category.descripcion || '',
      imagen_url: category.imagen_url || '',
      activa: category.activa !== false
    };
    this.showEditModal = true;
  }

  openDeleteModal(category: Category) {
    this.selectedCategory = category;
    this.showDeleteModal = true;
  }

  closeModals() {
    this.showCreateModal = false;
    this.showEditModal = false;
    this.showDeleteModal = false;
    this.selectedCategory = null;
    this.resetForm();
  }

  resetForm() {
    this.categoryForm = {
      nombre_categoria: '',
      descripcion: '',
      imagen_url: '',
      activa: true
    };
  }

  async createCategory() {
    if (!this.categoryForm.nombre_categoria.trim()) {
      this.error = 'El nombre de la categoría es requerido';
      return;
    }

    try {
      this.isCreating = true;
      this.error = null;

      const response = await this.adminService.createCategory(this.categoryForm).toPromise();
      if (response && response.success) {
        await this.loadCategories();
        this.closeModals();
      } else {
        this.error = response?.message || 'Error al crear la categoría';
      }
    } catch (error: any) {
      console.error('Error creating category:', error);
      this.error = error.error?.message || 'Error al crear la categoría';
    } finally {
      this.isCreating = false;
    }
  }

  async updateCategory() {
    if (!this.selectedCategory || !this.categoryForm.nombre_categoria.trim()) {
      this.error = 'Datos inválidos';
      return;
    }

    try {
      this.isCreating = true;
      this.error = null;

      const response = await this.adminService.updateCategory(this.selectedCategory._id, this.categoryForm).toPromise();
      if (response && response.success) {
        await this.loadCategories();
        this.closeModals();
      } else {
        this.error = response?.message || 'Error al actualizar la categoría';
      }
    } catch (error: any) {
      console.error('Error updating category:', error);
      this.error = error.error?.message || 'Error al actualizar la categoría';
    } finally {
      this.isCreating = false;
    }
  }

  async deleteCategory() {
    if (!this.selectedCategory) return;

    try {
      this.isCreating = true;
      this.error = null;

      const response = await this.adminService.deleteCategory(this.selectedCategory._id).toPromise();
      if (response && response.success) {
        await this.loadCategories();
        this.closeModals();
      } else {
        this.error = response?.message || 'Error al eliminar la categoría';
      }
    } catch (error: any) {
      console.error('Error deleting category:', error);
      this.error = error.error?.message || 'Error al eliminar la categoría';
    } finally {
      this.isCreating = false;
    }
  }

  async toggleCategoryStatus(category: Category) {
    try {
      this.error = null;
      const action = category.activa ? 'deactivateCategory' : 'activateCategory';
      const response = await this.adminService[action](category._id).toPromise();

      if (response && response.success) {
        await this.loadCategories();
      } else {
        this.error = 'Error al cambiar el estado de la categoría';
      }
    } catch (error) {
      console.error('Error toggling category status:', error);
      this.error = 'Error al cambiar el estado de la categoría';
    }
  }
}
