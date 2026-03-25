import { useRef } from 'react';
import {
  Button,
  Dimensions,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import Animated, {
  useAnimatedProps,
  useAnimatedScrollHandler,
  useSharedValue,
} from 'react-native-reanimated';

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

const { width: windowWidth } = Dimensions.get('window');

export function Carousel() {
  const scrollView = useRef<ScrollView>(null);

  const offsetX = useSharedValue(0);

  const handleScroll = useAnimatedScrollHandler((event) => {
    offsetX.value = event.contentOffset.x;
  });

  const handleScrollTo = (page: number) => {
    console.assert(Boolean(scrollView.current));

    scrollView.current?.scrollTo({
      x: windowWidth * page,
      y: 0,
      animated: true,
    });
  };

  const animatedProps = useAnimatedProps(() => ({
    text: `Scroll offset: ${Math.round(offsetX.value)}px`,
    defaultValue: `Scroll offset: ${offsetX.value}x`,
  }));

  return (
    <View style={styles.container}>
      <Animated.ScrollView ref={scrollView} horizontal onScroll={handleScroll}>
        <View
          style={{
            width: windowWidth,
            aspectRatio: 1,
            backgroundColor: '#FF0000',
          }}
        />
        <View
          style={{
            width: windowWidth,
            aspectRatio: 1,
            backgroundColor: '#00FF00',
          }}
        />
        <View
          style={{
            width: windowWidth,
            aspectRatio: 1,
            backgroundColor: '#0000FF',
          }}
        />
      </Animated.ScrollView>

      <View>
        <Button title="1" onPress={() => handleScrollTo(0)} />
        <Button title="2" onPress={() => handleScrollTo(1)} />
        <Button title="3" onPress={() => handleScrollTo(2)} />
      </View>

      <AnimatedTextInput
        animatedProps={animatedProps}
        editable={false}
        defaultValue=""
      />
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
});
