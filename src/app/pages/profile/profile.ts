import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ImageCropperComponent, ImageCroppedEvent } from 'ngx-image-cropper';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

import { Navbar } from '../../components/navbar/navbar';
import { Footer } from '../../components/footer/footer';
import { UserService } from '../../services/user';
import { BetService } from '../../services/bet';
import { ToastService } from '../../services/toast';
import { AchievementService } from '../../services/achievement';
import { RivalryService } from '../../services/rivalry';
import { PushService } from '../../services/push'; // <--- Importar
import { environment } from '../../../environments/environment';
// import { environment } from '../../environments/environment';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, Navbar, FormsModule, ImageCropperComponent, Footer, RouterModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile implements OnInit {
  private userService = inject(UserService);
  private betService = inject(BetService);
  private toast = inject(ToastService);
  private sanitizer = inject(DomSanitizer);
  private achievementService = inject(AchievementService);
  private rivalryService = inject(RivalryService);
  public pushService = inject(PushService); // <--- Injeção
  
  private readonly API_URL = environment.imageBaseUrl;

  user: any = null;
  userInitial: string = '?';
  
  allHistory: any[] = [];
  filteredHistory: any[] = [];
  
  // Conquistas
  myBadges: any[] = [];
  allBadges: any[] = [];
  badgesLimit = 5;
  isBadgesExpanded = false;

  // Rivais
  rivalryStats = { wins: 0, losses: 0, draws: 0, total: 0 };

  stats = {
    totalPoints: 0,
    racesParticipated: 0,
    avgPoints: 0,
    poleAccuracy: 0,
    podiumAccuracy: 0,
    recentPerformance: [] as number[]
  };

  seasons: number[] = [];
  selectedSeason: number | null = null;
  expandedRaceId: number | null = null;
  
  drivers: any[] = [];
  teams: any[] = [];
  isLoading = true;

  // Edição de Perfil
  showEditModal = false;
  isSaving = false;
  showCropper = false;
  imageChangedEvent: any = '';
  croppedImage: SafeUrl = '';
  finalBlob: Blob | null = null;
  editName = '';
  editFile: File | null = null;
  editPhotoPreview: string | null = null;

  ngOnInit() {
    this.loadAuxData();
  }

  loadAuxData() {
    this.betService.getDrivers().subscribe(d => {
      this.drivers = d;
      this.betService.getTeams().subscribe(t => {
        this.teams = t;
        this.loadProfile();
      });
    });
  }

  loadProfile() {
    this.userService.getMe().subscribe({
      next: (u) => {
        this.user = u;
        this.userInitial = u.full_name.charAt(0).toUpperCase();
        this.loadHistory();
        this.loadBadges();
        this.loadRivals(u.id);
      },
      error: () => this.isLoading = false
    });
  }

  loadHistory() {
    this.userService.getHistory().subscribe({
      next: (data) => {
        this.allHistory = data;
        this.processSeasons();
        this.filterHistory();
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  processSeasons() {
    const years = new Set(this.allHistory.map(h => new Date(h.race_date).getFullYear()));
    this.seasons = Array.from(years).sort((a, b) => b - a);
    if (this.seasons.length > 0) this.selectedSeason = this.seasons[0];
  }

  filterHistory() {
    if (!this.selectedSeason) {
      this.filteredHistory = this.allHistory;
    } else {
      this.filteredHistory = this.allHistory.filter(h => 
        new Date(h.race_date).getFullYear() == this.selectedSeason
      );
    }
    this.calculateTelemetry(); 
  }

  calculateTelemetry() {
    if (this.filteredHistory.length === 0) {
      this.stats = { totalPoints: 0, racesParticipated: 0, avgPoints: 0, poleAccuracy: 0, podiumAccuracy: 0, recentPerformance: [] };
      return;
    }

    this.stats.totalPoints = this.filteredHistory.reduce((acc, curr) => acc + curr.points, 0);
    this.stats.racesParticipated = this.filteredHistory.length;
    this.stats.avgPoints = Math.round(this.stats.totalPoints / this.stats.racesParticipated);

    let polesHit = 0;
    let podiumsHit = 0; 

    this.filteredHistory.forEach(h => {
      const myBet = h.my_bet;
      const official = h.official_result;
      
      if (myBet.pole_driver_id === official.pole_driver_id) polesHit++;
      if (myBet.p1_driver_id === official.p1_driver_id) podiumsHit++;
      if (myBet.p2_driver_id === official.p2_driver_id) podiumsHit++;
      if (myBet.p3_driver_id === official.p3_driver_id) podiumsHit++;
    });

    this.stats.poleAccuracy = Math.round((polesHit / this.stats.racesParticipated) * 100);
    const totalPodiumSlots = this.stats.racesParticipated * 3;
    this.stats.podiumAccuracy = Math.round((podiumsHit / totalPodiumSlots) * 100);
    this.stats.recentPerformance = this.filteredHistory.slice(0, 5).map(h => h.points).reverse();
  }

  loadRivals(userId: number) {
    this.rivalryService.getUserHistory(userId).subscribe(history => {
      let w = 0, l = 0, d = 0;
      history.forEach(r => {
        if (r.winner_id === userId) w++;
        else if (r.winner_id === null) d++;
        else l++;
      });
      this.rivalryStats = { wins: w, losses: l, draws: d, total: history.length };
    });
  }

  loadBadges() {
    this.achievementService.getAll().subscribe(all => {
      this.allBadges = all;
      this.achievementService.getMyAchievements().subscribe(mine => {
        this.myBadges = mine.sort((a, b) => new Date(b.earned_at).getTime() - new Date(a.earned_at).getTime());
      });
    });
  }

  getLockedBadges() {
    const myBadgeIds = new Set(this.myBadges.map(ub => ub.achievement_id));
    return this.allBadges.filter(b => !myBadgeIds.has(b.id));
  }

  get displayedBadges() {
    const locked = this.getLockedBadges();
    const allItems = [...this.myBadges, ...locked];
    return this.isBadgesExpanded ? allItems : allItems.slice(0, this.badgesLimit);
  }
  
  get hasMoreBadges() {
    const total = this.myBadges.length + this.getLockedBadges().length;
    return total > this.badgesLimit;
  }

  toggleBadgesView() {
    this.isBadgesExpanded = !this.isBadgesExpanded;
  }

  openEditModal() {
    this.editName = this.user.full_name;
    this.editPhotoPreview = this.getPhotoUrl(this.user.profile_image_url);
    this.editFile = null;
    this.showEditModal = true;
  }

  onFileSelected(event: any) {
    this.imageChangedEvent = event;
    this.showCropper = true;
  }

  imageCropped(event: ImageCroppedEvent) {
    if (event.objectUrl && event.blob) {
      this.croppedImage = this.sanitizer.bypassSecurityTrustUrl(event.objectUrl);
      this.finalBlob = event.blob;
    }
  }

  loadImageFailed() {
    this.toast.show('Erro na imagem', 'error');
    this.cancelCrop();
  }

  confirmCrop() {
    if (!this.finalBlob) return;
    const file = new File([this.finalBlob], "avatar.png", { type: "image/png" });
    this.editFile = file;
    this.editPhotoPreview = URL.createObjectURL(this.finalBlob);
    this.showCropper = false;
    this.imageChangedEvent = '';
  }

  cancelCrop() {
    this.showCropper = false;
    this.imageChangedEvent = '';
  }

  saveProfile() {
    if (!this.editName) return;
    this.isSaving = true;

    this.userService.updateProfile(this.editName, this.editFile).subscribe({
      next: (updatedUser) => {
        this.user = updatedUser;
        this.userInitial = updatedUser.full_name.charAt(0).toUpperCase();
        this.toast.show('Perfil atualizado!', 'success');
        this.showEditModal = false;
        this.isSaving = false;
      },
      error: () => {
        this.toast.show('Erro ao atualizar.', 'error');
        this.isSaving = false;
      }
    });
  }

  getPhotoUrl(url: string | null): string {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `${this.API_URL}${url.startsWith('/') ? '' : '/'}${url}`;
  }
  
  toggleRace(race: any) {
    const id = race.my_bet.id; 
    this.expandedRaceId = this.expandedRaceId === id ? null : id;
  }

  getDriverName(id: number): string {
    const d = this.drivers.find(x => x.id === id);
    return d ? `#${d.number} ${d.name}` : '-';
  }

  getTeamName(id: number): string {
    const t = this.teams.find(x => x.id === id);
    return t ? t.name : '-';
  }

  isHit(myId: number, officialId: number): boolean {
    return myId === officialId;
  }
  
  copyShareLink() {
    const url = `${window.location.origin}/u/${this.user.id}`;
    navigator.clipboard.writeText(url).then(() => {
      this.toast.show('Link do perfil copiado! 🔗', 'success');
    });
  }

  getBadgeStyle(color: string, isLocked: boolean) {
    if (isLocked) return 'grayscale opacity-30 border-gray-800 bg-gray-900';
    const colors: any = {
      gold:   'from-yellow-600/20 to-yellow-900/40 border-yellow-500/50 shadow-yellow-500/20 text-yellow-500',
      silver: 'from-gray-400/20 to-gray-700/40 border-gray-400/50 shadow-gray-400/20 text-gray-300',
      bronze: 'from-orange-700/20 to-orange-900/40 border-orange-600/50 shadow-orange-600/20 text-orange-500',
      red:    'from-red-600/20 to-red-900/40 border-red-500/50 shadow-red-500/20 text-red-500',
      blue:   'from-blue-600/20 to-blue-900/40 border-blue-500/50 shadow-blue-500/20 text-blue-400',
      green:  'from-green-600/20 to-green-900/40 border-green-500/50 shadow-green-500/20 text-green-400',
      purple: 'from-purple-600/20 to-purple-900/40 border-purple-500/50 shadow-purple-500/20 text-purple-400',
    };
    return colors[color] || colors['gold'];
  }
}