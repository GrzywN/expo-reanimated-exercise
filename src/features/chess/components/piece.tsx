import { type FC } from 'react';
import { SvgProps } from 'react-native-svg';

import WK from '../../../../assets/chess/pieces/wK.svg';
import WQ from '../../../../assets/chess/pieces/wQ.svg';
import WR from '../../../../assets/chess/pieces/wR.svg';
import WB from '../../../../assets/chess/pieces/wB.svg';
import WN from '../../../../assets/chess/pieces/wN.svg';
import WP from '../../../../assets/chess/pieces/wP.svg';
import BK from '../../../../assets/chess/pieces/bK.svg';
import BQ from '../../../../assets/chess/pieces/bQ.svg';
import BR from '../../../../assets/chess/pieces/bR.svg';
import BB from '../../../../assets/chess/pieces/bB.svg';
import BN from '../../../../assets/chess/pieces/bN.svg';
import BP from '../../../../assets/chess/pieces/bP.svg';

const PIECES: Record<string, FC<SvgProps>> = {
  wK: WK,
  wQ: WQ,
  wR: WR,
  wB: WB,
  wN: WN,
  wP: WP,
  bK: BK,
  bQ: BQ,
  bR: BR,
  bB: BB,
  bN: BN,
  bP: BP,
};

function toPieceKey(piece: string): string {
  const color = piece === piece.toUpperCase() ? 'w' : 'b';
  return color + piece.toUpperCase();
}

export interface PieceProps {
  piece: string;
  size: number;
}

export function Piece({ piece, size }: PieceProps) {
  const Component = PIECES[toPieceKey(piece)];

  if (!Component) {
    return null;
  }

  return <Component width={size} height={size} />;
}
