import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './pages/admin/admin-layout.component';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent),
    canActivate: [() => {
      const user = localStorage.getItem('user');
      if (user) {
        try {
          const userObj = JSON.parse(user);
          if (userObj.rol === 'admin' && userObj.validada === true) {
            window.location.href = '/admin/dashboard';
            return false;
          }
        } catch {}
      }
      return true;
    }]
  },
  {
    path: 'menu',
    loadComponent: () => import('./pages/menu/menu.component').then(m => m.MenuComponent),
    canActivate: [() => {
      const user = localStorage.getItem('user');
      if (user) {
        try {
          const userObj = JSON.parse(user);
          if (userObj.rol === 'admin' && userObj.validada === true) {
            window.location.href = '/admin/dashboard';
            return false;
          }
        } catch {}
      }
      return true;
    }]
  },
  {
    path: 'product/:id',
    loadComponent: () => import('./pages/product-detail/product-detail.component').then(m => m.ProductDetailComponent),
    canActivate: [() => {
      const user = localStorage.getItem('user');
      if (user) {
        try {
          const userObj = JSON.parse(user);
          if (userObj.rol === 'admin' && userObj.validada === true) {
            window.location.href = '/admin/dashboard';
            return false;
          }
        } catch {}
      }
      return true;
    }]
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/auth/login/login.component').then(m => m.LoginComponent)
  },  {
    path: 'register',
    loadComponent: () => import('./pages/auth/register/register.component').then(m => m.RegisterComponent)
  },  {
    path: 'cart',
    loadComponent: () => import('./pages/cart/cart.component').then(m => m.CartComponent),
    canActivate: [() => {
      // Solo permite acceso si NO es admin
      const user = localStorage.getItem('user');
      if (user) {
        try {
          const userObj = JSON.parse(user);
          return !(userObj.rol === 'admin' && userObj.validada === true);
        } catch {
          return true;
        }
      }
      return true;
    }]
  },
  {
    path: 'favorites',
    loadComponent: () => import('./pages/favorites/favorites.component').then(m => m.FavoritesComponent),
    canActivate: [() => {
      // Solo permite acceso si el usuario está autenticado y NO es admin
      const token = localStorage.getItem('token');
      if (!token) return false;

      const user = localStorage.getItem('user');
      if (user) {
        try {
          const userObj = JSON.parse(user);
          return !(userObj.rol === 'admin' && userObj.validada === true);
        } catch {
          return true;
        }
      }
      return true;
    }]
  },
  {
    path: 'notifications',
    loadComponent: () => import('./pages/notifications/notifications.component').then(m => m.NotificationsComponent),
    canActivate: [() => {
      // Solo permite acceso si el usuario está autenticado y NO es admin
      const token = localStorage.getItem('token');
      if (!token) return false;

      const user = localStorage.getItem('user');
      if (user) {
        try {
          const userObj = JSON.parse(user);
          return !(userObj.rol === 'admin' && userObj.validada === true);
        } catch {
          return true;
        }
      }
      return true;
    }]
  },
  {
    path: 'profile',
    loadComponent: () => import('./pages/profile/profile.component').then(m => m.ProfileComponent),
    canActivate: [() => {
      // Solo permite acceso si el usuario está autenticado y NO es admin
      const token = localStorage.getItem('token');
      if (!token) return false;

      const user = localStorage.getItem('user');
      if (user) {
        try {
          const userObj = JSON.parse(user);
          return !(userObj.rol === 'admin' && userObj.validada === true);
        } catch {
          return true;
        }
      }
      return true;
    }]
  },
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [adminGuard],
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/admin/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent),
        canActivate: [adminGuard]
      },
      {
        path: 'categories',
        loadComponent: () => import('./pages/admin/categories/categories.component').then(m => m.CategoriesComponent),
        canActivate: [adminGuard]
      },
      {
        path: 'products',
        loadComponent: () => import('./pages/admin/products/products.component').then(m => m.ProductsComponent),
        canActivate: [adminGuard]
      },
      {
        path: 'orders',
        loadComponent: () => import('./pages/admin/orders/orders.component').then(m => m.OrdersComponent),
        canActivate: [adminGuard]
      },
      {
        path: 'administrators',
        loadComponent: () => import('./pages/admin/administrators/administrators.component').then(m => m.AdministratorsComponent),
        canActivate: [adminGuard]
      },
      {
        path: 'profile',
        loadComponent: () => import('./pages/profile/profile.component').then(m => m.ProfileComponent),
        canActivate: [adminGuard]
      },
      {
        path: 'products-admin',
        loadComponent: () => import('./pages/admin/products-admin/products-admin.component').then(m => m.ProductsAdminComponent),
        canActivate: [adminGuard]
      }
    ]
  },
  {
    path: 'auth/validate-email',
    loadComponent: () => import('./pages/auth/validate-email.component').then(m => m.ValidateEmailComponent)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
