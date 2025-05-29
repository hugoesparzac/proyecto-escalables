import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = `${environment.apiUrl}/notifications`;
  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSubject.asObservable();

  constructor(private http: HttpClient) {
    this.refreshUnreadCount();
  }

  // Obtener todas las notificaciones del usuario
  getNotifications(limit = 20, skip = 0): Observable<any> {
    return this.http.get(`${this.apiUrl}?limit=${limit}&skip=${skip}`);
  }

  // Obtener cantidad de notificaciones no leídas
  getUnreadCount(): Observable<any> {
    return this.http.get<{ count: number }>(`${this.apiUrl}/unread-count`)
      .pipe(
        tap(response => {
          this.unreadCountSubject.next(response.count);
        })
      );
  }

  // Marcar notificación como leída
  markAsRead(notificationId: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${notificationId}/read`, {})
      .pipe(
        tap(() => {
          // Actualizar contador después de marcar como leída
          this.refreshUnreadCount();
        })
      );
  }

  // Marcar todas las notificaciones como leídas
  markAllAsRead(): Observable<any> {
    return this.http.patch(`${this.apiUrl}/mark-all-read`, {})
      .pipe(
        tap(() => {
          this.unreadCountSubject.next(0);
        })
      );
  }

  // Actualizar contador de notificaciones no leídas
  refreshUnreadCount(): void {
    this.getUnreadCount().subscribe({
      next: (data) => {
        // No es necesario hacer nada aquí ya que tap ya actualiza el subject
      },
      error: (err) => console.error('Error al obtener cantidad de notificaciones:', err)
    });
  }
}
