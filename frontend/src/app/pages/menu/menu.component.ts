import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { ProductService } from '../../core/services/product.service';
import { Product, Category } from '../../core/models/interfaces';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css'
})
export class MenuComponent implements OnInit {
  private productService = inject(ProductService);
  private route = inject(ActivatedRoute);

  products: Product[] = [];
  filteredProducts: Product[] = [];
  categories: Category[] = [];
  isAuthenticated = false;
  selectedCategoryId: string = '';
  searchTerm: string = '';
  isLoading = true;
  error: string | null = null;

  sortBy: 'name' | 'price' | 'newest' = 'name';
  sortOrder: 'asc' | 'desc' = 'asc';
  ngOnInit() {
    this.loadMenuData();
    this.checkAuthentication();    // Check for category query parameter
    this.route.queryParams.subscribe(params => {
      if (params['category']) {
        this.selectedCategoryId = params['category'];
        this.filterProducts();
      }
    });
  }

  private checkAuthentication() {
    // Check if token exists in localStorage
    const token = localStorage.getItem('token');
    this.isAuthenticated = !!token;
  }  public async loadMenuData() {
    try {
      this.isLoading = true;
      this.error = null;

      const [productsResponse, categoriesResponse] = await Promise.all([
        firstValueFrom(this.productService.getProducts()),
        firstValueFrom(this.productService.getCategories())
      ]);      // Carga de categorías primero para asegurar que estén disponibles
      if (categoriesResponse?.success && categoriesResponse.categories) {
        this.categories = categoriesResponse.categories;
      }

      if (productsResponse?.success && productsResponse.data) {
        this.products = productsResponse.data.products;
        this.filteredProducts = [...this.products];
        this.sortProducts();
      }

    } catch (error) {
      console.error('Error loading menu data:', error);
      this.error = 'Error cargando el menú. Por favor intente nuevamente.';
    } finally {
      this.isLoading = false;
    }
  }  filterProducts() {
    let filtered = [...this.products];

    // Filter by category
    if (
      this.selectedCategoryId &&
      this.selectedCategoryId.trim() !== '' &&
      this.selectedCategoryId !== 'undefined'
    ) {
      filtered = filtered.filter(product => {
        const cat = product.id_categoria;
        let catId: string | null = null;
        if (cat && typeof cat === 'object' && '_id' in cat && cat._id) {
          catId = String(cat._id);
        } else if (typeof cat === 'string' || typeof cat === 'number') {
          catId = String(cat);
        }
        // Comparación robusta: ambos como string y sin espacios
        return catId && catId.trim() === this.selectedCategoryId.trim();
      });
    }

    // Filter by search term
    if (this.searchTerm.trim()) {
      const searchLower = this.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(product =>
        product.nombre_producto.toLowerCase().includes(searchLower) ||
        (product.descripcion && product.descripcion.toLowerCase().includes(searchLower))
      );
    }

    this.filteredProducts = filtered;
    this.sortProducts();
  }  onSearchChange() {
    this.filterProducts();
  }

  onSortChange() {
    this.sortProducts();
  }

  private sortProducts() {
    this.filteredProducts.sort((a, b) => {
      let comparison = 0;      switch (this.sortBy) {
        case 'name':
          comparison = a.nombre_producto.localeCompare(b.nombre_producto);
          break;
        case 'price':
          comparison = a.precio - b.precio;
          break;
        case 'newest':
          // Assuming products have a createdAt field or using _id for newest
          comparison = a._id.localeCompare(b._id);
          break;
      }

      return this.sortOrder === 'desc' ? -comparison : comparison;
    });
  }
  addToCart(product: Product) {
    // TODO: Implement add to cart functionality
    console.log('Add to cart:', product);
    alert(`${product.nombre_producto} agregado al carrito`);
  }  getCategoryName(categoryId: string | any): string {
    if (!categoryId || categoryId === '') {
      return 'Sin categoría';
    }

    // Si id_categoria es un objeto poblado, usar directamente
    if (typeof categoryId === 'object' && categoryId.nombre_categoria) {
      return categoryId.nombre_categoria;
    }

    // Si es un string, buscar en la lista de categorías
    if (typeof categoryId === 'string' && this.categories.length) {
      const category = this.categories.find(cat => cat._id === categoryId);
      return category ? category.nombre_categoria : 'Sin categoría';
    }

    return 'Sin categoría';
  }
}
