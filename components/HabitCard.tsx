import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, Radius, Shadow } from '../constants/Colors';
import { getHabitIcon, Icons } from '../constants/Icons';
import { Fonts } from '../constants/Typography';
import type { Habit } from '../types/habit';

type HabitCardProps = {
  habit: Habit;
  completed: boolean;
  onPress: () => void;
  onToggle: () => void;
};

export default function HabitCard({
  habit,
  completed,
  onPress,
  onToggle,
}: HabitCardProps) {
  const IconComponent = getHabitIcon(habit.icon);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${habit.name}, ${
        completed ? 'sudah selesai hari ini' : 'belum selesai hari ini'
      }`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        pressed ? styles.pressed : null,
      ]}
    >
      <View style={styles.iconWrapper}>
        <IconComponent size={24} color={Colors.primary} />
      </View>

      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {habit.name}
        </Text>
        {habit.target ? (
          <Text style={styles.target} numberOfLines={1}>
            Target: {habit.target}
          </Text>
        ) : null}
      </View>

      <Pressable
        accessibilityRole="checkbox"
        accessibilityLabel={`Tandai ${habit.name}`}
        accessibilityState={{ checked: completed }}
        hitSlop={8}
        onPress={(event) => {
          event.stopPropagation();
          onToggle();
        }}
        style={styles.checkboxHitArea}
      >
        <View
          style={[
            styles.checkbox,
            completed ? styles.checkboxChecked : styles.checkboxUnchecked,
          ]}
        >
          {completed ? (
            <Icons.Check size={16} color={Colors.white} strokeWidth={3} />
          ) : null}
        </View>
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: Radius.card,
    padding: 14,
    ...Shadow.card,
  },
  pressed: {
    opacity: 0.9,
  },
  iconWrapper: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: Colors.softGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  name: {
    fontFamily: Fonts.semiBold,
    fontSize: 15,
    color: Colors.text,
  },
  target: {
    marginTop: 2,
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: Colors.textSecondary,
  },
  checkboxHitArea: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: Colors.primary,
  },
  checkboxUnchecked: {
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
  },
});
