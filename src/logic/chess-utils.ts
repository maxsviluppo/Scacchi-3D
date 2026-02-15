
import { Board, Piece, PieceType, Position, PieceColor, GameMode } from './chess-types';

export class ChessUtils {
  static createInitialBoard(mode: GameMode = 'chess'): Board {
    const board: Board = Array(8).fill(null).map(() => Array(8).fill(null));

    if (mode === 'chess') {
      // Pawns
      for (let i = 0; i < 8; i++) {
        board[1][i] = { type: 'p', color: 'b' };
        board[6][i] = { type: 'p', color: 'w' };
      }
      // Pieces
      const order: PieceType[] = ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'];
      for (let i = 0; i < 8; i++) {
        board[0][i] = { type: order[i], color: 'b' };
        board[7][i] = { type: order[i], color: 'w' };
      }
    } else {
      // Checkers (Dama) Setup
      // Black on top (rows 0, 1, 2). White on bottom (rows 5, 6, 7).
      // Only on dark squares. ((row + col) % 2 !== 0)
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 8; c++) {
          if ((r + c) % 2 !== 0) board[r][c] = { type: 'cm', color: 'b' };
        }
      }
      for (let r = 5; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          if ((r + c) % 2 !== 0) board[r][c] = { type: 'cm', color: 'w' };
        }
      }
    }

    return board;
  }

  static isValidPos(pos: Position): boolean {
    return pos.row >= 0 && pos.row < 8 && pos.col >= 0 && pos.col < 8;
  }

  static getValidMoves(board: Board, pos: Position, mode: GameMode = 'chess', lastMove: any = null, checkCastling = true): Position[] {
    const piece = board[pos.row][pos.col];
    if (!piece) return [];

    const moves: Position[] = [];

    // --- CHECKERS LOGIC ---
    if (mode === 'checkers') {
      const piece = board[pos.row][pos.col];
      if (!piece) return [];

      const dirs = piece.type === 'ck' ? [[1, 1], [1, -1], [-1, 1], [-1, -1]] :
        (piece.color === 'w' ? [[-1, -1], [-1, 1]] : [[1, -1], [1, 1]]);

      // --- 1. Find Captures (Jumps) ---
      const jumps: Position[] = [];
      for (const [dr, dc] of dirs) {
        let r = pos.row + dr;
        let c = pos.col + dc;

        // Capture Logic (Jump over enemy)
        const jr = pos.row + dr * 2;
        const jc = pos.col + dc * 2;

        if (this.isValidPos({ row: jr, col: jc }) && board[jr][jc] === null) {
          const mid = board[r][c];
          if (mid && mid.color !== piece.color) {
            // Italian Checkers Rule: Man cannot capture King
            if (piece.type === 'cm' && mid.type === 'ck') continue;

            jumps.push({ row: jr, col: jc });
          }
        }
      }

      // If this piece has jumps, return only jumps (local mandatory rule will be enforced globally later)
      if (jumps.length > 0) return jumps;

      // --- 2. Simple Moves ---
      for (const [dr, dc] of dirs) {
        const sr = pos.row + dr;
        const sc = pos.col + dc;
        if (this.isValidPos({ row: sr, col: sc }) && board[sr][sc] === null) {
          moves.push({ row: sr, col: sc });
        }
      }
      return moves;
    }

    // --- CHESS LOGIC ---

    const direction = piece.color === 'w' ? -1 : 1;
    const startRow = piece.color === 'w' ? 6 : 1;

    // Helper
    const tryAdd = (r: number, c: number, captureOnly = false, moveOnly = false) => {
      if (!this.isValidPos({ row: r, col: c })) return false;
      const target = board[r][c];
      if (moveOnly && target !== null) return false;
      if (captureOnly && (target === null || target.color === piece.color)) return false;
      if (!captureOnly && !moveOnly && target?.color === piece.color) return false;
      moves.push({ row: r, col: c });
      return target !== null;
    };

    if (piece.type === 'p') {
      const r1 = pos.row + direction;
      // Normal push
      if (this.isValidPos({ row: r1, col: pos.col }) && board[r1][pos.col] === null) {
        moves.push({ row: r1, col: pos.col });
        // Initial double push
        const r2 = pos.row + direction * 2;
        if (pos.row === startRow && this.isValidPos({ row: r2, col: pos.col }) && board[r2][pos.col] === null) {
          moves.push({ row: r2, col: pos.col });
        }
      }
      // Captures
      [[r1, pos.col - 1], [r1, pos.col + 1]].forEach(([r, c]) => {
        if (this.isValidPos({ row: r, col: c })) {
          const target = board[r][c];
          if (target && target.color !== piece.color) {
            moves.push({ row: r, col: c });
          }
          // --- EN PASSANT ---
          if (!target && lastMove && lastMove.piece.type === 'p' &&
            lastMove.to.row === pos.row && lastMove.to.col === c &&
            Math.abs(lastMove.from.row - lastMove.to.row) === 2) {
            moves.push({ row: r, col: c });
          }
        }
      });
    } else {
      const directions: Record<string, number[][]> = {
        'r': [[1, 0], [-1, 0], [0, 1], [0, -1]],
        'b': [[1, 1], [1, -1], [-1, 1], [-1, -1]],
        'q': [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]],
        'n': [[2, 1], [2, -1], [-2, 1], [-2, -1], [1, 2], [1, -2], [-1, 2], [-1, -2]],
        'k': [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]]
      };

      const dirs = directions[piece.type] || [];
      const isSingleStep = piece.type === 'n' || piece.type === 'k';

      for (const [dr, dc] of dirs) {
        let r = pos.row + dr;
        let c = pos.col + dc;
        while (this.isValidPos({ row: r, col: c })) {
          const target = board[r][c];
          if (target === null) {
            moves.push({ row: r, col: c });
            if (isSingleStep) break;
          } else {
            if (target.color !== piece.color) {
              moves.push({ row: r, col: c });
            }
            break;
          }
          r += dr;
          c += dc;
        }
      }

      // --- CASTLING (ARROCCO) ---
      if (checkCastling && piece.type === 'k' && !piece.hasMoved && !this.isKingInCheck(board, piece.color)) {
        // Kingside
        const rookK = board[pos.row][7];
        if (rookK && rookK.type === 'r' && !rookK.hasMoved && !board[pos.row][5] && !board[pos.row][6]) {
          if (!this.isSquareAttacked(board, { row: pos.row, col: 5 }, piece.color)) {
            moves.push({ row: pos.row, col: 6 });
          }
        }
        // Queenside
        const rookQ = board[pos.row][0];
        if (rookQ && rookQ.type === 'r' && !rookQ.hasMoved && !board[pos.row][1] && !board[pos.row][2] && !board[pos.row][3]) {
          if (!this.isSquareAttacked(board, { row: pos.row, col: 3 }, piece.color)) {
            moves.push({ row: pos.row, col: 2 });
          }
        }
      }
    }

    return moves;
  }

  static getLegalMoves(board: Board, pos: Position, mode: GameMode = 'chess', lastMove: any = null): Position[] {
    const validMoves = this.getValidMoves(board, pos, mode, lastMove);

    if (mode === 'checkers') {
      const piece = board[pos.row][pos.col];
      if (!piece) return [];

      // Mandatory capture logic:
      let anyoneCanCapture = false;
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          const p = board[r][c];
          if (p && p.color === piece.color) {
            const pieceMoves = this.getValidMoves(board, { row: r, col: c }, 'checkers', lastMove);
            const hasCapture = pieceMoves.some(m => Math.abs(m.row - r) === 2);
            if (hasCapture) {
              anyoneCanCapture = true;
              break;
            }
          }
        }
        if (anyoneCanCapture) break;
      }

      if (anyoneCanCapture) {
        return validMoves.filter(m => Math.abs(m.row - pos.row) === 2);
      }
      return validMoves;
    }

    const piece = board[pos.row][pos.col];
    if (!piece) return [];

    return validMoves.filter(to => {
      const simulatedBoard = this.simulateMove(board, pos, to);
      return !this.isKingInCheck(simulatedBoard, piece.color);
    });
  }

  static isKingInCheck(board: Board, color: PieceColor): boolean {
    let kingPos: Position | null = null;
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = board[r][c];
        if (p && p.type === 'k' && p.color === color) {
          kingPos = { row: r, col: c };
          break;
        }
      }
      if (kingPos) break;
    }

    if (!kingPos) return false;
    return this.isSquareAttacked(board, kingPos, color);
  }

  static isSquareAttacked(board: Board, pos: Position, color: PieceColor): boolean {
    const opponentColor: PieceColor = color === 'w' ? 'b' : 'w';
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = board[r][c];
        if (p && p.color === opponentColor) {
          const attacks = this.getValidMoves(board, { row: r, col: c }, 'chess', null, false);
          if (attacks.some(m => m.row === pos.row && m.col === pos.col)) {
            return true;
          }
        }
      }
    }
    return false;
  }

  static simulateMove(board: Board, from: Position, to: Position): Board {
    const newBoard = board.map(row => [...row]);
    newBoard[to.row][to.col] = newBoard[from.row][from.col];
    newBoard[from.row][from.col] = null;
    return newBoard;
  }

  static isCheckmate(board: Board, color: PieceColor): boolean {
    if (!this.isKingInCheck(board, color)) return false;

    // If any piece has a legal move, it's not checkmate
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = board[r][c];
        if (p && p.color === color) {
          if (this.getLegalMoves(board, { row: r, col: c }, 'chess').length > 0) {
            return false;
          }
        }
      }
    }
    return true;
  }

  static isStalemate(board: Board, color: PieceColor): boolean {
    if (this.isKingInCheck(board, color)) return false;

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = board[r][c];
        if (p && p.color === color) {
          if (this.getLegalMoves(board, { row: r, col: c }, 'chess').length > 0) {
            return false;
          }
        }
      }
    }
    return true;
  }


  // --- EVALUATION & HEURISTICS (User Training Data) ---

  static readonly PIECE_VALUES: Record<string, number> = {
    'p': 100, 'n': 320, 'b': 330, 'r': 500, 'q': 900, 'k': 20000,
    'cm': 100, 'ck': 300
  };

  static readonly PAWN_PST = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [50, 50, 50, 50, 50, 50, 50, 50],
    [10, 10, 20, 30, 30, 20, 10, 10],
    [5, 5, 10, 25, 25, 10, 5, 5],
    [0, 0, 0, 20, 20, 0, 0, 0],
    [5, -5, -10, 0, 0, -10, -5, 5],
    [5, 10, 10, -20, -20, 10, 10, 5],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];

  static readonly CHECKERS_PST = [
    [0, 50, 0, 50, 0, 50, 0, 50],   // Promotion Row (Black start) - Goal for White
    [40, 0, 40, 0, 40, 0, 40, 0],   // Defensive row
    [0, 30, 0, 10, 0, 10, 0, 30],   // Side protection
    [20, 0, 25, 0, 25, 0, 20, 0],   // Center control
    [0, 20, 0, 25, 0, 25, 0, 20],   // Center control
    [30, 0, 10, 0, 10, 0, 30, 0],   // Side protection
    [0, 40, 0, 40, 0, 40, 0, 40],   // Defensive row
    [50, 0, 50, 0, 50, 0, 50, 0]    // Promotion Row (White start) - Goal for Black
  ];

  static readonly KNIGHT_PST = [
    [-50, -40, -30, -30, -30, -30, -40, -50],
    [-40, -20, 0, 0, 0, 0, -20, -40],
    [-30, 0, 10, 15, 15, 10, 0, -30],
    [-30, 5, 15, 20, 20, 15, 5, -30],
    [-30, 0, 15, 20, 20, 15, 0, -30],
    [-30, 5, 10, 15, 15, 10, 5, -30],
    [-40, -20, 0, 5, 5, 0, -20, -40],
    [-50, -40, -30, -30, -30, -30, -40, -50]
  ];

  static evaluateBoard(board: Board, mode: GameMode = 'chess'): number {
    let score = 0;
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = board[r][c];
        if (piece) {
          const val = this.PIECE_VALUES[piece.type] || 0;
          let pstBonus = 0;

          if (mode === 'chess') {
            const tr = piece.color === 'w' ? r : 7 - r;
            if (piece.type === 'p') pstBonus = this.PAWN_PST[tr][c];
            if (piece.type === 'n') pstBonus = this.KNIGHT_PST[tr][c];
          } else if (mode === 'checkers') {
            const tr = piece.color === 'w' ? r : 7 - r;
            // In checkers, moving forward is good
            pstBonus = this.CHECKERS_PST[tr][c];
          }

          if (piece.color === 'w') score += val + pstBonus;
          else score -= (val + pstBonus);
        }
      }
    }
    return score;
  }

  // --- MINIMAX LOCAL ENGINE ---
  static getBestMoveLocal(board: Board, mode: GameMode, depth: number, color: PieceColor): string | null {
    let bestMove = null;
    let bestValue = color === 'w' ? -Infinity : Infinity;

    const moves = this.getAllUciMoves(board, color, mode);
    for (const uci of moves) {
      const from = this.uciToCoords(uci.substring(0, 2));
      const to = this.uciToCoords(uci.substring(2, 4));
      if (!from || !to) continue;

      const simulated = this.simulateMove(board, from, to);
      const val = this.minimax(simulated, depth - 1, -Infinity, Infinity, color === 'b', mode);

      if (color === 'w') {
        if (val > bestValue) { bestValue = val; bestMove = uci; }
      } else {
        if (val < bestValue) { bestValue = val; bestMove = uci; }
      }
    }
    return bestMove;
  }

  static minimax(board: Board, depth: number, alpha: number, beta: number, isMaximizing: boolean, mode: GameMode): number {
    if (depth === 0) return this.evaluateBoard(board, mode);

    const turnColor: PieceColor = isMaximizing ? 'w' : 'b';
    const moves = this.getAllUciMoves(board, turnColor, mode);

    if (moves.length === 0) {
      if (this.isKingInCheck(board, turnColor)) return isMaximizing ? -100000 : 100000;
      return 0; // Stalemate
    }

    if (isMaximizing) {
      let maxEval = -Infinity;
      for (const uci of moves) {
        const from = this.uciToCoords(uci.substring(0, 2))!;
        const to = this.uciToCoords(uci.substring(2, 4))!;
        const evalScore = this.minimax(this.simulateMove(board, from, to), depth - 1, alpha, beta, false, mode);
        maxEval = Math.max(maxEval, evalScore);
        alpha = Math.max(alpha, evalScore);
        if (beta <= alpha) break;
      }
      return maxEval;
    } else {
      let minEval = Infinity;
      for (const uci of moves) {
        const from = this.uciToCoords(uci.substring(0, 2))!;
        const to = this.uciToCoords(uci.substring(2, 4))!;
        const evalScore = this.minimax(this.simulateMove(board, from, to), depth - 1, alpha, beta, true, mode);
        minEval = Math.min(minEval, evalScore);
        beta = Math.min(beta, evalScore);
        if (beta <= alpha) break;
      }
      return minEval;
    }
  }

  static getAllUciMoves(board: Board, color: PieceColor, mode: GameMode): string[] {
    const list: string[] = [];
    const cols = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = board[r][c];
        if (p && p.color === color) {
          const fromPos: Position = { row: r, col: c };
          const legalMoves = this.getLegalMoves(board, fromPos, mode);
          legalMoves.forEach(to => {
            list.push(`${cols[fromPos.col]}${8 - fromPos.row}${cols[to.col]}${8 - to.row}`);
          });
        }
      }
    }
    return list;
  }

  static uciToCoords(sq: string): Position | null {
    const colMap: any = { 'a': 0, 'b': 1, 'c': 2, 'd': 3, 'e': 4, 'f': 5, 'g': 6, 'h': 7 };
    const col = colMap[sq[0]];
    const row = 8 - parseInt(sq[1]);
    if (isNaN(row) || col === undefined) return null;
    return { row, col };
  }

  static boardToFEN(board: Board, turn: PieceColor): string {
    let fen = '';
    for (let r = 0; r < 8; r++) {
      let empty = 0;
      for (let c = 0; c < 8; c++) {
        const p = board[r][c];
        if (p) {
          if (empty > 0) {
            fen += empty;
            empty = 0;
          }
          let char = p.type;
          if (char === 'ck') char = 'k';
          if (char === 'cm') char = 'p';
          fen += p.color === 'w' ? char.toUpperCase() : char.toLowerCase();
        } else {
          empty++;
        }
      }
      if (empty > 0) fen += empty;
      if (r < 7) fen += '/';
    }
    fen += ` ${turn} - - 0 1`;
    return fen;
  }
}
