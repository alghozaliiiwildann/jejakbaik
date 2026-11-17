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
import { Icons } from '../constants/Icons';
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
            scale.set(withSpring(0.985, { damping: 18, stiffness: 260 }));
          }
        }}
        onPressOut={() => {
          scale.set(withSpring(1, { damping: 16, stiffness: 220 }));
        }}
        style={[styles.card, completed ? styles.cardCompleted : null]}
      >
        <View
          style={[
            styles.iconWrap,
            { backgroundColor: withAlpha(accent, 0.12) },
          ]}
        >
          <HabitGlyph
            name={habit.icon}
            size={22}
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
                <Icons.Flame
                  size={9}
                  color="#C2410C"
                  fill="#FB923C"
                  strokeWidth={2}
                />
                <Text style={styles.streakText}>{habit.currentStreak}</Text>
              </View>
            ) : null}
          </View>
        </View>

        <Pressable
          accessibilityRole="checkbox"
          accessibilityLabel={`Tandai ${habit.name}`}
          accessibilityState={{ checked: completed, disabled: !interactive }}
          hitSlop={8}
          disabled={!interactive}
          onPress={(event) => {
            event.stopPropagation();
            onToggle();
          }}
          style={styles.checkboxHitArea}
        >
          <Animated.View style={animatedCheckboxStyle}>
            <Svg width={28} height={28} viewBox="0 0 28 28">
              <Rect
                x={1}
                y={1}
                width={26}
                height={26}
                rx={9}
                fill={completed ? accent : 'transparent'}
                stroke={completed ? accent : withAlpha(accent, 0.28)}
                strokeWidth={1.8}
              />
              <AnimatedPath
                d="M8 14.2L11.9 18.1L20 9.9"
                stroke="#FFFFFF"
                strokeWidth={2.8}
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
    paddingVertical: 13,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.9)',
    ...Shadow.card,
  },
  cardCompleted: {
    backgroundColor: '#F9FDFB',
    borderColor: 'rgba(22, 163, 74, 0.18)',
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    minWidth: 0,
    marginLeft: 12,
    marginRight: 8,
  },
  name: {
    fontFamily: Fonts.semiBold,
    fontSize: 14.5,
    lineHeight: 20,
    letterSpacing: -0.1,
    color: Colors.text,
  },
  nameCompleted: {
    color: Colors.primaryDark,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  meta: {
    flexShrink: 1,
    fontFamily: Fonts.regular,
    fontSize: 11,
    lineHeight: 15,
    color: Colors.textSecondary,
  },
  streakPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginLeft: 6,
    borderRadius: Radius.pill,
    backgroundColor: withAlpha(Colors.streakFire, 0.14),
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  streakText: {
    fontFamily: Fonts.semiBold,
    fontSize: 9.5,
    lineHeight: 12,
    color: '#C2410C',
  },
  checkboxHitArea: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
