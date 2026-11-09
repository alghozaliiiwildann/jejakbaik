import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { Colors, HEATMAP_COLORS, Radius } from '../constants/Colors';
import { Fonts } from '../constants/Typography';
import {
  formatLongDateId,
  getWeekdayIndex,
} from '../services/dateUtils';
import type { HeatmapDay } from '../services/habitUtils';

const GAP = 5;
const COLUMNS = 7;
const WEEKDAY_LABELS = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

type HeatmapCalendarProps = {
  data: HeatmapDay[];
  accent?: string;
  showWeekdays?: boolean;
};

export default function HeatmapCalendar({
  data,
  accent,
  showWeekdays = true,
}: HeatmapCalendarProps) {
  const [gridWidth, setGridWidth] = useState(0);
  const cellSize =
    gridWidth > 0 ? (gridWidth - GAP * (COLUMNS - 1)) / COLUMNS : 0;

  const firstDateKey = data[0]?.dateKey;
  const startOffset = firstDateKey
    ? (getWeekdayIndex(firstDateKey) + 6) % COLUMNS
    : 0;

  const getCellColor = (day: HeatmapDay): string => {
    if (day.level === 0) {
      return '#F1F5F9';
    }
    return accent ?? HEATMAP_COLORS[day.level];
  };

  return (
    <View>
      {showWeekdays ? (
        <View style={styles.weekdayRow}>
          {WEEKDAY_LABELS.map((label) => (
            <View key={label} style={[styles.weekdayCell, { width: cellSize }]}>
              <Text style={styles.weekdayText}>{label}</Text>
            </View>
          ))}
        </View>
      ) : null}

      <View
        style={styles.grid}
        onLayout={(event) => setGridWidth(event.nativeEvent.layout.width)}
      >
        {cellSize > 0 ? (
          <>
            {Array.from({ length: startOffset }).map((_, index) => (
              <View
                key={`blank-${index}`}
                style={{ width: cellSize, height: cellSize }}
              />
            ))}

            {data.map((day, index) => {
              const isToday = index === data.length - 1;
              return (
                <Animated.View
                  key={day.dateKey}
                  entering={FadeIn.delay(index * 8).duration(260)}
                  accessible
                  accessibilityLabel={`${formatLongDateId(day.dateKey)}: ${
                    day.completed
                  } dari ${day.total} kebiasaan selesai`}
                  style={[
                    styles.cell,
                    {
                      width: cellSize,
                      height: cellSize,
                      backgroundColor: getCellColor(day),
                      borderWidth: isToday ? 1.5 : 0,
                      borderColor: isToday
                        ? accent ?? Colors.primaryDark
                        : 'transparent',
                    },
                  ]}
                />
              );
            })}
          </>
        ) : null}
      </View>

      <View style={styles.legendRow}>
        <Text style={styles.legendLabel}>Sedikit</Text>
        {(accent ? ['#F1F5F9', accent] : [...HEATMAP_COLORS]).map((color) => (
          <View
            key={color}
            style={[styles.legendSwatch, { backgroundColor: color }]}
          />
        ))}
        <Text style={styles.legendLabel}>Banyak</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  weekdayRow: {
    flexDirection: 'row',
    gap: GAP,
    marginBottom: 6,
  },
  weekdayCell: {
    alignItems: 'center',
  },
  weekdayText: {
    fontFamily: Fonts.medium,
    fontSize: 9,
    color: Colors.textSecondary,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GAP,
  },
  cell: {
    borderRadius: Radius.button - 6,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 12,
    gap: 4,
  },
  legendLabel: {
    fontFamily: Fonts.regular,
    fontSize: 9,
    color: Colors.textSecondary,
    marginHorizontal: 2,
  },
  legendSwatch: {
    width: 11,
    height: 11,
    borderRadius: 3.5,
  },
});
