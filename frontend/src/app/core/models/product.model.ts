export interface Product {
  _id?: string;
  id_producto?: string;
  nombre_producto: string;
  descripcion: string;
  precio: number;
  categoria: string;
  url_imagen?: string;
  activo: boolean;
  disponible?: boolean;
  cantidad_stock?: number;
  stock?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ProductCreateRequest {
  nombre_producto: string;
  descripcion: string;
  precio: number;
  categoria: string;
  url_imagen?: string;
  cantidad_stock?: number;
}

export interface ProductUpdateRequest {
  nombre_producto?: string;
  descripcion?: string;
  precio?: number;
  categoria?: string;
  url_imagen?: string;
  cantidad_stock?: number;
  activo?: boolean;
  disponible?: boolean;
}
