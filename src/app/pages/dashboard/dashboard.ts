import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Navbar } from '../../components/navbar/navbar';
import { BetService } from '../../services/bet';
import { UserService } from '../../services/user';
import { AchievementService } from '../../services/achievement';
import { RivalryService } from '../../services/rivalry';
import { ResultViewerComponent } from '../../components/result-viewer/result-viewer';
import { Footer } from '../../components/footer/footer';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, Navbar, ResultViewerComponent, Footer],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit, OnDestroy {
  currentYear = new Date().getFullYear();

  private http = inject(HttpClient);
  private betService = inject(BetService);
  private userService = inject(UserService);
  private achievementService = inject(AchievementService);
  private rivalryService = inject(RivalryService);
  
  private readonly API_URL = environment.imageBaseUrl;

  // Dados da Temporada
  nextRace: any = null;
  futureRaces: any[] = [];
  pastRaces: any[] = [];
  seasonProgress = 0;
  
  // Dados do Usuário
  currentUser: any = null;
  userStats: any = null; 
  hasBetOnNextRace = false;
  userHistory: any[] = [];
  chartPoints: string = '';
  lastRacePoints: number = 0;
  totalPoints: number = 0; // <--- CORREÇÃO: Variável reintroduzida
  
  // Rivais
  activeDuel: any = null;
  pendingInvitesCount = 0;

  // Modal
  showResultModal = false;
  selectedRaceId: number | null = null;
  isLoading = true;

  // Cronômetro
  countdownText: string = '';
  countdownLabel: string = 'FECHAMENTO EM';
  private timerInterval: any;
  isBettingClosed = false;
  isUpcomingOpen = false;

  ngOnInit() {
    this.userService.getMe().subscribe(user => {
      this.currentUser = user;
      
      // Busca perfil completo (com ranking)
      this.userService.getPublicProfile(user.id).subscribe(profile => {
        this.userStats = profile;
      });

      this.loadSeasonData();
      this.loadUserStats();
      this.loadRivals();
      this.achievementService.triggerCheck();
    });
  }

  ngOnDestroy() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  loadSeasonData() {
    this.betService.getAllRaces().subscribe({
      next: (races) => {
        this.processRaces(races);
        if (this.nextRace) {
          this.checkUserBets();
          this.startCountdown();
        }
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  loadUserStats() {
    this.userService.getHistory().subscribe(history => {
      this.userHistory = history;
      if (history.length > 0) {
        this.lastRacePoints = history[0].points;
      }
      
      // CORREÇÃO: Recalcula o total de pontos baseado no histórico
      this.totalPoints = history.reduce((acc, curr) => acc + curr.points, 0);

      this.generateChart(history.slice(0, 6).reverse());
    });
  }

  loadRivals() {
    this.rivalryService.getMyRivals().subscribe(rivals => {
      this.pendingInvitesCount = rivals.filter(r => r.status === 'PENDING' && r.opponent_id === this.currentUser.id).length;
      this.activeDuel = rivals.find(r => r.status === 'ACCEPTED');
    });
  }

  generateChart(data: any[]) {
    if (data.length < 2) return;
    
    const maxPoints = Math.max(...data.map(d => d.points), 15);
    const width = 100; 
    const step = width / (data.length - 1);
    
    this.chartPoints = data.map((d, i) => {
      const x = i * step;
      const y = 100 - ((d.points / maxPoints) * 80); 
      return `${x},${y}`;
    }).join(' ');
  }

  checkUserBets() {
    this.betService.getMyBets().subscribe({
      next: (bets) => {
        const bet = bets.find(b => b.race_id === this.nextRace.id);
        this.hasBetOnNextRace = !!bet;
      },
      error: () => {}
    });
  }

  processRaces(races: any[]) {
    const finished = races.filter(r => r.status === 'FINISHED');
    const upcoming = races.filter(r => r.status !== 'FINISHED');

    this.pastRaces = finished.sort((a, b) => new Date(b.race_date).getTime() - new Date(a.race_date).getTime());
    const sortedUpcoming = upcoming.sort((a, b) => new Date(a.race_date).getTime() - new Date(b.race_date).getTime());

    if (sortedUpcoming.length > 0) {
      this.nextRace = sortedUpcoming[0];
      this.futureRaces = sortedUpcoming.slice(1);
    } else {
      this.nextRace = null;
      this.futureRaces = [];
    }

    const total = races.length;
    const done = finished.length;
    this.seasonProgress = total > 0 ? Math.round((done / total) * 100) : 0;
  }

  startCountdown() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    const now = new Date().getTime();
    let targetDateStr = this.nextRace.bets_close_at || this.nextRace.race_date;
    
    if (this.nextRace.status === 'SCHEDULED' && this.nextRace.bets_open_at) {
        const openTime = new Date(this.nextRace.bets_open_at).getTime();
        if (openTime > now) {
            this.isUpcomingOpen = true;
            this.countdownLabel = 'ABERTURA EM';
            targetDateStr = this.nextRace.bets_open_at;
        } else {
            this.isUpcomingOpen = false;
            this.countdownLabel = 'BOX FECHA EM';
        }
    } else {
        this.isUpcomingOpen = false;
        this.countdownLabel = 'BOX FECHA EM';
    }
    
    const targetDate = new Date(targetDateStr).getTime();
    this.updateTimer(targetDate);
    this.timerInterval = setInterval(() => this.updateTimer(targetDate), 1000);
  }

  updateTimer(targetDate: number) {
    const now = new Date().getTime();
    const distance = targetDate - now;

    if (distance < 0) {
      clearInterval(this.timerInterval);
      if (this.isUpcomingOpen) {
          this.countdownText = "ABRINDO...";
          this.isUpcomingOpen = false;
          setTimeout(() => this.loadSeasonData(), 2000); 
      } else {
          this.countdownText = "00:00:00";
          this.isBettingClosed = true;
          this.countdownLabel = 'TEMPO ESGOTADO';
      }
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);
    
    let text = '';
    if (days > 0) text += `${days}d `;
    text += `${this.pad(hours)}:${this.pad(minutes)}:${this.pad(seconds)}`;
    this.countdownText = text;
  }

  pad(num: number): string { return num < 10 ? '0' + num : num.toString(); }
  
  getOpponent(rivalry: any) {
    if (!rivalry || !this.currentUser) return null;
    return rivalry.challenger_id === this.currentUser.id ? rivalry.opponent : rivalry.challenger;
  }

  getPhotoUrl(url: string | null): string {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `${this.API_URL}${url.startsWith('/') ? '' : '/'}${url}`;
  }

  getInitials(name: string): string {
    if (!name) return '?';
    return name.charAt(0).toUpperCase();
  }

  openResult(race: any) {
    this.selectedRaceId = race.id;
    this.showResultModal = true;
  }
}