import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TeamService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/teams`;

  createTeam(name: string, primaryColor: string, secondaryColor: string, logo: File | null): Observable<any> {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('primary_color', primaryColor);
    formData.append('secondary_color', secondaryColor);
    if (logo) formData.append('logo', logo);
    // Note: POST em /teams/
    return this.http.post(`${this.apiUrl}/`, formData);
  }

  updateTeam(teamId: number, name: string, primaryColor: string, secondaryColor: string, logo: File | null): Observable<any> {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('primary_color', primaryColor);
    formData.append('secondary_color', secondaryColor);
    if (logo) formData.append('logo', logo);
    return this.http.put(`${this.apiUrl}/${teamId}`, formData);
  }

  getMyTeam(): Observable<any> {
    return this.http.get(`${this.apiUrl}/my-team`);
  }

  getTeamPreview(teamId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${teamId}/preview`);
  }

  joinTeam(teamId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${teamId}/join`, {});
  }

  leaveTeam(): Observable<any> {
    return this.http.post(`${this.apiUrl}/leave`, {});
  }

  kickPartner(teamId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${teamId}/kick`, {});
  }

  getPublicTeam(teamId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${teamId}/public`);
  }
}