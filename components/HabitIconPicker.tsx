import { Pressable, StyleSheet, View } from 'react-native';

import {
  HABIT_ICON_MAP,
  HABIT_ICON_OPTIONS,
  type HabitIconName,
} from '../constants/Icons';
import { Colors, Radius } from '../constants/Colors';

type HabitIconPickerProps = {
  selectedIcon: string;
  onSelect: (icon: HabitIconName) => void;
};

export default function HabitIconPicker({
  selectedIcon,
  onSelect,
}: HabitIconPickerProps) {
  return (
    <View style={styles.grid}>
      {HABIT_ICON_OPTIONS.map((option) => {
        const IconComponent = HABIT_ICON_MAP[option.name];
        const isSelected = option.name === selectedIcon;

        return (
          <Pressable
            key={option.name}
            accessibilityRole="button"
            accessibilityLabel={`Ikon ${option.label}`}
            accessibilityState={{ selected: isSelected }}
            onPress={() => onSelect(option.name)}
            style={({ pressed }) => [
              styles.item,
              isSelected ? styles.itemSelected : null,
              pressed ? styles.pressed : null,
            ]}
          >
            <IconComponent
              size={24}
              color={isSelected ? Colors.primary : Colors.textSecondary}
            />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  item: {
    width: '22%',
    aspectRatio: 1,
    minWidth: 44,
    borderRadius: Radius.button,
    borderWidth: 2,
    borderColor: 'transparent',
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.softGreen,
  },
  pressed: {
    opacity: 0.85,
  },
});
