import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  cancelAnimation,
  createAnimatedComponent,
  Easing,
  Extrapolation,
  interpolate,
  ReduceMotion,
  useAnimatedProps,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

const AnimatedPath = createAnimatedComponent(Path);

const N = 70;
const CX = 50;
const CY = 50;
const R = 50;

export type Point = { x: number; y: number };

const buildPoints = (): { from: Point; to: Point }[] => {
  const startAngle = Math.PI / 2;
  const anglePerSegment = (Math.PI * 2) / N;

  return Array.from({ length: N + 1 }, (_, i) => {
    const angle = startAngle + anglePerSegment * i;

    return {
      from: { x: (100 * i) / N, y: 50 },
      to: { x: CX + R * Math.cos(angle), y: CY + R * Math.sin(angle) },
    };
  });
};

const points = buildPoints();

// https://www.joshwcomeau.com/svg/interactive-guide-to-paths/
export const Circle2d = () => {
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

  const animatedPathProps = useAnimatedProps(() => {
    const segments = points.map((p, i) => {
      const x = interpolate(
        timer.value,
        [0, 1],
        [p.from.x, p.to.x],
        Extrapolation.CLAMP
      );
      const y = interpolate(
        timer.value,
        [0, 1],
        [p.from.y, p.to.y],
        Extrapolation.CLAMP
      );

      return i === 0 ? `M ${x},${y}` : `L ${x},${y}`;
    });

    return { d: segments.join(' ') };
  });

  return (
    <View style={styles.container}>
      <Svg viewBox="0 0 100 100" width="50%" height="50%">
        <AnimatedPath
          animatedProps={animatedPathProps}
          strokeWidth={2.5}
          stroke="red"
          fill="none"
        />
      </Svg>
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
