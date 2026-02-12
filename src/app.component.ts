import { Component, inject, ViewChild } from '@angular/core';
import { ChessSceneComponent } from './components/chess-scene.component';
import { HomeViewComponent } from './components/home-view.component';
import { GameService } from './services/game.service';
import { PieceType, Position } from './logic/chess-types';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ChessSceneComponent, HomeViewComponent],
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
          [showSetup]="gameService.viewState() === 'settings'"
          (fileSelected)="onFileSelected($event.event, $event.type, $event.colorSuffix)">
        </app-home-view>
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

    </div>
  `,
  styles: [`
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
  gameService = inject(GameService);
  @ViewChild(ChessSceneComponent) scene!: ChessSceneComponent;

  showAssets = false;
  showMenu = false;

  constructor() {
    // Component initialization
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
  onFileSelected(event: Event, type: string, colorSuffix?: string) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      // Construct the key for the scene loader
      // If board: key='board'
      // If piece with color: key='p_w' or 'p_b'
      // If generic (legacy fallback): key='p'

      let key = type;
      if (type !== 'board' && colorSuffix) {
        key = `${type}_${colorSuffix}`;
      }

      // Pass file to scene component to load
      this.scene.loadCustomModel(file, key);

      // Update local status
      this.loadedStatus[key] = true;

      // Auto-switch to custom style
      if (type !== 'board') {
        this.gameService.setPieceStyle('custom');
      }
    }
  }
}
