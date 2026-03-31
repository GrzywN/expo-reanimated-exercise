import { useRef, useState } from 'react';
import { Game } from 'js-chess-engine';
import { isOwnPiece } from '../utils';

export function useChessGame() {
  const gameRef = useRef(new Game());
  const [config, setConfig] = useState(() => gameRef.current.exportJson());
  const [selected, setSelected] = useState<string | null>(null);
  const [validMoves, setValidMoves] = useState<string[]>([]);
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(
    null
  );

  // Ref mirror of validMoves — safe to read from gesture worklets via runOnJS closures
  const validMovesRef = useRef<string[]>([]);

  const clearSelection = () => {
    setSelected(null);
    setValidMoves([]);
    validMovesRef.current = [];
  };

  const selectPiece = (square: string): string | null => {
    const piece = config.pieces[square] as string | undefined;

    if (!piece || !isOwnPiece(piece, config.turn)) {
      return null;
    }

    const moves: string[] = gameRef.current.moves(square) ?? [];

    if (moves.length === 0) {
      return null;
    }

    setSelected(square);
    setValidMoves(moves);
    validMovesRef.current = moves;

    return piece;
  };

  const executeMove = (from: string, to: string) => {
    gameRef.current.move(from, to);
    setConfig(gameRef.current.exportJson());
    setLastMove({ from, to });
    clearSelection();
  };

  const handleSquare = (square: string) => {
    if (!square) {
      return;
    }

    if (selected) {
      if (validMovesRef.current.includes(square)) {
        executeMove(selected, square);
        return;
      }

      clearSelection();
    }

    selectPiece(square);
  };

  return {
    config,
    selected,
    validMoves,
    lastMove,
    validMovesRef,
    selectPiece,
    executeMove,
    clearSelection,
    handleSquare,
  };
}
