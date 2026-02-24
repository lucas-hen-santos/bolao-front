import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../../services/admin';
import { ToastService } from '../../../../services/toast';
import { ResultViewerComponent } from '../../../../components/result-viewer/result-viewer';

@Component({
  selector: 'app-admin-races',
  standalone: true,
  imports: [CommonModule, FormsModule, ResultViewerComponent],
  templateUrl: './admin-races.html',
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
    .label-admin {
      display: block; color: #9ca3af; font-size: 0.65rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.25rem;
    }
    .animate-slide-up { animation: slideUp 0.5s ease-out forwards; }
    @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    .scrollbar-hide::-webkit-scrollbar { display: none; }
    .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
  `]
})
export class AdminRaces implements OnInit {
  private adminService = inject(AdminService);
  private toast = inject(ToastService);

  seasons: any[] = [];
  selectedSeasonId: number | null = null;
  activeSeason: any = null;
  races: any[] = [];
  isLoading = true;

  showModal = false;
  isEditing = false;
  editingId: number | null = null;
  
  form: any = {
    name: '',
    country: '',
    race_date: '',
    bets_open_at: '',
    bets_close_at: ''
  };

  showSeasonModal = false;
  newSeasonYear: number = new Date().getFullYear() + 1;
  
  showDeleteModal = false;
  raceToDelete: any = null;
  
  showFreezeModal = false;
  isFreezing = false;
  progressValue = 0;
  freezeStep = '';

  showResultModal = false;
  selectedRaceForResults: any = null;

  ngOnInit() {
    this.loadSeasons();
  }

  loadSeasons() {
    this.adminService.getSeasons().subscribe({
      next: (data) => {
        this.seasons = data;
        this.activeSeason = this.seasons.find(s => s.is_active);
        
        if (!this.selectedSeasonId) {
          this.selectedSeasonId = this.activeSeason ? this.activeSeason.id : (this.seasons.length > 0 ? this.seasons[0].id : null);
        }
        
        if (this.selectedSeasonId) {
          this.loadRaces();
        } else {
          this.isLoading = false;
        }
      },
      error: () => this.isLoading = false
    });
  }

  loadRaces() {
    if (!this.selectedSeasonId) return;
    this.isLoading = true;
    
    this.adminService.getRaces(this.selectedSeasonId).subscribe({
      next: (data) => {
        this.races = data;
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  selectSeason(id: number) {
    this.selectedSeasonId = id;
    this.loadRaces();
  }

  openFreezeModal() {
    if (!this.activeSeason) return;
    this.showFreezeModal = true;
    this.isFreezing = false;
    this.progressValue = 0;
  }

  confirmFreezeSeason() {
    this.isFreezing = true;
    const steps = [
      { pct: 20, msg: 'Validando integridade...' },
      { pct: 40, msg: 'Congelando histórico de equipes...' },
      { pct: 60, msg: 'Arquivando pontuações...' },
      { pct: 80, msg: 'Finalizando temporada...' },
      { pct: 100, msg: 'Concluído!' }
    ];

    let currentStep = 0;
    
    this.adminService.closeSeason(this.activeSeason.id).subscribe({
      next: () => {
        const interval = setInterval(() => {
          if (currentStep >= steps.length) {
            clearInterval(interval);
            setTimeout(() => {
              this.showFreezeModal = false;
              this.toast.show('Temporada encerrada com sucesso!', 'success');
              this.loadSeasons();
            }, 500);
            return;
          }
          this.progressValue = steps[currentStep].pct;
          this.freezeStep = steps[currentStep].msg;
          currentStep++;
        }, 600);
      },
      error: (err) => {
        this.isFreezing = false;
        this.showFreezeModal = false;
        this.toast.show(err.error?.detail || 'Erro ao encerrar.', 'error');
      }
    });
  }

  openSeasonModal() {
    this.newSeasonYear = new Date().getFullYear() + 1;
    this.showSeasonModal = true;
  }

  confirmCreateSeason() {
    this.showSeasonModal = false;
    this.adminService.createSeason(this.newSeasonYear).subscribe({
      next: (season) => {
        this.toast.show(`Temporada ${this.newSeasonYear} criada!`, 'success');
        this.loadSeasons();
      },
      error: (err) => this.toast.show(err.error?.detail || 'Erro ao criar.', 'error')
    });
  }

  openModal(race: any = null) {
    if (race) {
      this.isEditing = true;
      this.editingId = race.id;
      this.showModal = true; 
      
      this.form = {
        name: race.name,
        country: race.country,
        race_date: this.formatDateForInput(race.race_date),
        bets_open_at: this.formatDateForInput(race.bets_open_at),
        bets_close_at: this.formatDateForInput(race.bets_close_at)
      };
    } else {
      this.isEditing = false;
      this.editingId = null;
      this.form = { name: '', country: '', race_date: '', bets_open_at: '', bets_close_at: '' };
      this.showModal = true;
    }
  }

  // A MÁGICA ESTÁ AQUI: Extração pura do texto, sem instanciar new Date() e evitar somar 3 horas!
  private formatDateForInput(dateStr: string): string {
    if (!dateStr) return '';
    // Troca espaço por 'T' caso venha do banco e pega os primeiros 16 caracteres (YYYY-MM-DDTHH:MM)
    return dateStr.replace(' ', 'T').substring(0, 16);
  }

  saveRace() {
    if (!this.form.name || !this.form.country || !this.form.race_date || !this.form.bets_close_at) {
      this.toast.show('Preencha os campos obrigatórios!', 'error');
      return;
    }

    const payload = {
      ...this.form,
      race_date: this.ensureISO(this.form.race_date),
      bets_open_at: this.form.bets_open_at ? this.ensureISO(this.form.bets_open_at) : null,
      bets_close_at: this.ensureISO(this.form.bets_close_at)
    };

    const action$ = (this.isEditing && this.editingId) 
      ? this.adminService.updateRace(this.editingId, payload)
      : this.adminService.createRace(payload);

    action$.subscribe({
      next: () => {
        this.toast.show(this.isEditing ? 'Corrida atualizada!' : 'Corrida criada!', 'success');
        this.showModal = false;
        this.loadRaces();
      },
      error: () => this.toast.show('Erro ao salvar.', 'error')
    });
  }

  private ensureISO(dateStr: string): string {
    if (dateStr.length === 16) return dateStr + ':00'; 
    return dateStr;
  }

  confirmDeleteRace(race: any) {
    this.raceToDelete = race;
    this.showDeleteModal = true;
  }

  deleteRace() {
    if (!this.raceToDelete) return;
    this.adminService.deleteRace(this.raceToDelete.id).subscribe({
      next: () => {
        this.toast.show('Corrida excluída.', 'success');
        this.loadRaces();
        this.showDeleteModal = false;
        this.raceToDelete = null;
      },
      error: (err) => {
        this.toast.show(err.error?.detail || 'Erro ao excluir.', 'error');
        this.showDeleteModal = false;
      }
    });
  }

  toggleStatus(race: any) {
    let nextStatus = 'OPEN';
    if (race.status === 'OPEN') nextStatus = 'CLOSED';
    if (race.status === 'CLOSED') nextStatus = 'OPEN';
    if (race.status === 'FINISHED') return;

    this.adminService.updateRaceStatus(race.id, nextStatus).subscribe({
      next: () => {
        this.toast.show(`Status alterado para ${nextStatus}`, 'success');
        this.loadRaces();
      },
      error: () => this.toast.show('Erro ao alterar status', 'error')
    });
  }

  viewResults(race: any) {
    this.selectedRaceForResults = race;
    this.showResultModal = true;
  }

  getStatusClass(status: string) {
    switch(status) {
      case 'OPEN': return 'bg-green-900/20 text-green-400 border-green-500/30';
      case 'CLOSED': return 'bg-red-900/20 text-red-400 border-red-500/30';
      case 'FINISHED': return 'bg-gray-800 text-gray-400 border-gray-700';
      default: return 'bg-yellow-900/20 text-yellow-500 border-yellow-500/30';
    }
  }

  getStatusLabel(status: string) {
    switch(status) {
      case 'OPEN': return 'Apostas Abertas';
      case 'CLOSED': return 'Fechada';
      case 'FINISHED': return 'Finalizada';
      default: return 'Agendada';
    }
  }
}