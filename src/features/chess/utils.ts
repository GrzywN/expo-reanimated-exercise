import { FILES, RANKS, SQUARE_SIZE } from './constants';

export interface ChessConfig {
  turn: 'white' | 'black';
  pieces: Record<string, string>;
  moves: Record<string, string[]>;
  isFinished: boolean;
  check: boolean;
  checkMate: boolean;
}

export function squareFromXY(x: number, y: number): string {
  'worklet';
  const column = Math.floor(x / SQUARE_SIZE);
  const row = Math.floor(y / SQUARE_SIZE);

  if (column < 0 || column > 7 || row < 0 || row > 7) {
    return '';
  }

  return FILES[column] + RANKS[row];
}

export function isOwnPiece(piece: string, turn: string): boolean {
  const isWhitePiece = piece === piece.toUpperCase();

  if (turn === 'white' && isWhitePiece) {
    return true;
  }

  if (turn === 'black' && !isWhitePiece) {
    return true;
  }

  return false;
}

export function findKingSquare(
  pieces: Record<string, string>,
  turn: string
): string | null {
  const kingCode = turn === 'white' ? 'K' : 'k';
  return Object.keys(pieces).find((sq) => pieces[sq] === kingCode) ?? null;
}
