import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { Colors, Radius } from '../constants/Colors';
import {
  HABIT_ICON_MAP,
  HABIT_ICON_OPTIONS,
  type HabitIconName,
} from '../constants/Icons';
import { selectFeedback } from '../hooks/useHaptics';

const GAP = 9;

type IconOptionProps = {
  name: HabitIconName;
  label: string;
  selected: boolean;
  size: number;
  onSelect: (name: HabitIconName) => void;
};

function IconOption({ name, label, selected, size, onSelect }: IconOptionProps) {
  const IconComponent = HABIT_ICON_MAP[name];
  const scale = useSharedValue(selected ? 1.06 : 1);

  useEffect(() => {
    scale.value = withSpring(selected ? 1.08 : 1, {
      damping: 12,
      stiffness: 220,
    });
  }, [scale, selected]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[{ width: size, height: size }, animatedStyle]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Ikon ${label}`}
        accessibilityState={{ selected }}
        onPress={() => {
          selectFeedback();
          onSelect(name);
        }}
        style={[
          styles.option,
          selected ? styles.optionSelected : styles.optionIdle,
        ]}
      >
        <IconComponent
          size={22}
          color={selected ? Colors.primary : Colors.textSecondary}
          strokeWidth={selected ? 2.4 : 2}
        />
      </Pressable>
    </Animated.View>
  );
}

type HabitIconPickerProps = {
  selectedIcon: string;
  onSelect: (icon: HabitIconName) => void;
};

export default function HabitIconPicker({
  selectedIcon,
  onSelect,
}: HabitIconPickerProps) {
  const [width, setWidth] = useState(0);
  const itemSize = width > 0 ? (width - GAP * 4) / 5 : 0;

  return (
    <View
      style={styles.grid}
      onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
    >
      {itemSize > 0
        ? HABIT_ICON_OPTIONS.map((option) => (
            <IconOption
              key={option.name}
              name={option.name}
              label={option.label}
              selected={option.name === selectedIcon}
              size={itemSize}
              onSelect={onSelect}
            />
          ))
        : null}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GAP,
  },
  option: {
    flex: 1,
    borderRadius: Radius.button + 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  optionIdle: {
    backgroundColor: Colors.background,
    borderColor: 'transparent',
  },
  optionSelected: {
    backgroundColor: Colors.accent,
    borderColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 2,
  },
});
