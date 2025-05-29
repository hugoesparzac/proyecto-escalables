// filepath: c:\Users\hugo\Documents\ShareX\Screenshots\cafeteria-app\frontend\src\app\pages\profile\profile.component.ts
import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { UserService } from '../../core/services/user.service';
import { FavoriteService } from '../../core/services/favorite.service';
import { NotificationService } from '../../core/services/notification.service';
import { CartService } from '../../core/services/cart.service';
import { User, ApiResponse } from '../../core/models/interfaces';

interface OrderStats {
  total: number;
  pending: number;
  completed: number;
}

interface FavoriteStats {
  total: number;
}

interface RecentOrder {
  _id: string;
  numero_pedido: string;
  estado: string;
  total: number;
  createdAt: string;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit, OnDestroy {
  private userService = inject(UserService);
  private favoriteService = inject(FavoriteService);
  private notificationService = inject(NotificationService);
  private cartService = inject(CartService);
  private router = inject(Router);

  private subscriptions: Subscription[] = [];

  user: User | null = null;
  isLoading = true;
  error: string | null = null;
  successMessage: string | null = null;

  // Tab states
  activeTab: 'profile' | 'password' | 'account' = 'profile';

  // Profile form
  profileForm = {
    nombre: '',
    correo: '',
    telefono: ''
  };

  // Password form
  passwordForm = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  // Stats
  orderStats: OrderStats = {
    total: 0,
    pending: 0,
    completed: 0
  };

  favoriteStats: FavoriteStats = {
    total: 0
  };

  recentOrders: RecentOrder[] = [];

  // Password validation
  passwordRequirements = {
    minLength: false,
    hasUpper: false,
    hasLower: false,
    hasNumber: false,
    hasSpecial: false
  };

  // Loading states
  isUpdatingProfile = false;
  isChangingPassword = false;
  isDeletingAccount = false;

  // Modals
  showDeleteModal = false;
  deleteConfirmText = '';

  ngOnInit() {
    this.loadUserProfile();
    this.loadStats();
  }

  ngOnDestroy() {
    // Unsubscribe from all subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  loadUserProfile() {
    try {
      this.isLoading = true;
      this.error = null;

      const sub = this.userService.getProfile().subscribe({
        next: (response) => {
          if (response && response.success) {
            this.user = response.data;
            this.profileForm = {
              nombre: this.user.nombre,
              correo: this.user.correo || '',
              telefono: this.user.telefono || ''
            };
          } else {
            this.error = 'No se pudo cargar la información del usuario';
          }
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading user profile:', error);
          this.error = 'Error al cargar el perfil del usuario';
          this.isLoading = false;
        }
      });

      this.subscriptions.push(sub);
    } catch (error) {
      console.error('Error loading user profile:', error);
      this.error = 'Error al cargar el perfil del usuario';
      this.isLoading = false;
    }
  }

  loadStats() {
    // Load favorites count
    const favSub = this.favoriteService.getFavorites().subscribe({
      next: (response) => {
        if (response && response.success && response.data) {
          this.favoriteStats.total = response.data.total || 0;
        }
      }
    });

    this.subscriptions.push(favSub);

    // Load recent orders - this would be implemented in an OrderService
    // For now, we'll just use empty data
    this.recentOrders = [];
    this.orderStats = {
      total: 0,
      pending: 0,
      completed: 0
    };
  }

  // Tab management
  setActiveTab(tab: 'profile' | 'password' | 'account') {
    this.activeTab = tab;
    this.clearMessages();
  }

  // Form validation
  validatePassword(password: string) {
    this.passwordRequirements = {
      minLength: password.length >= 8,
      hasUpper: /[A-Z]/.test(password),
      hasLower: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
  }

  get isPasswordValid(): boolean {
    return Object.values(this.passwordRequirements).every(req => req);
  }

  get isProfileFormValid(): boolean {
    return !!(this.profileForm.nombre.trim() &&
             this.profileForm.correo.trim() &&
             this.isValidEmail(this.profileForm.correo));
  }

  get isPasswordFormValid(): boolean {
    return !!(this.passwordForm.currentPassword &&
             this.passwordForm.newPassword &&
             this.passwordForm.confirmPassword &&
             this.isPasswordValid &&
             this.passwordForm.newPassword === this.passwordForm.confirmPassword);
  }

  isValidEmail(email: string): boolean {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  }

  // Profile operations
  updateProfile() {
    if (!this.isProfileFormValid || this.isUpdatingProfile || !this.user) return;

    try {
      this.isUpdatingProfile = true;
      this.clearMessages();

      const updateData = {
        nombre: this.profileForm.nombre.trim(),
        correo: this.profileForm.correo.trim(),
        telefono: this.profileForm.telefono.trim() || undefined
      };

      const sub = this.userService.updateProfile(updateData).subscribe({
        next: (response) => {
          if (response && response.success) {
            this.successMessage = 'Perfil actualizado correctamente';
            // Update local user data
            this.user = { ...this.user!, ...updateData };
          } else {
            this.error = response?.message || 'Error al actualizar el perfil';
          }
          this.isUpdatingProfile = false;
        },
        error: (error: any) => {
          console.error('Error updating profile:', error);
          this.error = error.error?.message || 'Error al actualizar el perfil';
          this.isUpdatingProfile = false;
        }
      });

      this.subscriptions.push(sub);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      this.error = error.error?.message || 'Error al actualizar el perfil';
      this.isUpdatingProfile = false;
    }
  }

  changePassword() {
    if (!this.isPasswordFormValid || this.isChangingPassword) return;

    try {
      this.isChangingPassword = true;
      this.clearMessages();

      const sub = this.userService.changePassword(
        this.passwordForm.currentPassword,
        this.passwordForm.newPassword
      ).subscribe({
        next: (response) => {
          if (response && response.success) {
            this.successMessage = 'Contraseña cambiada correctamente';
            this.resetPasswordForm();
          } else {
            this.error = response?.message || 'Error al cambiar la contraseña';
          }
          this.isChangingPassword = false;
        },
        error: (error: any) => {
          console.error('Error changing password:', error);
          this.error = error.error?.message || 'Error al cambiar la contraseña';
          this.isChangingPassword = false;
        }
      });

      this.subscriptions.push(sub);
    } catch (error: any) {
      console.error('Error changing password:', error);
      this.error = error.error?.message || 'Error al cambiar la contraseña';
      this.isChangingPassword = false;
    }
  }

  deleteAccount() {
    if (this.deleteConfirmText !== 'ELIMINAR' || this.isDeletingAccount) return;

    try {
      this.isDeletingAccount = true;
      this.clearMessages();

      const sub = this.userService.deleteAccount().subscribe({
        next: (response) => {
          if (response && response.success) {
            // Account deleted successfully, logout and redirect
            this.logout();
          } else {
            this.error = response?.message || 'Error al eliminar la cuenta';
            this.isDeletingAccount = false;
          }
        },
        error: (error: any) => {
          console.error('Error deleting account:', error);
          this.error = error.error?.message || 'Error al eliminar la cuenta';
          this.isDeletingAccount = false;
        },
        complete: () => {
          this.closeDeleteModal();
        }
      });

      this.subscriptions.push(sub);
    } catch (error: any) {
      console.error('Error deleting account:', error);
      this.error = error.error?.message || 'Error al eliminar la cuenta';
      this.isDeletingAccount = false;
      this.closeDeleteModal();
    }
  }

  logout() {
    try {
      const sub = this.userService.logout().subscribe({
        complete: () => {
          // Clear local storage
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          // Navigate to home page
          this.router.navigate(['/']);
        }
      });

      this.subscriptions.push(sub);
    } catch (error) {
      // Ignore logout errors, just clear local storage and redirect
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      this.router.navigate(['/']);
    }
  }

  // Utility methods
  clearMessages() {
    this.error = null;
    this.successMessage = null;
  }

  resetPasswordForm() {
    this.passwordForm = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    };
    this.passwordRequirements = {
      minLength: false,
      hasUpper: false,
      hasLower: false,
      hasNumber: false,
      hasSpecial: false
    };
  }

  openDeleteModal() {
    this.showDeleteModal = true;
    this.deleteConfirmText = '';
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
    this.deleteConfirmText = '';
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getOrderStatusText(status: string): string {
    switch (status) {
      case 'pendiente': return 'Pendiente';
      case 'preparando': return 'En preparación';
      case 'listo': return 'Listo para recoger';
      case 'entregado': return 'Entregado';
      case 'cancelado': return 'Cancelado';
      default: return 'Desconocido';
    }
  }

  getOrderStatusClass(status: string): string {
    switch (status) {
      case 'pendiente': return 'status-pending';
      case 'preparando': return 'status-preparing';
      case 'listo': return 'status-ready';
      case 'entregado': return 'status-delivered';
      case 'cancelado': return 'status-canceled';
      default: return '';
    }
  }

  getRoleDisplay(role: string): string {
    const roles: { [key: string]: string } = {
      'admin': 'Administrador',
      'cliente': 'Cliente'
    };
    return roles[role] || role;
  }
}
