
export type GameMode = 'chess' | 'checkers';

// 'cm' = Checker Man (Pedina), 'ck' = Checker King (Dama)
export type PieceType = 'p' | 'r' | 'n' | 'b' | 'q' | 'k' | 'cm' | 'ck';
export type PieceColor = 'w' | 'b';

export interface Piece {
  type: PieceType;
  color: PieceColor;
  hasMoved?: boolean;
}

export type Board = (Piece | null)[][];

export interface Position {
  row: number;
  col: number;
}

export interface Move {
  from: Position;
  to: Position;
}

export interface LastMove {
  from: Position;
  to: Position;
  piece: Piece; // Il pezzo che si muove
  capturedPiece?: Piece | null; // Il pezzo eventualmente catturato
  capturedPos?: Position | null; // Dove si trovava il pezzo catturato
  isJump: boolean; // Se è un salto (cattura o movimento cavallo)
}
