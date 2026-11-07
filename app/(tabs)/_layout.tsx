import { Tabs } from 'expo-router';
import { StyleSheet } from 'react-native';

import { Colors } from '../../constants/Colors';
import { Icons } from '../../constants/Icons';
import { Fonts } from '../../constants/Typography';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused, size }) => (
            <Icons.Home
              size={size}
              color={color}
              strokeWidth={focused ? 2.4 : 2}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: 'Progress',
          tabBarIcon: ({ color, focused, size }) => (
            <Icons.BarChart3
              size={size}
              color={color}
              strokeWidth={focused ? 2.4 : 2}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.card,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.border,
  },
  tabLabel: {
    fontFamily: Fonts.medium,
    fontSize: 12,
  },
});
