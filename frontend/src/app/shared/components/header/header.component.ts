import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';
import { NotificationService } from '../../../core/services/notification.service';
import { FavoriteService } from '../../../core/services/favorite.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  private cartService = inject(CartService);
  private notificationService = inject(NotificationService);
  private favoriteService = inject(FavoriteService);
  private router = inject(Router);

  private subscriptions: Subscription[] = [];

  cartItemCount = 0;
  notificationCount = 0;
  favoriteCount = 0;
  isMobileMenuOpen = false;
  isAuthenticated = false;
  isAdmin = false;

  constructor() {
    // Escucha cambios de ruta para actualizar autenticación
    this.subscriptions.push(
      this.router.events.subscribe(event => {
        if (event instanceof NavigationEnd) {
          this.checkAuthentication();
        }
      })
    );
  }

  ngOnInit() {
    // Check if user is authenticated
    this.checkAuthentication();

    // Subscribe to cart count changes
    this.subscriptions.push(
      this.cartService.cartCount$.subscribe(count => {
        this.cartItemCount = count;
      })
    );

    // Subscribe to notification count changes
    this.subscriptions.push(
      this.notificationService.unreadCount$.subscribe(count => {
        this.notificationCount = count;
      })
    );

    // Subscribe to favorites count changes
    this.subscriptions.push(
      this.favoriteService.favoritesCount$.subscribe(count => {
        this.favoriteCount = count;
      })
    );

    // Load initial data if authenticated
    if (this.isAuthenticated && !this.isAdmin) {
      this.loadUserData();
    }
  }

  ngOnDestroy() {
    // Unsubscribe from all subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  private loadUserData() {
    // Load cart data
    this.cartService.getCart().subscribe();

    // Load notifications data
    this.notificationService.getNotifications().subscribe();

    // Load favorites data
    this.favoriteService.getFavorites().subscribe();
  }

  private checkAuthentication() {
    // Check if token exists in localStorage
    const token = localStorage.getItem('token');
    const wasAuthenticated = this.isAuthenticated;
    this.isAuthenticated = !!token;

    // Check if user is admin
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const userObj = JSON.parse(user);
        this.isAdmin = userObj.rol === 'admin' && userObj.validada === true;
      } catch {
        this.isAdmin = false;
      }
    } else {
      this.isAdmin = false;
    }

    // If user just logged in, load their data
    if (!wasAuthenticated && this.isAuthenticated && !this.isAdmin) {
      this.loadUserData();
    }
  }
}
