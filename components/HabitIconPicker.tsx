import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { Radius } from '../constants/Colors';
import {
  HABIT_ICON_MAP,
  HABIT_ICON_OPTIONS,
  HABIT_ICON_THEMES,
  Icons,
  type HabitIconName,
} from '../constants/Icons';
import { selectFeedback } from '../hooks/useHaptics';

const GAP = 9;
const COLUMNS = 4;

type IconOptionProps = {
  name: HabitIconName;
  label: string;
  selected: boolean;
  size: number;
  onSelect: (name: HabitIconName) => void;
};

function IconOption({
  name,
  label,
  selected,
  size,
  onSelect,
}: IconOptionProps) {
  const IconComponent = HABIT_ICON_MAP[name];
  const theme = HABIT_ICON_THEMES[name];
  const scale = useSharedValue(selected ? 1.08 : 1);

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
          {
            backgroundColor: theme.background,
            borderColor: selected ? theme.stroke : 'transparent',
            shadowColor: theme.stroke,
          },
          selected ? styles.optionSelected : null,
        ]}
      >
        <IconComponent
          size={22}
          color={theme.stroke}
          strokeWidth={selected ? 2.5 : 2.1}
        />
        {selected ? (
          <View style={[styles.checkDot, { backgroundColor: theme.stroke }]}>
            <Icons.Check size={8} color="#FFFFFF" strokeWidth={3.4} />
          </View>
        ) : null}
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
  const itemSize = width > 0 ? (width - GAP * (COLUMNS - 1)) / COLUMNS : 0;

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
  optionSelected: {
    borderWidth: 3,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 8,
    elevation: 3,
  },
  checkDot: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 17,
    height: 17,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
