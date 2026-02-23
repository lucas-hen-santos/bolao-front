import { Component, EventEmitter, Input, Output, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { BetService } from '../../services/bet';

@Component({
  selector: 'app-result-viewer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/90 backdrop-blur-sm" (click)="close.emit()"></div>
      
      <div class="bg-racing-dark border border-gray-700 rounded-xl w-full max-w-2xl relative z-10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        <div class="bg-black p-4 flex justify-between items-center border-b border-gray-800">
          <h3 class="text-white font-bold uppercase italic flex items-center gap-2">
            <span class="text-2xl">🏁</span> Resultado Oficial
          </h3>
          <button (click)="close.emit()" class="text-gray-500 hover:text-white text-2xl">&times;</button>
        </div>

        <div class="overflow-y-auto p-6 space-y-6" *ngIf="!isLoading; else loading">
          
          <div class="text-center mb-6">
            <h2 class="text-2xl font-black text-white uppercase">{{ raceData?.race?.name }}</h2>
            <p class="text-gray-500">{{ raceData?.race?.country }}</p>
          </div>

          @if (raceData?.result) {
            <div class="flex justify-center items-end gap-4 mb-8">
              <div class="text-center">
                <div class="text-gray-400 text-xs mb-1">2º Lugar</div>
                <div class="w-16 h-24 bg-gray-800 border-t-4 border-gray-400 rounded-t-lg flex items-center justify-center">
                  <div class="font-bold text-white">{{ getDriverName(raceData.result.p2_driver_id) }}</div>
                </div>
              </div>
              <div class="text-center">
                <div class="text-yellow-500 text-xs mb-1 font-bold">VENCEDOR</div>
                <div class="w-20 h-32 bg-gray-800 border-t-4 border-yellow-500 rounded-t-lg flex items-center justify-center relative shadow-[0_0_15px_rgba(234,179,8,0.3)]">
                  <div class="font-bold text-white text-lg">{{ getDriverName(raceData.result.p1_driver_id) }}</div>
                </div>
              </div>
              <div class="text-center">
                <div class="text-orange-700 text-xs mb-1">3º Lugar</div>
                <div class="w-16 h-20 bg-gray-800 border-t-4 border-orange-700 rounded-t-lg flex items-center justify-center">
                  <div class="font-bold text-white">{{ getDriverName(raceData.result.p3_driver_id) }}</div>
                </div>
              </div>
            </div>

            <div class="grid grid-cols-3 gap-4 mb-6">
              <div class="bg-black/30 p-3 rounded border border-gray-800 text-center">
                <div class="text-[10px] text-gray-500 uppercase">Pole Position</div>
                <div class="text-racing-red font-bold">{{ getDriverName(raceData.result.pole_driver_id) }}</div>
              </div>
              <div class="bg-black/30 p-3 rounded border border-gray-800 text-center">
                <div class="text-[10px] text-gray-500 uppercase">Piloto do Dia</div>
                <div class="text-racing-red font-bold">{{ getDriverName(raceData.result.dotd_driver_id) }}</div>
              </div>
              <div class="bg-black/30 p-3 rounded border border-gray-800 text-center">
                <div class="text-[10px] text-gray-500 uppercase">Equipe Vencedora</div>
                <div class="text-racing-red font-bold">{{ getTeamName(raceData.result.winning_team_id) }}</div>
              </div>
            </div>

            <div class="bg-black/20 rounded border border-gray-800">
              @for (pos of [4,5,6,7,8,9,10]; track pos) {
                <div class="flex items-center p-2 border-b border-gray-800 last:border-0 text-sm">
                  <span class="w-8 text-center text-gray-500 font-mono">P{{pos}}</span>
                  <span class="text-white ml-2">{{ getDriverByPos(pos) }}</span>
                </div>
              }
            </div>

          } @else {
            <div class="text-center py-10 text-gray-500">
              Resultado ainda não disponível.
            </div>
          }

        </div>

        <ng-template #loading>
          <div class="flex justify-center items-center h-64">
            <div class="animate-spin rounded-full h-10 w-10 border-t-2 border-racing-red"></div>
          </div>
        </ng-template>

      </div>
    </div>
  `
})
export class ResultViewerComponent implements OnInit {
  @Input() raceId!: number;
  @Output() close = new EventEmitter<void>();

  private http = inject(HttpClient);
  private betService = inject(BetService);

  raceData: any = null;
  drivers: any[] = [];
  teams: any[] = [];
  isLoading = true;

  ngOnInit() {
    // Carrega dados auxiliares (Drivers/Teams) para mapear IDs -> Nomes
    this.betService.getDrivers().subscribe(d => {
      this.drivers = d;
      this.betService.getTeams().subscribe(t => {
        this.teams = t;
        this.loadResult();
      });
    });
  }

  loadResult() {
    this.http.get<any>(`/api/v1/races/${this.raceId}/result`).subscribe({
      next: (data) => {
        this.raceData = data;
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  // Helpers para mostrar nomes ao invés de IDs
  getDriverName(id: number): string {
    const d = this.drivers.find(x => x.id === id);
    return d ? `#${d.number} ${d.name}` : 'Desc.';
  }

  getTeamName(id: number): string {
    const t = this.teams.find(x => x.id === id);
    return t ? t.name : 'Desc.';
  }

  getDriverByPos(pos: number): string {
    if (!this.raceData?.result) return '-';
    // Mapeia P4 -> p4_driver_id
    const key = `p${pos}_driver_id`;
    const id = this.raceData.result[key];
    return this.getDriverName(id);
  }
}