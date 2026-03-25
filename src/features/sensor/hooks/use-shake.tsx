import { useRef } from 'react';
import {
  useAnimatedSensor,
  useDerivedValue,
  SensorType,
} from 'react-native-reanimated';
import { impactAsync, ImpactFeedbackStyle } from 'expo-haptics';
import { scheduleOnRN } from 'react-native-worklets';

/** Acceleration magnitude (g-force) above which a shake is detected. Lower = more sensitive. */
const SHAKE_THRESHOLD = 1.5;
/** Minimum time between counted shakes in milliseconds. */
const COOLDOWN_MS = 1000;

/**
 * Detects device shakes via the accelerometer and calls `onShake` on each counted event.
 * Triggers haptic feedback and enforces a cooldown between events.
 *
 * @returns The raw `AnimatedSensor` object, usable for continuous wobble effects.
 */
export function useShake(onShake: () => void) {
  const accelerometer = useAnimatedSensor(SensorType.ACCELEROMETER);
  const lastShake = useRef(0);

  const onShakeRef = useRef(onShake);
  onShakeRef.current = onShake;

  const triggerShake = useRef(() => {
    const now = Date.now();

    if (now - lastShake.current < COOLDOWN_MS) {
      return;
    }

    lastShake.current = now;
    impactAsync(ImpactFeedbackStyle.Heavy);

    onShakeRef.current();
  }).current;

  useDerivedValue(() => {
    const { x, y, z } = accelerometer.sensor.value;
    const magnitude = Math.sqrt(x * x + y * y + z * z);

    if (magnitude > SHAKE_THRESHOLD) {
      scheduleOnRN(triggerShake);
    }
  });

  return accelerometer;
}
