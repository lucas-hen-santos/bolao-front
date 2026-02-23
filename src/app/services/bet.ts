import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BetService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl; // Base API

  // Busca lista de pilotos para o dropdown
  getDrivers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/races/drivers-list`);
  }
  
  // Busca lista de equipes para o dropdown
  getTeams(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/races/teams-list`);
  }

  // Busca todas as corridas
  getAllRaces(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/races/`);
  }

  // Envia ou Atualiza a aposta
  submitBet(betData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/bets/`, betData);
  }

  // Busca histórico de apostas do usuário
  getMyBets(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/bets/my-bets`);
  }

  getSeasons(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/races/seasons-list`);
  }

  getGridInfo(seasonId?: number): Observable<any[]> {
    let url = `${this.apiUrl}/races/grid-info`;
    if (seasonId) url += `?season_id=${seasonId}`;
    return this.http.get<any[]>(url);
  }
}