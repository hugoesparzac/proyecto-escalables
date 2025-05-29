import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  private router = inject(Router);
  private authService = inject(AuthService);

  loginData = {
    email: '',
    password: ''
  };

  isLoading = false;
  error: string | null = null;
  showPassword = false;

  ngOnInit() {
    if (this.isAuthenticated) {
      this.router.navigate(['/']);
    }
  }

  async onSubmit() {
    if (!this.validateForm()) return;

    try {
      this.isLoading = true;
      this.error = null;

      // Llamada real al backend para login
      const response = await this.authService.login(this.loginData.email, this.loginData.password).toPromise();
      if (response && response.success && response.data && response.data.token) {
        localStorage.setItem('token', response.data.token);
        // Guardar el usuario en localStorage para el guard
        localStorage.setItem('user', JSON.stringify(response.data.user));
        // Redirección según rol
        const user = response.data.user;
        if (user && user.rol === 'admin') {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/']);
        }
      } else {
        this.error = response?.message || 'Error en el inicio de sesión.';
      }
    } catch (error: any) {
      this.error = error?.error?.message || 'Error en el inicio de sesión. Verifique sus credenciales.';
    } finally {
      this.isLoading = false;
    }
  }

  private validateForm(): boolean {
    if (!this.loginData.email.trim()) {
      this.error = 'El email es requerido';
      return false;
    }

    if (!this.isValidEmail(this.loginData.email)) {
      this.error = 'Por favor ingrese un email válido';
      return false;
    }

    if (!this.loginData.password.trim()) {
      this.error = 'La contraseña es requerida';
      return false;
    }

    if (this.loginData.password.length < 6) {
      this.error = 'La contraseña debe tener al menos 6 caracteres';
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

  clearError() {
    this.error = null;
  }

  get isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }
}
