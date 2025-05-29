import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { User, ApiResponse } from '../models/interfaces';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiService = inject(ApiService);

  // Perfil del usuario
  getProfile(): Observable<ApiResponse<User>> {
    return this.apiService.get('/auth/profile');
  }

  updateProfile(profileData: Partial<User>): Observable<ApiResponse<User>> {
    return this.apiService.put('/auth/profile', profileData);
  }

  changePassword(currentPassword: string, newPassword: string): Observable<ApiResponse<any>> {
    return this.apiService.post('/auth/change-password', {
      current_password: currentPassword,
      new_password: newPassword
    });
  }

  updateProfilePhoto(photoData: FormData): Observable<ApiResponse<{ url_imagen: string }>> {
    return this.apiService.post('/auth/profile/photo', photoData);
  }

  deleteAccount(): Observable<ApiResponse<any>> {
    return this.apiService.delete('/auth/profile');
  }

  logout(): Observable<ApiResponse<any>> {
    return this.apiService.post('/auth/logout', {});
  }
}
