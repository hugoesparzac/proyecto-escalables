import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { FavoriteService } from '../../core/services/favorite.service';
import { CartService, AddToCartRequest } from '../../core/services/cart.service';
import { Product } from '../../core/models/interfaces';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './favorites.component.html',
  styleUrl: './favorites.component.css'
})
export class FavoritesComponent implements OnInit, OnDestroy {
  private favoriteService = inject(FavoriteService);
  private cartService = inject(CartService);

  private subscriptions: Subscription[] = [];

  favorites: Product[] = [];
  isLoading = true;
  error: string | null = null;

  ngOnInit() {
    this.loadFavorites();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
  // Helper function to extract product from string
  private extractProductFromString(productString: string): Product | null {
    if (!productString || typeof productString !== 'string') {
      return null;
    }

    try {
      // Extract key properties using regex
      const idMatch = productString.match(/_id: new ObjectId\(['"]([^'"]+)['"]\)/);
      const nameMatch = productString.match(/nombre_producto: ['"]([^'"]+)['"]/);
      const priceMatch = productString.match(/precio: (\d+)/);
      const imageMatch = productString.match(/url_imagen: ['"]([^'"]+)['"]/);
      const descMatch = productString.match(/descripcion: ['"]([^'"]+)['"]/);

      if (!idMatch || !nameMatch || !priceMatch) {
        console.log('Could not extract essential product data');
        return null;
      }

      // Create product object with all required fields and sensible defaults
      return {
        _id: idMatch[1],
        id_producto: idMatch[1],
        nombre_producto: nameMatch[1],
        precio: parseInt(priceMatch[1]),
        descripcion: descMatch ? descMatch[1] : undefined,
        url_imagen: imageMatch ? imageMatch[1] : '/assets/images/products/default.jpg',
        imagen_url: imageMatch ? imageMatch[1] : '/assets/images/products/default.jpg',
        calorias: 0,
        id_categoria: '',
        activo: true,
        disponible: true,
        cantidad_stock: 1,
        stock: 1,
        popularidad: 0,
        destacado: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error extracting product data:', error);
      return null;
    }
  }

  loadFavorites() {
    this.isLoading = true;
    this.error = null;

    const sub = this.favoriteService.getFavorites().subscribe({
      next: (response) => {
        console.log('Favorites response:', response);
        if (response.success && response.data) {
          // Extract productos from the response
          let productos = response.data.productos || [];

          // Log the received data for debugging
          console.log('Received productos:', productos);

          // If productos array is empty but we have favorites
          if (productos.length === 0 && response.data.favorites && response.data.favorites.length > 0) {
            console.log('No productos found in response, trying to extract from favorites data');

            // Extract product data directly from the favorites
            productos = response.data.favorites
              .map(fav => {
                // If the favorite already has a producto property, use it
                if (fav.producto) {
                  return fav.producto;
                }

                // Try to extract product from the string representation
                if (fav.favorite && typeof fav.favorite.id_producto === 'string') {
                  return this.extractProductFromString(fav.favorite.id_producto);
                }

                return null;
              })
              .filter(Boolean); // Remove null values

            console.log('Extracted productos from favorites:', productos);
          }

          this.favorites = productos;
          console.log('Final favorites list:', this.favorites);
        } else {
          this.error = response.message || 'Error al cargar favoritos';
          console.error('Error in favorites response:', response);
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading favorites:', error);
        this.error = 'Error al cargar favoritos. Por favor intente nuevamente.';
        this.isLoading = false;
      }
    });

    this.subscriptions.push(sub);
  }

  reloadFavorites() {
    this.loadFavorites();
  }

  removeFromFavorites(productId: string) {
    const sub = this.favoriteService.removeFromFavorites(productId).subscribe({
      next: (response) => {
        if (response.success) {
          // Filter out the removed product locally
          this.favorites = this.favorites.filter(p => p._id !== productId);
        } else {
          // Show error
          alert('Error al eliminar de favoritos: ' + (response.message || 'Error desconocido'));
        }
      },
      error: (error) => {
        console.error('Error removing from favorites:', error);
        alert('Error al eliminar de favoritos');
      }
    });

    this.subscriptions.push(sub);
  }
  addToCart(product: Product) {
    // Ensure product has a valid ID
    const productId = product._id || product.id_producto;
    if (!productId) {
      console.error('No se puede agregar al carrito: ID de producto faltante', product);
      alert('Error: No se puede agregar este producto al carrito');
      return;
    }

    const request: AddToCartRequest = {
      id_producto: productId,
      cantidad: 1
    };

    const sub = this.cartService.addToCart(request).subscribe({
      next: (response) => {
        if (response.success) {
          alert(`${product.nombre_producto} agregado al carrito`);
        } else {
          alert('Error al agregar al carrito: ' + (response.message || 'Error desconocido'));
        }
      },
      error: (error) => {
        console.error('Error adding to cart:', error);
        alert('Error al agregar al carrito');
      }
    });

    this.subscriptions.push(sub);
  }
}
