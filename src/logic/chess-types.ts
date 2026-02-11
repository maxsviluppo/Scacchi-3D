
export type GameMode = 'chess' | 'checkers';

// 'cm' = Checker Man (Pedina), 'ck' = Checker King (Dama)
export type PieceType = 'p' | 'r' | 'n' | 'b' | 'q' | 'k' | 'cm' | 'ck';
export type PieceColor = 'w' | 'b';

export interface Piece {
  type: PieceType;
  color: PieceColor;
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
