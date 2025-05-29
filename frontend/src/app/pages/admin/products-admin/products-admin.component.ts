import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { Product, Category, ApiResponse } from '../../../core/models/interfaces';

@Component({
  selector: 'app-products-admin',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './products-admin.component.html',
  styleUrl: './products-admin.component.css'
})
export class ProductsAdminComponent implements OnInit {
  private adminService = inject(AdminService);

  products: Product[] = [];
  categories: Category[] = [];
  isLoading = true;
  error: string | null = null;
  isCreating = false;
  isSubmitting = false;

  // Modal states
  showCreateModal = false;
  showEditModal = false;
  showDeleteModal = false;
  selectedProduct: Product | null = null;

  // Form data
  productForm = {
    nombre_producto: '',
    descripcion: '',
    precio: 0,
    calorias: 0,
    cantidad_stock: 0,
    id_categoria: '',
    url_imagen: '',
    activo: true
  };

  async ngOnInit() {
    await this.loadProducts();
    await this.loadCategories();
  }

  async loadProducts() {
    try {
      this.isLoading = true;
      this.error = null;
      const response = await this.adminService.getProducts().toPromise();
      if (response && response.success) {
        this.products = response.data.products || [];
      } else {
        this.error = 'Error al cargar los productos';
      }
    } catch (error) {
      console.error('Error loading products:', error);
      this.error = 'Error al cargar los productos';
    } finally {
      this.isLoading = false;
    }
  }

  async loadCategories() {
    try {
      const response = await this.adminService.getCategories().toPromise();
      if (response && response.success) {
        this.categories = response.data.categories || [];
      } else {
        console.error('Error al cargar categorías');
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  }

  // Modal methods
  openCreateModal() {
    this.resetForm();
    this.showCreateModal = true;
  }

  openEditModal(product: Product) {
    this.selectedProduct = product;
    this.productForm = {
      nombre_producto: product.nombre_producto,
      descripcion: product.descripcion || '',
      precio: product.precio,
      calorias: product.calorias,
      cantidad_stock: product.cantidad_stock,
      id_categoria: typeof product.id_categoria === 'string' ? product.id_categoria : (product.id_categoria && product.id_categoria._id ? product.id_categoria._id : ''),
      url_imagen: product.url_imagen,
      activo: product.activo
    };
    this.showEditModal = true;
  }

  openDeleteModal(product: Product) {
    this.selectedProduct = product;
    this.showDeleteModal = true;
  }

  closeModals() {
    this.showCreateModal = false;
    this.showEditModal = false;
    this.showDeleteModal = false;
    this.selectedProduct = null;
    this.resetForm();
  }

  resetForm() {
    this.productForm = {
      nombre_producto: '',
      descripcion: '',
      precio: 0,
      calorias: 0,
      cantidad_stock: 0,
      id_categoria: '',
      url_imagen: '',
      activo: true
    };
  }

  // CRUD operations
  async createProduct() {
    if (this.isCreating || this.isSubmitting) return;
    this.isSubmitting = true;
    try {
      this.isCreating = true;
      this.error = null;

      const productData = {
        nombre_producto: this.productForm.nombre_producto.trim(),
        descripcion: this.productForm.descripcion.trim(),
        precio: this.productForm.precio,
        calorias: this.productForm.calorias,
        cantidad_stock: this.productForm.cantidad_stock,
        id_categoria: this.productForm.id_categoria,
        url_imagen: this.productForm.url_imagen.trim(),
        activo: this.productForm.activo
      };

      const response = await this.adminService.createProduct(productData).toPromise();
      if (response && response.success) {
        this.closeModals();
        await this.loadProducts(); // Refresh list
      } else {
        this.error = response?.message || 'Error al crear el producto';
      }
    } catch (error: any) {
      console.error('Error creating product:', error);
      this.error = error.error?.message || 'Error al crear el producto';
    } finally {
      this.isCreating = false;
      this.isSubmitting = false;
    }
  }

  async updateProduct() {
    if (!this.selectedProduct || this.isSubmitting) return;
    this.isSubmitting = true;
    try {
      this.error = null;

      const productData = {
        nombre_producto: this.productForm.nombre_producto.trim(),
        descripcion: this.productForm.descripcion.trim(),
        precio: this.productForm.precio,
        calorias: this.productForm.calorias,
        cantidad_stock: this.productForm.cantidad_stock,
        id_categoria: this.productForm.id_categoria,
        url_imagen: this.productForm.url_imagen.trim(),
        activo: this.productForm.activo
      };

      const response = await this.adminService.updateProduct(
        this.selectedProduct._id,
        productData
      ).toPromise();

      if (response && response.success) {
        this.closeModals();
        await this.loadProducts(); // Refresh list
      } else {
        this.error = response?.message || 'Error al actualizar el producto';
      }
    } catch (error: any) {
      console.error('Error updating product:', error);
      this.error = error.error?.message || 'Error al actualizar el producto';
    } finally {
      this.isSubmitting = false;
    }
  }

  async deleteProduct() {
    if (!this.selectedProduct || this.isSubmitting) return;
    this.isSubmitting = true;
    try {
      this.error = null;

      const response = await this.adminService.deleteProduct(this.selectedProduct._id).toPromise();

      if (response && response.success) {
        this.closeModals();
        await this.loadProducts();
      } else {
        this.error = response?.message || 'Error al eliminar el producto';
      }
    } catch (error: any) {
      console.error('Error deleting product:', error);
      this.error = error.error?.message || 'Error al eliminar el producto';
    } finally {
      this.isSubmitting = false;
    }
  }

  // Utility methods
  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  }

  formatPrice(price: number): string {
    return price.toLocaleString('es-MX', {
      style: 'currency',
      currency: 'MXN'
    });
  }

  getCategoryName(categoryId: string | Category): string {
    if (typeof categoryId === 'string') {
      const category = this.categories.find(c => c._id === categoryId);
      return category ? category.nombre_categoria : 'Categoría no encontrada';
    } else {
      return categoryId.nombre_categoria;
    }
  }

  get isFormValid(): boolean {
    const f = this.productForm;
    return !!(
      f.nombre_producto &&
      f.descripcion &&
      f.precio >= 0 &&
      f.calorias >= 0 &&
      f.cantidad_stock >= 0 &&
      f.id_categoria &&
      f.url_imagen
    );
  }
}
