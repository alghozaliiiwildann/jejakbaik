import { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { Colors, HABIT_ACCENT_COLORS, Radius } from '../constants/Colors';
import { Icons } from '../constants/Icons';
import { selectFeedback } from '../hooks/useHaptics';
import { withAlpha } from '../services/colorUtils';

type ColorPickerProps = {
  value: string;
  onChange: (color: string) => void;
};

type ColorDotProps = {
  color: string;
  selected: boolean;
  onSelect: (color: string) => void;
};

function ColorDot({ color, selected, onSelect }: ColorDotProps) {
  const scale = useSharedValue(selected ? 1.12 : 1);

  useEffect(() => {
    scale.value = withSpring(selected ? 1.14 : 1, {
      damping: 12,
      stiffness: 220,
    });
  }, [scale, selected]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Warna ${color}`}
        accessibilityState={{ selected }}
        hitSlop={4}
        onPress={() => {
          selectFeedback();
          onSelect(color);
        }}
        style={[
          styles.outerRing,
          {
            borderColor: selected ? withAlpha(color, 0.35) : 'transparent',
            backgroundColor: selected ? withAlpha(color, 0.10) : 'transparent',
          },
        ]}
      >
        <View style={[styles.dot, { backgroundColor: color }]}>
          {selected ? (
            <Icons.Check size={15} color="#FFFFFF" strokeWidth={3.2} />
          ) : null}
        </View>
      </Pressable>
    </Animated.View>
  );
}

export default function ColorPicker({ value, onChange }: ColorPickerProps) {
  return (
    <View style={styles.row}>
      {HABIT_ACCENT_COLORS.map((color) => (
        <ColorDot
          key={color}
          color={color}
          selected={value.toLowerCase() === color.toLowerCase()}
          onSelect={onChange}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  outerRing: {
    width: 42,
    height: 42,
    borderRadius: Radius.pill,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.9)',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 2,
  },
});
