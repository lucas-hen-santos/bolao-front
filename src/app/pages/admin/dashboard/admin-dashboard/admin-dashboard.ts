import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminService } from '../../../../services/admin';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-dashboard.html',
  styles: [`
    .glass-panel {
      background: rgba(20, 20, 20, 0.6);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: 1rem;
    }
    .animate-slide-up { animation: slideUp 0.5s ease-out forwards; }
    @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class AdminDashboard implements OnInit {
  private adminService = inject(AdminService);
  private readonly API_URL = environment.imageBaseUrl;

  stats: any = {};
  isLoading = true;
  
  // Gráfico
  chartPoints: string = '';

  ngOnInit() {
    this.loadStats();
  }

  loadStats() {
    this.isLoading = true;
    this.adminService.getDashboardStats().subscribe({
      next: (data) => {
        this.stats = data;
        if (data.engagement_history) {
            this.generateChart(data.engagement_history);
        }
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  generateChart(history: any[]) {
    if (!history || history.length < 2) return;
    
    const maxPct = 100; // Eixo Y é sempre 0-100%
    const width = 100; 
    const step = width / (history.length - 1);
    
    this.chartPoints = history.map((h, i) => {
      const x = i * step;
      const y = 100 - h.pct; // Inverte Y (0 é topo)
      return `${x},${y}`;
    }).join(' ');
  }

  getPhotoUrl(url: string | null): string {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `${this.API_URL}${url.startsWith('/') ? '' : '/'}${url}`;
  }

  getInitials(name: string): string {
      return name ? name.charAt(0).toUpperCase() : '?';
  }
}