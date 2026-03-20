import { useEffect, useMemo } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import {
  Canvas,
  Group,
  interpolatePaths,
  Path,
  Skia,
} from '@shopify/react-native-skia';
import {
  cancelAnimation,
  Easing,
  ReduceMotion,
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

const N = 100_000;
const CX = 50;
const CY = 50;
const R = 50;

export type Point = { x: number; y: number };

const buildPathString = (pts: Point[]) =>
  pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x},${p.y}`).join(' ');

const startAngle = Math.PI / 2;
const anglePerSegment = (Math.PI * 2) / N;

const makePath = (pts: Point[]) => {
  const path = Skia.Path.MakeFromSVGString(buildPathString(pts));
  if (!path) throw new Error('Failed to create Skia path from SVG string');
  return path;
};

const fromPath = makePath(
  Array.from({ length: N + 1 }, (_, i) => ({ x: (100 * i) / N, y: 50 }))
);

const toPath = makePath(
  Array.from({ length: N + 1 }, (_, i) => {
    const angle = startAngle + anglePerSegment * i;
    return { x: CX + R * Math.cos(angle), y: CY + R * Math.sin(angle) };
  })
);

// https://www.joshwcomeau.com/svg/interactive-guide-to-paths/
export const Circle2d = () => {
  const { width } = useWindowDimensions();
  const canvasSize = width * 0.5;
  const canvasStyle = useMemo(() => ({ width: canvasSize, height: canvasSize }), [canvasSize]);
  const groupTransform = useMemo(() => [{ scale: canvasSize / 100 }], [canvasSize]);

  const timer = useSharedValue(0);

  useEffect(() => {
    timer.value = withRepeat(
      withTiming(1, {
        duration: 3_000,
        easing: Easing.inOut(Easing.quad),
        reduceMotion: ReduceMotion.System,
      }),
      -1,
      true
    );

    return () => cancelAnimation(timer);
  }, [timer]);

  const animatedPath = useDerivedValue(() =>
    interpolatePaths(timer.value, [0, 1], [fromPath, toPath])
  );

  return (
    <View style={styles.container}>
      <Canvas style={canvasStyle}>
        <Group transform={groupTransform}>
          <Path
            path={animatedPath}
            strokeWidth={2.5}
            color="red"
            style="stroke"
          />
        </Group>
      </Canvas>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
