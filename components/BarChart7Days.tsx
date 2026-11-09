import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedProps,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import Svg, {
  Defs,
  Line,
  LinearGradient as SvgLinearGradient,
  Rect,
  Stop,
} from 'react-native-svg';

import { Colors } from '../constants/Colors';
import { Fonts } from '../constants/Typography';
import { todayKey } from '../services/dateUtils';
import type { DailyProgress } from '../types/habit';

const AnimatedRect = Animated.createAnimatedComponent(Rect);

const CHART_HEIGHT = 108;
const TOP_PADDING = 8;
const BASELINE = CHART_HEIGHT - 6;
const MAX_BAR_HEIGHT = BASELINE - TOP_PADDING;

type BarProps = {
  x: number;
  width: number;
  percentage: number;
  index: number;
  active: boolean;
};

function AnimatedBar({ x, width, percentage, index, active }: BarProps) {
  const targetHeight =
    percentage > 0 ? Math.max(8, (percentage / 100) * MAX_BAR_HEIGHT) : 5;
  const height = useSharedValue(0);

  useEffect(() => {
    height.value = 0;
    height.value = withDelay(
      index * 55,
      withTiming(targetHeight, {
        duration: 620,
        easing: Easing.out(Easing.cubic),
      }),
    );
  }, [height, index, targetHeight]);

  const animatedProps = useAnimatedProps(() => ({
    height: height.value,
    y: BASELINE - height.value,
  }));

  return (
    <AnimatedRect
      x={x}
      width={width}
      rx={width / 2}
      fill={active ? 'url(#barGradient)' : '#E2E8F0'}
      animatedProps={animatedProps}
    />
  );
}

type BarChart7DaysProps = {
  data: DailyProgress[];
};

export default function BarChart7Days({ data }: BarChart7DaysProps) {
  const [chartWidth, setChartWidth] = useState(0);
  const today = todayKey();
  const slot = chartWidth / 7;
  const barWidth = Math.min(24, Math.max(10, slot * 0.42));

  return (
    <View>
      <View
        style={styles.chartArea}
        onLayout={(event) => setChartWidth(event.nativeEvent.layout.width)}
      >
        {chartWidth > 0 ? (
          <Svg width={chartWidth} height={CHART_HEIGHT}>
            <Defs>
              <SvgLinearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor={Colors.primaryLight} />
                <Stop offset="1" stopColor={Colors.primary} />
              </SvgLinearGradient>
            </Defs>

            {[0.33, 0.66, 1].map((ratio) => (
              <Line
                key={ratio}
                x1={0}
                y1={BASELINE - MAX_BAR_HEIGHT * ratio}
                x2={chartWidth}
                y2={BASELINE - MAX_BAR_HEIGHT * ratio}
                stroke="#EEF2F6"
                strokeWidth={1}
                strokeDasharray="4 6"
              />
            ))}

            {data.map((day, index) => (
              <AnimatedBar
                key={day.dateKey}
                x={slot * index + (slot - barWidth) / 2}
                width={barWidth}
                percentage={day.percentage}
                index={index}
                active={day.percentage > 0}
              />
            ))}
          </Svg>
        ) : null}
      </View>

      <View style={styles.labelsRow}>
        {data.map((day) => {
          const isToday = day.dateKey === today;
          return (
            <View
              key={day.dateKey}
              style={styles.labelColumn}
              accessibilityLabel={`${day.label}: ${day.completed} dari ${day.total} selesai`}
            >
              <Text
                style={[styles.dayLabel, isToday ? styles.dayLabelActive : null]}
              >
                {day.label}
              </Text>
              <View
                style={[
                  styles.dot,
                  isToday ? styles.dotActive : null,
                  day.percentage > 0 && !isToday ? styles.dotFilled : null,
                ]}
              />
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  chartArea: {
    height: CHART_HEIGHT,
  },
  labelsRow: {
    flexDirection: 'row',
    marginTop: 8,
  },
  labelColumn: {
    flex: 1,
    alignItems: 'center',
  },
  dayLabel: {
    fontFamily: Fonts.medium,
    fontSize: 10,
    color: Colors.textSecondary,
  },
  dayLabelActive: {
    fontFamily: Fonts.semiBold,
    color: Colors.primary,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 4,
    backgroundColor: 'transparent',
  },
  dotFilled: {
    backgroundColor: Colors.secondary,
  },
  dotActive: {
    backgroundColor: Colors.primary,
  },
});
