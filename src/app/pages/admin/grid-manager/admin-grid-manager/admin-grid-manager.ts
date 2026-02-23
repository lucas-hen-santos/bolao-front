import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ToastService } from '../../../../services/toast';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-admin-grid-manager',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-grid-manager.html',
  styles: [`
    .glass-panel {
      background: rgba(20, 20, 20, 0.6);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: 1rem;
    }
    .input-admin {
      width: 100%;
      background-color: rgba(0,0,0,0.4);
      color: white;
      padding: 0.75rem;
      border-radius: 0.75rem;
      border: 1px solid #374151;
      outline: none;
      font-weight: 500;
      font-size: 0.875rem;
    }
    .input-admin:focus { border-color: #ef4444; background-color: rgba(0,0,0,0.6); }
    .animate-slide-up { animation: slideUp 0.5s ease-out forwards; }
    @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class AdminGridManager implements OnInit {
  private http = inject(HttpClient);
  private toast = inject(ToastService);
  private apiUrl = `${environment.apiUrl}/admin/f1`; // Ajuste conforme sua rota de admin para F1

  activeTab: 'drivers' | 'teams' = 'drivers';
  drivers: any[] = [];
  teams: any[] = [];
  isLoading = true;

  // Modais
  showDriverModal = false;
  showTeamModal = false;
  isEditing = false;

  // Forms
  driverForm: any = { id: null, name: '', number: null, photo_url: '', real_team_id: null };
  teamForm: any = { id: null, name: '', logo_url: '' };

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.isLoading = true;
    // Carrega Equipes primeiro para mapear nomes
    this.http.get<any[]>(`${this.apiUrl}/teams/`).subscribe(teams => {
      this.teams = teams;
      this.http.get<any[]>(`${this.apiUrl}/drivers/`).subscribe(drivers => {
        this.drivers = drivers;
        this.isLoading = false;
      });
    });
  }

  // --- DRIVERS ---

  openDriverModal(driver: any = null) {
    if (driver) {
      this.isEditing = true;
      this.driverForm = { ...driver };
    } else {
      this.isEditing = false;
      this.driverForm = { id: null, name: '', number: null, photo_url: '', real_team_id: null };
    }
    this.showDriverModal = true;
  }

  saveDriver() {
    if (this.isEditing) {
      this.http.put(`${this.apiUrl}/drivers/${this.driverForm.id}`, this.driverForm).subscribe({
        next: () => { this.toast.show('Piloto atualizado!', 'success'); this.showDriverModal = false; this.loadData(); },
        error: () => this.toast.show('Erro ao salvar.', 'error')
      });
    } else {
      this.http.post(`${this.apiUrl}/drivers/`, this.driverForm).subscribe({
        next: () => { this.toast.show('Piloto criado!', 'success'); this.showDriverModal = false; this.loadData(); },
        error: () => this.toast.show('Erro ao criar.', 'error')
      });
    }
  }

  deleteDriver(driver: any) {
    if (!confirm(`Excluir ${driver.name}?`)) return;
    this.http.delete(`${this.apiUrl}/drivers/${driver.id}`).subscribe({
      next: () => { this.toast.show('Removido.', 'success'); this.loadData(); },
      error: () => this.toast.show('Erro ao remover.', 'error')
    });
  }

  // --- TEAMS ---

  openTeamModal(team: any = null) {
    if (team) {
      this.isEditing = true;
      this.teamForm = { ...team };
    } else {
      this.isEditing = false;
      this.teamForm = { id: null, name: '', logo_url: '' };
    }
    this.showTeamModal = true;
  }

  saveTeam() {
    if (this.isEditing) {
      this.http.put(`${this.apiUrl}/teams/${this.teamForm.id}`, this.teamForm).subscribe({
        next: () => { this.toast.show('Equipe atualizada!', 'success'); this.showTeamModal = false; this.loadData(); },
        error: () => this.toast.show('Erro ao salvar.', 'error')
      });
    } else {
      this.http.post(`${this.apiUrl}/teams/`, this.teamForm).subscribe({
        next: () => { this.toast.show('Equipe criada!', 'success'); this.showTeamModal = false; this.loadData(); },
        error: () => this.toast.show('Erro ao criar.', 'error')
      });
    }
  }

  deleteTeam(team: any) {
    if (!confirm(`Excluir ${team.name}? Isso removerá os pilotos associados.`)) return;
    this.http.delete(`${this.apiUrl}/teams/${team.id}`).subscribe({
      next: () => { this.toast.show('Removido.', 'success'); this.loadData(); },
      error: () => this.toast.show('Erro ao remover.', 'error')
    });
  }

  // Helper
  getTeamName(id: number): string {
    const t = this.teams.find(team => team.id === id);
    return t ? t.name : 'Sem Equipe';
  }
}