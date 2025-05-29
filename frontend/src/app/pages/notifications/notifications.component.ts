import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { NotificationService } from '../../services/notification.service';
import { Notification } from '../../models/notification.model';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.css'
})
export class NotificationsComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = [];

  notifications: Notification[] = [];
  isLoading = true;
  error: string | null = null;
  isMarkingAllAsRead = false;

  constructor(
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadNotifications();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  loadNotifications() {
    this.isLoading = true;
    this.error = null;

    const sub = this.notificationService.getNotifications().subscribe({
      next: (response: any) => {
        if (response.success && response.data) {
          this.notifications = response.data.notifications || response.data.notificaciones;
          this.isLoading = false;
        } else {
          this.error = response.message || 'Error al cargar notificaciones';
          this.isLoading = false;
        }
      },
      error: (error: any) => {
        console.error('Error loading notifications:', error);
        this.error = 'Error al cargar notificaciones. Por favor intente nuevamente.';
        this.isLoading = false;
      }
    });

    this.subscriptions.push(sub);
  }

  reloadNotifications() {
    this.loadNotifications();
  }

  markAsRead(notification: Notification) {
    // If the notification is already read, do nothing
    if (notification.estado === 'leido' || notification.leida) {
      return;
    }

    const sub = this.notificationService.markAsRead(notification._id).subscribe({
      next: (response: any) => {
        if (response.success) {
          // Update notification status locally
          notification.estado = 'leido';
          notification.leida = true;
          console.log('Notificación marcada como leída:', notification._id);

          // If it's an order notification, we can navigate to the order
          if (notification.id_orden) {
            this.navigateToOrder(notification.id_orden);
          }
        } else {
          alert('Error al marcar como leída: ' + (response.message || 'Error desconocido'));
        }
      },
      error: (error: any) => {
        console.error('Error marking notification as read:', error);
        alert('Error al marcar como leída');
      }
    });

    this.subscriptions.push(sub);
  }

  markAllAsRead() {
    this.isMarkingAllAsRead = true;

    const sub = this.notificationService.markAllAsRead().subscribe({
      next: (response: any) => {
        if (response.success) {
          // Update all notifications locally
          this.notifications.forEach(notification => {
            notification.estado = 'leido';
            notification.leida = true;
          });
          console.log('Todas las notificaciones marcadas como leídas');
        } else {
          alert('Error al marcar todas como leídas: ' + (response.message || 'Error desconocido'));
        }
        this.isMarkingAllAsRead = false;
      },
      error: (error: any) => {
        console.error('Error marking all notifications as read:', error);
        alert('Error al marcar todas como leídas');
        this.isMarkingAllAsRead = false;
      }
    });

    this.subscriptions.push(sub);
  }

  navigateToOrder(orderId: string): void {
    this.router.navigate(['/order', orderId]);
  }

  // Helper methods for template
  notificationIconClass(tipo: string): string {
    switch (tipo) {
      case 'orden_pagada': return 'icon-paid';
      case 'orden_realizando': return 'icon-preparing';
      case 'orden_entregada': return 'icon-ready';
      case 'sistema': return 'icon-system';
      case 'pedido': return 'icon-order';
      case 'promo': return 'icon-promo';
      case 'info': return 'icon-info';
      default: return 'icon-default';
    }
  }

  notificationIconType(tipo: string): string {
    switch (tipo) {
      case 'orden_pagada': return 'fa-credit-card';
      case 'orden_realizando': return 'fa-utensils';
      case 'orden_entregada': return 'fa-check-circle';
      case 'sistema': return 'fa-cog';
      case 'pedido': return 'fa-shopping-bag';
      case 'promo': return 'fa-percent';
      case 'info': return 'fa-info-circle';
      default: return 'fa-bell';
    }
  }

  // Format date to display in a friendly way
  formatDate(dateString: string | Date): string {
    const date = new Date(dateString);
    return date.toLocaleString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
