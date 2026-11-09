import { LinearGradient } from 'expo-linear-gradient';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { Colors, Gradients, Radius } from '../constants/Colors';
import { CATEGORY_ICONS } from '../constants/Icons';
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
  const IconComponent = CATEGORY_ICONS[category];

  const content = (
    <>
      <IconComponent
        size={13}
        color={selected ? '#FFFFFF' : Colors.primary}
        strokeWidth={2.2}
      />
      <Text
        style={[styles.text, selected ? styles.textSelected : null]}
        numberOfLines={1}
      >
        {category}
      </Text>
    </>
  );

  if (!onPress) {
    return (
      <View
        style={[
          styles.chip,
          styles.staticChip,
          selected ? styles.selectedChipWrapper : null,
          style,
        ]}
      >
        {selected ? (
          <LinearGradient
            colors={Gradients.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
        ) : null}
        {content}
      </View>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Kategori ${category}`}
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        selected ? styles.selectedChipWrapper : styles.unselectedChip,
        pressed ? styles.pressed : null,
        style,
      ]}
    >
      {selected ? (
        <LinearGradient
          colors={Gradients.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      ) : null}
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: Radius.pill,
    paddingHorizontal: 13,
    paddingVertical: 9,
    overflow: 'hidden',
  },
  staticChip: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  unselectedChip: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  selectedChipWrapper: {
    borderWidth: 1,
    borderColor: 'transparent',
    shadowColor: Colors.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  text: {
    fontFamily: Fonts.medium,
    fontSize: 11.5,
    color: Colors.textSecondary,
  },
  textSelected: {
    color: '#FFFFFF',
    fontFamily: Fonts.semiBold,
  },
  pressed: {
    opacity: 0.88,
    transform: [{ scale: 0.97 }],
  },
});
