import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Navbar } from '../../components/navbar/navbar';
import { TeamService } from '../../services/team';
import { ToastService } from '../../services/toast';
import { ImageCropperComponent, ImageCroppedEvent } from 'ngx-image-cropper';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Footer } from '../../components/footer/footer';
import { environment } from '../../../environments/environment';
// import { environment } from '../../environments/environment'; // <--- Importar

@Component({
  selector: 'app-my-team',
  standalone: true,
  imports: [CommonModule, Navbar, FormsModule, ImageCropperComponent, Footer],
  templateUrl: './my-team.html',
  styleUrl: './my-team.css'
})
export class MyTeam implements OnInit {
  private teamService = inject(TeamService);
  private toastService = inject(ToastService);
  private http = inject(HttpClient);
  private sanitizer = inject(DomSanitizer);
  private readonly API_URL = environment.imageBaseUrl; // <--- Atualizado

  myTeam: any = null;
  stats: any = null;
  currentUserId: number | null = null;
  isLoading = true;
  contributionPercent = 50;

  // ... (Variáveis de estado mantidas)
  isCreating = false;
  teamName = '';
  primaryColor = '#ef4444';
  secondaryColor = '#f4f4f5';
  imageChangedEvent: any = '';
  croppedImage: SafeUrl = '';
  finalBlob: Blob | null = null;
  showCropperModal = false;
  isEditMode = false;
  selectedFile: File | null = null;
  logoPreview: string | null = null;
  showEditModal = false;
  isSaving = false;
  editName = '';
  editPrimaryColor = '';
  editSecondaryColor = '';
  editFile: File | null = null;
  editLogoPreview: string | null = null;
  isJoining = false;
  inviteCode = '';
  showJoinModal = false;
  teamPreviewData: any = null;
  showLeaveModal = false;
  showKickModal = false;

  ngOnInit() {
    this.loadCurrentUser();
  }

  loadCurrentUser() {
    // Usa environment.apiUrl
    this.http.get<any>(`${environment.apiUrl}/users/me`).subscribe({
      next: (user) => {
        this.currentUserId = user.id;
        this.loadMyTeam();
      },
      error: () => this.loadMyTeam()
    });
  }

  loadMyTeam() {
    this.teamService.getMyTeam().subscribe({
      next: (response) => {
        if (response && response.team) {
          this.myTeam = response.team;
          this.stats = response.stats;
          this.calculateMetrics();
        } else {
          this.myTeam = null;
          this.stats = null;
        }
        this.isLoading = false;
      },
      error: () => {
        this.myTeam = null;
        this.isLoading = false;
      }
    });
  }

  calculateMetrics() {
    if (!this.stats) return;
    const total = this.stats.captain_points + this.stats.partner_points;
    if (total > 0) {
      this.contributionPercent = Math.round((this.stats.captain_points / total) * 100);
    } else {
      this.contributionPercent = 50;
    }
  }

  getLogoUrl(url: string | null): string {
    if (!url) return 'assets/default-team.png';
    if (url.startsWith('data:') || url.startsWith('http')) return url;
    return `${this.API_URL}${url.startsWith('/') ? '' : '/'}${url}`;
  }

  // ... (Métodos de ação mantidos: openLeaveModal, confirmLeave, openKickModal, etc)
  openLeaveModal() { this.showLeaveModal = true; }
  confirmLeave() {
    this.showLeaveModal = false;
    this.teamService.leaveTeam().subscribe({
      next: (res) => { this.toastService.show(res.message, 'info'); this.myTeam = null; this.stats = null; },
      error: (err) => this.toastService.show(err.error?.detail || 'Erro ao sair.', 'error')
    });
  }
  openKickModal() { if (!this.myTeam || !this.myTeam.partner) return; this.showKickModal = true; }
  confirmKick() {
    this.showKickModal = false;
    this.teamService.kickPartner(this.myTeam.id).subscribe({
      next: (res) => { this.toastService.show(res.message, 'success'); this.loadMyTeam(); },
      error: (err) => this.toastService.show(err.error?.detail || 'Erro ao remover.', 'error')
    });
  }
  
  // ... (Métodos de Upload e Cropper mantidos)
  onFileSelected(event: any, isEdit: boolean = false) { this.isEditMode = isEdit; this.imageChangedEvent = event; this.showCropperModal = true; }
  imageCropped(event: ImageCroppedEvent) { if (event.objectUrl && event.blob) { this.croppedImage = this.sanitizer.bypassSecurityTrustUrl(event.objectUrl); this.finalBlob = event.blob; } }
  loadImageFailed() { this.toastService.show('Imagem inválida.', 'error'); this.cancelCrop(); }
  confirmCrop() {
    if (!this.finalBlob) return;
    const file = new File([this.finalBlob], "logo.png", { type: "image/png" });
    const previewUrl = URL.createObjectURL(this.finalBlob);
    if (this.isEditMode) { this.editFile = file; this.editLogoPreview = previewUrl; } else { this.selectedFile = file; this.logoPreview = previewUrl; }
    this.showCropperModal = false; this.finalBlob = null; this.imageChangedEvent = '';
  }
  cancelCrop() { this.showCropperModal = false; this.imageChangedEvent = ''; this.finalBlob = null; }
  
  createTeam() {
    if (!this.teamName) return;
    this.isCreating = true;
    this.teamService.createTeam(this.teamName, this.primaryColor, this.secondaryColor, this.selectedFile)
      .subscribe({
        next: () => { this.toastService.show('Equipe criada!', 'success'); this.loadMyTeam(); this.isCreating = false; },
        error: (err) => { this.toastService.show(err.error?.detail || 'Erro ao criar.', 'error'); this.isCreating = false; }
      });
  }
  
  openEditModal() {
    this.editName = this.myTeam.name; this.editPrimaryColor = this.myTeam.primary_color || '#ef4444'; this.editSecondaryColor = this.myTeam.secondary_color || '#f4f4f5'; this.editLogoPreview = this.myTeam.logo_url; this.editFile = null; this.showEditModal = true;
  }
  saveEdit() {
    if (!this.editName) return;
    this.isSaving = true;
    this.teamService.updateTeam(this.myTeam.id, this.editName, this.editPrimaryColor, this.editSecondaryColor, this.editFile).subscribe({
      next: (updatedTeam) => {
        this.toastService.show('Atualizado!', 'success'); this.myTeam = {...this.myTeam, ...updatedTeam}; this.showEditModal = false; this.isSaving = false;
      },
      error: (err) => { this.toastService.show(err.error?.detail || 'Erro ao salvar.', 'error'); this.isSaving = false; }
    });
  }
  
  searchTeam() {
    if (!this.inviteCode) return;
    this.isJoining = true;
    this.teamService.getTeamPreview(parseInt(this.inviteCode)).subscribe({
      next: (d) => { this.teamPreviewData = d; this.showJoinModal = true; this.isJoining = false; },
      error: () => { this.toastService.show('Equipe não encontrada', 'error'); this.isJoining = false; }
    });
  }
  confirmJoin() {
    if(!this.teamPreviewData) return;
    this.teamService.joinTeam(this.teamPreviewData.id).subscribe({
      next: () => { this.showJoinModal = false; this.loadMyTeam(); },
      error: (e) => this.toastService.show(e.error?.detail, 'error')
    });
  }
  cancelJoin() { this.showJoinModal = false; }
  copyInviteLink() { navigator.clipboard.writeText(this.myTeam.id.toString()); this.toastService.show('Código copiado!', 'success'); }
  copyShareLink() {
    const url = `${window.location.origin}/t/${this.myTeam.id}`;
    navigator.clipboard.writeText(url).then(() => { this.toastService.show('Link da equipe copiado! 🔗', 'success'); });
  }
}