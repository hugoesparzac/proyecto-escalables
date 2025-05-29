import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { User, ApiResponse } from '../../../core/models/interfaces';

@Component({
  selector: 'app-administrators',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './administrators.component.html',
  styleUrl: './administrators.component.css'
})
export class AdministratorsComponent implements OnInit {
  private adminService = inject(AdminService);

  administrators: User[] = [];
  isLoading = true;
  error: string | null = null;
  isCreating = false;

  // Modal states
  showCreateModal = false;
  showEditModal = false;
  showDeleteModal = false;
  selectedAdmin: User | null = null;

  // Form data
  adminForm = {
    nombre: '',
    correo: '',
    telefono: '',
    password: '',
    confirmPassword: '',
    activo: true
  };

  // Password validation
  passwordRequirements = {
    minLength: false,
    hasUpper: false,
    hasLower: false,
    hasNumber: false,
    hasSpecial: false
  };

  async ngOnInit() {
    await this.loadAdministrators();
  }

  async loadAdministrators() {
    try {
      this.isLoading = true;
      this.error = null;
      const response = await this.adminService.getAdministrators().toPromise();
      if (response && response.success) {
        // El backend ahora retorna un array directo en data
        this.administrators = Array.isArray(response.data) ? response.data : [];
      } else {
        this.error = 'Error al cargar los administradores';
      }
    } catch (error) {
      console.error('Error loading administrators:', error);
      this.error = 'Error al cargar los administradores';
    } finally {
      this.isLoading = false;
    }
  }

  // Form validation
  validatePassword(password: string) {
    this.passwordRequirements = {
      minLength: password.length >= 8,
      hasUpper: /[A-Z]/.test(password),
      hasLower: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
  }

  get isPasswordValid(): boolean {
    return Object.values(this.passwordRequirements).every(req => req);
  }
  get isFormValid(): boolean {
    const basicValid = !!(this.adminForm.nombre.trim() &&
                      this.adminForm.correo.trim() &&
                      this.isValidEmail(this.adminForm.correo));

    if (this.showCreateModal) {
      return basicValid &&
             !!this.adminForm.password &&
             this.isPasswordValid &&
             this.adminForm.password === this.adminForm.confirmPassword;
    }

    return basicValid;
  }

  isValidEmail(email: string): boolean {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  }

  // Modal methods
  openCreateModal() {
    this.resetForm();
    this.showCreateModal = true;
  }

  openEditModal(admin: User) {
    this.selectedAdmin = admin;
    this.adminForm = {
      nombre: admin.nombre,
      correo: admin.correo,
      telefono: admin.telefono || '',
      password: '',
      confirmPassword: '',
      activo: admin.activo
    };
    this.showEditModal = true;
  }
  openDeleteModal(admin: User) {
    console.log('Administrador a eliminar:', admin);
    this.selectedAdmin = admin;

    // Verificar si el ID está disponible
    if (!admin._id) {
      console.error('Error: El administrador no tiene ID', admin);
      this.error = 'No se puede eliminar el administrador porque no tiene ID';
      return;
    }

    this.showDeleteModal = true;
  }

  closeModals() {
    this.showCreateModal = false;
    this.showEditModal = false;
    this.showDeleteModal = false;
    this.selectedAdmin = null;
    this.resetForm();
  }

  resetForm() {
    this.adminForm = {
      nombre: '',
      correo: '',
      telefono: '',
      password: '',
      confirmPassword: '',
      activo: true
    };
    this.passwordRequirements = {
      minLength: false,
      hasUpper: false,
      hasLower: false,
      hasNumber: false,
      hasSpecial: false
    };
  }

  // CRUD operations
  async createAdministrator() {
    if (!this.isFormValid || this.isCreating) return;

    try {
      this.isCreating = true;
      this.error = null;      const adminData = {
        nombre: this.adminForm.nombre.trim(),
        correo: this.adminForm.correo.trim(),
        telefono: this.adminForm.telefono.trim() || undefined,
        contraseña: this.adminForm.password, // Cambiado de password a contraseña
        rol: 'admin' as const,
        activo: this.adminForm.activo
      };

      const response = await this.adminService.createAdministrator(adminData).toPromise();
      if (response && response.success) {
        this.administrators.push(response.data);
        this.closeModals();
        this.loadAdministrators(); // Refresh list
      } else {
        this.error = response?.message || 'Error al crear el administrador';
      }
    } catch (error: any) {
      console.error('Error creating administrator:', error);
      this.error = error.error?.message || 'Error al crear el administrador';
    } finally {
      this.isCreating = false;
    }
  }

  async updateAdministrator() {
    if (!this.selectedAdmin || !this.isFormValid) return;

    try {
      this.error = null;

      const updateData: any = {
        nombre: this.adminForm.nombre.trim(),
        correo: this.adminForm.correo.trim(),
        telefono: this.adminForm.telefono.trim() || undefined,
        activo: this.adminForm.activo
      };

      // Only include password if provided
      if (this.adminForm.password) {        if (!this.isPasswordValid || this.adminForm.password !== this.adminForm.confirmPassword) {
          this.error = 'La contraseña no cumple con los requisitos o no coincide';
          return;
        }
        updateData.contraseña = this.adminForm.password; // Cambiado de password a contraseña
      }

      const response = await this.adminService.updateAdministrator(
        this.selectedAdmin._id,
        updateData
      ).toPromise();

      if (response && response.success) {
        // Update the administrator in the list
        const index = this.administrators.findIndex(a => a._id === this.selectedAdmin!._id);
        if (index !== -1) {
          this.administrators[index] = { ...this.administrators[index], ...updateData };
        }
        this.closeModals();
      } else {
        this.error = response?.message || 'Error al actualizar el administrador';
      }
    } catch (error: any) {
      console.error('Error updating administrator:', error);
      this.error = error.error?.message || 'Error al actualizar el administrador';
    }
  }

  async toggleAdminStatus(admin: User) {
    try {
      this.error = null;
      // Si quieres implementar activar/desactivar, deberías usar updateAdministrator y cambiar el campo activo
      const response = await this.adminService.updateAdministrator(admin._id, { activo: !admin.activo }).toPromise();
      if (response && response.success) {
        // Update the administrator in the list
        const index = this.administrators.findIndex(a => a._id === admin._id);
        if (index !== -1) {
          this.administrators[index].activo = !admin.activo;
        }
      } else {
        this.error = 'Error al cambiar el estado del administrador';
      }
    } catch (error) {
      console.error('Error toggling admin status:', error);
      this.error = 'Error al cambiar el estado del administrador';
    }
  }
  async deleteAdministrator() {
    if (!this.selectedAdmin) return;
    try {
      this.error = null;
      console.log(`Eliminando administrador con ID: ${this.selectedAdmin._id}`);

      const response = await this.adminService.deleteAdministrator(this.selectedAdmin._id).toPromise();
      console.log('Respuesta de eliminación:', response);

      if (response && response.success) {
        this.administrators = this.administrators.filter(a => a._id !== this.selectedAdmin!._id);
        this.closeModals();
      } else {
        this.error = response?.message || 'Error al eliminar el administrador';
      }
    } catch (error: any) {
      console.error('Error detallado al eliminar administrador:', error);
      this.error = error.error?.message || 'Error al eliminar el administrador';
    }
  }

  // Utility methods
  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  }

  isCurrentUser(admin: User): boolean {
    // This would need to be implemented based on your auth service
    // For now, return false to allow all operations
    return false;
  }
}
