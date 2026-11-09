import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { Colors } from '../constants/Colors';
import { lighten, withAlpha } from '../services/colorUtils';

type ProgressBarProps = {
  progress: number;
  height?: number;
  color?: string;
  trackColor?: string;
  style?: StyleProp<ViewStyle>;
};

export default function ProgressBar({
  progress,
  height = 8,
  color = Colors.primary,
  trackColor,
  style,
}: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, progress));
  const [trackWidth, setTrackWidth] = useState(0);
  const width = useSharedValue(0);

  useEffect(() => {
    width.value = withTiming((clamped / 100) * trackWidth, {
      duration: 800,
      easing: Easing.out(Easing.cubic),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clamped, trackWidth]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: width.value,
  }));

  return (
    <View
      onLayout={(event) => setTrackWidth(event.nativeEvent.layout.width)}
      style={[
        styles.track,
        {
          height,
          borderRadius: height / 2,
          backgroundColor: trackColor ?? withAlpha(color, 0.13),
        },
        style,
      ]}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(clamped) }}
    >
      <Animated.View
        style={[
          {
            height,
            borderRadius: height / 2,
            overflow: 'hidden',
          },
          animatedStyle,
        ]}
      >
        <LinearGradient
          colors={[color, lighten(color, 0.3)]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: '100%',
    overflow: 'hidden',
  },
});
