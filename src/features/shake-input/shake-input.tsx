import { useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { notificationAsync, NotificationFeedbackType } from 'expo-haptics';

export type Digit = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9';
export type Pin = `${Digit}${Digit}${Digit}${Digit}`;

export interface ShakeInputProps {
  validPin?: Pin;
}

export const ShakeInput = ({ validPin = '1234' }: ShakeInputProps) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const shakeTranslate = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeTranslate.value }],
  }));

  const handleSubmit = () => {
    if (pin === validPin) {
      setError('');
      setPin('');
      Alert.alert('Correct PIN!');

      return;
    }

    notificationAsync(NotificationFeedbackType.Error);

    shakeTranslate.value = withSequence(
      withTiming(-12, { duration: 50, easing: Easing.out(Easing.quad) }),
      withTiming(12, { duration: 50, easing: Easing.inOut(Easing.quad) }),
      withTiming(-10, { duration: 50, easing: Easing.inOut(Easing.quad) }),
      withTiming(10, { duration: 50, easing: Easing.inOut(Easing.quad) }),
      withTiming(-6, { duration: 50, easing: Easing.inOut(Easing.quad) }),
      withTiming(6, { duration: 50, easing: Easing.inOut(Easing.quad) }),
      withTiming(0, { duration: 50, easing: Easing.in(Easing.quad) })
    );

    // withSpring possible

    setError('Incorrect PIN');
    setPin('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter PIN</Text>

      <Animated.View style={animatedStyle}>
        <TextInput
          style={[styles.input, error && styles.inputError]}
          value={pin}
          onChangeText={setPin}
          keyboardType="numeric"
          maxLength={4}
          secureTextEntry
        />
      </Animated.View>

      <TouchableOpacity onPress={handleSubmit}>
        <Text style={styles.button}>Confirm</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  input: {
    width: 160,
    height: 52,
    borderWidth: 2,
    borderColor: '#ccc',
    borderRadius: 10,
    textAlign: 'center',
    fontSize: 22,
  },
  inputError: {
    borderColor: '#e74c3c',
  },
  button: {
    fontSize: 16,
    color: '#3498db',
    fontWeight: '600',
  },
});
