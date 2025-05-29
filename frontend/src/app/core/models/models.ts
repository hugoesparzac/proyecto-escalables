// Enhanced models with convenience properties
export class Product {
  constructor(
    public _id: string,
    public id_producto: string,
    public nombre_producto: string,
    public descripcion: string,
    public precio: number,
    public url_imagen: string,
    public id_categoria: string,
    public activo: boolean,
    public disponible: boolean,
    public cantidad_stock: number,
    public popularidad: number,
    public createdAt: string,
    public updatedAt: string,
    public categoria?: Category
  ) {}

  // Convenience getters for template compatibility
  get name(): string {
    return this.nombre_producto;
  }

  get description(): string {
    return this.descripcion;
  }

  get price(): number {
    return this.precio;
  }

  get image(): string {
    return this.url_imagen;
  }

  get category(): string {
    return this.id_categoria;
  }
}

export class Category {
  constructor(
    public _id: string,
    public id_categoria: string,
    public nombre_categoria: string,
    public descripcion: string,
    public activo: boolean,
    public popularidad: number,
    public createdAt: string,
    public updatedAt: string,
    public productCount?: number
  ) {}

  // Convenience getters for template compatibility
  get name(): string {
    return this.nombre_categoria;
  }

  get description(): string {
    return this.descripcion;
  }
}

// Keep the original interfaces for API responses
export interface ProductData {
  _id: string;
  id_producto: string;
  nombre_producto: string;
  descripcion: string;
  precio: number;
  url_imagen: string;
  id_categoria: string;
  categoria?: CategoryData;
  activo: boolean;
  disponible: boolean;
  cantidad_stock: number;
  popularidad: number;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryData {
  _id: string;
  id_categoria: string;
  nombre_categoria: string;
  descripcion: string;
  activo: boolean;
  popularidad: number;
  productCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  products: T[];
  pagination: {
    total: number;
    page: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
    limit: number;
  };
}

export interface CategoriesResponse {
  success: boolean;
  message: string;
  categories: Category[];
  total: number;
  filters_applied?: any;
}

export interface CartItem {
  id: string;
  id_producto: string;
  nombre_producto: string;
  precio_unitario: number;
  cantidad: number;
  subtotal: number;
  notas?: string;
  url_imagen?: string;
}

export interface Cart {
  _id: string;
  id_usuario: string;
  items: CartItem[];
  total: number;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  _id: string;
  id_usuario: string;
  nombre: string;
  correo: string;
  telefono?: string;
  rol: 'admin' | 'cliente';
  activo: boolean;
  email_verificado: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginResponse {
  user: User;
  token: string;
  message: string;
}
