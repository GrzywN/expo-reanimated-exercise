import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  withSpring,
  withDelay,
} from 'react-native-reanimated';
import { useShake } from './hooks/use-shake';

export type Coupon = { title: string; description: string };

const COUPONS: Coupon[] = [
  { title: 'FREE BEER', description: 'With a purchase of at least 30 zł' },
  { title: '2+1 PIZZA', description: 'Every third pizza free' },
  { title: '-50% DAIRY', description: 'All dairy products' },
  { title: '-30% MEAT', description: 'Entire meat section' },
] as const;

export interface SensorProps {
  coupons?: Coupon[];
  hintIdle?: string;
  hintProgress?: (count: number) => string;
  hintDone?: string;
  placeholderText?: string;
  accessibilityLabel?: string;
  accessibilityHintProgress?: (count: number) => string;
  accessibilityHintDone?: string;
}

function defaultHintProgress(n: number): string {
  if (n < 2) return `${n * 33}% — ${3 - n} more shakes!`;
  return `${n * 33}% — ${3 - n} more shake!`;
}

export function Sensor({
  coupons = COUPONS,
  hintIdle = 'Shake or tap the card',
  hintProgress = defaultHintProgress,
  hintDone = 'You got a reward!',
  placeholderText = 'Your reward awaits',
  accessibilityLabel = 'Scratch card',
  accessibilityHintProgress = (n) => `Tap to scratch, progress: ${n} of 3`,
  accessibilityHintDone = 'Reward revealed',
}: SensorProps = {}) {
  const [shakeCount, setShakeCount] = useState(0);
  const [offer, setOffer] = useState<Coupon | null>(null);

  const shakeX = useSharedValue(0);
  const scratchOpacity = useSharedValue(1);
  const offerScale = useSharedValue(0);

  const handleShake = useCallback(() => {
    setShakeCount((previous) => {
      if (previous >= 3) {
        return previous;
      }

      const next = previous + 1;

      if (next === 3) {
        setOffer(coupons[Math.floor(Math.random() * coupons.length)]);
      }

      return next;
    });
  }, [coupons]);

  const sensor = useShake(handleShake);

  useEffect(() => {
    if (shakeCount === 0) {
      return;
    }

    // with spring inital velocity
    shakeX.value = withSequence(
      withTiming(-18, { duration: 70 }),
      withTiming(18, { duration: 70 }),
      withTiming(-12, { duration: 60 }),
      withTiming(12, { duration: 60 }),
      withTiming(0, { duration: 60 })
    );

    scratchOpacity.value = withTiming(1 - shakeCount / 3, { duration: 400 });

    if (shakeCount === 3) {
      offerScale.value = withDelay(
        350,
        withSpring(1, { damping: 12, stiffness: 100 })
      );
    }
  }, [shakeCount]); // eslint-disable-line react-hooks/exhaustive-deps

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: sensor.sensor.value.x * 8 + shakeX.value }],
  }));

  const scratchStyle = useAnimatedStyle(() => ({
    opacity: scratchOpacity.value,
  }));

  const offerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: offerScale.value }],
  }));

  const hint = useMemo(() => {
    if (shakeCount === 0) {
      return hintIdle;
    }

    if (shakeCount < 3) {
      return hintProgress(shakeCount);
    }

    return hintDone;
  }, [shakeCount, hintIdle, hintProgress, hintDone]);

  const onPress = useMemo(() => {
    if (shakeCount < 3) {
      return handleShake;
    }

    return undefined;
  }, [shakeCount, handleShake]);

  const accessibilityHint = useMemo(() => {
    if (shakeCount < 3) {
      return accessibilityHintProgress(shakeCount);
    }

    return accessibilityHintDone;
  }, [shakeCount, accessibilityHintProgress, accessibilityHintDone]);

  return (
    <View style={styles.container}>
      <Text style={styles.hint}>{hint}</Text>

      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
      >
        <Animated.View style={[styles.card, cardStyle]}>
          <View style={styles.cardInner}>
            {offer && (
              <Animated.View style={[styles.offerWrap, offerStyle]}>
                <Text style={styles.offerTitle}>{offer.title}</Text>
                <Text style={styles.offerDesc}>{offer.description}</Text>
              </Animated.View>
            )}
            {!offer && (
              <View style={styles.cardPlaceholder}>
                <Text style={styles.cardPlaceholderText}>
                  {placeholderText}
                </Text>
              </View>
            )}
          </View>

          <Animated.View style={[styles.scratchOverlay, scratchStyle]} />
        </Animated.View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 28,
    backgroundColor: '#F5F5F5',
  },
  hint: {
    fontSize: 15,
    color: '#666',
    fontWeight: '500',
  },
  card: {
    width: 300,
    height: 200,
    borderRadius: 20,
    backgroundColor: '#FFFBF0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
  },
  cardInner: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardPlaceholder: {
    alignItems: 'center',
    gap: 8,
  },
  cardPlaceholderText: { fontSize: 14, color: '#999', fontWeight: '500' },
  offerWrap: { alignItems: 'center', gap: 4 },
  offerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1A1A1A',
    letterSpacing: 0.5,
  },
  offerDesc: { fontSize: 13, color: '#666' },
  scratchOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#C0C0C0',
  },
});
