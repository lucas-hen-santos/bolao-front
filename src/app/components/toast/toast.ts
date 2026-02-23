import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../services/toast';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed top-20 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
      
      @for (toast of toastService.toasts(); track toast.id) {
        <div 
          class="min-w-[300px] p-4 rounded-lg shadow-2xl border-l-4 text-white transform transition-all animate-slide-in cursor-pointer pointer-events-auto backdrop-blur-md"
          [ngClass]="{
            'bg-gray-900/95 border-green-500 shadow-green-900/20': toast.type === 'success',
            'bg-gray-900/95 border-red-500 shadow-red-900/20': toast.type === 'error',
            'bg-gray-900/95 border-blue-500 shadow-blue-900/20': toast.type === 'info'
          }"
          (click)="toastService.remove(toast.id)">
          
          <div class="flex items-center gap-3">
            @if(toast.type === 'success') { <span class="text-xl">✅</span> }
            @if(toast.type === 'error') { <span class="text-xl">⚠️</span> }
            @if(toast.type === 'info') { <span class="text-xl">ℹ️</span> }
            
            <span class="font-bold text-sm">{{ toast.message }}</span>
          </div>
          
        </div>
      }
    </div>
  `,
  styles: [`
    .animate-slide-in {
      animation: slideIn 0.3s cubic-bezier(0.68, -0.55, 0.27, 1.55);
    }
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `]
})
export class ToastComponent {
  toastService = inject(ToastService);
}