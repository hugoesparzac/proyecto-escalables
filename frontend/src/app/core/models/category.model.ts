export interface Category {
  _id?: string;
  nombre_categoria: string;
  descripcion?: string;
  activa: boolean;
  producto_count?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CategoryCreateRequest {
  nombre_categoria: string;
  descripcion?: string;
}

export interface CategoryUpdateRequest {
  nombre_categoria?: string;
  descripcion?: string;
  activa?: boolean;
}
