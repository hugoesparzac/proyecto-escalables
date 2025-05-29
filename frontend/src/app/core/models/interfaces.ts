export interface Product {
  _id: string;
  id_producto: string;
  nombre_producto: string;
  descripcion?: string; // Made optional since some products might not have descriptions
  precio: number;
  calorias: number;
  url_imagen: string;
  imagen_url: string; // Added for template compatibility
  id_categoria: string | Category; // Can be ObjectId string or populated Category object
  categoria?: Category;
  activo: boolean;
  disponible: boolean;
  cantidad_stock: number;
  stock: number; // Added for template compatibility
  popularidad: number;
  destacado: boolean; // Added for template compatibility
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  _id: string;
  id_categoria: string;
  nombre_categoria: string;
  descripcion: string;
  activo: boolean;
  activa: boolean; // Added for template compatibility (alias for activo)
  imagen_url: string; // Added for template compatibility
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
  total: number; // Added for template compatibility
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
  email?: string; // Para compatibilidad con backend que responde 'email'
  telefono?: string;
  rol: 'admin' | 'cliente';
  activo: boolean;
  email_verificado: boolean;
  validada: boolean; // Added for template compatibility (alias for email_verificado)
  createdAt: string;
  updatedAt: string;
}

export interface ProductDetailResponse {
  product: Product;
  category: Category;
  relatedProducts: Product[];
}

export interface LoginResponse {
  user: User;
  token: string;
  message: string;
}

export interface OrderDetail {
  id_detalle: string;
  id_producto: string;
  nombre_producto: string;
  precio_unitario: number;
  cantidad: number;
  subtotal: number;
  notas?: string;
}

export interface Order {
  _id: string;
  id_pedido: string;
  id_usuario: string;
  usuario?: User;
  estado: 'pendiente' | 'en_preparacion' | 'listo' | 'entregado' | 'cancelado';
  total: number;
  notas?: string;
  fecha_pedido: string;
  fecha_entrega?: string;
  detalles?: OrderDetail[];
  createdAt: string;
  updatedAt: string;
}
