import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Navbar } from '../../components/navbar/navbar';
import { Footer } from '../../components/footer/footer';
import { BetService } from '../../services/bet';
import { environment } from '../../../environments/environment';
// import { environment } from '../../environments/environment'; // <--- Importar

@Component({
  selector: 'app-ranking',
  standalone: true,
  imports: [CommonModule, Navbar, Footer, FormsModule, RouterModule],
  templateUrl: './ranking.html',
  styleUrl: './ranking.css'
})
export class Ranking implements OnInit {
  private http = inject(HttpClient);
  private betService = inject(BetService);
  private readonly API_URL = environment.imageBaseUrl; // <--- Atualizado
  
  activeTab: 'drivers' | 'teams' = 'drivers';
  
  teamsList: any[] = [];
  driversList: any[] = [];
  isLoading = true;

  // Filtros
  seasons: any[] = [];
  selectedSeasonId: number | null = null;

  ngOnInit() {
    this.loadSeasons();
  }

  loadSeasons() {
    this.betService.getSeasons().subscribe(data => {
      this.seasons = data;
      const active = this.seasons.find(s => s.is_active);
      this.selectedSeasonId = active ? active.id : (this.seasons[0]?.id || null);
      this.loadRankings();
    });
  }

  loadRankings() {
    if (!this.selectedSeasonId) return;
    
    this.isLoading = true;
    const params = `?season_id=${this.selectedSeasonId}`;
    
    // Como essas rotas não estão no BetService, uso o environment.apiUrl se fosse injetado, 
    // mas aqui o path é relativo (/api/v1/...) e o interceptor não altera a URL base se não for completa.
    // Idealmente, movemos isso para o Service. Mas como paliativo:
    const apiUrl = environment.apiUrl; 
    
    this.http.get<any[]>(`${apiUrl}/ranking/teams${params}`).subscribe(teams => {
      this.teamsList = teams;
      
      this.http.get<any[]>(`${apiUrl}/ranking/drivers${params}`).subscribe(drivers => {
        this.driversList = drivers;
        this.isLoading = false;
      });
    });
  }

  setTab(tab: 'drivers' | 'teams') {
    this.activeTab = tab;
  }

  getLogoUrl(url: string | null): string {
    if (!url) return 'assets/default-team.png';
    if (url.startsWith('http')) return url;
    return `${this.API_URL}${url.startsWith('/') ? '' : '/'}${url}`;
  }

  getPhotoUrl(url: string | null, name: string): string {
    if (url) {
      if (url.startsWith('http')) return url;
      return `${this.API_URL}${url.startsWith('/') ? '' : '/'}${url}`;
    }
    return `https://ui-avatars.com/api/?name=${name}&background=random&color=fff&bold=true`;
  }
}