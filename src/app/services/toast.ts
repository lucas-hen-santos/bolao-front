import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  // Usando Signals para reatividade instantânea
  toasts = signal<Toast[]>([]); 
  private counter = 0;

  show(message: string, type: 'success' | 'error' | 'info' = 'info') {
    const id = this.counter++;
    
    // Adiciona o novo toast à lista
    this.toasts.update(current => [...current, { id, message, type }]);

    // Auto-remove após 3 segundos (3000ms)
    setTimeout(() => this.remove(id), 3000);
  }

  remove(id: number) {
    this.toasts.update(current => current.filter(t => t.id !== id));
  }
}