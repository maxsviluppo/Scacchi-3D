
import { Injectable, signal, computed, inject } from '@angular/core';
import { Board, PieceColor, Position, GameMode } from '../logic/chess-types';
import { ChessUtils } from '../logic/chess-utils';
import { AiService } from './ai.service';

export type PieceStyle = 'minimal' | 'classic' | 'neon' | 'custom';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private aiService = inject(AiService);

  // State Signals
  gameMode = signal<GameMode>('chess');
  board = signal<Board>(ChessUtils.createInitialBoard('chess'));
  turn = signal<PieceColor>('w');
  selectedPos = signal<Position | null>(null);
  pieceStyle = signal<PieceStyle>('classic');
  useOriginalTexture = signal<boolean>(false); 
  
  // Computed
  validMoves = computed(() => {
    const pos = this.selectedPos();
    if (!pos) return [];
    return ChessUtils.getValidMoves(this.board(), pos, this.gameMode());
  });

  isAiThinking = signal(false);
  gameStatus = signal<string>('Tocca al Bianco');

  // Actions
  setPieceStyle(style: PieceStyle) {
    this.pieceStyle.set(style);
  }

  toggleOriginalTexture(value: boolean) {
    this.useOriginalTexture.set(value);
    if (this.pieceStyle() === 'custom') {
       this.pieceStyle.set('custom');
    }
  }

  setGameMode(mode: GameMode) {
    this.gameMode.set(mode);
    this.resetGame();
  }

  selectSquare(pos: Position) {
    if (this.isAiThinking()) return;

    const currentBoard = this.board();
    const piece = currentBoard[pos.row][pos.col];
    const selected = this.selectedPos();

    // Re-select own piece
    if (piece && piece.color === this.turn()) {
      this.selectedPos.set(pos);
      return;
    }

    // Move
    if (selected) {
      const moves = this.validMoves();
      const isMove = moves.some(m => m.row === pos.row && m.col === pos.col);
      
      if (isMove) {
        this.executeMove(selected, pos);
      } else {
        this.selectedPos.set(null);
      }
    }
  }

  async executeMove(from: Position, to: Position) {
    // CRITICAL VALIDATION: Ensure the piece belongs to the current turn
    const currentBoard = this.board();
    const pieceToMove = currentBoard[from.row][from.col];
    
    if (!pieceToMove || pieceToMove.color !== this.turn()) {
        console.warn('Attempted to move invalid piece or opponent piece');
        return;
    }

    const mode = this.gameMode();

    this.board.update(b => {
      const newBoard = b.map(row => [...row]);
      let movingPiece = newBoard[from.row][from.col];

      // Handle Checkers Jump Removal
      if (mode === 'checkers' && Math.abs(to.row - from.row) === 2) {
          const midRow = (from.row + to.row) / 2;
          const midCol = (from.col + to.col) / 2;
          newBoard[midRow][midCol] = null; // Capture
      }

      // Checkers Promotion (Kinging)
      if (mode === 'checkers' && movingPiece?.type === 'cm') {
          if ((movingPiece.color === 'w' && to.row === 0) || (movingPiece.color === 'b' && to.row === 7)) {
              movingPiece = { ...movingPiece, type: 'ck' };
          }
      }

      newBoard[to.row][to.col] = movingPiece;
      newBoard[from.row][from.col] = null;
      return newBoard;
    });

    this.selectedPos.set(null);
    const nextTurn = this.turn() === 'w' ? 'b' : 'w';
    this.turn.set(nextTurn);
    this.gameStatus.set(`${nextTurn === 'w' ? 'Tocca al Bianco' : 'Tocca al Nero'}`);

    // AI Logic 
    if (mode === 'chess' && nextTurn === 'b') {
      // Use setTimeout to allow UI to update before AI freezes thread (though with async it's fine)
      setTimeout(() => this.triggerAiMove(), 50);
    }
  }

  async triggerAiMove() {
    this.isAiThinking.set(true);
    this.gameStatus.set('Gemini sta pensando...');

    try {
      const fen = ChessUtils.boardToFEN(this.board(), 'b');
      const uciMove = await this.aiService.getBestMove(fen);

      if (uciMove) {
        const fromStr = uciMove.substring(0, 2);
        const toStr = uciMove.substring(2, 4);
        
        const from = this.uciToCoords(fromStr);
        const to = this.uciToCoords(toStr);

        if (from && to) {
            // Validate that AI is actually moving a Black piece
            const aiPiece = this.board()[from.row][from.col];
            if (aiPiece && aiPiece.color === 'b') {
                this.executeMove(from, to);
            } else {
                console.error('AI tried to move a White piece or empty square:', fromStr);
                this.gameStatus.set('AI: Errore (Mossa illegale). Tocca a te.');
                this.turn.set('w'); // Skip turn back to human to unblock
            }
        } else {
          this.gameStatus.set('Errore AI: Coordinate non valide');
          this.turn.set('w');
        }
      } else {
        this.gameStatus.set('AI: Impossibile muovere (Resa?)');
        this.turn.set('w');
      }
    } catch (e) {
        console.error('AI Critical Error', e);
        this.gameStatus.set('Errore Connessione AI');
        this.turn.set('w'); // Ensure game is not stuck
    } finally {
        this.isAiThinking.set(false);
    }
  }

  uciToCoords(sq: string): Position | null {
    if (sq.length !== 2) return null;
    const colMap: Record<string, number> = { 'a': 0, 'b': 1, 'c': 2, 'd': 3, 'e': 4, 'f': 5, 'g': 6, 'h': 7 };
    const col = colMap[sq[0]];
    const row = 8 - parseInt(sq[1]); 
    if (isNaN(row) || col === undefined) return null;
    return { row, col };
  }

  resetGame() {
    this.board.set(ChessUtils.createInitialBoard(this.gameMode()));
    this.turn.set('w');
    this.selectedPos.set(null);
    this.gameStatus.set('Tocca al Bianco');
    this.isAiThinking.set(false);
  }
}
