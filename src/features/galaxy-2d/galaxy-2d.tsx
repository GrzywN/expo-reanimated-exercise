import React from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import Animated from 'react-native-reanimated';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const PLANET_DATA = {
  Sun: { color: '#fbbf24', radius: 696340, shadowColor: '#f59e0b', zIndex: 100 },
  Mercury: { color: '#94a3b8', radius: 2439, shadowColor: '#64748b', zIndex: 90 },
  Venus: { color: '#f59e0b', radius: 6051, shadowColor: '#b45309', zIndex: 80 },
  Earth: { color: '#3b82f6', radius: 6371, shadowColor: '#1d4ed8', zIndex: 70 },
  Mars: { color: '#ea580c', radius: 3389, shadowColor: '#9a3412', zIndex: 60 },
  Jupiter: { color: '#fdba74', radius: 69911, shadowColor: '#f97316', zIndex: 50 },
  Saturn: { color: '#fef08a', radius: 58232, shadowColor: '#eab308', zIndex: 40 },
  Uranus: { color: '#22d3ee', radius: 25362, shadowColor: '#0891b2', zIndex: 30 },
  Neptune: { color: '#4f46e5', radius: 24622, shadowColor: '#3730a3', zIndex: 20 },
};

const PLANET_DATA_ENTIRIES = Object.entries(PLANET_DATA);

// PERF: compute it before-hand at compile time or init
// 0.4 for readability on the mobile device
const getPlanetSize = (radius: number, baseSize = 40, k = 0.35) => {
  const ratio = radius / PLANET_DATA.Earth.radius;
  return baseSize * Math.pow(ratio, k);
};

export const Galaxy2d = () => {
  return (
    <View style={styles.container}>
      <Animated.View style={styles.centerPoint}>
        {PLANET_DATA_ENTIRIES.map(([name, data]) => {
          const size = getPlanetSize(data.radius);

          return (
            <View
              key={name}
              style={[
                styles.planet,
                {
                  width: size,
                  height: size,
                  backgroundColor: data.color,
                  shadowColor: data.shadowColor,
                  // zIndex: data.zIndex,
                  marginLeft: -size / 2,
                  marginTop: -size / 2,
                  shadowRadius: name === 'Sun' ? 50 : 15,
                  shadowOpacity: name === 'Sun' ? 0.8 : 0.5,
                },
              ]}
            />
          );
        })}
      </Animated.View>
    </View>
  );
}

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
});
