import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path, Rect } from 'react-native-svg';

import { Colors, Radius, Shadow } from '../constants/Colors';
import { Fonts } from '../constants/Typography';
import { withAlpha } from '../services/colorUtils';
import type { Habit } from '../types/habit';
import HabitGlyph from './HabitGlyph';

const AnimatedPath = Animated.createAnimatedComponent(Path);

type HabitCardProps = {
  habit: Habit;
  completed: boolean;
  onPress: () => void;
  onToggle: () => void;
  interactive?: boolean;
};

export default function HabitCard({
  habit,
  completed,
  onPress,
  onToggle,
  interactive = true,
}: HabitCardProps) {
  const accent = habit.color || Colors.primary;

  const scale = useSharedValue(1);
  const checkboxScale = useSharedValue(1);
  const checkProgress = useSharedValue(completed ? 24 : 0);

  useEffect(() => {
    checkProgress.value = withTiming(completed ? 24 : 0, { duration: 260 });

    if (completed) {
      checkboxScale.value = withSequence(
        withTiming(1.18, { duration: 110 }),
        withSpring(1, { damping: 9, stiffness: 240 }),
      );
    }
  }, [completed, checkProgress, checkboxScale]);

  const animatedCardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const animatedCheckboxStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkboxScale.value }],
  }));

  const animatedCheckProps = useAnimatedProps(() => ({
    strokeDashoffset: 24 - checkProgress.value,
  }));

  return (
    <Animated.View style={[animatedCardStyle]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${habit.name}, ${
          completed ? 'sudah selesai hari ini' : 'belum selesai hari ini'
        }`}
        disabled={!interactive}
        onPress={onPress}
        onPressIn={() => {
          if (interactive) {
            scale.set(withSpring(0.982, { damping: 18, stiffness: 260 }));
          }
        }}
        onPressOut={() => {
          scale.set(withSpring(1, { damping: 16, stiffness: 220 }));
        }}
        style={[
          styles.card,
          completed
            ? {
                backgroundColor: withAlpha(accent, 0.055),
                borderColor: withAlpha(accent, 0.28),
              }
            : null,
        ]}
      >
        <View
          style={[
            styles.iconWrap,
            { backgroundColor: withAlpha(accent, 0.13) },
          ]}
        >
          <HabitGlyph
            name={habit.icon}
            size={23}
            color={accent}
            strokeWidth={2.1}
          />
        </View>

        <View style={styles.info}>
          <Text
            style={[styles.name, completed ? styles.nameCompleted : null]}
            numberOfLines={1}
          >
            {habit.name}
          </Text>

          <View style={styles.metaRow}>
            <Text style={styles.meta} numberOfLines={1}>
              {habit.category}
              {habit.target ? ` · ${habit.target}` : ''}
            </Text>
            {habit.currentStreak > 0 ? (
              <View style={styles.streakPill}>
                <Text style={styles.streakText}>🔥 {habit.currentStreak}</Text>
              </View>
            ) : null}
          </View>
        </View>

        <Pressable
          accessibilityRole="checkbox"
          accessibilityLabel={`Tandai ${habit.name}`}
          accessibilityState={{ checked: completed, disabled: !interactive }}
          hitSlop={6}
          disabled={!interactive}
          onPress={(event) => {
            event.stopPropagation();
            onToggle();
          }}
          style={styles.checkboxHitArea}
        >
          <Animated.View style={animatedCheckboxStyle}>
            <Svg width={30} height={30} viewBox="0 0 30 30">
              <Rect
                x={1.2}
                y={1.2}
                width={27.6}
                height={27.6}
                rx={9.5}
                fill={completed ? accent : 'transparent'}
                stroke={completed ? accent : withAlpha(accent, 0.30)}
                strokeWidth={1.8}
              />
              <AnimatedPath
                d="M8.6 15.2L12.8 19.4L21.4 10.6"
                stroke="#FFFFFF"
                strokeWidth={3}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                strokeDasharray={24}
                animatedProps={animatedCheckProps}
              />
            </Svg>
          </Animated.View>
        </Pressable>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: Radius.card,
    padding: 13,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.9)',
    ...Shadow.card,
  },
  iconWrap: {
    width: 50,
    height: 50,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    marginLeft: 12,
    marginRight: 6,
  },
  name: {
    fontFamily: Fonts.semiBold,
    fontSize: 14.5,
    color: Colors.text,
  },
  nameCompleted: {
    color: Colors.primaryDark,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  meta: {
    flexShrink: 1,
    fontFamily: Fonts.regular,
    fontSize: 11,
    color: Colors.textSecondary,
  },
  streakPill: {
    marginLeft: 7,
    borderRadius: Radius.pill,
    backgroundColor: withAlpha(Colors.streakFire, 0.13),
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  streakText: {
    fontFamily: Fonts.semiBold,
    fontSize: 9.5,
    color: '#C2410C',
  },
  checkboxHitArea: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
