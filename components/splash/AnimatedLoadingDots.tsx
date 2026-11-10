import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { Colors } from '../../constants/Colors';

interface AnimatedLoadingDotsProps {
  reducedMotion?: boolean;
}

function Dot({ index, reducedMotion }: { index: number; reducedMotion: boolean }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    if (reducedMotion) {
      progress.value = 0;
      return;
    }

    progress.value = withRepeat(
      withSequence(
        withDelay(
          index * 180,
          withTiming(1, { duration: 260, easing: Easing.out(Easing.quad) }),
        ),
        withTiming(0, { duration: 300, easing: Easing.in(Easing.quad) }),
        withDelay(360, withTiming(0, { duration: 1 })),
      ),
      -1,
      false,
    );

    return () => {
      progress.value = 0;
    };
  }, [index, progress, reducedMotion]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -8 * progress.value }, { scale: 0.82 + progress.value * 0.36 }],
    opacity: 0.45 + progress.value * 0.55,
  }));

  return <Animated.View style={[styles.dot, animatedStyle]} />;
}

export default function AnimatedLoadingDots({
  reducedMotion = false,
}: AnimatedLoadingDotsProps) {
  return (
    <View style={styles.row}>
      <Dot index={0} reducedMotion={reducedMotion} />
      <Dot index={1} reducedMotion={reducedMotion} />
      <Dot index={2} reducedMotion={reducedMotion} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
});
