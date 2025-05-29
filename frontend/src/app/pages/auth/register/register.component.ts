import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent implements OnInit {
  private router = inject(Router);
  private authService = inject(AuthService);  registerData = {
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  };

  isLoading = false;
  error: string | null = null;
  showPassword = false;
  showConfirmPassword = false;

  get isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  ngOnInit() {
    if (this.isAuthenticated) {
      this.router.navigate(['/']);
    }
  }
  async onSubmit() {
    if (!this.validateForm()) return;

    try {
      this.isLoading = true;
      this.error = null;      // Llamada real al backend para registro
      this.authService.register(
        this.registerData.name,
        this.registerData.email,
        this.registerData.password
      ).subscribe({
        next: (response) => {
          if (response && response.success) {
            // Mostrar mensaje de éxito y redirigir a login
            alert('Registro exitoso. Revisa tu correo para validar tu cuenta.');
            this.router.navigate(['/login']);
          } else {
            this.error = response?.message || 'Error en el registro.';
          }
          this.isLoading = false;
        },
        error: (error) => {
          this.error = error?.error?.message || 'Error en el registro. Por favor intente nuevamente.';
          this.isLoading = false;
        }
      });
    } catch (error: any) {
      this.error = error?.error?.message || 'Error en el registro. Por favor intente nuevamente.';
      this.isLoading = false;
    }
  }  private validateForm(): boolean {
    // Name validation
    if (!this.registerData.name.trim()) {
      this.error = 'El nombre es requerido';
      return false;
    }

    if (this.registerData.name.trim().length < 2) {
      this.error = 'El nombre debe tener al menos 2 caracteres';
      return false;
    }

    // Email validation
    if (!this.registerData.email.trim()) {
      this.error = 'El email es requerido';
      return false;
    }

    if (!this.isValidEmail(this.registerData.email)) {
      this.error = 'Por favor ingrese un email válido';
      return false;
    }

    // Password validation
    if (!this.registerData.password.trim()) {
      this.error = 'La contraseña es requerida';
      return false;
    }

    if (this.registerData.password.length < 6) {
      this.error = 'La contraseña debe tener al menos 6 caracteres';
      return false;
    }

    // Confirm password validation
    if (this.registerData.password !== this.registerData.confirmPassword) {
      this.error = 'Las contraseñas no coinciden';
      return false;
    }

    return true;
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  clearError() {
    this.error = null;
  }
}
