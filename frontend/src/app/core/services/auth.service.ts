import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { LoginResponse, ApiResponse, User } from '../models/interfaces';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiService = inject(ApiService);

  login(email: string, password: string): Observable<ApiResponse<LoginResponse>> {
    return this.apiService.post<ApiResponse<LoginResponse>>('/auth/login', {
      correo: email,
      contraseña: password
    });
  }  register(name: string, email: string, password: string): Observable<ApiResponse<any>> {
    return this.apiService.post<ApiResponse<any>>('/auth/register', {
      nombre: name,
      correo: email,
      contraseña: password
    });
  }
}
