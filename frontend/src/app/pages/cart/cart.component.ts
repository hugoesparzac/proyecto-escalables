import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService, CartResponse } from '../../core/services/cart.service';
import { ApiResponse } from '../../core/models/interfaces';
import { CreditCardFormComponent } from '../../components/credit-card-form/credit-card-form.component';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, CreditCardFormComponent],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css'
})
export class CartComponent implements OnInit {
  private cartService = inject(CartService);
  private router = inject(Router);

  cart: CartResponse | null = null;
  isLoading = true;
  error: string | null = null;
  successMessage: string | null = null;

  // Loading states for individual operations
  loadingStates: { [key: string]: boolean } = {};

  // Payment processing states
  isProcessingPayment = false;
  paymentSuccess = false;
  paymentError: string | null = null;

  // Credit card form visibility
  showCreditCardForm = false;

  ngOnInit(): void {
    this.loadCart();
  }

  loadCart(): void {
    this.isLoading = true;
    this.error = null;

    this.cartService.getCart().subscribe({
      next: (response: ApiResponse<CartResponse>) => {
        if (response.success) {
          this.cart = response.data;
        } else {
          this.error = response.message || 'Error al cargar el carrito';
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading cart:', error);
        this.error = 'Error al cargar el carrito';
        this.isLoading = false;
      }
    });
  }
  updateQuantity(productId: string, newQuantity: number): void {
    if (newQuantity < 1) {
      this.removeProduct(productId);
      return;
    }

    const item = this.cart?.productos.find(p => p.id_producto === productId);
    if (!item) return;

    this.loadingStates[productId] = true;
    this.clearMessages();

    // Use the product ID as item ID for the API call
    this.cartService.updateCartItem(productId, {
      cantidad: newQuantity
    }).subscribe({
      next: (response) => {
        if (response.success) {
          this.loadCart(); // Reload cart to get updated data
          this.showSuccess('Cantidad actualizada correctamente');
        } else {
          this.showError(response.message || 'Error al actualizar cantidad');
        }
        this.loadingStates[productId] = false;
      },
      error: (error) => {
        console.error('Error updating quantity:', error);
        this.showError('Error al actualizar la cantidad');
        this.loadingStates[productId] = false;
      }
    });
  }

  onQuantityChange(event: Event, productId: string): void {
    const target = event.target as HTMLInputElement;
    const newQuantity = parseInt(target.value, 10);
    if (!isNaN(newQuantity)) {
      this.updateQuantity(productId, newQuantity);
    }
  }

  removeProduct(productId: string): void {
    if (!confirm('¿Estás seguro de que quieres eliminar este producto del carrito?')) {
      return;
    }

    this.loadingStates[productId] = true;
    this.clearMessages();

    this.cartService.removeFromCart(productId).subscribe({
      next: (response) => {
        if (response.success) {
          this.loadCart(); // Reload cart to get updated data
          this.showSuccess('Producto eliminado del carrito');
        } else {
          this.showError(response.message || 'Error al eliminar producto');
        }
        this.loadingStates[productId] = false;
      },
      error: (error) => {
        console.error('Error removing product:', error);
        this.showError('Error al eliminar el producto');
        this.loadingStates[productId] = false;
      }
    });
  }

  clearCart(): void {
    if (!confirm('¿Estás seguro de que quieres vaciar todo el carrito?')) {
      return;
    }

    this.isLoading = true;
    this.clearMessages();

    this.cartService.clearCart().subscribe({
      next: (response) => {
        if (response.success) {
          this.cart = null;
          this.showSuccess('Carrito vaciado correctamente');
        } else {
          this.showError(response.message || 'Error al vaciar carrito');
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error clearing cart:', error);
        this.showError('Error al vaciar el carrito');
        this.isLoading = false;
      }
    });
  }  proceedToPayment(): void {
    if (!this.cart || this.cart.productos.length === 0) {
      this.showError('El carrito está vacío');
      return;
    }
    this.clearMessages();

    // Mostrar el formulario de tarjeta de crédito
    this.showCreditCardForm = true;
  }  // Método para manejar el envío del formulario de tarjeta
  handleCardFormSubmit(cardData: any): void {
    this.showCreditCardForm = false;
    this.isProcessingPayment = true;
    this.paymentError = null;
    this.paymentSuccess = false;

    console.log('💳 Procesando pago con datos de tarjeta');

    // Simulamos un breve procesamiento
    setTimeout(() => {
      console.log('🔄 Enviando solicitud al servidor');
      // Procesar el pago, crear la orden y notificación en el backend
      this.cartService.processPayment().subscribe({
        next: (response) => {
          console.log('✅ Respuesta del servidor:', response);
          if (response.success) {
            this.paymentSuccess = true;
            this.cart = null;
            this.showSuccess(`¡Pago realizado con éxito! Orden #${response.data.order.numero_orden} registrada. Te avisaremos cuando puedas recoger tu comida.`);
          } else {
            this.paymentError = response.message || 'Error al procesar el pago';
            this.showError(this.paymentError);
          }
          this.isProcessingPayment = false;
        },
        error: (error) => {
          console.error('❌ Error en la solicitud:', error);
          this.isProcessingPayment = false;
          if (error.status === 0) {
            this.paymentError = 'Error de conexión con el servidor. Por favor, inténtalo de nuevo.';
          } else {
            this.paymentError = error.error?.message || error.message || 'Error al procesar el pago';
          }
          this.showError(this.paymentError || 'Error al procesar el pago');
        }
      });
    }, 1500);
  }

  // Método para manejar la cancelación del formulario de tarjeta
  handleCardFormCancel(): void {
    this.showCreditCardForm = false;
    this.clearMessages();
  }

  proceedToCheckout(): void {
    if (!this.cart || this.cart.productos.length === 0) {
      this.showError('El carrito está vacío');
      return;
    }

    // Validate cart before proceeding
    this.cartService.validateCart().subscribe({
      next: (response) => {
        if (response.success && response.data.isValid) {
          // Navigate to checkout page
          this.router.navigate(['/checkout']);
        } else {
          this.showError('Hay problemas con algunos productos en tu carrito. Por favor revísalo.');
          this.loadCart(); // Reload to show updated cart state
        }
      },
      error: (error) => {
        console.error('Error validating cart:', error);
        this.showError('Error al validar el carrito');
      }
    });
  }

  continueShopping(): void {
    this.router.navigate(['/products']);
  }

  // Utility methods
  getCartTotal(): number {
    if (!this.cart) return 0;
    return this.cart.summary.totalPrice;
  }

  getCartItemCount(): number {
    if (!this.cart) return 0;
    return this.cart.summary.totalItems;
  }

  isCartEmpty(): boolean {
    return !this.cart || this.cart.productos.length === 0;
  }

  getItemSubtotal(item: any): number {
    return item.cantidad * item.precio_actual;
  }

  isItemLoading(productId: string): boolean {
    return !!this.loadingStates[productId];
  }

  private showSuccess(message: string): void {
    this.successMessage = message;
    this.error = null;
    setTimeout(() => {
      this.successMessage = null;
    }, 3000);
  }

  private showError(message: string): void {
    this.error = message;
    this.successMessage = null;
  }

  private clearMessages(): void {
    this.error = null;
    this.successMessage = null;
  }
  // Format currency
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  }

  // TrackBy function for ngFor performance
  trackByProductId(index: number, item: any): string {
    return item.id_producto;
  }
}
