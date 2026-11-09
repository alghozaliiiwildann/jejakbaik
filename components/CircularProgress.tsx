import { useId, useEffect, useState } from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedProps,
  useAnimatedReaction,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Svg, {
  Circle,
  Defs,
  LinearGradient as SvgLinearGradient,
  Stop,
} from 'react-native-svg';

import { Colors } from '../constants/Colors';
import { Fonts } from '../constants/Typography';
import { lighten, withAlpha } from '../services/colorUtils';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

type CircularProgressProps = {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  trackColor?: string;
  label?: string;
  showLabel?: boolean;
  style?: StyleProp<ViewStyle>;
};

export default function CircularProgress({
  percentage,
  size = 120,
  strokeWidth = 11,
  color = Colors.primary,
  trackColor,
  label = 'selesai',
  showLabel = true,
  style,
}: CircularProgressProps) {
  const clamped = Math.max(0, Math.min(100, Math.round(percentage)));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const gradientId = `ring-${useId().replace(/[^a-zA-Z0-9]/g, '')}`;

  const progress = useSharedValue(0);
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    progress.value = withTiming(clamped, {
      duration: 1100,
      easing: Easing.out(Easing.cubic),
    });
  }, [clamped, progress]);

  useAnimatedReaction(
    () => Math.round(progress.value),
    (current, previous) => {
      if (current !== previous) {
        runOnJS(setDisplayValue)(current);
      }
    },
  );

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset:
      circumference - (Math.max(0, Math.min(100, progress.value)) / 100) * circumference,
  }));

  return (
    <View
      style={[{ width: size, height: size }, style]}
      accessibilityRole="progressbar"
      accessibilityValue={{
        min: 0,
        max: 100,
        now: clamped,
        text: `${clamped}%`,
      }}
    >
      <Svg width={size} height={size}>
        <Defs>
          <SvgLinearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={color} />
            <Stop offset="1" stopColor={lighten(color, 0.28)} />
          </SvgLinearGradient>
        </Defs>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trackColor ?? withAlpha(color, 0.14)}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeLinecap="round"
          rotation={-90}
          originX={size / 2}
          originY={size / 2}
          animatedProps={animatedProps}
        />
      </Svg>

      <View style={styles.center} pointerEvents="none">
        <View style={styles.valueRow}>
          <Text style={[styles.value, { fontSize: Math.round(size * 0.235) }]}>
            {displayValue}
          </Text>
          <Text style={[styles.percent, { fontSize: Math.round(size * 0.11) }]}>
            %
          </Text>
        </View>
        {showLabel ? <Text style={styles.label}>{label}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  value: {
    fontFamily: Fonts.bold,
    color: Colors.text,
    letterSpacing: -1,
  },
  percent: {
    marginLeft: 1,
    fontFamily: Fonts.semiBold,
    color: Colors.textSecondary,
  },
  label: {
    marginTop: -2,
    fontFamily: Fonts.medium,
    fontSize: 9,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    color: Colors.textSecondary,
  },
});
