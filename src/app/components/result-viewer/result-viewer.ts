import { Component, EventEmitter, Input, Output, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { BetService } from '../../services/bet';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-result-viewer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed inset-0 z-[200] flex items-center justify-center p-2 sm:p-4">
      <div class="absolute inset-0 bg-black/80 backdrop-blur-sm animate-fade-in" (click)="close.emit()"></div>
      
      <div class="bg-gradient-to-br from-gray-900 via-black to-[#0a0a0a] border border-gray-700 rounded-2xl w-full max-w-3xl relative z-10 shadow-2xl overflow-hidden flex flex-col max-h-[95vh] md:max-h-[90vh] animate-slide-up">
        
        <div class="bg-white/5 p-3 md:p-6 flex justify-between items-center border-b border-white/10 backdrop-blur-md">
          <div class="flex items-center gap-2 md:gap-3 min-w-0">
             <div class="w-8 h-8 md:w-10 md:h-10 rounded-full bg-racing-red/20 flex items-center justify-center border border-racing-red/30 shadow-[0_0_15px_rgba(239,68,68,0.2)] shrink-0">
                <span class="text-base md:text-xl">🏁</span>
             </div>
             <div class="min-w-0">
               <h3 class="text-white font-black uppercase tracking-widest leading-none text-sm md:text-base truncate">Resultado Oficial</h3>
               <p class="text-gray-400 text-[9px] md:text-xs font-mono uppercase mt-1 truncate">Gabarito da Etapa</p>
             </div>
          </div>
          <button (click)="close.emit()" class="text-gray-500 hover:text-white bg-black/50 hover:bg-racing-red/80 rounded-full w-8 h-8 md:w-10 md:h-10 flex items-center justify-center transition-all border border-gray-800 hover:border-racing-red group shrink-0 ml-2">
            <span class="text-xl md:text-2xl font-bold group-hover:scale-110 transition-transform">&times;</span>
          </button>
        </div>

        <div class="overflow-y-auto overflow-x-hidden p-3 md:p-8 space-y-6 md:space-y-8 scrollbar-hide" *ngIf="!isLoading; else loading">
          
          <div class="text-center relative animate-slide-up px-2" style="animation-delay: 0.1s;">
            <div class="absolute inset-0 bg-racing-red/5 blur-3xl rounded-full"></div>
            <h2 class="text-2xl md:text-5xl font-black text-white italic uppercase tracking-tighter drop-shadow-lg relative z-10 leading-tight md:leading-none break-words">
              {{ raceData?.race?.name }}
            </h2>
            <p class="text-gray-400 font-bold uppercase tracking-widest text-[10px] md:text-sm mt-2 md:mt-3 flex items-center justify-center gap-1 md:gap-2 relative z-10">
              <span class="text-racing-red shrink-0">📍</span> <span class="truncate">{{ raceData?.race?.country }}</span>
            </p>
          </div>

          @if (raceData?.result) {
            <div class="flex justify-center items-end gap-1 md:gap-6 mt-6 md:mt-8 mb-8 md:mb-12 px-1">
              
              <div class="flex flex-col items-center w-[30%] md:w-32 animate-slide-up" style="animation-delay: 0.2s;">
                <div class="text-gray-300 font-bold text-center mb-1 md:mb-2 flex flex-col items-center w-full min-w-0">
                  <span class="text-[9px] md:text-xs uppercase tracking-widest text-gray-500">P2</span>
                  <span class="text-[10px] md:text-sm truncate w-full px-1">{{ getDriverName(raceData.result.p2_driver_id) }}</span>
                </div>
                <div class="w-full h-16 md:h-32 bg-gradient-to-t from-gray-900 to-gray-800 border-t-4 border-gray-400 rounded-t-xl shadow-[0_-5px_15px_rgba(156,163,175,0.1)] flex items-end justify-center pb-1 md:pb-4 relative overflow-hidden group">
                  <div class="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors"></div>
                  <span class="text-3xl md:text-4xl font-black text-white/10 italic">2</span>
                </div>
              </div>

              <div class="flex flex-col items-center w-[40%] md:w-40 z-10 animate-slide-up relative" style="animation-delay: 0.3s;">
                <div class="absolute -top-6 md:-top-10 text-xl md:text-3xl animate-bounce drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]">👑</div>
                <div class="text-yellow-400 font-bold text-center mb-1 md:mb-2 flex flex-col items-center w-full min-w-0">
                  <span class="text-[9px] md:text-xs uppercase tracking-widest text-yellow-600 font-black truncate max-w-full">Vencedor</span>
                  <span class="text-xs md:text-base truncate w-full px-1 drop-shadow-md">{{ getDriverName(raceData.result.p1_driver_id) }}</span>
                </div>
                <div class="w-full h-24 md:h-40 bg-gradient-to-t from-yellow-900/30 to-yellow-600/30 border-t-4 border-yellow-400 rounded-t-xl shadow-[0_-10px_25px_rgba(250,204,21,0.2)] flex items-end justify-center pb-1 md:pb-4 backdrop-blur-sm relative overflow-hidden group">
                  <div class="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors"></div>
                  <span class="text-4xl md:text-5xl font-black text-yellow-400/20 italic">1</span>
                </div>
              </div>

              <div class="flex flex-col items-center w-[30%] md:w-32 animate-slide-up" style="animation-delay: 0.4s;">
                <div class="text-orange-400 font-bold text-center mb-1 md:mb-2 flex flex-col items-center w-full min-w-0">
                  <span class="text-[9px] md:text-xs uppercase tracking-widest text-orange-700">P3</span>
                  <span class="text-[10px] md:text-sm truncate w-full px-1">{{ getDriverName(raceData.result.p3_driver_id) }}</span>
                </div>
                <div class="w-full h-12 md:h-28 bg-gradient-to-t from-orange-900/30 to-orange-800/30 border-t-4 border-orange-500 rounded-t-xl shadow-[0_-5px_15px_rgba(249,115,22,0.1)] flex items-end justify-center pb-1 md:pb-4 backdrop-blur-sm relative overflow-hidden group">
                  <div class="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors"></div>
                  <span class="text-3xl md:text-4xl font-black text-orange-500/20 italic">3</span>
                </div>
              </div>

            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4 mb-6 md:mb-8">
              
              <div class="bg-black/40 border border-gray-800 p-3 md:p-4 rounded-xl flex items-center gap-3 md:gap-4 hover:border-racing-red/50 hover:bg-black/60 transition-all group animate-slide-up min-w-0" style="animation-delay: 0.5s;">
                <div class="w-8 h-8 md:w-10 md:h-10 shrink-0 rounded-full bg-purple-500/10 flex items-center justify-center border border-purple-500/30 group-hover:scale-110 transition-transform shadow-[0_0_10px_rgba(168,85,247,0.2)]">
                  <span class="text-purple-400 text-sm md:text-lg">⏱️</span>
                </div>
                <div class="overflow-hidden min-w-0 flex-1">
                  <div class="text-[9px] text-gray-500 uppercase font-bold tracking-widest mb-0.5 truncate">Pole Position</div>
                  <div class="text-white font-black truncate text-xs md:text-sm">{{ getDriverName(raceData.result.pole_driver_id) }}</div>
                </div>
              </div>

              <div class="bg-black/40 border border-gray-800 p-3 md:p-4 rounded-xl flex items-center gap-3 md:gap-4 hover:border-racing-red/50 hover:bg-black/60 transition-all group animate-slide-up min-w-0" style="animation-delay: 0.6s;">
                <div class="w-8 h-8 md:w-10 md:h-10 shrink-0 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/30 group-hover:scale-110 transition-transform shadow-[0_0_10px_rgba(59,130,246,0.2)]">
                  <span class="text-blue-400 text-sm md:text-lg">🌟</span>
                </div>
                <div class="overflow-hidden min-w-0 flex-1">
                  <div class="text-[9px] text-gray-500 uppercase font-bold tracking-widest mb-0.5 truncate">Piloto do Dia</div>
                  <div class="text-white font-black truncate text-xs md:text-sm">{{ getDriverName(raceData.result.dotd_driver_id) }}</div>
                </div>
              </div>

              <div class="bg-black/40 border border-gray-800 p-3 md:p-4 rounded-xl flex items-center gap-3 md:gap-4 hover:border-racing-red/50 hover:bg-black/60 transition-all group animate-slide-up min-w-0" style="animation-delay: 0.7s;">
                <div class="w-8 h-8 md:w-10 md:h-10 shrink-0 rounded-full bg-green-500/10 flex items-center justify-center border border-green-500/30 group-hover:scale-110 transition-transform shadow-[0_0_10px_rgba(34,197,94,0.2)]">
                  <span class="text-green-400 text-sm md:text-lg">🛡️</span>
                </div>
                <div class="overflow-hidden min-w-0 flex-1">
                  <div class="text-[9px] text-gray-500 uppercase font-bold tracking-widest mb-0.5 truncate">Equipe Vencedora</div>
                  <div class="text-white font-black truncate text-xs md:text-sm">{{ getTeamName(raceData.result.winning_team_id) }}</div>
                </div>
              </div>

            </div>

            <div class="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-md animate-slide-up" style="animation-delay: 0.8s;">
              <div class="bg-black/40 p-3 md:p-4 border-b border-white/5">
                <h4 class="text-gray-400 text-[10px] md:text-xs font-bold uppercase tracking-widest text-center flex items-center justify-center gap-2">
                  <span class="w-4 md:w-8 h-[1px] bg-gray-600"></span>
                  Restante do Top 10
                  <span class="w-4 md:w-8 h-[1px] bg-gray-600"></span>
                </h4>
              </div>
              
              <div class="divide-y divide-white/5">
                @for (pos of [4,5,6,7,8,9,10]; track pos; let i = $index) {
                  <div class="flex items-center p-2.5 md:p-4 hover:bg-white/5 transition-colors group">
                    <div class="w-8 md:w-14 text-center shrink-0">
                      <span class="text-gray-500 font-black italic text-sm md:text-lg group-hover:text-racing-red transition-colors">P{{pos}}</span>
                    </div>
                    <div class="w-1 h-4 md:h-6 bg-gray-800 rounded-full mx-2 md:mx-4 shrink-0 group-hover:bg-racing-red transition-colors"></div>
                    <span class="text-gray-300 font-bold text-xs md:text-base group-hover:text-white transition-colors truncate min-w-0 flex-1">{{ getDriverByPos(pos) }}</span>
                  </div>
                }
              </div>
            </div>

          } @else {
            <div class="flex flex-col items-center justify-center py-12 md:py-24 text-center px-4">
              <span class="text-5xl md:text-7xl mb-4 md:mb-6 grayscale opacity-20 filter drop-shadow-lg">🏁</span>
              <h3 class="text-xl md:text-2xl font-black text-white uppercase italic tracking-tight">Gabarito Pendente</h3>
              <p class="text-gray-500 text-xs md:text-sm mt-2 max-w-xs mx-auto">A FIA ainda não liberou os resultados oficiais desta corrida. Volte mais tarde.</p>
            </div>
          }

        </div>

        <ng-template #loading>
          <div class="flex flex-col justify-center items-center h-[50vh] md:h-[60vh]">
            <div class="relative">
              <div class="w-12 h-12 md:w-20 md:h-20 border-4 border-gray-800 rounded-full"></div>
              <div class="w-12 h-12 md:w-20 md:h-20 border-4 border-racing-red rounded-full animate-spin border-t-transparent absolute top-0 left-0"></div>
            </div>
            <p class="text-gray-500 mt-4 md:mt-6 font-bold tracking-widest uppercase text-[10px] md:text-xs animate-pulse text-center">Processando<br class="md:hidden"> Telemetria...</p>
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
    this.betService.getDrivers().subscribe(d => {
      this.drivers = d;
      this.betService.getTeams().subscribe(t => {
        this.teams = t;
        this.loadResult();
      });
    });
  }

  loadResult() {
    this.http.get<any>(`${environment.apiUrl}/races/${this.raceId}/result`).subscribe({
      next: (data) => {
        this.raceData = data;
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

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
    const key = `p${pos}_driver_id`;
    const id = this.raceData.result[key];
    return this.getDriverName(id);
  }
}