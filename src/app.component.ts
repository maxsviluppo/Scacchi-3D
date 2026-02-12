
import { Component, inject, ViewChild } from '@angular/core';
import { ChessSceneComponent } from './components/chess-scene.component';
import { GameService } from './services/game.service';
import { PieceType } from './logic/chess-types';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ChessSceneComponent],
  templateUrl: './app.component.html',
  styles: [`
    @keyframes blob {
      0% { transform: translate(0px, 0px) scale(1); }
      33% { transform: translate(30px, -50px) scale(1.1); }
      66% { transform: translate(-20px, 20px) scale(0.9); }
      100% { transform: translate(0px, 0px) scale(1); }
    }
    @keyframes twinkle {
      0%, 100% { opacity: 0.3; transform: scale(0.8); }
      50% { opacity: 1; transform: scale(1.2); }
    }
    @keyframes float-particle {
      0% { transform: translateY(0) translateX(0); }
      50% { transform: translateY(-20px) translateX(10px); }
      100% { transform: translateY(0) translateX(0); }
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

  // Chess Pieces
  pieceTypes: {id: PieceType, label: string}[] = [
    { id: 'p', label: 'Pedone' },
    { id: 'r', label: 'Torre' },
    { id: 'n', label: 'Cavallo' },
    { id: 'b', label: 'Alfiere' },
    { id: 'q', label: 'Regina' },
    { id: 'k', label: 'Re' },
  ];

  // Checker Pieces
  checkerTypes: {id: PieceType, label: string}[] = [
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
