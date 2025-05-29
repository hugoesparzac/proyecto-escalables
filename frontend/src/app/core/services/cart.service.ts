import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ApiResponse, Cart, CartItem } from '../models/interfaces';

export interface CartSummary {
  totalItems: number;
  totalAmount: number;
  isEmpty: boolean;
  itemCount: number;
}

export interface AddToCartRequest {
  id_producto: string;
  cantidad: number;
  notas?: string;
}

export interface UpdateCartItemRequest {
  cantidad: number;
  notas?: string;
}

export interface CartResponse {
  productos: Array<{
    id_producto: string;
    cantidad: number;
    precio_unitario: number;
    producto: {
      _id: string;
      id_producto: string;
      nombre_producto: string;
      precio: number;
      url_imagen: string;
      cantidad_stock: number;
      activo: boolean;
    };
    disponible: boolean;
    precio_actual: number;
    cambio_precio: boolean;
    stock_disponible: number;
    stock_suficiente: boolean;
  }>;
  productos_removidos: any[];
  cambios_realizados: boolean;
  summary: {
    totalItems: number;
    totalPrice: number;
    productCount: number;
    isEmpty: boolean;
  };
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:3002/api';

  // Reactive cart state
  private cartSubject = new BehaviorSubject<CartResponse | null>(null);
  private cartCountSubject = new BehaviorSubject<number>(0);

  public cart$ = this.cartSubject.asObservable();
  public cartCount$ = this.cartCountSubject.asObservable();

  // Get current cart
  getCart(): Observable<ApiResponse<CartResponse>> {
    return this.http.get<ApiResponse<CartResponse>>(`${this.baseUrl}/cart`)
      .pipe(
        tap(response => {
          if (response.success && response.data) {
            this.cartSubject.next(response.data);
            this.cartCountSubject.next(response.data.summary.totalItems);
          }
        })
      );
  }

  // Add product to cart
  addToCart(request: AddToCartRequest): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/cart/items`, request)
      .pipe(
        tap(() => {
          // Refresh cart after adding item
          this.refreshCart();
        })
      );
  }

  // Update cart item quantity
  updateCartItem(itemId: string, request: UpdateCartItemRequest): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.baseUrl}/cart/items/${itemId}`, request)
      .pipe(
        tap(() => {
          // Refresh cart after updating item
          this.refreshCart();
        })
      );
  }

  // Remove item from cart
  removeFromCart(itemId: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.baseUrl}/cart/items/${itemId}`)
      .pipe(
        tap(() => {
          // Refresh cart after removing item
          this.refreshCart();
        })
      );
  }

  // Remove product by product ID
  removeProductFromCart(productId: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.baseUrl}/cart/products/${productId}`)
      .pipe(
        tap(() => {
          // Refresh cart after removing product
          this.refreshCart();
        })
      );
  }

  // Clear entire cart
  clearCart(): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.baseUrl}/cart`)
      .pipe(
        tap(() => {
          // Clear cart state
          this.cartSubject.next(null);
          this.cartCountSubject.next(0);
        })
      );
  }

  // Get cart summary
  getCartSummary(): Observable<ApiResponse<CartSummary>> {
    return this.http.get<ApiResponse<CartSummary>>(`${this.baseUrl}/cart/summary`);
  }

  // Validate cart before checkout
  validateCart(): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/cart/validate`, {});
  }  // Payment processing
  processPayment(): Observable<ApiResponse<any>> {
    console.log('🔄 Enviando solicitud de pago a:', `${this.baseUrl}/payments/process-cart`);
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/payments/process-cart`, {})
      .pipe(
        tap((response) => {
          console.log('✅ Respuesta recibida:', response);
          if (response.success) {
            // Clear cart state on successful payment
            this.cartSubject.next(null);
            this.cartCountSubject.next(0);
          }
        })
      );
  }

  // Create a Stripe payment intent
  createPaymentIntent(amount: number): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/payments/create-intent`, { amount });
  }

  // Confirm a payment
  confirmPayment(paymentIntentId: string): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/payments/confirm/${paymentIntentId}`, {});
  }

  // Helper method to refresh cart
  private refreshCart(): void {
    this.getCart().subscribe();
  }

  // Initialize cart (call on app startup)
  initializeCart(): void {
    this.getCart().subscribe({
      error: (error) => {
        console.warn('Failed to initialize cart:', error);
        // Initialize with empty cart state
        this.cartSubject.next(null);
        this.cartCountSubject.next(0);
      }
    });
  }

  // Get current cart value (synchronous)
  getCurrentCart(): CartResponse | null {
    return this.cartSubject.value;
  }

  // Get current cart count (synchronous)
  getCurrentCartCount(): number {
    return this.cartCountSubject.value;
  }

  // Calculate cart total
  calculateCartTotal(cart: CartResponse): number {
    return cart.productos.reduce((total, item) => {
      return total + (item.cantidad * item.precio_actual);
    }, 0);
  }

  // Check if product is in cart
  isProductInCart(productId: string): boolean {
    const cart = this.getCurrentCart();
    if (!cart) return false;

    return cart.productos.some(item => item.id_producto === productId);
  }

  // Get product quantity in cart
  getProductQuantityInCart(productId: string): number {
    const cart = this.getCurrentCart();
    if (!cart) return 0;

    const item = cart.productos.find(item => item.id_producto === productId);
    return item ? item.cantidad : 0;
  }
}
