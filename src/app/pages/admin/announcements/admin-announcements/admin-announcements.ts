import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../../services/admin';
import { ToastService } from '../../../../services/toast';

@Component({
  selector: 'app-admin-announcements',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-announcements.html'
})
export class AdminAnnouncements {
  private adminService = inject(AdminService);
  private toast = inject(ToastService);

  subject = '';
  message = '';
  isSending = false;
  showConfirmationModal = false;

  openConfirmation() {
    if (!this.subject || !this.message) {
      this.toast.show('Preencha o assunto e a mensagem.', 'error');
      return;
    }
    this.showConfirmationModal = true;
  }

  confirmSend() {
    this.showConfirmationModal = false;
    this.isSending = true;

    this.adminService.sendAnnouncement(this.subject, this.message).subscribe({
      next: (res) => {
        this.toast.show(res.message, 'success');
        this.subject = '';
        this.message = '';
        this.isSending = false;
      },
      error: (err) => {
        console.error(err);
        this.toast.show('Erro ao enviar aviso.', 'error');
        this.isSending = false;
      }
    });
  }
}