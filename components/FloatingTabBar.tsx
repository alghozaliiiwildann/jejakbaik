import { BlurView } from 'expo-blur';
import type { BottomTabBarProps } from 'expo-router/tabs';
import type { LucideIcon } from 'lucide-react-native';
import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { Colors, Shadow } from '../constants/Colors';
import { Icons } from '../constants/Icons';
import { Fonts } from '../constants/Typography';
import { selectFeedback } from '../hooks/useHaptics';

type TabMeta = {
  label: string;
  icon: LucideIcon;
};

const TAB_META: Record<string, TabMeta> = {
  home: { label: 'Beranda', icon: Icons.Home },
  progress: { label: 'Progres', icon: Icons.BarChart3 },
};

type TabButtonProps = {
  label: string;
  icon: LucideIcon;
  focused: boolean;
  onPress: () => void;
};

function TabButton({ label, icon: IconComponent, focused, onPress }: TabButtonProps) {
  const scale = useSharedValue(focused ? 1.1 : 1);
  const pill = useSharedValue(focused ? 1 : 0);

  useEffect(() => {
    scale.value = withSpring(focused ? 1.12 : 1, {
      damping: 14,
      stiffness: 220,
    });
    pill.value = withTiming(focused ? 1 : 0, { duration: 200 });
  }, [focused, pill, scale]);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const pillStyle = useAnimatedStyle(() => ({
    opacity: pill.value,
    transform: [{ scale: 0.82 + pill.value * 0.18 }],
  }));

  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityLabel={label}
      accessibilityState={{ selected: focused }}
      onPress={() => {
        selectFeedback();
        onPress();
      }}
      style={styles.tab}
    >
      <View style={styles.iconBox}>
        <Animated.View style={[styles.pill, pillStyle]} />
        <Animated.View style={iconStyle}>
          <IconComponent
            size={21}
            color={focused ? Colors.primary : Colors.textSecondary}
            strokeWidth={focused ? 2.5 : 2}
          />
        </Animated.View>
      </View>
      <Text style={[styles.label, focused ? styles.labelActive : null]}>
        {label}
      </Text>
    </Pressable>
  );
}

export default function FloatingTabBar({
  state,
  descriptors,
  navigateToTab,
  insets,
}: BottomTabBarProps) {
  return (
    <View
      style={[styles.wrapper, { bottom: Math.max(insets.bottom, 10) + 8 }]}
      pointerEvents="box-none"
    >
      <View style={styles.shadowWrap}>
        <BlurView intensity={70} tint="light" style={styles.bar}>
          <View style={styles.tabsRow}>
            {state.routes.map((route, index) => {
              const meta = TAB_META[route.name] ?? {
                label: descriptors[route.key]?.options?.title ?? route.name,
                icon: Icons.Home,
              };

              return (
                <TabButton
                  key={route.key}
                  label={meta.label}
                  icon={meta.icon}
                  focused={state.index === index}
                  onPress={() => navigateToTab(route.key)}
                />
              );
            })}
          </View>
        </BlurView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 24,
    right: 24,
    zIndex: 50,
    elevation: 50,
  },
  shadowWrap: {
    borderRadius: 26,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    ...Shadow.floating,
  },
  bar: {
    height: 66,
    borderRadius: 26,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.78)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.9)',
  },
  tabsRow: {
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBox: {
    width: 56,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pill: {
    position: 'absolute',
    width: 48,
    height: 30,
    borderRadius: 12,
    backgroundColor: Colors.accent,
  },
  label: {
    marginTop: 2,
    fontFamily: Fonts.medium,
    fontSize: 10,
    color: Colors.textSecondary,
  },
  labelActive: {
    fontFamily: Fonts.semiBold,
    color: Colors.primary,
  },
});
