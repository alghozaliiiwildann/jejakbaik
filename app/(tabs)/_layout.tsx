import { Tabs } from 'expo-router';

import FloatingTabBar from '../../components/FloatingTabBar';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
      }}
      tabBar={(props) => <FloatingTabBar {...props} />}
    >
      <Tabs.Screen name="home" options={{ title: 'Beranda' }} />
      <Tabs.Screen name="progress" options={{ title: 'Progres' }} />
    </Tabs>
  );
}
