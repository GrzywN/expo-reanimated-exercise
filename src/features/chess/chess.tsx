import { useRef, useState } from 'react';
import { View, Pressable, StyleSheet, Dimensions } from 'react-native';
import { Game } from 'js-chess-engine';
import { Piece } from './components/piece';
const FILES = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'] as const;
const RANKS = ['8', '7', '6', '5', '4', '3', '2', '1'] as const;

const BOARD_SIZE = Dimensions.get('window').width;
const SQUARE_SIZE = BOARD_SIZE / 8;

export function Chess() {
  const gameRef = useRef(new Game());
  const [config, setConfig] = useState(() => gameRef.current.exportJson());
  const [selected, setSelected] = useState<string | null>(null);
  const [validMoves, setValidMoves] = useState<string[]>([]);

  const handleSquare = (square: string) => {
    const game = gameRef.current;

    if (selected) {
      if (validMoves.includes(square)) {
        game.move(selected, square);

        setConfig(game.exportJson());
        setSelected(null);
        setValidMoves([]);

        return;
      }

      setSelected(null);
      setValidMoves([]);
    }

    const piece = config.pieces[square];

    if (!piece) {
      return;
    }

    const isWhiteTurn = config.turn === 'white';
    const isWhitePiece = piece === piece.toUpperCase();

    if (isWhiteTurn !== isWhitePiece) {
      return;
    }

    const moves: string[] = game.moves(square) ?? [];

    if (moves.length === 0) {
      return;
    }

    setSelected(square);
    setValidMoves(moves);
  };

  return (
    <View style={styles.container}>
      <View style={styles.board}>
        {RANKS.map((rank, rankIndex) =>
          FILES.map((file, fileIndex) => {
            const square = file + rank;
            const piece = config.pieces[square];
            const isLight = (rankIndex + fileIndex) % 2 === 0;
            const isSelected = selected === square;
            const isValidMove = validMoves.includes(square);
            const isLastMove =
              config.moves &&
              Object.entries(config.moves).some(
                ([from, to]) => from === square || to === square
              );

            return (
              <Pressable
                key={square}
                style={[
                  styles.square,
                  isLight ? styles.squareLight : styles.squareDark,
                  isSelected && styles.squareSelected,
                  isLastMove && !isSelected && styles.squareLastMove,
                  isValidMove && styles.squareValidMove,
                ]}
                onPress={() => handleSquare(square)}
              >
                {piece && <Piece piece={piece} size={SQUARE_SIZE * 0.85} />}
                {isValidMove && !piece && <View style={styles.dot} />}
              </Pressable>
            );
          })
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  board: {
    width: BOARD_SIZE,
    height: BOARD_SIZE,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  square: {
    width: SQUARE_SIZE,
    height: SQUARE_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  squareLight: {
    backgroundColor: '#f0d9b5',
  },
  squareDark: {
    backgroundColor: '#b58863',
  },
  squareSelected: {
    backgroundColor: '#f6f669',
  },
  squareLastMove: {
    backgroundColor: '#cdd16e',
  },
  squareValidMove: {
    backgroundColor: '#90ee90aa',
  },
  dot: {
    width: SQUARE_SIZE * 0.3,
    height: SQUARE_SIZE * 0.3,
    borderRadius: SQUARE_SIZE * 0.15,
    backgroundColor: '#00000033',
  },
});
