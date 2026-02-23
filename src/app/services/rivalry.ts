import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RivalryService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/rivals`;

  getMyRivals(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/my-rivals`);
  }

  getUserHistory(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/user/${userId}/history`);
  }

  createChallenge(opponentId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/challenge`, { opponent_id: opponentId });
  }

  acceptChallenge(rivalryId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${rivalryId}/accept`, {});
  }

  declineChallenge(rivalryId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${rivalryId}/decline`, {});
  }
}