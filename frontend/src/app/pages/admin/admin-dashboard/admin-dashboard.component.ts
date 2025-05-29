import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AdminService, AdminStats } from '../../../core/services/admin.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent implements OnInit {
  private adminService = inject(AdminService);
  private router = inject(Router);

  stats: AdminStats | null = null;
  isLoading = true;
  error: string | null = null;

  async ngOnInit() {
    await this.loadStats();
  }
  async loadStats() {
    try {
      this.isLoading = true;
      this.error = null;

      const response = await this.adminService.getOrderStatistics().toPromise();
      if (response && response.success) {
        this.stats = response.data;
      } else {
        this.error = 'Error al cargar las estadísticas';
      }
    } catch (error) {
      console.error('Error loading stats:', error);
      this.error = 'Error al cargar las estadísticas';
    } finally {
      this.isLoading = false;
    }
  }

  navigateTo(route: string) {
    this.router.navigate(['/admin', route]);
  }
}
