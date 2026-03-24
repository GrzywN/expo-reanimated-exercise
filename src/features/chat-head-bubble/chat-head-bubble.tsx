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
            <Train />
          </Animated.View>
        </GestureDetector>
        <TrainTracks />
      </View>
    </GestureHandlerRootView>
  );
}

function TrainTracks() {
  return (
    <View style={{ flexDirection: 'column' }}>
      <View style={styles.rail} />
      <View style={{ flexDirection: 'row' }}>
        {Array.from({ length: 20 }).map((_, i) => (
          <View key={i} style={styles.track} />
        ))}
      </View>
    </View>
  );
}

function Train() {
  return (
    <View style={styles.column}>
      <View style={styles.row}>
        <View style={styles.back} />
        <View style={styles.chimney} />
      </View>
      <View style={styles.row}>
        <View style={styles.body} />
        <View style={styles.front} />
      </View>
      <View style={styles.stripe} />
      <View style={styles.underbody} />
      <View style={styles.row}>
        <View style={styles.wheel} />
        <View style={styles.wheel} />
        <View style={styles.wheel} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  wrapper: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  grab: {
    cursor: 'grab',
  },
  row: { flexDirection: 'row' },
  column: { flexDirection: 'column' },
  wheel: {
    height: 50,
    width: 50,
    backgroundColor: '#537FE7',
    borderRadius: 50,
    marginHorizontal: 5,
  },
  underbody: {
    width: SIZE,
    height: 30,
    backgroundColor: 'black',
    top: 30,
  },
  stripe: {
    width: SIZE,
    height: 10,
    backgroundColor: 'red',
    top: 30,
  },
  front: {
    width: 50,
    height: 50,
    backgroundColor: 'black',
    top: 30,
  },
  body: {
    width: 130,
    height: 50,
    backgroundColor: '#537FE7',
    top: 30,
  },
  chimney: {
    width: 20,
    height: 30,
    backgroundColor: 'black',
    top: 30,
    right: 15,
    marginLeft: 'auto',
  },
  back: {
    width: 50,
    height: 15,
    backgroundColor: '#537FE7',
    top: 30 + 15,
  },
  track: {
    height: 10,
    width: 20,
    backgroundColor: '#B8621B',
    marginHorizontal: 15,
  },
  rail: {
    width: '100%',
    height: 10,
    backgroundColor: 'gray',
  },
});
