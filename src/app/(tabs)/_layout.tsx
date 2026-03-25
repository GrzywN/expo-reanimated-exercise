import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" options={{ title: 'Galaxy 2D' }} />
      <Tabs.Screen name="circle" options={{ title: 'Circle' }} />
      <Tabs.Screen name="galaxy-3d" options={{ title: 'Galaxy 3D' }} />
      <Tabs.Screen
        name="chat-head-bubble"
        options={{ title: 'Chat Head Bubble' }}
      />
      <Tabs.Screen
        name="set"
        options={{ title: 'Shared Element Transition' }}
      />
      <Tabs.Screen name="shake-input" options={{ title: 'Shake Input' }} />
    </Tabs>
  );
}
