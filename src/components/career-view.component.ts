
import { Component, inject, signal, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../services/supabase.service';
import { GameService } from '../services/game.service';
import { GameMode } from '../logic/chess-types';

@Component({
  selector: 'app-career-view',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed inset-0 z-[100] flex flex-col bg-slate-950/98 backdrop-blur-3xl animate-fade-in overflow-hidden">
      
      <!-- Premium Career Header -->
      <div class="relative z-10 px-6 py-6 md:px-12 flex items-center justify-between border-b border-white/5 bg-slate-900/40">
        <div class="flex items-center gap-6">
          <button (click)="gameService.setView('home')" 
            class="w-12 h-12 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-white/10 hover:border-orange-400/50 transition-all flex items-center justify-center group shadow-xl">
            <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="8" class="w-6 h-6 text-slate-400 group-hover:text-orange-400 transition-colors">
              <path d="M70 20 L30 50 L70 80" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          <div>
            <h1 class="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter">Carriera Reale</h1>
            <p class="text-orange-400/80 text-[10px] md:text-xs font-bold uppercase tracking-widest">Ascesa al Trono • Livello {{ activeMode === 'chess' ? currentChessLevel : currentCheckersLevel }}</p>
          </div>
        </div>

        <div class="flex items-center gap-4 bg-slate-950/60 px-6 py-3 rounded-2xl border border-orange-500/20 shadow-[0_0_20px_rgba(249,115,22,0.1)]">
          <div class="text-right">
            <p class="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none">Punti Gloria</p>
            <p class="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-400">{{ totalPoints }}</p>
          </div>
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-lg animate-pulse-subtle">
            <svg viewBox="0 0 24 24" fill="white" class="w-6 h-6">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </div>
        </div>
      </div>

      <!-- Mode Selector (Chess / Checkers) -->
      <div class="flex justify-center p-6 bg-slate-900/20">
        <div class="flex p-1.5 bg-slate-900 rounded-2xl border border-white/5 shadow-2xl">
          <button (click)="activeMode = 'chess'"
            [class.bg-orange-500]="activeMode === 'chess'"
            [class.text-white]="activeMode === 'chess'"
            [class.text-slate-500]="activeMode !== 'chess'"
            class="px-8 py-3 rounded-xl font-black uppercase text-xs tracking-widest transition-all">
            Scacchi
          </button>
          <button (click)="activeMode = 'checkers'"
            [class.bg-orange-500]="activeMode === 'checkers'"
            [class.text-white]="activeMode === 'checkers'"
            [class.text-slate-500]="activeMode !== 'checkers'"
            class="px-8 py-3 rounded-xl font-black uppercase text-xs tracking-widest transition-all">
            Dama
          </button>
        </div>
      </div>

      <!-- Levels Grid -->
      <div class="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-12">
        <div class="max-w-6xl mx-auto">
          
          @if (savedGame && savedGame.type === activeMode) {
             <div class="mb-12 p-8 rounded-[2.5rem] bg-gradient-to-r from-orange-600/20 to-amber-600/10 border border-orange-500/30 backdrop-blur-md shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
               <div class="flex items-center gap-6">
                 <div class="w-20 h-20 rounded-3xl bg-orange-500 flex items-center justify-center shadow-[0_10px_30px_rgba(249,115,22,0.4)]">
                    <svg viewBox="0 0 24 24" fill="white" class="w-10 h-10 animate-bounce-subtle">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
                    </svg>
                 </div>
                 <div>
                   <h3 class="text-2xl font-black text-white uppercase tracking-tighter">Partita in Corso</h3>
                   <p class="text-orange-400 font-bold uppercase text-xs tracking-widest">Livello {{ savedGame.level }} • Hai ancora una mossa!</p>
                 </div>
               </div>
               <div class="flex gap-4 w-full md:w-auto">
                 <button (click)="resumeGame()" 
                   class="flex-1 md:flex-none px-10 py-4 bg-orange-500 hover:bg-orange-400 text-white font-black rounded-2xl shadow-xl transition-all uppercase tracking-widest text-xs">
                   Riprendi
                 </button>
                 <button (click)="abandonSavedGame()" 
                   class="px-6 py-4 bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-400 font-black rounded-2xl transition-all uppercase tracking-widest text-[10px] border border-white/5">
                   Abbandona
                 </button>
               </div>
             </div>
          }

          <div class="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-10 gap-4 md:gap-6">
             @for (level of levels; track level) {
                @let isUnlocked = level <= (activeMode === 'chess' ? currentChessLevel : currentCheckersLevel);
                @let isCurrent = level === (activeMode === 'chess' ? currentChessLevel : currentCheckersLevel);
                
                <button (click)="isUnlocked ? startLevel(level) : null"
                  [disabled]="!isUnlocked"
                  [class.opacity-40]="!isUnlocked"
                  [class.grayscale]="!isUnlocked"
                  [class.scale-105]="isCurrent"
                  [class.ring-4]="isCurrent"
                  [class.ring-orange-500/50]="isCurrent"
                  class="group relative aspect-square rounded-2xl flex flex-col items-center justify-center transition-all duration-300
                         {{ isUnlocked ? 'bg-slate-900 hover:bg-slate-800 border-white/10' : 'bg-slate-950 border-white/5 cursor-not-allowed' }}
                         border hover:border-orange-500/40 shadow-xl overflow-hidden">
                  
                  @if (isCurrent && isUnlocked) {
                    <div class="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-amber-500/20 animate-pulse"></div>
                  }

                  @if (isUnlocked) {
                    <span class="text-2xl font-black {{ isCurrent ? 'text-orange-400' : 'text-white' }} group-hover:scale-110 transition-transform">{{ level }}</span>
                    <span class="text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-1">{{ level < (activeMode === 'chess' ? currentChessLevel : currentCheckersLevel) ? 'Completato' : 'Inizia' }}</span>
                  } @else {
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="w-6 h-6 text-slate-700">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                  }
                </button>
             }
          </div>

        </div>
      </div>
    </div>
  `,
  styles: [`
    .custom-scrollbar::-webkit-scrollbar { width: 6px; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(249, 115, 22, 0.3); border-radius: 10px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    
    @keyframes fade-in { from { opacity: 0; transform: scale(0.98); } to { opacity: 1; transform: scale(1); } }
    .animate-fade-in { animation: fade-in 0.4s ease-out; }
    
    @keyframes pulse-subtle { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
    .animate-pulse-subtle { animation: pulse-subtle 2s infinite ease-in-out; }

    @keyframes bounce-subtle { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
    .animate-bounce-subtle { animation: bounce-subtle 2s infinite ease-in-out; }
  `]
})
export class CareerViewComponent implements OnInit {
  supabase = inject(SupabaseService);
  gameService = inject(GameService);

  activeMode: GameMode = 'chess';
  currentChessLevel = 1;
  currentCheckersLevel = 1;
  totalPoints = 0;
  savedGame: any = null;
  loading = true;

  levels = Array.from({ length: 100 }, (_, i) => i + 1);

  ngOnInit() {
    this.loadProgress();
  }

  async loadProgress() {
    this.loading = true;
    const progress = await this.supabase.getCareerProgress();
    if (progress) {
      this.currentChessLevel = progress.chess_level || 1;
      this.currentCheckersLevel = progress.checkers_level || 1;
      this.totalPoints = progress.total_points || 0;
      this.savedGame = progress.current_game_state;
    }
    this.loading = false;
  }

  startLevel(level: number) {
    this.gameService.startGame(this.activeMode, 'career', level);
  }

  resumeGame() {
    if (this.savedGame) {
      this.gameService.gameMode.set(this.savedGame.type);
      this.gameService.playerMode.set('career');
      this.gameService.careerLevel.set(this.savedGame.level);
      this.gameService.board.set(this.savedGame.state.board);
      this.gameService.turn.set(this.savedGame.state.turn);
      this.gameService.lastMove.set(this.savedGame.state.lastMove);
      this.gameService.viewState.set('game');
    }
  }

  async abandonSavedGame() {
    await this.supabase.clearSavedGame();
    this.savedGame = null;
  }
}
