import { RefObject, useRef, useState } from 'react';
import { Gesture } from 'react-native-gesture-handler';
import {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN, scheduleOnUI } from 'react-native-worklets';
import { SQUARE_SIZE } from '../constants';
import { squareFromXY } from '../utils';

export interface DragHandlers {
  validMovesRef: RefObject<string[]>;
  onHandleSquare: (square: string) => void;
  onSelectPiece: (square: string) => string | null;
  onExecuteMove: (from: string, to: string) => void;
  onClearSelection: () => void;
}

export function useChessDrag({
  validMovesRef,
  onHandleSquare,
  onSelectPiece,
  onExecuteMove,
  onClearSelection,
}: DragHandlers) {
  const [floatingPiece, setFloatingPiece] = useState<string | null>(null);
  const panSourceRef = useRef('');

  const isDragging = useSharedValue(false);
  const dragX = useSharedValue(0);
  const dragY = useSharedValue(0);
  const dragSourceX = useSharedValue(0);
  const dragSourceY = useSharedValue(0);
  const dragScale = useSharedValue(1);
  const isOnEndFired = useSharedValue(false);

  const setPanSource = (square: string) => {
    panSourceRef.current = square;
  };

  const activateDrag = () => {
    const square = panSourceRef.current;
    const piece = onSelectPiece(square);
    if (piece) setFloatingPiece(piece);
  };

  const cancelDrag = () => {
    setFloatingPiece(null);
    panSourceRef.current = '';
    onClearSelection();
  };

  const finishDrag = (targetSquare: string) => {
    const sourceSquare = panSourceRef.current;
    const isValid =
      !!sourceSquare &&
      !!targetSquare &&
      validMovesRef.current.includes(targetSquare);

    if (isValid) {
      setFloatingPiece(null);
      panSourceRef.current = '';
      onExecuteMove(sourceSquare, targetSquare);
      scheduleOnUI(() => {
        'worklet';
        isDragging.value = false;
        dragScale.value = 1;
      });
    } else {
      scheduleOnUI(() => {
        'worklet';
        dragScale.value = withTiming(1, { duration: 180 });
        dragX.value = withTiming(dragSourceX.value, { duration: 260 }, () => {
          'worklet';
          isDragging.value = false;
          scheduleOnRN(cancelDrag);
        });
        dragY.value = withTiming(dragSourceY.value, { duration: 260 });
      });
    }
  };

  const pan = Gesture.Pan()
    .minDistance(8)
    .onBegin((e) => {
      isOnEndFired.value = false;
      dragSourceX.value =
        Math.floor(e.x / SQUARE_SIZE) * SQUARE_SIZE + SQUARE_SIZE / 2;
      dragSourceY.value =
        Math.floor(e.y / SQUARE_SIZE) * SQUARE_SIZE + SQUARE_SIZE / 2;
      scheduleOnRN(setPanSource, squareFromXY(e.x, e.y));
    })
    .onStart((e) => {
      isDragging.value = true;
      dragX.value = e.x;
      dragY.value = e.y;
      dragScale.value = withTiming(1.15, { duration: 150 });
      scheduleOnRN(activateDrag);
    })
    .onChange((e) => {
      dragX.value = e.x;
      dragY.value = e.y;
    })
    .onEnd((e) => {
      isOnEndFired.value = true;
      scheduleOnRN(finishDrag, squareFromXY(e.x, e.y));
    })
    .onFinalize(() => {
      if (!isOnEndFired.value && isDragging.value) {
        isDragging.value = false;
        dragScale.value = 1;
        scheduleOnRN(cancelDrag);
      }
    });

  const tap = Gesture.Tap().onEnd((e) => {
    scheduleOnRN(onHandleSquare, squareFromXY(e.x, e.y));
  });

  const gesture = Gesture.Exclusive(pan, tap);

  const floatingStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    left: dragX.value - (SQUARE_SIZE * 0.85) / 2,
    top: dragY.value - (SQUARE_SIZE * 0.85) / 2,
    width: SQUARE_SIZE * 0.85,
    height: SQUARE_SIZE * 0.85,
    transform: [{ scale: dragScale.value }],
    opacity: isDragging.value ? 1 : 0,
    zIndex: 10,
    pointerEvents: 'none',
  }));

  return { floatingPiece, gesture, floatingStyle };
}
