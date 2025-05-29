export interface Notification {
  _id: string;
  id_usuario: string;
  tipo: 'orden_pagada' | 'orden_realizando' | 'orden_entregada' | 'sistema' | 'pedido' | 'promo' | 'info';
  mensaje: string;
  titulo?: string;
  estado: 'leido' | 'no_leido';
  leida?: boolean;  // Alternative property used in the new component version
  id_orden?: string;
  fecha_hora?: Date;
  createdAt: Date;
  updatedAt: Date;
}
