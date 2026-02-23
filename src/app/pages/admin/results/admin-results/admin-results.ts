import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../../services/admin';
import { BetService } from '../../../../services/bet'; // Para pegar drivers/teams
import { ToastService } from '../../../../services/toast';

@Component({
  selector: 'app-admin-results',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-results.html',
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
export class AdminResults implements OnInit {
  private adminService = inject(AdminService);
  private betService = inject(BetService);
  private toast = inject(ToastService);

  races: any[] = [];
  drivers: any[] = [];
  teams: any[] = [];
  
  selectedRaceId: number | null = null;
  isLoading = true;
  isSaving = false;

  form: any = {
    pole_driver_id: null, dotd_driver_id: null, winning_team_id: null,
    p1_driver_id: null, p2_driver_id: null, p3_driver_id: null, p4_driver_id: null, p5_driver_id: null,
    p6_driver_id: null, p7_driver_id: null, p8_driver_id: null, p9_driver_id: null, p10_driver_id: null
  };

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.isLoading = true;
    this.adminService.getRaces().subscribe(races => {
      this.races = races;
      this.betService.getDrivers().subscribe(drivers => {
        this.drivers = drivers;
        this.betService.getTeams().subscribe(teams => {
          this.teams = teams;
          this.isLoading = false;
        });
      });
    });
  }

  onRaceSelect() {
    if (!this.selectedRaceId) return;
    
    // Tenta carregar resultado existente
    this.adminService.getRaceResult(this.selectedRaceId).subscribe(res => {
      if (res.result) {
        this.form = { ...res.result }; // Preenche form
        this.toast.show('Gabarito existente carregado.', 'info');
      } else {
        this.resetForm();
      }
    });
  }

  resetForm() {
    this.form = {
      pole_driver_id: null, dotd_driver_id: null, winning_team_id: null,
      p1_driver_id: null, p2_driver_id: null, p3_driver_id: null, p4_driver_id: null, p5_driver_id: null,
      p6_driver_id: null, p7_driver_id: null, p8_driver_id: null, p9_driver_id: null, p10_driver_id: null
    };
  }

  saveResult() {
    if (!this.selectedRaceId) return;
    if (!confirm('Tem certeza que deseja salvar este resultado? Isso irá recalcular o ranking.')) return;

    this.isSaving = true;
    this.adminService.submitResult(this.selectedRaceId, this.form).subscribe({
      next: () => {
        this.toast.show('Resultado salvo e processamento iniciado! 🚀', 'success');
        this.isSaving = false;
      },
      error: (e) => {
        this.toast.show(e.error?.detail || 'Erro ao salvar.', 'error');
        this.isSaving = false;
      }
    });
  }
}