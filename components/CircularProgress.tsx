import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { Colors } from '../constants/Colors';
import { Fonts } from '../constants/Typography';

type CircularProgressProps = {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  trackColor?: string;
};

export default function CircularProgress({
  percentage,
  size = 104,
  strokeWidth = 10,
  color = Colors.primary,
  trackColor = Colors.softGreen,
}: CircularProgressProps) {
  const clamped = Math.max(0, Math.min(100, Math.round(percentage)));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (clamped / 100) * circumference;

  return (
    <View
      style={{ width: size, height: size }}
      accessibilityRole="progressbar"
      accessibilityValue={{
        min: 0,
        max: 100,
        now: clamped,
        text: `${clamped}%`,
      }}
    >
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation={-90}
          originX={size / 2}
          originY={size / 2}
        />
      </Svg>
      <View style={styles.overlay}>
        <Text style={[styles.value, { fontSize: Math.round(size * 0.23) }]}>
          {clamped}%
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    fontFamily: Fonts.bold,
    color: Colors.text,
  },
});
