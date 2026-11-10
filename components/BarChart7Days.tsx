import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
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
import { getDayOfMonth, todayKey } from '../services/dateUtils';
import type { DailyProgress } from '../types/habit';

const AnimatedRect = Animated.createAnimatedComponent(Rect);

const CHART_HEIGHT = 116;
const TOP_PADDING = 22;
const BASELINE = CHART_HEIGHT - 6;
const MAX_BAR_HEIGHT = BASELINE - TOP_PADDING;

function barHeightFor(percentage: number): number {
  return percentage > 0 ? Math.max(8, (percentage / 100) * MAX_BAR_HEIGHT) : 5;
}

type BarProps = {
  x: number;
  width: number;
  percentage: number;
  index: number;
  active: boolean;
};

function AnimatedBar({ x, width, percentage, index, active }: BarProps) {
  const targetHeight = barHeightFor(percentage);
  const height = useSharedValue(0);

  useEffect(() => {
    height.value = 0;
    height.value = withDelay(
      index * 45,
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
  onSelectDay?: (day: DailyProgress) => void;
  showValues?: boolean;
};

export default function BarChart7Days({
  data,
  onSelectDay,
  showValues = true,
}: BarChart7DaysProps) {
  const [chartWidth, setChartWidth] = useState(0);
  const today = todayKey();
  const slot = chartWidth / Math.max(1, data.length);
  const barWidth = Math.min(24, Math.max(8, slot * 0.55));
  const showValueLabels = showValues && data.length <= 7;

  return (
    <View>
      <View
        style={styles.chartArea}
        onLayout={(event) => setChartWidth(event.nativeEvent.layout.width)}
      >
        {chartWidth > 0 ? (
          <>
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

            {showValueLabels
              ? data.map((day, index) => (
                  <Text
                    key={`value-${day.dateKey}`}
                    numberOfLines={1}
                    style={[
                      styles.barValue,
                      {
                        left: slot * index,
                        width: slot,
                        top:
                          BASELINE - barHeightFor(day.percentage) - 16,
                      },
                    ]}
                  >
                    {day.percentage > 0 ? `${day.percentage}%` : '–'}
                  </Text>
                ))
              : null}

            {onSelectDay
              ? data.map((day, index) => (
                  <Pressable
                    key={`hit-${day.dateKey}`}
                    accessibilityRole="button"
                    accessibilityLabel={`${day.label}: ${day.completed} dari ${day.total} kebiasaan selesai, ${day.percentage}%`}
                    onPress={() => onSelectDay(day)}
                    style={[styles.hitArea, { left: slot * index, width: slot }]}
                  />
                ))
              : null}
          </>
        ) : null}
      </View>

      <View style={styles.labelsRow}>
        {data.map((day, index) => {
          const isToday = day.dateKey === today;
          const showLabel = data.length <= 7 || index % 5 === 0 || index === data.length - 1;

          return (
            <View key={day.dateKey} style={styles.labelColumn}>
              <Text
                style={[styles.dayLabel, isToday ? styles.dayLabelActive : null]}
                numberOfLines={1}
              >
                {showLabel ? (data.length <= 7 ? day.label : getDayOfMonth(day.dateKey)) : ''}
              </Text>
              {data.length <= 7 ? (
                <Text
                  style={[styles.dateLabel, isToday ? styles.dateLabelActive : null]}
                  numberOfLines={1}
                >
                  {getDayOfMonth(day.dateKey)}
                </Text>
              ) : null}
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
  barValue: {
    position: 'absolute',
    textAlign: 'center',
    fontFamily: Fonts.semiBold,
    fontSize: 8.5,
    color: Colors.textSecondary,
  },
  hitArea: {
    position: 'absolute',
    top: 0,
    bottom: 0,
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
  dateLabel: {
    marginTop: 1,
    fontFamily: Fonts.regular,
    fontSize: 8.5,
    color: Colors.textSecondary,
  },
  dateLabelActive: {
    fontFamily: Fonts.medium,
    color: Colors.primary,
  },
});
