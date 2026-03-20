import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" options={{ title: 'Galaxy 2D' }} />
      <Tabs.Screen name="circle" options={{ title: 'Circle' }} />
    </Tabs>
  );
}
