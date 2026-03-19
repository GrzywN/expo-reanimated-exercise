import { Fragment, useEffect, useMemo } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
  SharedValue,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export interface Planet {
  color: string;
  radius: number;
  au: number;
  shadowColor: string;
  zIndex: number;
}

// prettier-ignore
const PLANETS = {
  Sun: { color: '#fbbf24', radius: 696340, au: 0, shadowColor: '#f59e0b', zIndex: 100 },
  Mercury: { color: '#94a3b8', radius: 2439, au: 0.39, shadowColor: '#64748b', zIndex: 90 },
  Venus: { color: '#f59e0b', radius: 6051, au: 0.72, shadowColor: '#b45309', zIndex: 80 },
  Earth: { color: '#3b82f6', radius: 6371, au: 1.00, shadowColor: '#1d4ed8', zIndex: 70 },
  Mars: { color: '#ea580c', radius: 3389, au: 1.52, shadowColor: '#9a3412', zIndex: 60 },
  Jupiter: { color: '#fdba74', radius: 69911, au: 5.20, shadowColor: '#f97316', zIndex: 50 },
  Saturn: { color: '#fef08a', radius: 58232, au: 9.54, shadowColor: '#eab308', zIndex: 40 },
  Uranus: { color: '#22d3ee', radius: 25362, au: 19.22, shadowColor: '#0891b2', zIndex: 30 },
  Neptune: { color: '#4f46e5', radius: 24622, au: 30.06, shadowColor: '#3730a3', zIndex: 20 },
} satisfies Record<string, Planet>;

const PLANET_ENTIRIES = Object.entries(PLANETS);

/**
 * Calculates the visual size of a planet based on its physical radius.
 * Uses a power-law scaling (k) to compress the massive scale differences
 * for better UI visibility.
 *
 * @param {number} radius - The real radius of the planet in km.
 * @param {number} [baseSize=40] - The pixel size of the baseline planet (Earth).
 * @param {number} [k=0.2] - The compression factor (lower = smaller differences).
 * @returns {number} The calculated width/height in pixels.
 */
const getPlanetSize = (radius: number, baseSize = 40, k = 0.2): number => {
  const ratio = radius / PLANETS.Earth.radius;
  return baseSize * Math.pow(ratio, k);
};

/**
 * Calculates the orbit's radius (distance from the center) using logarithmic scaling.
 * This prevents outer planets (like Neptune) from rendering off-screen.
 *
 * @param {number} au - Distance from the Sun in Astronomical Units.
 * @param {number} [spacing=40] - Multiplier for the gap between orbits.
 * @param {number} [minOffset=50] - Minimum distance from the Sun's center to the first orbit.
 * @returns {number} The distance from (0,0) in pixels.
 */
const getOrbitRadius = (au: number, spacing = 40, minOffset = 50): number => {
  if (au === 0) {
    return 0;
  }

  return minOffset + Math.log1p(au) * spacing * 2.5;
};

/**
 * Calculates relative orbital speed based on Kepler's Third Law.
 * Distance (au) affects the period, so closer planets move faster.
 * @param {number} au - Distance from the Sun in AU.
 * @returns {number} Relative speed factor (Earth = 1.0).
 */
const getOrbitalSpeed = (au: number): number => {
  if (au === 0) return 0; // The Sun doesn't orbit itself
  // Period T² ∝ R³, so velocity v ∝ 1/√R
  return 1 / Math.sqrt(au);
};

export interface PlanetProps {
  name: string;
  data: Planet;
  timer: SharedValue<number>;
}

export function Planet({ name, data, timer }: PlanetProps) {
  const size = getPlanetSize(data.radius);
  const orbitRadius = getOrbitRadius(data.au);
  const speed = getOrbitalSpeed(data.au);

  const hasOrbitRadius = useMemo(() => orbitRadius > 0, [orbitRadius]);

  // const startAngle = React.useMemo(() => Math.random() * 360, []); // RANDOM
  const startAngle = useMemo(() => 0, []); // 0

  const isSun = name === 'Sun';

  const animatedStyle = useAnimatedStyle(() => {
    const currentAngle = startAngle + timer.value * speed;

    if (isSun) {
      return {
        transform: [],
      };
    }

    return {
      transform: [
        { rotate: `${currentAngle}deg` }, // Rotates the invisible "arm" from the center
        { translateX: orbitRadius }, // Moves the planet to the end of that arm
        { rotate: `-${currentAngle}deg` }, // Counter-rotation so the planet doesn't spin on its own axis
      ],
    };
  });

  return (
    <Fragment key={name}>
      <Animated.View
        style={[
          styles.planet,
          animatedStyle,
          {
            width: size,
            height: size,
            backgroundColor: data.color,
            shadowColor: data.shadowColor,
            zIndex: data.zIndex,
            // transform: [
            //   { translateX: orbitRadius - size / 2 },
            //   { translateY: -size / 2 },
            // ],
            marginLeft: -size / 2,
            marginTop: -size / 2,
            shadowRadius: name === 'Sun' ? 50 : 15,
            shadowOpacity: name === 'Sun' ? 0.8 : 0.5,
          },
        ]}
      />

      {hasOrbitRadius && (
        <View
          style={[
            styles.orbitLine,
            {
              width: orbitRadius * 2,
              height: orbitRadius * 2,
              borderRadius: orbitRadius,
              transform: [
                { translateX: -orbitRadius },
                { translateY: -orbitRadius },
              ],
            },
          ]}
        />
      )}
    </Fragment>
  );
}

export const Galaxy2d = () => {
  const timer = useSharedValue(0);

  useEffect(() => {
    // Animate to a large number so the timer never resets (takes ~63 milions years).
    // Duration is scaled so the rate of increase equals 360 degrees per 8s.
    const oneCycle = 360;
    const target = 360_000; // 1000 full rotations

    timer.value = withTiming(target, {
      duration: 8_000 * (target / oneCycle),
      easing: Easing.linear
    });

    return () => cancelAnimation(timer);
  }, [timer]);

  return (
    <View style={styles.container}>
      <Animated.View style={styles.centerPoint}>
        {PLANET_ENTIRIES.map(([name, data]) => (
          <Planet name={name} data={data} timer={timer} key={name} />
        ))}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerPoint: {
    position: 'absolute',
    left: SCREEN_WIDTH / 2,
    top: SCREEN_HEIGHT / 2,
    width: 0,
    height: 0,
  },
  planet: {
    position: 'absolute',
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    elevation: 10,
  },
  orbitLine: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    borderStyle: 'dashed',
    zIndex: -1,
  },
});
