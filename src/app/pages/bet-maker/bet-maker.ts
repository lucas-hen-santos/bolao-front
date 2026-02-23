import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Navbar } from '../../components/navbar/navbar';
import { BetService } from '../../services/bet';
import { ToastService } from '../../services/toast';
import { Footer } from '../../components/footer/footer';

@Component({
  selector: 'app-bet-maker',
  standalone: true,
  imports: [CommonModule, Navbar, FormsModule, RouterModule, Footer],
  templateUrl: './bet-maker.html',
  styleUrl: './bet-maker.css'
})
export class BetMaker implements OnInit, OnDestroy {
  private betService = inject(BetService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toastService = inject(ToastService);

  raceId: number = 0;
  raceInfo: any = null;

  allDrivers: any[] = [];
  allTeams: any[] = [];

  top10Selections: (number | null)[] = new Array(10).fill(null);

  selectedPole: number | null = null;
  selectedDotd: number | null = null;
  selectedTeamWinner: number | null = null;

  isLoading = true;
  isSubmitting = false;

  // Cronômetro
  countdownText: string = '';
  private timerInterval: any;
  isBettingClosed = false;

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.raceId = Number(params['raceId']);
      if (this.raceId) {
        this.loadData();
      }
    });
  }

  ngOnDestroy() {
    if (this.timerInterval) clearInterval(this.timerInterval);
  }

  loadData() {
    this.betService.getAllRaces().subscribe(races => {
      this.raceInfo = races.find(r => r.id === this.raceId);
      if (this.raceInfo) this.startCountdown();
    });

    this.betService.getDrivers().subscribe(drivers => {
      this.allDrivers = drivers.sort((a, b) => a.number - b.number);
      this.betService.getTeams().subscribe(teams => {
        this.allTeams = teams;
        this.loadExistingBet();
      });
    });
  }

  loadExistingBet() {
    this.betService.getMyBets().subscribe({
      next: (bets) => {
        const myBet = bets.find(b => b.race_id === this.raceId);
        if (myBet) {
          this.selectedPole = myBet.pole_driver_id;
          this.selectedDotd = myBet.dotd_driver_id;
          this.selectedTeamWinner = myBet.winning_team_id;
          this.top10Selections = [
            myBet.p1_driver_id, myBet.p2_driver_id, myBet.p3_driver_id, myBet.p4_driver_id, myBet.p5_driver_id,
            myBet.p6_driver_id, myBet.p7_driver_id, myBet.p8_driver_id, myBet.p9_driver_id, myBet.p10_driver_id
          ];
        }
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  // --- APOSTA RÁPIDA ---
  randomizeBet() {
    if (this.isBettingClosed) return;

    // 1. Embaralhar pilotos para o Top 10
    const shuffled = [...this.allDrivers].sort(() => 0.5 - Math.random());
    
    // Preenche as 10 primeiras posições
    this.top10Selections = shuffled.slice(0, 10).map(d => d.id);

    // 2. Sortear Extras
    this.selectedPole = this.getRandomItem(this.allDrivers).id;
    this.selectedDotd = this.getRandomItem(this.allDrivers).id;
    this.selectedTeamWinner = this.getRandomItem(this.allTeams).id;

    this.toastService.show('Os dados foram lançados! 🎲', 'info');
  }

  private getRandomItem(array: any[]) {
    return array[Math.floor(Math.random() * array.length)];
  }

  // --- Helpers Visuais ---
  getDriverById(id: number | null) {
    if (!id) return null;
    return this.allDrivers.find(d => d.id === id);
  }

  getTeamById(id: number | null) {
    if (!id) return null;
    return this.allTeams.find(t => t.id === id);
  }

  // --- Cronômetro ---
  startCountdown() {
    const targetDateStr = this.raceInfo.bets_close_at || this.raceInfo.race_date;
    const targetDate = new Date(targetDateStr).getTime();
    this.updateTimer(targetDate);
    this.timerInterval = setInterval(() => this.updateTimer(targetDate), 1000);
  }

  updateTimer(targetDate: number) {
    const now = new Date().getTime();
    const distance = targetDate - now;
    if (distance < 0) {
      this.countdownText = "00d 00h 00m 00s";
      this.isBettingClosed = true;
      clearInterval(this.timerInterval);
      return;
    }
    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);
    this.countdownText = `${days > 0 ? days + 'd ' : ''}${this.pad(hours)}h ${this.pad(minutes)}m ${this.pad(seconds)}s`;
  }

  pad(num: number) { return num < 10 ? '0' + num : num.toString(); }

  // --- Validações ---
  
  // Retorna o índice onde o piloto selecionado já aparece (duplicata), ou -1 se não houver
  getDuplicatePosition(driverId: number | null, currentIndex: number): number {
    if (!driverId) return -1;
    return this.top10Selections.findIndex((id, index) => id === driverId && index !== currentIndex);
  }

  hasDuplicates(): boolean {
    const ids = this.top10Selections.filter(id => id !== null);
    return new Set(ids).size !== ids.length;
  }

  isValid(): boolean {
    const top10Filled = this.top10Selections.every(id => id !== null);
    const extrasFilled = !!this.selectedPole && !!this.selectedDotd && !!this.selectedTeamWinner;
    
    // Impede o envio se houver duplicatas ou campos vazios
    return top10Filled && extrasFilled && !this.hasDuplicates() && !this.isBettingClosed;
  }

  submitBet() {
    if (!this.isValid()) {
      if (this.hasDuplicates()) {
        this.toastService.show('Você selecionou o mesmo piloto mais de uma vez!', 'error');
      } else {
        this.toastService.show('Preencha todos os campos do grid!', 'error');
      }
      return;
    }

    this.isSubmitting = true;
    const betData = {
      race_id: this.raceId,
      pole_driver_id: this.selectedPole,
      dotd_driver_id: this.selectedDotd,
      winning_team_id: this.selectedTeamWinner,
      p1_driver_id: this.top10Selections[0],
      p2_driver_id: this.top10Selections[1],
      p3_driver_id: this.top10Selections[2],
      p4_driver_id: this.top10Selections[3],
      p5_driver_id: this.top10Selections[4],
      p6_driver_id: this.top10Selections[5],
      p7_driver_id: this.top10Selections[6],
      p8_driver_id: this.top10Selections[7],
      p9_driver_id: this.top10Selections[8],
      p10_driver_id: this.top10Selections[9],
    };

    this.betService.submitBet(betData).subscribe({
      next: () => {
        this.toastService.show('Aposta Salva com Sucesso! 🏁', 'success');
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.toastService.show(err.error?.detail || 'Erro ao salvar.', 'error');
        this.isSubmitting = false;
      }
    });
  }
}