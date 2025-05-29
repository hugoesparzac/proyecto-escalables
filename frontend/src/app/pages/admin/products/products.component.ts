import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../core/services/product.service';
import { Product, ApiResponse, Category } from '../../../core/models/interfaces';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './products.component.html',
  styleUrl: './products.component.css'
})
export class ProductsComponent implements OnInit {
  private productService = inject(ProductService);

  products: Product[] = [];
  categories: Category[] = [];
  isLoading = true;
  error: string | null = null;
  isCreating = false;

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
    url_imagen: ''
  };

  async ngOnInit() {
    await Promise.all([
      this.loadProducts(),
      this.loadCategories()
    ]);
  }

  async loadProducts() {
    try {
      this.isLoading = true;
      this.error = null;
      const response = await this.productService.getProducts().toPromise();
      if (response && response.success) {
        this.products = response.data.products || [];
      } else {
        this.error = 'Error al cargar los productos';
      }
    } catch (error) {
      this.error = 'Error al cargar los productos';
    } finally {
      this.isLoading = false;
    }
  }

  async loadCategories() {
    try {
      const response = await this.productService.getCategories().toPromise();
      if (response && response.success) {
        // Filtrar solo categorías activas
        this.categories = response.categories?.filter((cat: Category) => cat.activo || cat.activa) || [];
      }
    } catch (error) {
      // No bloquear la carga de productos si falla
      this.categories = [];
    }
  }

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
      id_categoria: typeof product.id_categoria === 'string'
        ? product.id_categoria
        : (product.id_categoria && product.id_categoria._id ? product.id_categoria._id : ''),
      url_imagen: product.url_imagen
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
      url_imagen: ''
    };
  }

  async createProduct() {
    if (!this.productForm.nombre_producto || this.productForm.precio <= 0 || !this.productForm.descripcion || !this.productForm.id_categoria || !this.productForm.url_imagen) return;
    try {
      this.isCreating = true;
      this.error = null;
      const productData = { ...this.productForm };
      const response = await this.productService.createProduct(productData).toPromise();
      if (response && response.success) {
        this.products.push(response.data);
        this.closeModals();
        await this.loadProducts();
      } else {
        this.error = response?.message || 'Error al crear el producto';
      }
    } catch (error: any) {
      this.error = error?.error?.message || 'Error al crear el producto';
    } finally {
      this.isCreating = false;
    }
  }

  async updateProduct() {
    if (!this.selectedProduct) return;
    try {
      this.error = null;
      const updateData = { ...this.productForm };
      const response = await this.productService.updateProduct(this.selectedProduct._id, updateData).toPromise();
      if (response && response.success) {
        const index = this.products.findIndex(p => p._id === this.selectedProduct!._id);
        if (index !== -1) {
          this.products[index] = { ...this.products[index], ...updateData };
        }
        this.closeModals();
        await this.loadProducts();
      } else {
        this.error = response?.message || 'Error al actualizar el producto';
      }
    } catch (error: any) {
      this.error = error?.error?.message || 'Error al actualizar el producto';
    }
  }

  async deleteProduct() {
    if (!this.selectedProduct) return;
    try {
      this.error = null;
      const response = await this.productService.deleteProduct(this.selectedProduct._id).toPromise();
      if (response && response.success) {
        this.products = this.products.filter(p => p._id !== this.selectedProduct!._id);
        this.closeModals();
        await this.loadProducts();
      } else {
        this.error = response?.message || 'Error al eliminar el producto';
      }
    } catch (error: any) {
      this.error = error?.error?.message || 'Error al eliminar el producto';
    }
  }
}
