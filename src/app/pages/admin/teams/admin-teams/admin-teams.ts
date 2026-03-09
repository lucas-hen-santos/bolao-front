import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../../services/admin';
import { ToastService } from '../../../../services/toast';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-admin-teams',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-teams.html',
  styleUrl: './admin-teams.css'
})
export class AdminTeams implements OnInit {
  private adminService = inject(AdminService);
  private toast = inject(ToastService);
  private readonly API_URL = environment.imageBaseUrl;

  teams: any[] = [];
  isLoading = true;
  skip = 0;
  limit = 20;
  searchTerm = '';

  // Modal
  showModal = false;
  selectedTeam: any = null;
  editName = '';
  removeLogo = false;

  ngOnInit() {
    this.loadTeams();
  }

  loadTeams() {
    this.isLoading = true;
    this.adminService.getUserTeams(this.skip, this.limit, this.searchTerm).subscribe({
      next: (data) => {
        this.teams = data;
        this.isLoading = false;
      },
      error: () => {
        this.toast.show('Erro ao carregar equipes.', 'error');
        this.isLoading = false;
      }
    });
  }

  changePage(direction: number) {
    const newSkip = this.skip + (direction * this.limit);
    if (newSkip < 0) return;
    this.skip = newSkip;
    this.loadTeams();
  }

  // --- MODERAÇÃO ---

  openModerateModal(team: any) {
    this.selectedTeam = team;
    this.editName = team.name;
    this.removeLogo = false;
    this.showModal = true;
  }

  saveModeration() {
    if (!this.selectedTeam) return;
    
    this.adminService.moderateTeam(this.selectedTeam.id, this.editName, this.removeLogo).subscribe({
      next: () => {
        this.toast.show('Equipe atualizada!', 'success');
        this.showModal = false;
        this.loadTeams();
      },
      error: (e) => this.toast.show(e.error?.detail || 'Erro ao salvar.', 'error')
    });
  }

  deleteTeam(team: any) {
    if (!confirm(`ATENÇÃO: Excluir a equipe "${team.name}" irá remover os pontos dela. Continuar?`)) return;

    this.adminService.deleteUserTeam(team.id).subscribe({
      next: () => {
        this.toast.show('Equipe excluída.', 'success');
        this.loadTeams();
      },
      error: (e) => this.toast.show(e.error?.detail || 'Erro ao excluir.', 'error')
    });
  }

  // Helper
  getLogoUrl(url: string | null): string {
    if (!url) return 'assets/default-team.png'; 
    if (url.startsWith('http')) return url;
    return `${this.API_URL}${url.startsWith('/') ? '' : '/'}${url}`;
  }
}