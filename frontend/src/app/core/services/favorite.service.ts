import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ApiResponse, Product } from '../models/interfaces';

export interface FavoriteResponse {
  productos: Product[];
  favorites: any[];
  total: number;
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  removedCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class FavoriteService {
  private http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:3002/api';

  // Reactive favorites state
  private favoritesSubject = new BehaviorSubject<Product[]>([]);
  private favoritesCountSubject = new BehaviorSubject<number>(0);

  public favorites$ = this.favoritesSubject.asObservable();
  public favoritesCount$ = this.favoritesCountSubject.asObservable();
  // Get user favorites
  getFavorites(): Observable<ApiResponse<FavoriteResponse>> {
    return this.http.get<any>(`${this.baseUrl}/favorites`)
      .pipe(
        tap(response => {
          console.log('Favorite service raw response:', response);
          if (response.success && response.data) {
            // Solo usa 'productos', que es lo que retorna el backend
            const productos = response.data.productos || [];
            console.log('Favorite service processed productos:', productos);
            this.favoritesSubject.next(productos);
            this.favoritesCountSubject.next(response.data.total);
            response.data.productos = productos;
          }
        })
      );
  }

  // Add product to favorites
  addToFavorites(productId: string): Observable<ApiResponse<any>> {
    // El backend espera el body { id_producto }
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/favorites`, { id_producto: productId })
      .pipe(
        tap(() => {
          // Refresh favorites after adding
          this.refreshFavorites();
        })
      );
  }

  // Remove product from favorites
  removeFromFavorites(productId: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.baseUrl}/favorites/${productId}`)
      .pipe(
        tap(() => {
          // Refresh favorites after removing
          this.refreshFavorites();
        })
      );
  }

  // Check if product is in favorites
  isProductFavorite(productId: string): Observable<ApiResponse<{isFavorite: boolean}>> {
    return this.http.get<ApiResponse<{isFavorite: boolean}>>(`${this.baseUrl}/favorites/check/${productId}`);
  }

  // Refresh favorites data
  private refreshFavorites(): void {
    this.getFavorites().subscribe();
  }
}
