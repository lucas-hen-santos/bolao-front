import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/admin`; 

  private baseUrl = environment.apiUrl;

  getDashboardStats(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/admin/dashboard/stats`);
  }

  // --- TEMPORADAS ---
  getSeasons(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/admin/seasons/`);
  }

  createSeason(year: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/admin/seasons/`, { year });
  }

  closeSeason(seasonId: number): Observable<any> {
    return this.http.put(`${this.baseUrl}/admin/seasons/${seasonId}/close`, {});
  }

  createRace(data: any): Observable<any> { return this.http.post(`${this.baseUrl}/races/`, data); }
  
  getRaces(seasonId?: number): Observable<any[]> { 
    let url = `${this.baseUrl}/races/`;
    if (seasonId) url += `?season_id=${seasonId}`;
    return this.http.get<any[]>(url); 
  }

  updateRaceStatus(raceId: number, status: string): Observable<any> { return this.http.put(`${this.baseUrl}/races/${raceId}/status?new_status=${status}`, {}); }
  updateRace(raceId: number, data: any): Observable<any> { return this.http.put(`${this.baseUrl}/races/${raceId}`, data); }
  deleteRace(raceId: number): Observable<any> { return this.http.delete(`${this.baseUrl}/races/${raceId}`); }

  // --- RESULTADOS ---
  getRaceResult(raceId: number): Observable<any> { return this.http.get<any>(`${this.baseUrl}/races/${raceId}/result`); }
  submitResult(raceId: number, resultData: any): Observable<any> { return this.http.post(`${this.baseUrl}/admin/races/${raceId}/result`, resultData); }

  // --- USUÁRIOS ---
  getUsers(skip: number = 0, limit: number = 100, search: string = ''): Observable<any[]> {
    let url = `${this.baseUrl}/users/?skip=${skip}&limit=${limit}`;
    if (search) { url += `&search=${search}`; }
    return this.http.get<any[]>(url);
  }
  toggleUserStatus(userId: number, isActive: boolean): Observable<any> { return this.http.put(`${this.baseUrl}/users/${userId}/status`, { is_active: isActive }); }
  toggleUserRole(userId: number, isAdmin: boolean): Observable<any> { return this.http.put(`${this.baseUrl}/users/${userId}/role`, { is_admin: isAdmin }); }

  // --- EQUIPES ---
  getUserTeams(skip: number = 0, limit: number = 50, search: string = ''): Observable<any[]> {
    let url = `${this.baseUrl}/admin/teams/?skip=${skip}&limit=${limit}`;
    if (search) { url += `&search=${search}`; }
    return this.http.get<any[]>(url);
  }
  moderateTeam(teamId: number, name?: string, removeLogo: boolean = false): Observable<any> {
    return this.http.put(`${this.baseUrl}/admin/teams/${teamId}/moderate`, { name: name, remove_logo: removeLogo });
  }
  deleteUserTeam(teamId: number): Observable<any> { return this.http.delete(`${this.baseUrl}/admin/teams/${teamId}`); }

  // --- AVISOS ---
  sendAnnouncement(subject: string, message: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/admin/announce`, { subject, message });
  }

  // --- CONQUISTAS ---
  createAchievement(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/achievements/`, data);
  }

  deleteAchievement(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/achievements/${id}`);
  }
}