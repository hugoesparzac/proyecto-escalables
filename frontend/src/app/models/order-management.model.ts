export interface OrderManagement {
  _id?: string;
  id?: string;
  id_orden?: string;
  id_usuario: string;
  usuario?: {
    nombre: string;
    correo: string;
  };
  estado: 'pendiente' | 'en_preparacion' | 'listo' | 'entregado' | 'cancelado';
  precio_total: number;
  productos: Array<{
    id_producto: string;
    nombre_producto: string;
    cantidad: number;
    precio_unitario: number;
    subtotal: number;
  }>;
  items?: Array<{
    id_producto: string;
    nombre_producto: string;
    cantidad: number;
    precio_unitario: number;
    subtotal: number;
  }>;
  fecha_pago?: string;
  fecha_preparacion?: string;
  fecha_listo?: string;
  fecha_entregado?: string;
  fecha_cancelacion?: string;
  createdAt: string;
  updatedAt: string;
}
