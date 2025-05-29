import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ProductService } from '../../core/services/product.service';
import { Product, Category } from '../../core/models/interfaces';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  private productService = inject(ProductService);

  featuredProducts: Product[] = [];
  categories: Category[] = [];
  isLoading = true;
  error: string | null = null;
  isAuthenticated = false;
  ngOnInit() {
    this.loadHomeData();
    this.checkAuthentication();
  }

  private checkAuthentication() {
    // Check if token exists in localStorage
    const token = localStorage.getItem('token');
    this.isAuthenticated = !!token;
  }
  async loadHomeData() {
    try {
      this.isLoading = true;
      this.error = null;

      console.log('🔄 Cargando datos del home...');

      // Load featured products and categories in parallel
      const [productsResponse, categoriesResponse] = await Promise.all([
        firstValueFrom(this.productService.getProducts()),
        firstValueFrom(this.productService.getCategories())
      ]);

      console.log('📦 Respuesta de productos:', productsResponse);
      console.log('🏷️ Respuesta de categorías:', categoriesResponse);      if (productsResponse?.success && productsResponse.data) {
        // Get first 6 products as featured
        this.featuredProducts = productsResponse.data.products.slice(0, 6);
        console.log('✅ Productos destacados cargados:', this.featuredProducts.length);
      } else {
        console.warn('⚠️ No se pudieron cargar los productos:', productsResponse);
      }      if (categoriesResponse?.success && categoriesResponse.categories) {
        this.categories = categoriesResponse.categories;
        console.log('✅ Categorías cargadas:', this.categories.length);
      } else {
        console.warn('⚠️ No se pudieron cargar las categorías:', categoriesResponse);
      }

    } catch (error) {
      console.error('❌ Error loading home data:', error);
      this.error = 'Error cargando los datos. Por favor intente nuevamente.';
    } finally {
      this.isLoading = false;
    }
  }addToCart(product: Product) {
    // TODO: Implement add to cart functionality
    console.log('Add to cart:', product);
    // For now, just show an alert
    alert(`${product.nombre_producto} agregado al carrito`);
  }

  getCategoryIcon(categoryName: string): string {
    const icons: { [key: string]: string } = {
      'cafés': 'fa-coffee',
      'coffee': 'fa-coffee',
      'café': 'fa-coffee',
      'bebidas': 'fa-glass-whiskey',
      'drinks': 'fa-glass-whiskey',
      'bebida': 'fa-glass-whiskey',
      'postres': 'fa-cookie-bite',
      'desserts': 'fa-cookie-bite',
      'postre': 'fa-cookie-bite',
      'pasteles': 'fa-birthday-cake',
      'cakes': 'fa-birthday-cake',
      'pastel': 'fa-birthday-cake',
      'sandwiches': 'fa-hamburger',
      'sandwich': 'fa-hamburger',
      'snacks': 'fa-cookie',
      'snack': 'fa-cookie',
      'tés': 'fa-leaf',
      'tea': 'fa-leaf',
      'té': 'fa-leaf'
    };

    const name = categoryName.toLowerCase();
    return icons[name] || 'fa-utensils';
  }
}
