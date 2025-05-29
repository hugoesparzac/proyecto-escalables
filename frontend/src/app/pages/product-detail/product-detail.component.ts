import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom, Subscription } from 'rxjs';
import { ProductService } from '../../core/services/product.service';
import { CartService, AddToCartRequest } from '../../core/services/cart.service';
import { FavoriteService } from '../../core/services/favorite.service';
import { Product, Category } from '../../core/models/interfaces';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.css'
})
export class ProductDetailComponent implements OnInit, OnDestroy {
  private productService = inject(ProductService);
  private cartService = inject(CartService);
  private favoriteService = inject(FavoriteService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  private subscriptions: Subscription[] = [];

  product: Product | null = null;
  category: Category | null = null;
  relatedProducts: Product[] = [];
  isLoading = true;
  error: string | null = null;
  quantity = 1;
  isAuthenticated = false;
  isFavorite = false;
  addingToCart = false;
  togglingFavorite = false;

  ngOnInit() {
    this.subscriptions.push(
      this.route.params.subscribe(params => {
        const productId = params['id'];
        if (productId) {
          // Scroll to top when loading a new product
          window.scrollTo({ top: 0, behavior: 'smooth' });
          this.loadProduct(productId);
        }
      })
    );
    this.checkAuthentication();
  }

  ngOnDestroy() {
    // Unsubscribe from all subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private checkAuthentication() {
    // Check if token exists in localStorage
    const token = localStorage.getItem('token');
    this.isAuthenticated = !!token;

    // If user is authenticated and we have a product, check if it's in favorites
    if (this.isAuthenticated && this.product) {
      this.checkFavoriteStatus(this.product._id);
    }
  }

  private async loadProduct(productId: string) {
    try {
      this.isLoading = true;
      this.error = null;

      const response = await firstValueFrom(this.productService.getProductById(productId));

      if (response?.success && response.data) {
        // Extract product data from nested structure
        this.product = response.data.product;
        this.category = response.data.category;
        this.relatedProducts = response.data.relatedProducts || [];

        // Limit related products to 4 and exclude current product
        this.relatedProducts = this.relatedProducts
          .filter((p: Product) => p._id !== this.product!._id)
          .slice(0, 4);

        // Check if product is in favorites
        if (this.isAuthenticated && this.product) {
          this.checkFavoriteStatus(this.product._id);
        }
      } else {
        this.error = 'Producto no encontrado';
      }

    } catch (error) {
      console.error('Error loading product:', error);
      this.error = 'Error cargando el producto. Por favor intente nuevamente.';
    } finally {
      this.isLoading = false;
    }
  }

  private checkFavoriteStatus(productId: string) {
    if (!this.isAuthenticated) return;

    this.favoriteService.isProductFavorite(productId).subscribe({
      next: (response) => {
        if (response && response.success) {
          this.isFavorite = response.data.isFavorite;
        }
      },
      error: (error) => {
        console.error('Error checking favorite status:', error);
      }
    });
  }

  toggleFavorite() {
    if (!this.isAuthenticated || !this.product || this.togglingFavorite) return;

    this.togglingFavorite = true;

    if (this.isFavorite) {
      // Remove from favorites
      this.favoriteService.removeFromFavorites(this.product._id).subscribe({
        next: (response) => {
          if (response && response.success) {
            this.isFavorite = false;
          }
          this.togglingFavorite = false;
        },
        error: (error) => {
          console.error('Error removing from favorites:', error);
          this.togglingFavorite = false;
        }
      });
    } else {
      // Add to favorites
      this.favoriteService.addToFavorites(this.product._id).subscribe({
        next: (response) => {
          if (response && response.success) {
            this.isFavorite = true;
          }
          this.togglingFavorite = false;
        },
        error: (error) => {
          console.error('Error adding to favorites:', error);
          this.togglingFavorite = false;
        }
      });
    }
  }

  increaseQuantity() {
    this.quantity++;
  }

  decreaseQuantity() {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  addToCart() {
    if (!this.product || !this.isAuthenticated || this.addingToCart) return;

    this.addingToCart = true;

    const request: AddToCartRequest = {
      id_producto: this.product._id,
      cantidad: this.quantity
    };

    this.cartService.addToCart(request).subscribe({
      next: (response) => {
        if (response && response.success) {
          // Show success message
          alert(`${this.quantity} x ${this.product?.nombre_producto} agregado al carrito`);
        } else {
          // Show error message
          alert('Error al agregar al carrito: ' + (response?.message || 'Error desconocido'));
        }
        this.addingToCart = false;
      },
      error: (error) => {
        console.error('Error adding to cart:', error);
        alert('Error al agregar al carrito');
        this.addingToCart = false;
      }
    });
  }

  goBack() {
    window.history.back();
  }

  goToRelatedProduct(productId: string) {
    // Scroll to top before navigating to new product
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.router.navigate(['/product', productId]);
  }
}
