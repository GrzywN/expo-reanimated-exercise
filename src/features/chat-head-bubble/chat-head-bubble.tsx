import React from 'react';
import { LayoutChangeEvent, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDecay,
  SharedValue,
} from 'react-native-reanimated';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
  PanGesture,
} from 'react-native-gesture-handler';

const SIZE = 180;

/** Energy retained after each wall bounce. `1.0` = perfect bounce, `0.0` = full stop. */
const BOUNCE_DAMPING = 0.5 as const;

/** Float tolerance (px) for wall collision detection. */
const WALL_EPSILON = 1 as const;

/** Minimum velocity (px/s) to trigger another bounce. Below this the movement is imperceptible. */
const MIN_BOUNCE_VELOCITY = 10 as const;

function bounceDecay(
  offset: SharedValue<number>,
  velocity: number,
  min: number,
  max: number
) {
  'worklet';
  offset.value = withDecay(
    {
      velocity,
      clamp: [min, max],
      rubberBandEffect: false,
    },
    (finished) => {
      'worklet';
      if (!finished) {
        return;
      }

      const isAtMinWall = offset.value <= min + WALL_EPSILON;
      const isAtMaxWall = offset.value >= max - WALL_EPSILON;

      const isAtWall = isAtMinWall || isAtMaxWall;
      const hasBounceableVelocity = Math.abs(velocity) > MIN_BOUNCE_VELOCITY;

      if (isAtWall && hasBounceableVelocity) {
        bounceDecay(offset, -velocity * BOUNCE_DAMPING, min, max);
      }
    }
  );
}

export function ChatHeadBubble() {
  const offsetX = useSharedValue(0);
  const offsetY = useSharedValue(0);

  const width = useSharedValue(0);
  const height = useSharedValue(0);

  const onLayout = (event: LayoutChangeEvent) => {
    width.value = event.nativeEvent.layout.width;
    height.value = event.nativeEvent.layout.height;
  };

  const pan: PanGesture = Gesture.Pan()
    .onChange((event) => {
      offsetX.value += event.changeX;
      offsetY.value += event.changeY;
    })
    .onFinalize((event) => {
      const { velocityX, velocityY } = event;

      const minX = -(width.value / 2) + SIZE / 2;
      const maxX = width.value / 2 - SIZE / 2;
      const minY = -(height.value / 2) + SIZE / 2;
      const maxY = height.value / 2 - SIZE / 2;

      bounceDecay(offsetX, velocityX, minX, maxX);
      bounceDecay(offsetY, velocityY, minY, maxY);
    });

  const animatedStyles = useAnimatedStyle(() => ({
    transform: [{ translateX: offsetX.value }, { translateY: offsetY.value }],
  }));

  return (
    <GestureHandlerRootView style={styles.container}>
      <View onLayout={onLayout} style={styles.wrapper}>
        <GestureDetector gesture={pan}>
          <Animated.View style={[styles.grab, animatedStyles]}>
            <View style={styles.ball} />
          </Animated.View>
        </GestureDetector>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    backgroundColor: '#fff',
  },
  wrapper: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  grab: {
    cursor: 'pointer',
  },
  ball: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    backgroundColor: '#001a72',
  },
});
