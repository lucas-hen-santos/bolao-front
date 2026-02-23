import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../../services/admin';
import { ToastService } from '../../../../services/toast';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-users.html',
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
export class AdminUsers implements OnInit {
  private adminService = inject(AdminService);
  private toast = inject(ToastService);
  
  private readonly API_URL = environment.imageBaseUrl;

  users: any[] = [];
  isLoading = true;
  skip = 0;
  limit = 20; // Paginação menor para caber melhor em telas
  searchTerm = '';

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.isLoading = true;
    this.adminService.getUsers(this.skip, this.limit, this.searchTerm).subscribe({
      next: (data) => {
        this.users = data;
        this.isLoading = false;
      },
      error: () => {
        this.toast.show('Erro ao carregar usuários', 'error');
        this.isLoading = false;
      }
    });
  }

  changePage(direction: number) {
    const newSkip = this.skip + (direction * this.limit);
    if (newSkip < 0) return;
    this.skip = newSkip;
    this.loadUsers();
  }

  toggleRole(user: any) {
    const newRole = !user.is_admin;
    if (!confirm(`Tem certeza que deseja ${newRole ? 'tornar ADMIN' : 'remover ADMIN de'} ${user.full_name}?`)) return;

    this.adminService.toggleUserRole(user.id, newRole).subscribe({
      next: (updatedUser) => {
        user.is_admin = updatedUser.is_admin;
        this.toast.show('Cargo atualizado com sucesso!', 'success');
      },
      error: (err) => this.toast.show(err.error?.detail || 'Erro ao alterar cargo', 'error')
    });
  }

  toggleStatus(user: any) {
    const newStatus = !user.is_active;
    if (!confirm(`Tem certeza que deseja ${newStatus ? 'ATIVAR' : 'BANIR'} ${user.full_name}?`)) return;

    this.adminService.toggleUserStatus(user.id, newStatus).subscribe({
      next: (updatedUser) => {
        user.is_active = updatedUser.is_active;
        this.toast.show(`Usuário ${newStatus ? 'ativado' : 'banido'}!`, 'info');
      },
      error: (err) => this.toast.show(err.error?.detail || 'Erro ao alterar status', 'error')
    });
  }

  getPhotoUrl(url: string | null): string {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `${this.API_URL}${url.startsWith('/') ? '' : '/'}${url}`;
  }
}