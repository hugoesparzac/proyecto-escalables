import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminService, OrderManagement } from '../../../core/services/admin.service';
import { Order, OrderDetail, ApiResponse } from '../../../core/models/interfaces';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.css'
})
export class OrdersComponent implements OnInit {
  private adminService = inject(AdminService);

  // Expose Math to template
  Math = Math;

  orders: OrderManagement[] = [];
  isLoading = true;
  error: string | null = null;

  // Filter options
  filterStatus = '';
  filterDate = '';
  searchTerm = '';

  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;
  // Modal states
  showDetailsModal = false;
  showStatusModal = false;
  selectedOrder: OrderManagement | null = null;
  newStatus = '';

  // Order status options
  statusOptions = [
    { value: 'pendiente', label: 'Pendiente', color: '#ffc107' },
    { value: 'en_preparacion', label: 'En Preparación', color: '#17a2b8' },
    { value: 'listo', label: 'Listo', color: '#28a745' },
    { value: 'entregado', label: 'Entregado', color: '#6c757d' },
    { value: 'cancelado', label: 'Cancelado', color: '#dc3545' }
  ];

  async ngOnInit() {
    await this.loadOrders();
  }

  async loadOrders() {
    try {
      this.isLoading = true;
      this.error = null;

      const params = {
        page: this.currentPage,
        limit: this.itemsPerPage,
        status: this.filterStatus,
        date: this.filterDate,
        search: this.searchTerm
      };      const response = await this.adminService.getAllOrders(params).toPromise();
      if (response && response.success) {
        this.orders = response.data.orders;
        this.totalItems = response.data.pagination?.total || this.orders.length;
      } else {
        this.error = 'Error al cargar los pedidos';
      }
    } catch (error) {
      console.error('Error loading orders:', error);
      this.error = 'Error al cargar los pedidos';
    } finally {
      this.isLoading = false;
    }
  }

  async applyFilters() {
    this.currentPage = 1;
    await this.loadOrders();
  }

  clearFilters() {
    this.filterStatus = '';
    this.filterDate = '';
    this.searchTerm = '';
    this.currentPage = 1;
    this.loadOrders();
  }

  // Pagination methods
  get totalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

  get paginatedOrders(): OrderManagement[] {
    return this.orders;
  }

  async changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      await this.loadOrders();
    }
  }

  // Modal methods
  openDetailsModal(order: OrderManagement) {
    this.selectedOrder = order;
    this.showDetailsModal = true;
  }

  openStatusModal(order: OrderManagement) {
    this.selectedOrder = order;
    this.newStatus = order.estado;
    this.showStatusModal = true;
  }

  closeModals() {
    this.showDetailsModal = false;
    this.showStatusModal = false;
    this.selectedOrder = null;
    this.newStatus = '';
  }

  async updateOrderStatus() {
    if (!this.selectedOrder) {
      console.error('No order selected');
      this.error = 'Error: No se ha seleccionado ningún pedido';
      return;
    }

    if (!this.newStatus) {
      console.error('No status selected');
      this.error = 'Error: No se ha seleccionado un estado';
      return;
    }

    console.log('Selected order:', this.selectedOrder);

    try {
      // Dado que el ID de usuario parece ser más confiable, vamos a usarlo directamente
      if (this.selectedOrder.id_usuario) {
        console.log('Attempting to update order using user ID:', this.selectedOrder.id_usuario);

        // Usamos el método específico para actualizar por ID de usuario
        const response = await this.adminService.updateOrderByUser(
          this.selectedOrder.id_usuario,
          this.newStatus
        ).toPromise();

        if (response && response.success) {
          console.log('Order status updated successfully');
          this.closeModals();
          await this.loadOrders();
          return;
        } else {
          console.error('Failed to update order status using user ID');
        }
      } else {
        console.error('No user ID available in the selected order');
      }

      // Si llegamos aquí, algo falló, intentemos otra estrategia
      this.error = 'No se pudo actualizar el estado de la orden. Actualizando la página para obtener datos frescos.';
      await this.loadOrders();

    } catch (error) {
      console.error('Error updating order status:', error);
      this.error = 'Error al actualizar el estado del pedido: ' + (error instanceof Error ? error.message : 'Error desconocido');
    }
  }

  // Utility methods
  getStatusBadgeClass(status: string): string {
    const statusConfig = this.statusOptions.find(s => s.value === status);
    return statusConfig ? `status-${status}` : 'status-default';
  }

  getStatusLabel(status: string): string {
    const statusConfig = this.statusOptions.find(s => s.value === status);
    return statusConfig ? statusConfig.label : status;
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatPrice(price: number): string {
    return `$${price.toFixed(2)}`;
  }

  calculateTotal(order: OrderManagement): number {
    return order.items?.reduce((total: number, item: any) =>
      total + (item.precio_unitario * item.cantidad), 0) || 0;
  }
}
