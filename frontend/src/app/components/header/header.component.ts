import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { CartService } from 'src/app/services/cart.service';
import { NotificationService } from 'src/app/services/notification.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  isLoggedIn = false;
  cartItemCount = 0;
  userRole: string | null = null;
  unreadNotificationCount = 0;

  constructor(
    private authService: AuthService,
    private router: Router,
    private cartService: CartService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.authService.isAuthenticated$.subscribe(isAuth => {
      this.isLoggedIn = isAuth;

      if (isAuth) {
        this.userRole = this.authService.getUserRole();
        this.getCartCount();
        this.getNotificationCount();
      } else {
        this.userRole = null;
        this.cartItemCount = 0;
        this.unreadNotificationCount = 0;
      }
    });

    this.cartService.cartItemCount$.subscribe(count => {
      this.cartItemCount = count;
    });

    this.notificationService.unreadCount$.subscribe(count => {
      this.unreadNotificationCount = count;
    });
  }

  getCartCount(): void {
    if (this.isLoggedIn) {
      this.cartService.refreshCart();
    }
  }

  getNotificationCount(): void {
    if (this.isLoggedIn) {
      this.notificationService.refreshUnreadCount();
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  isAdmin(): boolean {
    return this.userRole === 'admin';
  }

  goToNotifications(): void {
    this.router.navigate(['/notifications']);
  }
}
