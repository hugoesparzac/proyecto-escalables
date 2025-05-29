import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ApiResponse } from '../models/interfaces';

export interface Notification {
  _id: string;
  usuario_id: string;
  titulo: string;
  mensaje: string;
  tipo: 'pedido' | 'sistema' | 'promo' | 'info';
  leida: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationResponse {
  notificaciones: Notification[];
  total: number;
  no_leidas: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:3002/api';

  // Reactive notifications state
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  private unreadCountSubject = new BehaviorSubject<number>(0);

  public notifications$ = this.notificationsSubject.asObservable();
  public unreadCount$ = this.unreadCountSubject.asObservable();

  // Get user notifications
  getNotifications(): Observable<ApiResponse<NotificationResponse>> {
    return this.http.get<ApiResponse<NotificationResponse>>(`${this.baseUrl}/notifications`)
      .pipe(
        tap(response => {
          if (response.success && response.data) {
            this.notificationsSubject.next(response.data.notificaciones);
            this.unreadCountSubject.next(response.data.no_leidas);
          }
        })
      );
  }

  // Mark notification as read
  markAsRead(notificationId: string): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.baseUrl}/notifications/${notificationId}/read`, {})
      .pipe(
        tap(() => {
          // Refresh notifications after marking as read
          this.refreshNotifications();
        })
      );
  }

  // Mark all notifications as read
  markAllAsRead(): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.baseUrl}/notifications/read-all`, {})
      .pipe(
        tap(() => {
          // Refresh notifications after marking all as read
          this.refreshNotifications();
        })
      );
  }

  // Delete notification
  deleteNotification(notificationId: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.baseUrl}/notifications/${notificationId}`)
      .pipe(
        tap(() => {
          // Refresh notifications after deleting
          this.refreshNotifications();
        })
      );
  }

  // Refresh notifications data
  private refreshNotifications(): void {
    this.getNotifications().subscribe();
  }
}
