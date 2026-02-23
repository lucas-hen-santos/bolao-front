import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth';
import { ToastService } from '../../../services/toast';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './forgot-password.html'
})
export class ForgotPassword {
  private authService = inject(AuthService);
  private toast = inject(ToastService);
  private router = inject(Router);

  email = '';
  isLoading = false;
  sent = false;

  onSubmit() {
    if (!this.email) return;
    this.isLoading = true;

    this.authService.forgotPassword(this.email).subscribe({
      next: () => {
        this.sent = true;
        this.isLoading = false;
        this.toast.show('Email enviado! Verifique sua caixa de entrada.', 'success');
      },
      error: (err) => {
        this.toast.show(err.error?.detail || 'Erro ao enviar email.', 'error');
        this.isLoading = false;
      }
    });
  }
}