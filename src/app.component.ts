
import { Component, inject, ViewChild } from '@angular/core';
import { ChessSceneComponent } from './components/chess-scene.component';
import { GameService } from './services/game.service';
import { PieceType } from './logic/chess-types';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ChessSceneComponent],
  templateUrl: './app.component.html'
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
