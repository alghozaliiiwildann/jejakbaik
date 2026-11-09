import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Svg, {
  Circle,
  Defs,
  LinearGradient as SvgLinearGradient,
  Path,
  Stop,
} from 'react-native-svg';

import { Colors } from '../constants/Colors';
import { Fonts } from '../constants/Typography';
import { todayKey } from '../services/dateUtils';
import type { DailyProgress } from '../types/habit';

const AnimatedPath = Animated.createAnimatedComponent(Path);

const CHART_HEIGHT = 124;
const PADDING_Y = 14;
const BASELINE = CHART_HEIGHT - PADDING_Y;
const TOP = PADDING_Y;

type Point = { x: number; y: number };

function smoothPath(points: Point[]): string {
  if (points.length === 0) {
    return '';
  }
  if (points.length === 1) {
    return `M ${points[0].x} ${points[0].y}`;
  }

  let path = `M ${points[0].x} ${points[0].y}`;
  for (let index = 0; index < points.length - 1; index += 1) {
    const current = points[index];
    const next = points[index + 1];
    const middleX = (current.x + next.x) / 2;
    path += ` C ${middleX} ${current.y}, ${middleX} ${next.y}, ${next.x} ${next.y}`;
  }
  return path;
}

type LineChartTrendProps = {
  data: DailyProgress[];
};

export default function LineChartTrend({ data }: LineChartTrendProps) {
  const [chartWidth, setChartWidth] = useState(0);
  const draw = useSharedValue(0);
  const today = todayKey();

  // Identitas array berubah tiap render; pakai isi datanya sebagai pemicu animasi.
  const dataSignature = data
    .map((day) => `${day.dateKey}:${day.percentage}`)
    .join('|');

  useEffect(() => {
    draw.value = 0;
    draw.value = withTiming(1, {
      duration: 1300,
      easing: Easing.out(Easing.cubic),
    });
  }, [dataSignature, draw]);

  const usableWidth = Math.max(0, chartWidth - 18);
  const step = data.length > 1 ? usableWidth / (data.length - 1) : usableWidth;

  const points: Point[] = data.map((day, index) => {
    const x = 9 + step * index;
    const y = BASELINE - (Math.max(0, Math.min(100, day.percentage)) / 100) * (BASELINE - TOP);
    return { x, y };
  });

  const linePath = smoothPath(points);
  const areaPath =
    points.length > 0
      ? `${linePath} L ${points[points.length - 1].x} ${BASELINE} L ${points[0].x} ${BASELINE} Z`
      : '';
  const estimateLength = Math.max(120, chartWidth * 1.4);

  const animatedLineProps = useAnimatedProps(() => ({
    strokeDashoffset: estimateLength * (1 - draw.value),
  }));

  return (
    <View>
      <View
        style={styles.chartArea}
        onLayout={(event) => setChartWidth(event.nativeEvent.layout.width)}
      >
        {chartWidth > 0 ? (
          <Svg width={chartWidth} height={CHART_HEIGHT}>
            <Defs>
              <SvgLinearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                <Stop offset="0" stopColor={Colors.primaryLight} />
                <Stop offset="1" stopColor={Colors.primaryDark} />
              </SvgLinearGradient>
              <SvgLinearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor={Colors.primary} stopOpacity={0.22} />
                <Stop offset="1" stopColor={Colors.primary} stopOpacity={0.01} />
              </SvgLinearGradient>
            </Defs>

            {[0.25, 0.5, 0.75, 1].map((ratio) => (
              <Path
                key={ratio}
                d={`M 0 ${BASELINE - (BASELINE - TOP) * ratio} L ${chartWidth} ${
                  BASELINE - (BASELINE - TOP) * ratio
                }`}
                stroke="#EEF2F6"
                strokeWidth={1}
                strokeDasharray="4 6"
              />
            ))}

            {areaPath ? <Path d={areaPath} fill="url(#areaGradient)" /> : null}

            <AnimatedPath
              d={linePath}
              stroke="url(#lineGradient)"
              strokeWidth={3.2}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={estimateLength}
              animatedProps={animatedLineProps}
            />

            {points.map((point, index) => (
              <Circle
                key={data[index].dateKey}
                cx={point.x}
                cy={point.y}
                r={data[index].dateKey === today ? 5 : 3.2}
                fill="#FFFFFF"
                stroke={Colors.primary}
                strokeWidth={data[index].dateKey === today ? 3 : 2}
              />
            ))}
          </Svg>
        ) : null}
      </View>

      <View style={styles.labelsRow}>
        {data.map((day) => {
          const isToday = day.dateKey === today;
          return (
            <Text
              key={day.dateKey}
              style={[styles.dayLabel, isToday ? styles.dayLabelActive : null]}
            >
              {day.label}
            </Text>
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
    justifyContent: 'space-between',
    marginTop: 6,
    paddingHorizontal: 2,
  },
  dayLabel: {
    flex: 1,
    textAlign: 'center',
    fontFamily: Fonts.medium,
    fontSize: 10,
    color: Colors.textSecondary,
  },
  dayLabelActive: {
    fontFamily: Fonts.semiBold,
    color: Colors.primary,
  },
});
