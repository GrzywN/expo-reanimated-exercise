import { Dimensions } from 'react-native';
import { Keyframe } from 'react-native-reanimated';

export const FILES = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'] as const;
export const RANKS = ['8', '7', '6', '5', '4', '3', '2', '1'] as const;

export const BOARD_SIZE = Dimensions.get('window').width;
export const SQUARE_SIZE = BOARD_SIZE / 8;

export const pieceLand = new Keyframe({
  0: { transform: [{ scale: 1.25 }] },
  100: { transform: [{ scale: 1 }] },
}).duration(220);

export const pieceCapture = new Keyframe({
  0: { transform: [{ scale: 1 }], opacity: 1 },
  100: { transform: [{ scale: 0 }], opacity: 0 },
}).duration(140);
