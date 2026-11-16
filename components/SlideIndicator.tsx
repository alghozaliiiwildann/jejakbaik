import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { Colors } from '../constants/Colors';

type SlideIndicatorProps = {
  count: number;
  activeIndex: number;
};

type DotProps = {
  isActive: boolean;
};

function Dot({ isActive }: DotProps) {
  const progress = useSharedValue(isActive ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(isActive ? 1 : 0, { duration: 260 });
  }, [isActive, progress]);

  // Dot aktif melebar menjadi pill, dot lain menyusut.
  const animatedStyle = useAnimatedStyle(() => ({
    width: interpolate(progress.value, [0, 1], [8, 26]),
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      [Colors.border, Colors.primary],
    ),
  }));

  return <Animated.View style={[styles.dot, animatedStyle]} />;
}

export default function SlideIndicator({
  count,
  activeIndex,
}: SlideIndicatorProps) {
  return (
    <View
      accessibilityRole="adjustable"
      accessibilityLabel={`Slide ${activeIndex + 1} dari ${count}`}
      style={styles.row}
    >
      {Array.from({ length: count }, (_, index) => (
        <Dot key={index} isActive={index === activeIndex} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    height: 8,
    borderRadius: 999,
    marginHorizontal: 4,
  },
});
