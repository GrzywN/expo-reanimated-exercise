import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

export interface EndOverlayProps {
  checkMate: boolean;
  turn: string;
}

function displayLabel(checkMate: boolean, turn: string): string {
  if (!checkMate) {
    return 'Stalemate!';
  }

  const isWhiteTurn = turn === 'white';

  if (isWhiteTurn) {
    return 'Black wins!';
  }

  return 'White wins!';
}

export function EndOverlay({ checkMate, turn }: EndOverlayProps) {
  const label = displayLabel(checkMate, turn);

  return (
    <Animated.View
      entering={FadeIn.duration(600)}
      style={StyleSheet.absoluteFill}
      pointerEvents="none"
    >
      <View style={styles.card}>
        <Text style={styles.text}>{label}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00000077',
  },
  text: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#ffffff',
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
});
