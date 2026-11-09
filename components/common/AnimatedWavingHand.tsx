import { useEffect } from 'react';
import { StyleSheet, type StyleProp, type TextStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

type AnimatedWavingHandProps = {
  size?: number;
  style?: StyleProp<TextStyle>;
};

export default function AnimatedWavingHand({
  size = 26,
  style,
}: AnimatedWavingHandProps) {
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withSequence(
        withTiming(-15, {
          duration: 180,
          easing: Easing.inOut(Easing.ease),
        }),
        withTiming(15, {
          duration: 320,
          easing: Easing.inOut(Easing.ease),
        }),
        withTiming(-15, {
          duration: 320,
          easing: Easing.inOut(Easing.ease),
        }),
        withTiming(0, {
          duration: 180,
          easing: Easing.inOut(Easing.ease),
        }),
      ),
      -1,
      false,
    );
  }, [rotation]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <Animated.Text
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[styles.hand, { fontSize: size, lineHeight: size * 1.2 }, animatedStyle, style]}
    >
      👋
    </Animated.Text>
  );
}

const styles = StyleSheet.create({
  hand: {
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
});
