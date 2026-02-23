import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { UserService } from '../../services/user';
import { AchievementService } from '../../services/achievement';
import { RivalryService } from '../../services/rivalry';
import { ToastService } from '../../services/toast';
import { Navbar } from '../../components/navbar/navbar';
import { Footer } from '../../components/footer/footer';
import { environment } from '../../../environments/environment';
// import { environment } from '../../environments/environment'; // <--- Importar

@Component({
  selector: 'app-public-profile',
  standalone: true,
  imports: [CommonModule, Navbar, Footer, RouterModule],
  templateUrl: './public-profile.html',
  styles: [``]
})
export class PublicProfile implements OnInit {
  private route = inject(ActivatedRoute);
  private userService = inject(UserService);
  private achievementService = inject(AchievementService);
  private rivalryService = inject(RivalryService);
  private toast = inject(ToastService);
  
  readonly API_URL = environment.imageBaseUrl; // <--- Atualizado

  // ... (Restante do código mantido idêntico ao arquivo anteriormente fornecido, apenas trocando URL fixa pela variável) ...
  user: any = null;
  currentUser: any = null;
  isLoading = true;
  userInitial = '?';
  isChallenging = false;
  confirmChallenge = false;
  rivalryStats = { wins: 0, losses: 0, draws: 0, total: 0 };
  rivalryHistory: any[] = [];
  userBadges: any[] = [];
  allBadges: any[] = [];
  badgesLimit = 5;
  isBadgesExpanded = false;

  ngOnInit() {
    this.userService.getMe().subscribe(me => this.currentUser = me);
    this.route.params.subscribe(params => { const id = params['id']; if (id) this.loadData(id); });
  }

  loadData(id: number) {
    this.isLoading = true;
    this.userService.getPublicProfile(id).subscribe({
      next: (data) => {
        this.user = data;
        this.userInitial = data.name ? data.name.charAt(0).toUpperCase() : '?';
        this.userBadges = data.badges.sort((a: any, b: any) => new Date(b.earned_at).getTime() - new Date(a.earned_at).getTime());
        this.achievementService.getAll().subscribe(all => this.allBadges = all);
        this.loadRivalryHistory(id);
      },
      error: () => this.isLoading = false
    });
  }

  loadRivalryHistory(userId: number) {
    this.rivalryService.getUserHistory(userId).subscribe({
      next: (history) => {
        this.rivalryHistory = history;
        let w = 0, l = 0, d = 0;
        history.forEach(r => { if (r.winner_id === userId) w++; else if (r.winner_id === null) d++; else l++; });
        this.rivalryStats = { wins: w, losses: l, draws: d, total: history.length };
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  challengeUser() {
    if (!this.user || !this.currentUser) return;
    if (this.user.id === this.currentUser.id) { this.toast.show("Você não pode desafiar a si mesmo.", 'error'); return; }
    if (!this.confirmChallenge) { this.confirmChallenge = true; setTimeout(() => this.confirmChallenge = false, 3000); return; }
    this.isChallenging = true; this.confirmChallenge = false;
    this.rivalryService.createChallenge(this.user.id).subscribe({
        next: () => { this.toast.show(`Desafio enviado para ${this.user.name}! ⚔️`, 'success'); this.isChallenging = false; },
        error: (e) => { this.toast.show(e.error?.detail || "Erro ao desafiar.", 'error'); this.isChallenging = false; }
    });
  }

  getLockedBadges() { const myBadgeIds = new Set(this.userBadges.map(ub => ub.achievement.id)); return this.allBadges.filter(b => !myBadgeIds.has(b.id)); }
  get displayedBadges() { const locked = this.getLockedBadges(); const allItems = [...this.userBadges, ...locked]; return this.isBadgesExpanded ? allItems : allItems.slice(0, this.badgesLimit); }
  get hasMoreBadges() { return (this.userBadges.length + this.getLockedBadges().length) > this.badgesLimit; }
  toggleBadgesView() { this.isBadgesExpanded = !this.isBadgesExpanded; }
  
  getPhotoUrl(url: string | null): string {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `${this.API_URL}${url.startsWith('/') ? '' : '/'}${url}`;
  }

  getBadgeStyle(color: string, isLocked: boolean) {
    if (isLocked) return 'grayscale opacity-30 border-gray-800 bg-gray-900';
    const colors: any = {
      gold: 'from-yellow-600/20 to-yellow-900/40 border-yellow-500/50 shadow-yellow-500/20 text-yellow-500',
      silver: 'from-gray-400/20 to-gray-700/40 border-gray-400/50 shadow-gray-400/20 text-gray-300',
      bronze: 'from-orange-700/20 to-orange-900/40 border-orange-600/50 shadow-orange-600/20 text-orange-500',
      red: 'from-red-600/20 to-red-900/40 border-red-500/50 shadow-red-500/20 text-red-500',
      blue: 'from-blue-600/20 to-blue-900/40 border-blue-500/50 shadow-blue-500/20 text-blue-400',
      green: 'from-green-600/20 to-green-900/40 border-green-500/50 shadow-green-500/20 text-green-400',
      purple: 'from-purple-600/20 to-purple-900/40 border-purple-500/50 shadow-purple-500/20 text-purple-400',
    };
    return colors[color] || colors['gold'];
  }
  
  // Helpers de Rivais
  getRivalName(rivalry: any): string { const opponent = rivalry.challenger_id === this.user.id ? rivalry.opponent : rivalry.challenger; return opponent ? opponent.full_name : 'Desconhecido'; }
  getRivalResultClass(rivalry: any): string { if (rivalry.winner_id === this.user.id) return 'text-green-500'; if (rivalry.winner_id === null) return 'text-gray-400'; return 'text-red-500'; }
  getRivalResultLabel(rivalry: any): string { if (rivalry.winner_id === this.user.id) return 'VIT'; if (rivalry.winner_id === null) return 'EMP'; return 'DER'; }
}