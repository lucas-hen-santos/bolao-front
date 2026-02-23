import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth';
import { ToastService } from '../../../services/toast';


@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './reset-password.html'
})
export class ResetPassword implements OnInit {
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toast = inject(ToastService);

  token = '';
  newPassword = '';
  confirmPassword = '';
  isLoading = false;

  ngOnInit() {
    // Pega o token da URL (?token=...)
    this.token = this.route.snapshot.queryParams['token'];
    if (!this.token) {
      this.toast.show('Token inválido ou ausente.', 'error');
      this.router.navigate(['/login']);
    }
  }

  onSubmit() {
    if (this.newPassword !== this.confirmPassword) {
      this.toast.show('As senhas não coincidem.', 'error');
      return;
    }
    
    if (this.newPassword.length < 6) {
      this.toast.show('A senha deve ter no mínimo 6 caracteres.', 'error');
      return;
    }

    this.isLoading = true;

    this.authService.resetPassword(this.token, this.newPassword).subscribe({
      next: () => {
        this.toast.show('Senha alterada com sucesso!', 'success');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.toast.show(err.error?.detail || 'Erro ao alterar senha.', 'error');
        this.isLoading = false;
      }
    });
  }
}