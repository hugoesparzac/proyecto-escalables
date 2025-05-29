import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-validate-email',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="validate-email-container">
      <div *ngIf="loading" class="loading-message">
        <i class="fas fa-spinner fa-spin"></i> Validando correo electrónico...
      </div>
      <div *ngIf="success" class="success-message">
        <i class="fas fa-check-circle"></i> {{ success }}
        <br>
        <a routerLink="/login" class="btn btn-primary">Iniciar sesión</a>
      </div>
      <div *ngIf="error" class="error-message">
        <i class="fas fa-exclamation-circle"></i> {{ error }}
        <br>
        <a routerLink="/login" class="btn btn-outline">Ir a inicio de sesión</a>
      </div>
    </div>
  `,
  styles: [`
    .validate-email-container { max-width: 400px; margin: 80px auto; padding: 2rem; background: #fff; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.08); text-align: center; }
    .success-message { color: #28a745; margin-top: 1rem; }
    .error-message { color: #dc3545; margin-top: 1rem; }
    .loading-message { color: #8B4513; margin-top: 1rem; }
    .btn { margin-top: 1.5rem; }
  `]
})
export class ValidateEmailComponent implements OnInit {
  loading = true;
  success: string | null = null;
  error: string | null = null;

  constructor(private route: ActivatedRoute, private http: HttpClient, private router: Router) {}  ngOnInit() {
    // Intentamos obtener el token de los parámetros o del query
    const tokenParam = this.route.snapshot.paramMap.get('token');
    const tokenQuery = this.route.snapshot.queryParamMap.get('token');
    const token = tokenParam || tokenQuery;

    if (!token) {
      this.error = 'Token de validación no encontrado.';
      this.loading = false;
      return;
    }    console.log('Intentando validar token:', token);

    // Usamos la URL completa desde el environment
    this.http.get<any>(`${environment.apiUrl}/auth/validate-email?token=${token}`).subscribe({
      next: (res) => {
        console.log('Respuesta de validación:', res);
        this.success = res?.message || 'Correo validado correctamente.';
        this.loading = false;
      },
      error: (err) => {
        console.error('Error en validación:', err);
        this.error = err?.error?.message || 'No se pudo validar el correo.';
        this.loading = false;
      }
    });
  }
}
