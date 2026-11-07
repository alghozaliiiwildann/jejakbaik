import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { Colors, Radius } from '../constants/Colors';
import { Fonts } from '../constants/Typography';
import type { HabitCategory } from '../types/habit';

type CategoryChipProps = {
  category: HabitCategory;
  selected?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

export default function CategoryChip({
  category,
  selected = false,
  onPress,
  style,
}: CategoryChipProps) {
  const content = (
    <Text style={[styles.text, selected ? styles.textSelected : null]}>
      {category}
    </Text>
  );

  if (!onPress) {
    return (
      <View
        style={[
          styles.chip,
          selected ? styles.chipSelected : null,
          style,
        ]}
      >
        {content}
      </View>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={category}
      accessibilityState={{ selected }}
      hitSlop={8}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        selected ? styles.chipSelected : null,
        pressed ? styles.pressed : null,
        style,
      ]}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    alignSelf: 'flex-start',
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.secondary,
    backgroundColor: Colors.softGreen,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  chipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  text: {
    fontFamily: Fonts.medium,
    fontSize: 11,
    color: Colors.success,
  },
  textSelected: {
    color: Colors.white,
  },
  pressed: {
    opacity: 0.85,
  },
});
