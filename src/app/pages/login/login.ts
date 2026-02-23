import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  private authService = inject(AuthService);
  
  email = '';
  password = '';
  rememberMe = false; // <--- Novo estado
  errorMessage = '';
  isLoading = false;

  onLogin() {
    this.isLoading = true;
    this.errorMessage = '';

    // Passa o rememberMe para o serviço
    this.authService.login(this.email, this.password, this.rememberMe).subscribe({
      next: () => {
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        console.error(err);
        this.errorMessage = 'Email ou senha incorretos. Tente novamente.';
      }
    });
  }
}