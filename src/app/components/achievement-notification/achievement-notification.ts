import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AchievementService } from '../../services/achievement';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-achievement-notification',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './achievement-notification.html',
  styleUrls: ['./achievement-notification.css']
})
export class AchievementNotification implements OnInit, OnDestroy {
  private achievementService = inject(AchievementService);
  private sub: Subscription | null = null;

  queue: any[] = [];
  currentBadge: any = null;

  ngOnInit() {
    this.checkNewAchievements();

    // Escuta o gatilho do Dashboard
    this.sub = this.achievementService.checkTrigger$.subscribe(() => {
      this.checkNewAchievements();
    });
  }

  ngOnDestroy() {
    if (this.sub) this.sub.unsubscribe();
  }

  checkNewAchievements() {
    // Se já tem algo na tela, não busca de novo para não sobrepor
    if (this.currentBadge) return;

    this.achievementService.getNewAchievements().subscribe(badges => {
      if (badges && badges.length > 0) {
        // Filtra duplicados locais (caso a API retorne o mesmo antes de marcar como visto)
        const newItems = badges.filter(b => !this.queue.find(q => q.id === b.id));
        this.queue.push(...newItems);
        
        if (!this.currentBadge) {
          this.showNext();
        }
      }
    });
  }

  showNext() {
    if (this.queue.length === 0) {
      this.currentBadge = null;
      return;
    }
    this.currentBadge = this.queue.shift();
  }

  next() {
    if (!this.currentBadge) return;

    // Marca como visto e avança
    this.achievementService.markAsSeen([this.currentBadge.id]).subscribe(() => {
        this.showNext();
    });
  }

  // Helper para cor do glow
  getGlowColor(color: string): string {
    const map: any = {
      gold: '#eab308',
      silver: '#9ca3af',
      bronze: '#ea580c',
      red: '#ef4444',
      blue: '#3b82f6',
      green: '#22c55e',
      purple: '#a855f7'
    };
    return map[color] || '#eab308';
  }
}