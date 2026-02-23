import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../../services/admin';
import { AchievementService } from '../../../../services/achievement'; // <--- Injetar este
import { ToastService } from '../../../../services/toast';

@Component({
  selector: 'app-admin-achievements',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-achievements.html',
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
  `]
})
export class AdminAchievements implements OnInit {
  private adminService = inject(AdminService);
  private achievementService = inject(AchievementService); // <--- Usar este para listar
  private toast = inject(ToastService);

  achievements: any[] = [];
  showModal = false;
  
  form: any = {
    name: '', description: '', icon: '🏆', color: 'gold', rule_type: 'TOTAL_POINTS', threshold: 100
  };

  ngOnInit() {
    this.loadAchievements();
  }

  loadAchievements() {
    this.achievementService.getAll().subscribe({
      next: (data) => this.achievements = data,
      error: () => this.toast.show('Erro ao carregar conquistas.', 'error')
    });
  }

  openModal() {
    this.form = { name: '', description: '', icon: '🏆', color: 'gold', rule_type: 'TOTAL_POINTS', threshold: 100 };
    this.showModal = true;
  }

  create() {
    this.adminService.createAchievement(this.form).subscribe({
      next: () => {
        this.toast.show('Conquista criada!', 'success');
        this.showModal = false;
        this.loadAchievements();
      },
      error: (e) => this.toast.show(e.error?.detail || 'Erro ao criar.', 'error')
    });
  }

  deleteAchievement(ach: any) {
    if (!confirm(`Excluir a conquista "${ach.name}"?`)) return;
    
    this.adminService.deleteAchievement(ach.id).subscribe({
      next: () => {
        this.toast.show('Removido com sucesso.', 'success');
        this.loadAchievements();
      },
      error: () => this.toast.show('Erro ao remover.', 'error')
    });
  }
}