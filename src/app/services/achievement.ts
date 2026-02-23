import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AchievementService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/achievements`;

  private checkTrigger = new Subject<void>();
  checkTrigger$ = this.checkTrigger.asObservable();

  triggerCheck() {
    this.checkTrigger.next();
  }

  getNewAchievements(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/me/new`);
  }

  markAsSeen(ids: number[]): Observable<any> {
    return this.http.put(`${this.apiUrl}/me/mark-seen`, ids);
  }
  
  getMyAchievements(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/me`);
  }

  getAll(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/all`);
  }
}