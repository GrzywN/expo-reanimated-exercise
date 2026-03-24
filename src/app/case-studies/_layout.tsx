import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import { FONT_REGULAR, FONT_BOLD, BG } from '@/features/set/set';

export default function CaseStudiesLayout() {
  useFonts({
    [FONT_REGULAR]: require('../../../assets/fonts/Aeonik/Aeonik-Regular.ttf'),
    [FONT_BOLD]: require('../../../assets/fonts/Aeonik/Aeonik-Bold.ttf'),
  });

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: BG },
      }}
    />
  );
}
