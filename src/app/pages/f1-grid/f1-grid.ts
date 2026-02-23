import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Navbar } from '../../components/navbar/navbar';
import { Footer } from '../../components/footer/footer';
import { BetService } from '../../services/bet';
import { environment } from '../../../environments/environment';
// import { environment } from '../../environments/environment'; // <--- Importar

@Component({
  selector: 'app-f1-grid',
  standalone: true,
  imports: [CommonModule, Navbar, Footer, FormsModule],
  templateUrl: './f1-grid.html',
  styleUrl: './f1-grid.css'
})
export class F1Grid implements OnInit {
  private betService = inject(BetService);
  private readonly API_URL = environment.imageBaseUrl; // <--- Atualizado

  grid: any[] = [];
  seasons: any[] = [];
  selectedSeasonId: number | null = null;
  isLoading = true;

  ngOnInit() {
    this.loadSeasons();
  }

  loadSeasons() {
    this.betService.getSeasons().subscribe(data => {
      this.seasons = data;
      const active = this.seasons.find(s => s.is_active);
      this.selectedSeasonId = active ? active.id : (this.seasons[0]?.id || null);
      this.loadGrid();
    });
  }

  loadGrid() {
    if (!this.selectedSeasonId) return;
    this.isLoading = true;
    this.betService.getGridInfo(this.selectedSeasonId).subscribe({
      next: (data) => {
        this.grid = data;
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  // Helpers
  getLogoUrl(url: string | null): string {
    if (!url) return 'assets/default-team.png';
    if (url.startsWith('http')) return url;
    return `${this.API_URL}${url.startsWith('/') ? '' : '/'}${url}`;
  }

  getPhotoUrl(url: string | null): string {
    if (!url) return 'assets/default-driver.png';
    if (url.startsWith('http')) return url;
    return `${this.API_URL}${url.startsWith('/') ? '' : '/'}${url}`;
  }
}