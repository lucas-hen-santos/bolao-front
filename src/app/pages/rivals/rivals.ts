import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Navbar } from '../../components/navbar/navbar';
import { Footer } from '../../components/footer/footer';
import { RivalryService } from '../../services/rivalry';
import { UserService } from '../../services/user';
import { ToastService } from '../../services/toast';
import { environment } from '../../../environments/environment';
// import { environment } from '../../environments/environment'; // <--- Importar

@Component({
  selector: 'app-rivals',
  standalone: true,
  imports: [CommonModule, Navbar, Footer, FormsModule, RouterModule],
  templateUrl: './rivals.html',
  styleUrl: './rivals.css'
})
export class Rivals implements OnInit {
  private rivalryService = inject(RivalryService);
  private userService = inject(UserService);
  private toast = inject(ToastService);

  private readonly API_URL = environment.imageBaseUrl; // <--- Atualizado

  currentUser: any = null;
  isLoading = true;

  // ... (Variáveis mantidas: listas, modal, etc)
  pendingReceived: any[] = [];
  pendingSent: any[] = [];
  activeRivalries: any[] = [];
  historyRivalries: any[] = [];
  showNewChallengeModal = false;
  usersList: any[] = [];
  selectedOpponentId: number | null = null;
  isCreating = false;
  searchTerm = ''; 

  ngOnInit() {
    this.userService.getMe().subscribe(user => {
      this.currentUser = user;
      this.loadRivals();
    });
  }

  loadRivals() {
    this.isLoading = true;
    this.rivalryService.getMyRivals().subscribe({
      next: (data) => {
        this.organizeRivals(data);
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  organizeRivals(data: any[]) {
    this.pendingReceived = [];
    this.pendingSent = [];
    this.activeRivalries = [];
    this.historyRivalries = [];
    data.forEach(r => {
      if (r.status === 'PENDING') {
        if (r.opponent_id === this.currentUser.id) this.pendingReceived.push(r);
        else this.pendingSent.push(r);
      } else if (r.status === 'ACCEPTED') {
        this.activeRivalries.push(r);
      } else { 
        this.historyRivalries.push(r);
      }
    });
  }

  // ... (Métodos de Ação: accept, decline, modal...)
  accept(id: number) {
    this.rivalryService.acceptChallenge(id).subscribe({
      next: () => { this.toast.show('Desafio aceito! ⚔️', 'success'); this.loadRivals(); },
      error: (e) => this.toast.show(e.error?.detail, 'error')
    });
  }
  decline(id: number) {
    if(!confirm('Recusar este duelo?')) return;
    this.rivalryService.declineChallenge(id).subscribe({
      next: () => { this.toast.show('Desafio recusado.', 'info'); this.loadRivals(); },
      error: (e) => this.toast.show(e.error?.detail, 'error')
    });
  }
  openChallengeModal() { this.showNewChallengeModal = true; this.searchOponents(); }
  searchOponents() {
    this.userService.searchUsers(this.searchTerm).subscribe({
        next: (users) => { this.usersList = users.filter(u => u.id !== this.currentUser.id); },
        error: () => this.toast.show('Erro ao buscar pilotos.', 'error')
    });
  }
  sendChallenge() {
    if (!this.selectedOpponentId) return;
    this.isCreating = true;
    this.rivalryService.createChallenge(this.selectedOpponentId).subscribe({
      next: () => { this.toast.show('Desafio enviado!', 'success'); this.showNewChallengeModal = false; this.isCreating = false; this.selectedOpponentId = null; this.loadRivals(); },
      error: (e) => { this.toast.show(e.error?.detail || 'Erro ao desafiar.', 'error'); this.isCreating = false; }
    });
  }

  // Helpers
  getOpponent(rivalry: any) { return rivalry.challenger_id === this.currentUser.id ? rivalry.opponent : rivalry.challenger; }
  
  getPhotoUrl(url: string | null): string {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `${this.API_URL}${url.startsWith('/') ? '' : '/'}${url}`;
  }
  getInitials(name: string): string { if (!name) return '?'; return name.charAt(0).toUpperCase(); }
  getStatusClass(status: string) { return ''; /* Simplificado para brevidade */ }
  getWinnerClass(rivalry: any) { if (rivalry.winner_id === this.currentUser.id) return 'text-green-500 font-black'; if (rivalry.winner_id === null) return 'text-gray-500'; return 'text-red-500'; }
  getWinnerText(rivalry: any) { if (rivalry.winner_id === this.currentUser.id) return 'VITÓRIA'; if (rivalry.winner_id === null) return 'EMPATE'; return 'DERROTA'; }
}