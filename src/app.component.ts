import { Component, inject, ViewChild, effect } from '@angular/core';
import { ChessSceneComponent } from './components/chess-scene.component';
import { HomeViewComponent } from './components/home-view.component';
import { MarketplaceViewComponent } from './components/marketplace-view.component';
import { CareerViewComponent } from './components/career-view.component';
import { SupabaseService } from './services/supabase.service';
import { GameService } from './services/game.service';
import { PieceType, Position } from './logic/chess-types';
import { AdminViewComponent } from './components/admin-view.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ChessSceneComponent, HomeViewComponent, MarketplaceViewComponent, CareerViewComponent, AdminViewComponent],
  template: `
    <div class="h-screen w-full relative overflow-hidden bg-slate-950 main-container">
      
      <!-- 3D Background - Always active but can be blurred -->
      <div class="absolute inset-0 transition-all duration-1000" 
           [class.blur-xl]="gameService.viewState() !== 'game' && gameService.bgBlur()"
           [class.scale-110]="gameService.viewState() !== 'game' && gameService.bgBlur()">
        <app-chess-scene></app-chess-scene>
      </div>

      <!-- Views Overlays -->
      @if (gameService.viewState() === 'home' || gameService.viewState() === 'settings') {
        <app-home-view 
          [showSetup]="gameService.viewState() === 'settings'">
        </app-home-view>
      }

      @if (gameService.viewState() === 'marketplace') {
        <app-marketplace-view></app-marketplace-view>
      }

      @if (gameService.viewState() === 'career') {
        <app-career-view></app-career-view>
      }

      @if (gameService.viewState() === 'admin') {
        <app-admin-view></app-admin-view>
      }

      @if (gameService.viewState() === 'game') {
        <!-- Minimal UI for Game Mode -->
        <div class="absolute top-6 left-6 z-40">
           <button (click)="gameService.setView('home')" 
             class="group w-12 h-12 md:w-14 md:h-14 rounded-xl bg-slate-900/80 backdrop-blur-md border border-white/10 hover:border-indigo-400/50 text-white hover:bg-slate-800 transition-all flex items-center justify-center shadow-lg">
             <svg viewBox="0 0 100 100" fill="currentColor" class="w-6 h-6 md:w-7 md:h-7 text-slate-400 group-hover:text-indigo-400 transition-colors">
               <path d="M50 20 L20 45 L30 45 L30 80 L45 80 L45 60 L55 60 L55 80 L70 80 L70 45 L80 45 Z"/>
             </svg>
           </button>
        </div>

        <!-- Status Bar -->
        <div class="absolute top-6 left-1/2 -translate-x-1/2 z-40">
          <div class="px-6 py-3 bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-full shadow-2xl">
            <span class="text-xs font-black uppercase tracking-[0.2em] text-indigo-400 animate-pulse">{{ gameService.gameStatus() }}</span>
          </div>
        </div>

        <!-- GAME OVER OVERLAY -->
        @if (gameService.isGameOver()) {
          <div class="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md animate-fade-in">
             <div class="bg-slate-950 border-2 border-yellow-500/30 rounded-[3rem] p-12 max-w-md w-full text-center shadow-[0_0_100px_rgba(234,179,8,0.2)]">
                <div class="w-24 h-24 bg-yellow-500/20 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-yellow-500/30">
                  <span class="text-5xl">🏆</span>
                </div>
                <h2 class="text-4xl font-black text-white uppercase tracking-tighter mb-2">Partita Terminata</h2>
                <p class="text-indigo-400 font-bold uppercase tracking-widest text-sm mb-10">{{ gameService.gameStatus() }}</p>
                
                <div class="space-y-4">
                  <button (click)="gameService.resetGame()" 
                    class="w-full py-5 bg-gradient-to-r from-yellow-500 to-amber-600 text-black font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all text-sm">
                    Rivincita
                  </button>
                  <button (click)="gameService.setView('home')" 
                    class="w-full py-5 bg-slate-800 text-white font-black uppercase tracking-[0.2em] rounded-2xl border border-white/10 hover:bg-slate-700 transition-all text-sm">
                    Torna al Menu
                  </button>
                </div>
             </div>
          </div>
        }
      }

      <!-- Shared Components (Modals, etc.) -->
      @if (showMenu) {
        <div class="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-6">
           <!-- Content of the previous menu ... -->
           <div class="bg-slate-900 border border-white/10 rounded-3xl p-8 max-w-lg w-full">
              <div class="flex justify-between items-center mb-6">
                <h2 class="text-2xl font-bold">Impostazioni Partita</h2>
                <button (click)="showMenu = false" class="text-slate-400">✕</button>
              </div>
              
              <div class="space-y-6">
                <!-- Piece Styles -->
                <div>
                  <label class="text-sm text-slate-400 mb-2 block uppercase tracking-widest font-bold">Stile Pezzi</label>
                  <div class="grid grid-cols-2 gap-2">
                    @for (s of ['classic', 'neon', 'minimal']; track s) {
                      <button 
                        (click)="gameService.pieceStyle.set(s)"
                        [class.border-blue-500]="gameService.pieceStyle() === s"
                        class="p-3 rounded-xl bg-slate-800 border-2 border-transparent transition-all capitalize text-white">
                        {{s}}
                      </button>
                    }
                  </div>
                </div>

                <!-- Visual Options -->
                <div>
                  <label class="text-sm text-slate-400 mb-2 block uppercase tracking-widest font-bold">Effetti Visivi</label>
                  <div class="flex items-center justify-between p-4 bg-slate-800 rounded-xl">
                    <span class="text-white">Sfocatura Sfondo Home</span>
                    <input type="checkbox" [checked]="gameService.bgBlur()" 
                           (change)="gameService.bgBlur.set(!gameService.bgBlur())"
                           class="w-6 h-6 rounded border-white/10 bg-slate-700">
                  </div>
                </div>


                <button (click)="showMenu = false" class="w-full py-4 bg-blue-600 rounded-2xl font-bold text-white shadow-lg hover:bg-blue-500 transition-all">
                  Conferma e Chiudi
                </button>
              </div>
           </div>
        </div>
      }

      <!-- SHARED TOAST NOTIFICATION -->
      @if (gameService.toast(); as t) {
        <div class="fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] animate-toast-in">
          <div class="px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-xl border flex items-center gap-4 min-w-[300px]"
               [class.bg-emerald-500/20]="t.type === 'success'" [class.border-emerald-500/50]="t.type === 'success'"
               [class.bg-rose-500/20]="t.type === 'error'" [class.border-rose-500/50]="t.type === 'error'"
               [class.bg-blue-500/20]="t.type === 'info'" [class.border-blue-500/50]="t.type === 'info'">
            
            <div class="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                 [class.bg-emerald-500/20]="t.type === 'success'" [class.text-emerald-400]="t.type === 'success'"
                 [class.bg-rose-500/20]="t.type === 'error'" [class.text-rose-400]="t.type === 'error'"
                 [class.bg-blue-500/20]="t.type === 'info'" [class.text-blue-400]="t.type === 'info'">
              {{ t.type === 'success' ? '✅' : (t.type === 'error' ? '❌' : 'ℹ️') }}
            </div>
            
            <div class="flex flex-col">
              <span class="text-[10px] font-black uppercase tracking-widest opacity-60">Notifica di Sistema</span>
              <span class="text-sm font-bold text-white">{{ t.message }}</span>
            </div>
          </div>
        </div>
      }

    </div>
  `,
  styles: [`
    @keyframes toast-in {
      from { transform: translate(-50%, 50px); opacity: 0; }
      to { transform: translate(-50%, 0); opacity: 1; }
    }
    .animate-toast-in { animation: toast-in 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }

    @keyframes float-particle {
      0% { transform: translateY(0) translateX(0); }
      50% { transform: translateY(-20px) translateX(10px); }
      100% { transform: translateY(0) translateX(0); }
    }
    :host {
      display: block;
      width: 100vw;
      height: 100vh;
      background: transparent;
    }
    .main-container {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 10;
      background: radial-gradient(ellipse at top, #1e293b 0%, #0f172a 50%, #020617 100%);
    }
    .animate-blob {
      animation: blob 15s infinite alternate ease-in-out;
    }
    .animate-twinkle {
      animation: twinkle 4s infinite ease-in-out;
    }
    .animate-float-slow {
      animation: float-particle 10s infinite ease-in-out;
    }
    .animate-float-medium {
      animation: float-particle 7s infinite ease-in-out;
    }
    .animation-delay-2000 { animation-delay: 2s; }
    .animation-delay-4000 { animation-delay: 4s; }
    .animation-delay-1000 { animation-delay: 1s; }
  `]
})
export class AppComponent {
  gameService: GameService = inject(GameService);
  supabase = inject(SupabaseService);
  @ViewChild(ChessSceneComponent) scene!: ChessSceneComponent;

  showAssets = false;
  showMenu = false;

  constructor() {
    // Persistent assets loading logic
    effect(async () => {
      const user = this.supabase.user();
      if (user) {
        console.log('AppComponent: User detected, loading persistent assets...');
        await this.gameService.loadUserAssets();
      }
    });
  }

  // Chess Pieces
  pieceTypes: { id: PieceType, label: string }[] = [
    { id: 'p', label: 'Pedone' },
    { id: 'r', label: 'Torre' },
    { id: 'n', label: 'Cavallo' },
    { id: 'b', label: 'Alfiere' },
    { id: 'q', label: 'Regina' },
    { id: 'k', label: 'Re' },
  ];

  // Checker Pieces
  checkerTypes: { id: PieceType, label: string }[] = [
    { id: 'cm', label: 'Pedina (Man)' },
    { id: 'ck', label: 'Dama (King)' }
  ];

  // Track status. Keys are now complex: 'p_w', 'p_b', 'board' etc.
  loadedStatus: Record<string, boolean> = {
    'board': false
  };

  toggleMenu() {
    this.showMenu = !this.showMenu;
  }

  openImportPanel() {
    this.showMenu = false;
    this.showAssets = true;
  }

  getIconForType(type: PieceType): string {
    const icons: Record<string, string> = {
      'p': '♟', 'r': '♜', 'n': '♞', 'b': '♝', 'q': '♛', 'k': '♚'
    };
    return icons[type] || '?';
  }

  /**
   * Handles file selection.
   * type: The piece type ('p', 'k', 'cm'...) or 'board'
   * colorSuffix: 'w' or 'b' (optional, specific for pieces)
   */
}
