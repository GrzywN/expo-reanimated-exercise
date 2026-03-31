import { useEffect, useRef } from 'react';
import {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { FILES, RANKS, SQUARE_SIZE } from '../constants';
import { ChessConfig, findKingSquare } from '../utils';

export function useChessAnimations(config: ChessConfig) {
  const isFirstRender = useRef(true);

  const checkOpacity = useSharedValue(0);
  const kingPulse = useSharedValue(0);
  const turnFlash = useSharedValue(0);

  useEffect(() => {
    if (config.check) {
      checkOpacity.value = withSequence(
        withTiming(0.45, { duration: 120 }),
        withTiming(0.1, { duration: 200 }),
        withTiming(0.45, { duration: 120 }),
        withTiming(0, { duration: 500 })
      );
    }

    if (config.check && !config.checkMate) {
      kingPulse.value = withRepeat(
        withSequence(
          withTiming(0.65, { duration: 350 }),
          withTiming(0.1, { duration: 350 })
        ),
        -1
      );
    } else {
      kingPulse.value = withTiming(0, { duration: 200 });
    }
  }, [config, checkOpacity, kingPulse]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;

      return;
    }

    turnFlash.value = withSequence(
      withTiming(0.12, { duration: 60 }),
      withTiming(0, { duration: 350 })
    );
  }, [config.turn, turnFlash]);

  const checkOverlayStyle = useAnimatedStyle(() => ({
    opacity: checkOpacity.value,
  }));
  const kingCheckStyle = useAnimatedStyle(() => ({ opacity: kingPulse.value }));
  const turnFlashStyle = useAnimatedStyle(() => ({ opacity: turnFlash.value }));

  const kingInCheckSquare = config.check
    ? findKingSquare(config.pieces, config.turn)
    : null;

  const kingCheckPos = kingInCheckSquare
    ? {
        left:
          FILES.indexOf(kingInCheckSquare[0] as (typeof FILES)[number]) *
          SQUARE_SIZE,
        top:
          RANKS.indexOf(kingInCheckSquare[1] as (typeof RANKS)[number]) *
          SQUARE_SIZE,
        width: SQUARE_SIZE,
        height: SQUARE_SIZE,
      }
    : null;

  return { checkOverlayStyle, kingCheckStyle, turnFlashStyle, kingCheckPos };
}
