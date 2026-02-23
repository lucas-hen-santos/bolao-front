import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth';
import { ToastService } from '../../services/toast';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  fullName = '';
  email = '';
  password = '';
  confirmPassword = '';
  
  isLoading = false;

  onRegister() {
    // Validação básica
    if (this.password !== this.confirmPassword) {
      this.toastService.show('As senhas não coincidem!', 'error');
      return;
    }
    
    if (this.password.length < 6) {
      this.toastService.show('A senha deve ter pelo menos 6 caracteres.', 'error');
      return;
    }

    this.isLoading = true;

    this.authService.register(this.fullName, this.email, this.password).subscribe({
      next: () => {
        this.toastService.show('Conta criada com sucesso! Faça login.', 'success');
        this.isLoading = false;
        // Redireciona para o login após criar
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error(err);
        const msg = err.error?.detail || 'Erro ao criar conta. Tente outro email.';
        this.toastService.show(msg, 'error');
        this.isLoading = false;
      }
    });
  }
}