import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { Product, Category, ApiResponse, PaginatedResponse, CategoriesResponse, ProductDetailResponse } from '../models/interfaces';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  constructor(private apiService: ApiService) {}

  getProducts(params?: any): Observable<ApiResponse<PaginatedResponse<Product>>> {
    const queryParams = new URLSearchParams(params).toString();
    const endpoint = queryParams ? `/products?${queryParams}` : '/products';
    return this.apiService.get<ApiResponse<PaginatedResponse<Product>>>(endpoint);
  }
  getProductById(id: string): Observable<ApiResponse<ProductDetailResponse>> {
    return this.apiService.get<ApiResponse<ProductDetailResponse>>(`/products/${id}`);
  }
  getCategories(): Observable<CategoriesResponse> {
    return this.apiService.get<CategoriesResponse>('/categories');
  }

  getProductsByCategory(categoryId: string, params?: any): Observable<ApiResponse<PaginatedResponse<Product>>> {
    const queryParams = new URLSearchParams(params).toString();
    const endpoint = queryParams
      ? `/products/category/${categoryId}?${queryParams}`
      : `/products/category/${categoryId}`;
    return this.apiService.get<ApiResponse<PaginatedResponse<Product>>>(endpoint);
  }

  searchProducts(query: string, params?: any): Observable<ApiResponse<PaginatedResponse<Product>>> {
    const searchParams = new URLSearchParams({ search: query, ...params }).toString();
    return this.apiService.get<ApiResponse<PaginatedResponse<Product>>>(`/products/search?${searchParams}`);
  }

  createProduct(productData: Partial<Product>) {
    return this.apiService.post<ApiResponse<Product>>('/products', productData);
  }

  updateProduct(id: string, productData: Partial<Product>) {
    return this.apiService.put<ApiResponse<Product>>(`/products/${id}`, productData);
  }

  deleteProduct(id: string) {
    return this.apiService.delete<ApiResponse<Product>>(`/products/${id}`);
  }
}
