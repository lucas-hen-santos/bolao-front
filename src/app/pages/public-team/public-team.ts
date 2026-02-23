import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { TeamService } from '../../services/team';
import { Navbar } from '../../components/navbar/navbar';
import { Footer } from '../../components/footer/footer';
import { environment } from '../../../environments/environment';
// import { environment } from '../../environments/environment'; // <--- Importar

@Component({
  selector: 'app-public-team',
  standalone: true,
  imports: [CommonModule, Navbar, Footer, RouterModule],
  templateUrl: './public-team.html',
  styles: [`
    .glass-panel {
      background: rgba(20, 20, 20, 0.8);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 1.5rem;
    }
    .animate-slide-up { animation: slideUp 0.6s ease-out forwards; opacity: 0; }
    @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  `]
})
export class PublicTeam implements OnInit {
  private route = inject(ActivatedRoute);
  private teamService = inject(TeamService);
  
  team: any = null;
  isLoading = true;
  readonly API_URL = environment.imageBaseUrl; // <--- Atualizado

  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) this.loadTeam(id);
    });
  }

  loadTeam(id: number) {
    this.teamService.getPublicTeam(id).subscribe({
      next: (data) => {
        this.team = data;
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  getLogoUrl(url: string | null): string {
    if (!url) return 'assets/default-team.png';
    if (url.startsWith('http')) return url;
    return `${this.API_URL}${url.startsWith('/') ? '' : '/'}${url}`;
  }

  getPhotoUrl(url: string | null): string {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `${this.API_URL}${url.startsWith('/') ? '' : '/'}${url}`;
  }
}