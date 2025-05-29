import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { User, Category, Product, ApiResponse } from '../models/interfaces';

export interface AdminStats {
  totalUsers: number;
  totalProducts: number;
  totalCategories: number;
  totalOrders: number;
  recentOrders: number;
  revenue: number;
}

export interface OrderManagement {
  _id: string;
  numero_orden: string;
  id_usuario: string;
  usuario: {
    nombre: string;
    correo: string;
  };
  items: Array<{
    id_producto: string;
    nombre_producto: string;
    cantidad: number;
    precio_unitario: number;
    subtotal: number;
  }>;
  total: number;
  estado: 'pendiente' | 'en_preparacion' | 'listo' | 'entregado' | 'cancelado';
  fecha_pedido: string;
  fecha_entrega?: string;
  notas?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiService = inject(ApiService);

  // Gestión de Categorías
  getCategories(includeInactive = false): Observable<ApiResponse<{ categories: Category[]; total: number }>> {
    return this.apiService.get(`/categories?includeInactive=${includeInactive}&includeProductCount=true`);
  }

  createCategory(categoryData: Partial<Category>): Observable<ApiResponse<Category>> {
    return this.apiService.post('/categories', categoryData);
  }

  updateCategory(id: string, categoryData: Partial<Category>): Observable<ApiResponse<Category>> {
    return this.apiService.put(`/categories/${id}`, categoryData);
  }

  deleteCategory(id: string, force = false): Observable<ApiResponse<any>> {
    return this.apiService.delete(`/categories/${id}?force=${force}`);
  }

  activateCategory(id: string): Observable<ApiResponse<Category>> {
    return this.apiService.post(`/categories/${id}/activate`, {});
  }

  deactivateCategory(id: string): Observable<ApiResponse<Category>> {
    return this.apiService.post(`/categories/${id}/deactivate`, {});
  }

  // Gestión de Productos
  getProducts(params: any = {}): Observable<ApiResponse<{ products: Product[]; pagination: any }>> {
    const queryParams = new URLSearchParams(params).toString();
    return this.apiService.get(`/products?${queryParams}`);
  }

  createProduct(productData: Partial<Product>): Observable<ApiResponse<Product>> {
    return this.apiService.post('/products', productData);
  }

  updateProduct(id: string, productData: Partial<Product>): Observable<ApiResponse<Product>> {
    return this.apiService.put(`/products/${id}`, productData);
  }

  deleteProduct(id: string): Observable<ApiResponse<any>> {
    return this.apiService.delete(`/products/${id}`);
  }

  activateProduct(id: string): Observable<ApiResponse<Product>> {
    return this.apiService.put(`/products/${id}/activate`, {});
  }

  deactivateProduct(id: string): Observable<ApiResponse<Product>> {
    return this.apiService.put(`/products/${id}/deactivate`, {});
  }

  updateProductStock(id: string, stock: number): Observable<ApiResponse<Product>> {
    return this.apiService.put(`/products/${id}/stock`, { cantidad_stock: stock });
  }

  // Gestión de Órdenes
  getAllOrders(params: any = {}): Observable<ApiResponse<{ orders: OrderManagement[]; pagination: any }>> {
    const queryParams = new URLSearchParams(params).toString();
    return this.apiService.get(`/orders/admin/all?${queryParams}`);
  }

  getPendingOrders(): Observable<ApiResponse<{ orders: OrderManagement[] }>> {
    return this.apiService.get('/orders/admin/pending');
  }

  getOrdersInProgress(): Observable<ApiResponse<{ orders: OrderManagement[] }>> {
    return this.apiService.get('/orders/admin/in-progress');
  }

  updateOrderStatus(orderId: string, status: string, notes?: string): Observable<ApiResponse<OrderManagement>> {
    return this.apiService.put(`/orders/${orderId}/status`, { estado: status, notas: notes });
  }

  // Nuevo método para actualizar órdenes usando el ID de usuario
  updateOrderByUser(userId: string, status: string): Observable<ApiResponse<OrderManagement>> {
    return this.apiService.put(`/orders/user/${userId}/update-status`, { estado: status });
  }

  getOrderStatistics(): Observable<ApiResponse<AdminStats>> {
    return this.apiService.get('/orders/admin/statistics');
  }

  // Gestión de Administradores (usando rutas REST reales)
  getAdministrators(): Observable<ApiResponse<User[]>> {
    return this.apiService.get('/admins');
  }

  getAdministrator(id: string): Observable<ApiResponse<User>> {
    return this.apiService.get(`/admins/${id}`);
  }

  createAdministrator(userData: Partial<User>): Observable<ApiResponse<User>> {
    return this.apiService.post('/admins', userData);
  }

  updateAdministrator(id: string, userData: Partial<User>): Observable<ApiResponse<User>> {
    return this.apiService.put(`/admins/${id}`, userData);
  }

  deleteAdministrator(id: string): Observable<ApiResponse<any>> {
    return this.apiService.delete(`/admins/${id}`);
  }
}
