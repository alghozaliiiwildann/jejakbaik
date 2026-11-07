import {
  StyleSheet,
  View,
  type DimensionValue,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { Colors } from '../constants/Colors';

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
  trackColor = Colors.softGreen,
  style,
}: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, progress));
  const width = `${clamped}%` as DimensionValue;

  return (
    <View
      style={[
        styles.track,
        {
          height,
          borderRadius: height / 2,
          backgroundColor: trackColor,
        },
        style,
      ]}
      accessibilityRole="progressbar"
      accessibilityValue={{
        min: 0,
        max: 100,
        now: Math.round(clamped),
      }}
    >
      <View
        style={{
          width,
          height,
          borderRadius: height / 2,
          backgroundColor: color,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: '100%',
    overflow: 'hidden',
  },
});
