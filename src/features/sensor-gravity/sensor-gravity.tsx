import { StyleSheet, View, Text } from 'react-native';
import Animated, {
  useAnimatedSensor,
  useAnimatedStyle,
  useDerivedValue,
  withSpring,
  interpolateColor,
  SensorType,
} from 'react-native-reanimated';

const BUBBLE_AREA = 120; // radius in px within which the bubble moves
const GRAVITY = 9.81; // m/s² – max value on the axis

export interface SensorGravityProps {
  title?: string;
}

export function SensorGravity({ title = 'Spirit level' }: SensorGravityProps) {
  const gravity = useAnimatedSensor(SensorType.GRAVITY);

  const x = useDerivedValue(() => gravity.sensor.value.x / GRAVITY);
  const y = useDerivedValue(() => gravity.sensor.value.y / GRAVITY);

  console.assert(-1 <= x.value && x.value <= 1);
  console.assert(-1 <= y.value && y.value <= 1);

  const translateX = useDerivedValue(() =>
    withSpring(-x.value * BUBBLE_AREA, { damping: 15 })
  );
  const translateY = useDerivedValue(() =>
    withSpring(y.value * BUBBLE_AREA, { damping: 15 })
  );

  const distance = useDerivedValue(() => {
    const distanceInSquare = Math.sqrt(x.value * x.value + y.value * y.value);
    const distanceInCircle = Math.min(distanceInSquare, 1);

    console.assert(0 < distanceInCircle && distanceInCircle <= 1);

    return distanceInCircle;
  });

  const bubbleStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
    backgroundColor: interpolateColor(
      distance.value,
      [0, 0.1, 0.3],
      ['#2ecc71', '#f1c40f', '#e74c3c']
    ),
  }));

  const ringStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(
      distance.value,
      [0, 0.1, 0.3],
      ['#2ecc71', '#f1c40f', '#e74c3c']
    ),
  }));

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>

      <Animated.View style={[styles.ring, ringStyle]}>
        <View style={styles.lineHorizontal} />
        <View style={styles.lineVertical} />

        <Animated.View style={[styles.bubble, bubbleStyle]} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
  },
  title: { fontSize: 20, fontWeight: '600' },
  ring: {
    width: 280,
    height: 280,
    borderRadius: 140,
    borderWidth: 3,
    borderColor: '#2ecc71',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lineHorizontal: {
    position: 'absolute',
    width: '100%',
    height: 1,
    backgroundColor: '#ccc',
  },
  lineVertical: {
    position: 'absolute',
    width: 1,
    height: '100%',
    backgroundColor: '#ccc',
  },
  bubble: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2ecc71',
  },
});
