import { View, StyleSheet } from 'react-native';
import Animated, {
  EntryExitAnimationFunction,
  FadeIn,
  FadeOut,
  ReanimatedKeyframe,
} from 'react-native-reanimated';
import { SQUARE_SIZE, pieceCapture } from '../constants';
import { Piece } from './piece';

const moveIndicatorEntering = FadeIn.duration(150);
const moveIndicatorExiting = FadeOut.duration(120);

export interface BoardSquareProps {
  piece: string | undefined;
  isLight: boolean;
  isSelected: boolean;
  isValidMove: boolean;
  isLastMoveSquare: boolean;
  isDragSource: boolean;
  pieceKey: string;
  pieceEntering: EntryExitAnimationFunction | ReanimatedKeyframe | undefined;
}

export function BoardSquare({
  piece,
  isLight,
  isSelected,
  isValidMove,
  isLastMoveSquare,
  isDragSource,
  pieceKey,
  pieceEntering,
}: BoardSquareProps) {
  return (
    <View
      style={[
        styles.square,
        isLight ? styles.squareLight : styles.squareDark,
        isLastMoveSquare && !isSelected && styles.squareLastMove,
        isSelected && styles.squareSelected,
      ]}
    >
      {piece && (
        <Animated.View
          key={pieceKey}
          entering={pieceEntering}
          exiting={pieceCapture}
          style={isDragSource && styles.ghost}
        >
          <Piece piece={piece} size={SQUARE_SIZE * 0.85} />
        </Animated.View>
      )}

      {isValidMove && (
        <Animated.View
          entering={moveIndicatorEntering}
          exiting={moveIndicatorExiting}
          style={[styles.validOverlay, piece ? styles.captureRing : styles.dot]}
          pointerEvents="none"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  square: {
    width: SQUARE_SIZE,
    height: SQUARE_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  squareLight: { backgroundColor: '#f0d9b5' },
  squareDark: { backgroundColor: '#b58863' },
  squareSelected: { backgroundColor: '#f6f669' },
  squareLastMove: { backgroundColor: '#cdd16e' },
  ghost: { opacity: 0.3 },
  validOverlay: { position: 'absolute' },
  dot: {
    width: SQUARE_SIZE * 0.32,
    height: SQUARE_SIZE * 0.32,
    borderRadius: SQUARE_SIZE * 0.16,
    backgroundColor: '#00000033',
  },
  captureRing: {
    width: SQUARE_SIZE * 0.92,
    height: SQUARE_SIZE * 0.92,
    borderRadius: SQUARE_SIZE * 0.46,
    borderWidth: SQUARE_SIZE * 0.1,
    borderColor: '#00000033',
  },
});
