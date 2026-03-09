import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../../services/admin';
import { AchievementService } from '../../../../services/achievement'; 
import { ToastService } from '../../../../services/toast';

@Component({
  selector: 'app-admin-achievements',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-achievements.html',
  styleUrl: './admin-achievements.css'
})
export class AdminAchievements implements OnInit {
  private adminService = inject(AdminService);
  private achievementService = inject(AchievementService);
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