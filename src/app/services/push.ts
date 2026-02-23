import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SwPush } from '@angular/service-worker';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { ToastService } from './toast';

@Injectable({
  providedIn: 'root'
})
export class PushService {
  private http = inject(HttpClient);
  private swPush = inject(SwPush);
  private router = inject(Router);
  private toast = inject(ToastService);
  private apiUrl = `${environment.apiUrl}/notifications`;

  isSubscribed = signal(false);

  constructor() {
    this.checkSubscription();
    this.listenToClicks();
  }

  private checkSubscription() {
    this.swPush.subscription.subscribe(sub => {
      this.isSubscribed.set(!!sub);
    });
  }

  private listenToClicks() {
    this.swPush.notificationClicks.subscribe(({ action, notification }) => {
      window.focus();
      if (notification.data && notification.data.url) {
        this.router.navigateByUrl(notification.data.url);
      }
    });
  }

  public subscribeToNotifications() {
    if (!this.swPush.isEnabled) {
      this.toast.show('Notificações não suportadas neste navegador.', 'error');
      return;
    }

    this.http.get<{ publicKey: string }>(`${this.apiUrl}/vapid-public-key`).subscribe({
      next: (res) => this.requestBrowserPermission(res.publicKey),
      error: () => this.toast.show('Erro de conexão. Tente mais tarde.', 'error')
    });
  }

  private requestBrowserPermission(publicKey: string) {
    this.swPush.requestSubscription({ serverPublicKey: publicKey })
    .then(sub => {
      this.http.post(`${this.apiUrl}/subscribe`, sub.toJSON()).subscribe({
        next: () => {
          this.toast.show('Notificações Ativadas! 🔔', 'success');
          this.isSubscribed.set(true);
        },
        error: () => this.toast.show('Erro ao salvar preferência.', 'error')
      });
    })
    .catch(err => {
      console.error(err);
      this.toast.show('Para receber alertas, você precisa permitir no navegador.', 'info');
    });
  }

  // --- MÉTODO RESTAURADO ---
  public sendTestNotification() {
    this.http.post(`${this.apiUrl}/test`, {}).subscribe({
      next: () => this.toast.show('Teste enviado! Verifique sua bandeja.', 'info'),
      error: () => this.toast.show('Erro ao enviar teste.', 'error')
    });
  }

  public unsubscribe() {
    this.swPush.subscription.subscribe(sub => {
      if (sub) {
        this.http.request('delete', `${this.apiUrl}/unsubscribe`, { params: { endpoint: sub.endpoint } }).subscribe();
        sub.unsubscribe().then(() => {
          this.isSubscribed.set(false);
          this.toast.show('Notificações desativadas.', 'info');
        });
      }
    });
  }
}