
import { Injectable, signal, computed, inject } from '@angular/core';
import { Board, PieceColor, Position, GameMode, LastMove, Piece } from '../logic/chess-types';
import { ChessUtils } from '../logic/chess-utils';
import { AiService } from './ai.service';
import { SupabaseService } from './supabase.service';


export type PieceStyle = 'minimal' | 'classic' | 'neon' | 'custom';
export type AppView = 'home' | 'game' | 'settings' | 'admin' | 'marketplace' | 'adventure' | 'career';
export type PlayerMode = 'ai' | 'local' | 'online' | 'career';

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

  // Career State
  careerLevel = signal<number>(1);
  careerPoints = signal<number>(0);
  isCareerGame = computed(() => this.playerMode() === 'career');

  // Animation State
  lastMove = signal<LastMove | null>(null);

  // Computed
  validMoves = computed(() => {
    const pos = this.selectedPos();
    if (!pos) return [];
    return ChessUtils.getLegalMoves(this.board(), pos, this.gameMode());
  });

  isAiThinking = signal(false);
  isGameOver = signal(false);
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

  startGame(mode: GameMode, playerMode: PlayerMode = 'local', level?: number) {
    this.gameMode.set(mode);
    this.playerMode.set(playerMode);
    if (playerMode === 'career' && level) {
      this.careerLevel.set(level);
    }
    this.resetGame();
    this.viewState.set('game');
  }

  setGameMode(mode: GameMode) {
    this.gameMode.set(mode);
    this.resetGame();
  }

  selectSquare(pos: Position) {
    if (this.isAiThinking() || this.isGameOver()) return;

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

    // --- GAME OVER DETECTION ---
    const board = this.board();
    let gameOver = false;
    let winner: PieceColor | 'draw' | null = null;

    if (mode === 'chess') {
      if (ChessUtils.isCheckmate(board, nextTurn)) {
        this.gameStatus.set(`SCACCO MATTO! Vince il ${this.turn() === 'b' ? 'Bianco' : 'Nero'}`);
        gameOver = true;
        winner = this.turn();
      } else if (ChessUtils.isStalemate(board, nextTurn)) {
        this.gameStatus.set('STALLO! Pareggio.');
        gameOver = true;
        winner = 'draw';
      } else if (ChessUtils.isKingInCheck(board, nextTurn)) {
        this.gameStatus.set(`SCACCO al ${nextTurn === 'w' ? 'Bianco' : 'Nero'}!`);
      } else {
        this.gameStatus.set(`Tocca al ${nextTurn === 'w' ? 'Bianco' : 'Nero'}`);
      }
    } else {
      const hasMoves = this.getAllLegalMoves(nextTurn).length > 0;
      if (!hasMoves) {
        this.gameStatus.set(`${this.turn() === 'b' ? 'Bianco' : 'Nero'} vince!`);
        gameOver = true;
        winner = this.turn();
      } else {
        this.gameStatus.set(`Tocca al ${nextTurn === 'w' ? 'Bianco' : 'Nero'}`);
      }
    }

    if (gameOver) {
      this.isGameOver.set(true);
      if (this.playerMode() === 'career') {
        this.handleCareerEnd(winner);
      }
      return;
    }

    // Save Career Game progress if active
    if (this.playerMode() === 'career') {
      this.saveCareerState();
    }

    // AI Trigger
    if (nextTurn === 'b' && (this.playerMode() === 'ai' || this.playerMode() === 'career')) {
      setTimeout(() => this.triggerAiMove(), 700);
    }
  }

  private supabase = inject(SupabaseService);

  private saveCareerState() {
    this.supabase.saveCareerGame(this.gameMode(), this.careerLevel(), {
      board: this.board(),
      turn: this.turn(),
      lastMove: this.lastMove()
    });
  }

  private async handleCareerEnd(winner: PieceColor | 'draw' | null) {
    if (winner === 'w') { // Player won
      const points = 100 + (this.careerLevel() * 10);
      await this.supabase.updateCareerProgress(this.gameMode(), this.careerLevel(), points);
      this.gameStatus.set(`${this.gameStatus()} +${points} PUNTI! LIVELLO SUPERATO.`);
    } else {
      await this.supabase.clearSavedGame();
    }
  }

  private async triggerAiMove() {
    // Only trigger AI if we're in AI or Career mode and it's black's turn
    if ((this.playerMode() !== 'ai' && this.playerMode() !== 'career') || this.turn() !== 'b') {
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

      const level = this.playerMode() === 'career' ? this.careerLevel() : 50; // Default to 50 for normal AI matches
      const uciMove = await this.aiService.getBestMove(fen, legalMoves, this.gameMode(), level);

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
          const valid = ChessUtils.getLegalMoves(board, from, this.gameMode());

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
    this.isGameOver.set(false);
  }
}
