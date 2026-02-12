
import { Injectable, signal, computed, inject } from '@angular/core';
import { Board, PieceColor, Position, GameMode, LastMove, Piece } from '../logic/chess-types';
import { ChessUtils } from '../logic/chess-utils';
import { AiService } from './ai.service';

export type PieceStyle = 'minimal' | 'classic' | 'neon' | 'custom';
export type AppView = 'home' | 'game' | 'settings' | 'admin' | 'marketplace' | 'adventure' | 'career';
export type PlayerMode = 'ai' | 'local' | 'online';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private aiService = inject(AiService);

  // App Navigation
  viewState = signal<AppView>('home');

  // State Signals
  gameMode = signal<GameMode>('chess');
  playerMode = signal<PlayerMode>('local');
  board = signal<Board>(ChessUtils.createInitialBoard('chess'));
  turn = signal<PieceColor>('w');
  selectedPos = signal<Position | null>(null);
  pieceStyle = signal<PieceStyle>('classic');
  useOriginalTexture = signal<boolean>(false);
  bgBlur = signal<boolean>(true);

  // Animation State
  lastMove = signal<LastMove | null>(null);

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

  setView(view: AppView) {
    this.viewState.set(view);
  }

  startGame(mode: GameMode, playerMode: PlayerMode = 'local') {
    this.gameMode.set(mode);
    this.playerMode.set(playerMode);
    this.resetGame();
    this.viewState.set('game');
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
    // CRITICAL VALIDATION
    const currentBoard = this.board();
    const pieceToMove = currentBoard[from.row][from.col];

    if (!pieceToMove || pieceToMove.color !== this.turn()) {
      console.warn('Attempted to move invalid piece');
      return;
    }

    const mode = this.gameMode();
    let capturedPiece: Piece | null = null;
    let capturedPos: Position | null = null;
    let isJump = false;

    // --- DETECTION LOGIC ---
    if (mode === 'checkers') {
      // Checkers Capture (Jump over)
      if (Math.abs(to.row - from.row) === 2) {
        const midRow = (from.row + to.row) / 2;
        const midCol = (from.col + to.col) / 2;
        capturedPiece = currentBoard[midRow][midCol];
        capturedPos = { row: midRow, col: midCol };
        isJump = true;
      }
    } else {
      // Chess Capture (Land on)
      const target = currentBoard[to.row][to.col];
      if (target) {
        capturedPiece = target;
        capturedPos = { ...to };
        isJump = true;
      }
      // Knight always jumps nicely
      if (pieceToMove.type === 'n') {
        isJump = true;
      }
    }

    // Prepare Animation Data
    const moveData: LastMove = {
      from,
      to,
      piece: pieceToMove,
      capturedPiece,
      capturedPos,
      isJump
    };

    // Update Board State
    this.board.update(b => {
      const newBoard = b.map(row => [...row]);
      let movingPiece = newBoard[from.row][from.col];

      // Handle Checkers Jump Removal
      if (capturedPos && mode === 'checkers') {
        newBoard[capturedPos.row][capturedPos.col] = null;
      }

      // Checkers Promotion
      if (mode === 'checkers' && movingPiece?.type === 'cm') {
        if ((movingPiece.color === 'w' && to.row === 0) || (movingPiece.color === 'b' && to.row === 7)) {
          movingPiece = { ...movingPiece, type: 'ck' };
          moveData.piece = movingPiece; // Update animation reference
        }
      }

      newBoard[to.row][to.col] = movingPiece;
      newBoard[from.row][from.col] = null;
      return newBoard;
    });

    // Notify Scene
    this.lastMove.set(moveData);

    this.selectedPos.set(null);
    const nextTurn = this.turn() === 'w' ? 'b' : 'w';
    this.turn.set(nextTurn);
    this.gameStatus.set(`${nextTurn === 'w' ? 'Tocca al Bianco' : 'Tocca al Nero'}`);

    // AI Trigger
    if (nextTurn === 'b' && this.playerMode() === 'ai') {
      setTimeout(() => this.triggerAiMove(), 700); // Slight delay to let animation start
    }
  }

  private async triggerAiMove() {
    // Only trigger AI if we're in AI mode and it's black's turn
    if (this.playerMode() !== 'ai' || this.turn() !== 'b') {
      return;
    }

    this.isAiThinking.set(true);
    this.gameStatus.set('Gemini sta pensando...');

    try {
      const fen = ChessUtils.boardToFEN(this.board(), 'b');
      const legalMoves = this.getAllLegalMoves('b');

      if (legalMoves.length === 0) {
        this.gameStatus.set('Scacco Matto / Stallo! Partita finita.');
        this.isAiThinking.set(false);
        return;
      }

      const uciMove = await this.aiService.getBestMove(fen, legalMoves, this.gameMode());

      let chosenMove = uciMove;

      if (!chosenMove || !legalMoves.includes(chosenMove)) {
        console.warn('AI unavailable. Using CPU Fallback.');
        const randomIndex = Math.floor(Math.random() * legalMoves.length);
        chosenMove = legalMoves[randomIndex];
        this.gameStatus.set('CPU (Offline)');
      }

      if (chosenMove) {
        const from = this.uciToCoords(chosenMove.substring(0, 2));
        const to = this.uciToCoords(chosenMove.substring(2, 4));
        if (from && to) {
          this.executeMove(from, to);
        }
      }

    } catch (e) {
      console.error('AI Critical Error', e);
      const legalMoves = this.getAllLegalMoves('b');
      if (legalMoves.length > 0) {
        const fallback = legalMoves[Math.floor(Math.random() * legalMoves.length)];
        const f = this.uciToCoords(fallback.substring(0, 2));
        const t = this.uciToCoords(fallback.substring(2, 4));
        if (f && t) this.executeMove(f, t);
      } else {
        this.handleAiError('Errore Fatale');
      }
    } finally {
      this.isAiThinking.set(false);
    }
  }

  getAllLegalMoves(color: PieceColor): string[] {
    const moves: string[] = [];
    const board = this.board();
    const cols = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = board[r][c];
        if (piece && piece.color === color) {
          const from: Position = { row: r, col: c };
          const valid = ChessUtils.getValidMoves(board, from, this.gameMode());

          valid.forEach(to => {
            const uci = `${cols[from.col]}${8 - from.row}${cols[to.col]}${8 - to.row}`;
            moves.push(uci);
          });
        }
      }
    }
    return moves;
  }

  private handleAiError(msg: string) {
    this.gameStatus.set(`${msg} Tocca a te.`);
    this.turn.set('w');
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
    this.lastMove.set(null);
    this.gameStatus.set('Tocca al Bianco');
    this.isAiThinking.set(false);
  }
}
