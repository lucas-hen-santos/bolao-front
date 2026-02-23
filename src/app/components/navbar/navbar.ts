import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth';
import { UserService } from '../../services/user';
import { environment } from '../../../environments/environment';


@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar implements OnInit {
  private authService = inject(AuthService);
  public userService = inject(UserService);
  
  // Usa a URL do ambiente
  private readonly API_URL = environment.imageBaseUrl;

  isOpen = signal(false);

  ngOnInit() {
    this.userService.getMe().subscribe();
  }

  toggleMenu() {
    this.isOpen.update(v => !v);
  }

  closeMenu() {
    this.isOpen.set(false);
  }

  logout() {
    this.authService.logout();
  }

  getPhotoUrl(url: string | null): string {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    // Concatena com a URL base do ambiente
    return `${this.API_URL}${url.startsWith('/') ? '' : '/'}${url}`;
  }

  getInitials(name: string): string {
    if (!name) return 'U';
    return name.charAt(0).toUpperCase();
  }
}