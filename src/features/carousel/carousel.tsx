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
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
} from 'react-native-reanimated';

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

const { width: windowWidth } = Dimensions.get('window');

export function Carousel() {
  const scrollView = useRef<ScrollView>(null);

  const offsetX = useSharedValue(0);

  const backgroundOpacity = useDerivedValue(() => {
    if (offsetX.value > windowWidth) {
      return 1;
    }

    return offsetX.value / windowWidth;
  }, [offsetX]);

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

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: backgroundOpacity.value,
  }));

  const debugAnimatedProps = useAnimatedProps(() => ({
    text: `Scroll offset: ${Math.round(offsetX.value)}px`,
    defaultValue: `Scroll offset: ${offsetX.value}x`,
  }));

  return (
    <View style={styles.container}>
      <Animated.ScrollView ref={scrollView} horizontal onScroll={handleScroll}>
        <View style={[styles.slide, styles.slideRed]} />
        <View style={[styles.slide, styles.slideGreen]} />
        <View style={[styles.slide, styles.slideBlue]} />
      </Animated.ScrollView>

      <Animated.View style={[styles.background, animatedStyle]} />

      <View>
        <Button title="1" onPress={() => handleScrollTo(0)} />
        <Button title="2" onPress={() => handleScrollTo(1)} />
        <Button title="3" onPress={() => handleScrollTo(2)} />
      </View>

      <AnimatedTextInput
        animatedProps={debugAnimatedProps}
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
  slide: {
    width: windowWidth,
    aspectRatio: 1,
  },
  slideRed: {
    backgroundColor: '#FF0000',
  },
  slideGreen: {
    backgroundColor: '#00FF00',
  },
  slideBlue: {
    backgroundColor: '#0000FF',
  },
  background: {
    position: 'absolute',
    inset: 0,
    backgroundColor: '#FFF000',
    zIndex: -1,
  },
});
