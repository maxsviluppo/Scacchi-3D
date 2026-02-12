
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

  static getValidMoves(board: Board, pos: Position, mode: GameMode = 'chess'): Position[] {
    const piece = board[pos.row][pos.col];
    if (!piece) return [];

    const moves: Position[] = [];

    // --- CHECKERS LOGIC (Simplified for Visual Play) ---
    if (mode === 'checkers') {
      // Checkers move diagonally. 
      // Man: Forward 1. King: Forward/Back 1 (or more depending on rules, keeping simple 1 step + jumps)
      const dirs = piece.type === 'ck' ? [[1, 1], [1, -1], [-1, 1], [-1, -1]] :
        (piece.color === 'w' ? [[-1, -1], [-1, 1]] : [[1, -1], [1, 1]]);

      // Simple moves
      for (const [dr, dc] of dirs) {
        const r = pos.row + dr;
        const c = pos.col + dc;
        if (this.isValidPos({ row: r, col: c }) && board[r][c] === null) {
          moves.push({ row: r, col: c });
        }

        // Simple Jumps (Captures) - Visual only validation (not forced capture logic)
        const jr = pos.row + (dr * 2);
        const jc = pos.col + (dc * 2);
        if (this.isValidPos({ row: jr, col: jc }) && board[jr][jc] === null) {
          // Check if there is an enemy in between
          const mr = pos.row + dr;
          const mc = pos.col + dc;
          const mid = board[mr][mc];
          if (mid && mid.color !== piece.color) {
            moves.push({ row: jr, col: jc });
          }
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
      if (this.isValidPos({ row: r1, col: pos.col }) && board[r1][pos.col] === null) {
        moves.push({ row: r1, col: pos.col });
        const r2 = pos.row + direction * 2;
        if (pos.row === startRow && this.isValidPos({ row: r2, col: pos.col }) && board[r2][pos.col] === null) {
          moves.push({ row: r2, col: pos.col });
        }
      }
      [[r1, pos.col - 1], [r1, pos.col + 1]].forEach(([r, c]) => {
        if (this.isValidPos({ row: r, col: c })) {
          const target = board[r][c];
          if (target && target.color !== piece.color) {
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
    }

    return moves;
  }

  static getLegalMoves(board: Board, pos: Position, mode: GameMode = 'chess'): Position[] {
    const validMoves = this.getValidMoves(board, pos, mode);
    if (mode === 'checkers') return validMoves;

    const piece = board[pos.row][pos.col];
    if (!piece) return [];

    // Filter moves that leave the king in check
    return validMoves.filter(to => {
      const simulatedBoard = this.simulateMove(board, pos, to);
      return !this.isKingInCheck(simulatedBoard, piece.color);
    });
  }

  static isKingInCheck(board: Board, color: PieceColor): boolean {
    // 1. Find the King
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

    // 2. Check if any opponent piece can reach the king
    const opponentColor: PieceColor = color === 'w' ? 'b' : 'w';
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = board[r][c];
        if (p && p.color === opponentColor) {
          const attacks = this.getValidMoves(board, { row: r, col: c }, 'chess');
          if (attacks.some(m => m.row === kingPos!.row && m.col === kingPos!.col)) {
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

  static boardToFEN(board: Board, turn: PieceColor): string {
    let fen = '';
    for (let r = 0; r < 8; r++) {
      let empty = 0;
      for (let c = 0; c < 8; c++) {
        const p = board[r][c];
        if (p) {
          if (empty > 0) { fen += empty; empty = 0; }
          const char = p.type === 'cm' ? 'p' : (p.type === 'ck' ? 'k' : p.type);
          fen += p.color === 'w' ? char.toUpperCase() : char;
        } else {
          empty++;
        }
      }
      if (empty > 0) fen += empty;
      if (r < 7) fen += '/';
    }
    fen += ` ${turn} KQkq - 0 1`;
    return fen;
  }
}
