import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/users`;

  currentUser = signal<any>(null);

  getMe(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/me`).pipe(
      tap(user => this.currentUser.set(user))
    );
  }

  updateProfile(fullName: string, photo: File | null): Observable<any> {
    const formData = new FormData();
    formData.append('full_name', fullName);
    if (photo) formData.append('photo', photo);

    return this.http.put(`${this.apiUrl}/me`, formData).pipe(
      tap(updatedUser => this.currentUser.set(updatedUser))
    );
  }

  getHistory(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/me/history`);
  }

  getPublicProfile(userId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${userId}/public`);
  }

  searchUsers(query: string = ''): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/search?q=${query}`);
  }
}