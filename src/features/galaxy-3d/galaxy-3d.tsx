import { useEffect, useMemo } from 'react';
import { Dimensions, StyleSheet } from 'react-native';
import {
  BlurMask,
  Canvas,
  Circle,
  Group,
  Path,
  Skia,
} from '@shopify/react-native-skia';
import {
  cancelAnimation,
  Easing,
  type SharedValue,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const CX = SCREEN_WIDTH / 2;
const CY = SCREEN_HEIGHT / 2;

const EARTH_ORBIT_DURATION_MS = 8_000;
const ANIMATION_CYCLES = 1_000;
const ANIMATION_TARGET = 360 * ANIMATION_CYCLES;

const PLANET_BASE_SIZE_PX = 40;
const PLANET_SIZE_COMPRESSION = 0.2;

const ORBIT_SPACING = 40;
const ORBIT_MIN_OFFSET = 50;
const ORBIT_LOG_SCALE = 2.5;

const ORBIT_INCLINATION_DEG = 75; // 0° = top-down view, 90° = edge-on view
const FOCAL = 600; // camera focal length (perspective strength)

const TILT_RAD = (ORBIT_INCLINATION_DEG * Math.PI) / 180;
const TILT_SIN = Math.sin(TILT_RAD);
const TILT_COS = Math.cos(TILT_RAD);

export interface Planet {
  color: string;
  radius: number;
  au: number;
  shadowColor: string;
  zIndex: number;
}

// prettier-ignore
const PLANETS = {
  Sun:     { color: '#fbbf24', radius: 696340, au:  0,     shadowColor: '#f59e0b', zIndex: 100 },
  Mercury: { color: '#94a3b8', radius:   2439, au:  0.39,  shadowColor: '#64748b', zIndex:  90 },
  Venus:   { color: '#f59e0b', radius:   6051, au:  0.72,  shadowColor: '#b45309', zIndex:  80 },
  Earth:   { color: '#3b82f6', radius:   6371, au:  1.00,  shadowColor: '#1d4ed8', zIndex:  70 },
  Mars:    { color: '#ea580c', radius:   3389, au:  1.52,  shadowColor: '#9a3412', zIndex:  60 },
  Jupiter: { color: '#fdba74', radius:  69911, au:  5.20,  shadowColor: '#f97316', zIndex:  50 },
  Saturn:  { color: '#fef08a', radius:  58232, au:  9.54,  shadowColor: '#eab308', zIndex:  40 },
  Uranus:  { color: '#22d3ee', radius:  25362, au: 19.22,  shadowColor: '#0891b2', zIndex:  30 },
  Neptune: { color: '#4f46e5', radius:  24622, au: 30.06,  shadowColor: '#3730a3', zIndex:  20 },
} satisfies Record<string, Planet>;

const PLANET_ENTRIES = Object.entries(PLANETS);

/**
 * Calculates the visual size of a planet based on its physical radius.
 * Uses a power-law scaling (k) to compress the massive scale differences
 * for better UI visibility.
 *
 * @param {number} radius - The real radius of the planet in km.
 * @param {number} [baseSize=PLANET_BASE_SIZE_PX] - The pixel size of the baseline planet (Earth).
 * @param {number} [k=PLANET_SIZE_COMPRESSION] - The compression factor (lower = smaller differences).
 * @returns {number} The calculated width/height in pixels.
 */
const getPlanetSize = (radius: number): number => {
  const ratio = radius / PLANETS.Earth.radius;
  return PLANET_BASE_SIZE_PX * Math.pow(ratio, PLANET_SIZE_COMPRESSION);
};

/**
 * Calculates the orbit's radius (distance from the center) using logarithmic scaling.
 * This prevents outer planets (like Neptune) from rendering off-screen.
 *
 * @param {number} au - Distance from the Sun in Astronomical Units.
 * @param {number} [spacing=ORBIT_SPACING] - Multiplier for the gap between orbits.
 * @param {number} [minOffset=ORBIT_MIN_OFFSET] - Minimum distance from the Sun's center to the first orbit.
 * @returns {number} The distance from (0,0) in pixels.
 */
const getOrbitRadius = (au: number): number => {
  if (au === 0) {
    return 0;
  }

  return ORBIT_MIN_OFFSET + Math.log1p(au) * ORBIT_SPACING * ORBIT_LOG_SCALE;
};

/**
 * Calculates relative orbital speed based on Kepler's Third Law.
 * Distance (au) affects the period, so closer planets move faster.
 * @param {number} au - Distance from the Sun in AU.
 * @returns {number} Relative speed factor (Earth = 1.0).
 */
const getOrbitalSpeed = (au: number): number => {
  if (au === 0) {
    return 0; // The Sun doesn't orbit itself
  }

  // Period T² ∝ R³, so velocity v ∝ 1/√R
  return 1 / Math.sqrt(au);
};

export interface PlanetProps {
  data: Planet;
  timer: SharedValue<number>;
  isFar: boolean;
}

// 3D perspective projection.
// Planets orbit in the screen XY plane, which is then tilted by TILT around
// the X axis (equivalent to CSS rotateX). y_orbit > 0 = far side of orbit (top of screen).
//
// isFar=true  → rendered BEFORE the sun (far side of orbit, zDepth ≥ 0)
// isFar=false → rendered AFTER the sun  (near side of orbit, zDepth < 0)
function PlanetLayer({ data, timer, isFar }: PlanetProps) {
  const baseR = useMemo(() => getPlanetSize(data.radius) / 2, [data.radius]);
  const orbitRadius = useMemo(() => getOrbitRadius(data.au), [data.au]);
  const speed = useMemo(() => getOrbitalSpeed(data.au), [data.au]);

  // Shared position and scale — computed once, reused by all three path derivatives
  const pos = useDerivedValue(() => {
    const angle = ((timer.value * Math.PI) / 180) * speed;
    const xOrbit = orbitRadius * Math.sin(angle);
    const yOrbit = orbitRadius * Math.cos(angle);
    const zDepth = yOrbit * TILT_SIN;
    const w = FOCAL / (FOCAL + zDepth);

    return {
      px: CX + xOrbit * w,
      py: CY + yOrbit * TILT_COS * w,
      r: Math.max(baseR * w, 1),
      zDepth,
    };
  });

  // Visibility: 1 when the planet is on the correct side of the sun's plane
  const opacity = useDerivedValue(() => {
    return isFar
      ? pos.value.zDepth >= 0
        ? 1
        : 0
      : pos.value.zDepth < 0
      ? 1
      : 0;
  });

  const mainPath = useDerivedValue(() => {
    const { px, py, r } = pos.value;
    const path = Skia.Path.Make();
    path.addCircle(px, py, r);

    return path;
  });

  const shadowPath = useDerivedValue(() => {
    const { px, py, r } = pos.value;
    const path = Skia.Path.Make();
    path.addCircle(px + r * 0.25, py + r * 0.25, r * 0.82);

    return path;
  });

  const highlightPath = useDerivedValue(() => {
    const { px, py, r } = pos.value;
    const path = Skia.Path.Make();
    path.addCircle(px - r * 0.22, py - r * 0.22, r * 0.32);

    return path;
  });

  return (
    <Group opacity={opacity}>
      <Path path={mainPath} color={data.color} />
      <Path path={shadowPath} color="rgba(0,0,0,0.45)" />
      <Path path={highlightPath} color="rgba(255,255,255,0.3)" />
    </Group>
  );
}

function OrbitEllipse({ au }: { au: number }) {
  const orbitPath = useMemo(() => {
    const rx = getOrbitRadius(au);
    // A circular orbit tilted by TILT projects to an ellipse with ry = rx * |cos(TILT)|
    const ry = rx * Math.abs(TILT_COS);
    const path = Skia.Path.Make();
    path.addOval({ x: CX - rx, y: CY - ry, width: rx * 2, height: ry * 2 });

    return path;
  }, [au]);

  return (
    <Path
      path={orbitPath}
      color="rgba(255,255,255,0.08)"
      style="stroke"
      strokeWidth={1}
    />
  );
}

export const Galaxy3d = () => {
  const timer = useSharedValue(0);

  useEffect(() => {
    // Animate to a large number so the timer never resets (takes ~63 million years).
    // Duration is scaled so the rate of increase equals 360 degrees per 8s.
    timer.value = withTiming(ANIMATION_TARGET, {
      duration: EARTH_ORBIT_DURATION_MS * ANIMATION_CYCLES,
      easing: Easing.linear,
    });

    return () => cancelAnimation(timer);
  }, [timer]);

  const sunR = useMemo(() => getPlanetSize(PLANETS.Sun.radius) / 2, []);

  // Approximate z-sort: outer planets drawn first (usually farther from camera at this angle).
  const outerToInner = useMemo(() => [...PLANET_ENTRIES].reverse(), []);

  return (
    <Canvas style={styles.canvas}>
      {/* Orbit ellipses */}
      {outerToInner.map(([name, data]) =>
        data.au > 0 ? <OrbitEllipse key={`orbit-${name}`} au={data.au} /> : null
      )}

      {/* Planets on the FAR side of orbit — drawn before the sun */}
      {outerToInner.map(([name, data]) =>
        data.au > 0 ? (
          <PlanetLayer
            key={`far-${name}`}
            data={data}
            timer={timer}
            isFar={true}
          />
        ) : null
      )}

      {/* Sun with glow */}
      <Circle cx={CX} cy={CY} r={sunR} color={PLANETS.Sun.color}>
        <BlurMask blur={sunR * 0.6} style="solid" />
      </Circle>

      {/* Planets on the NEAR side of orbit — drawn after the sun */}
      {outerToInner.map(([name, data]) =>
        data.au > 0 ? (
          <PlanetLayer
            key={`near-${name}`}
            data={data}
            timer={timer}
            isFar={false}
          />
        ) : null
      )}
    </Canvas>
  );
};

const styles = StyleSheet.create({
  canvas: {
    flex: 1,
    backgroundColor: '#020617',
  },
});
