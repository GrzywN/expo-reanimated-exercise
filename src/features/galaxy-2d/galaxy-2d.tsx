import { Fragment } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import Animated from 'react-native-reanimated';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

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
};

const PLANET_ENTIRIES = Object.entries(PLANETS);

// PERF: compute it before-hand at compile time or init
// 0.4 for readability on the mobile device
const getPlanetSize = (radius: number, baseSize = 40, k = 0.2) => {
  const ratio = radius / PLANETS.Earth.radius;
  return baseSize * Math.pow(ratio, k);
};

// Calculating the orbital radius (distance from the Sun)
// We use Math.log to fit the system on the screen while maintaining the distance ratio
const getOrbitRadius = (au: number, spacing = 40, minOffset = 50) => {
  if (au === 0) {
    return 0; // Słońce w centrum
  }

  return minOffset + Math.log1p(au) * spacing * 2.5;
};

export const Galaxy2d = () => {
  return (
    <View style={styles.container}>
      <Animated.View style={styles.centerPoint}>
        {PLANET_ENTIRIES.map(([name, data]) => {
          const size = getPlanetSize(data.radius);
          const orbitRadius = getOrbitRadius(data.au);
          const hasOrbitRadius = orbitRadius > 0;

          return (
            <Fragment key={name}>
              <View
                style={[
                  styles.planet,
                  {
                    width: size,
                    height: size,
                    backgroundColor: data.color,
                    shadowColor: data.shadowColor,
                    zIndex: data.zIndex,
                    transform: [
                      { translateX: orbitRadius - size / 2 },
                      { translateY: -size / 2 },
                    ],
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
        })}
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
    // borderColor: 'rgba(255,255,255,0.05)',
    borderColor: 'rgba(255,255,255,0.5)', // DEBUG - MORE VISIBLE
    borderStyle: 'dashed',
  },
});
