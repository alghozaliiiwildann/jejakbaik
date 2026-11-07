import { StyleSheet, Text, View } from 'react-native';

import { Colors } from '../constants/Colors';
import { Fonts } from '../constants/Typography';
import type { DailyProgress } from '../types/habit';

const CHART_HEIGHT = 96;

type BarChart7DaysProps = {
  data: DailyProgress[];
};

export default function BarChart7Days({ data }: BarChart7DaysProps) {
  return (
    <View style={styles.container}>
      {data.map((day) => {
        const cleanPercentage = Math.max(0, Math.min(100, day.percentage));
        const barHeight =
          cleanPercentage > 0
            ? Math.max(6, Math.round((cleanPercentage / 100) * CHART_HEIGHT))
            : 6;

        return (
          <View
            key={day.dateKey}
            style={styles.column}
            accessibilityLabel={`${day.label}: ${cleanPercentage}%`}
          >
            <Text
              style={[
                styles.percentage,
                cleanPercentage > 0 ? styles.percentageActive : null,
              ]}
            >
              {cleanPercentage}%
            </Text>
            <View style={styles.barArea}>
              <View
                style={[
                  styles.bar,
                  { height: barHeight },
                  cleanPercentage > 0 ? styles.barActive : null,
                ]}
              />
            </View>
            <Text style={styles.label} numberOfLines={1}>
              {day.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingTop: 8,
  },
  column: {
    flex: 1,
    alignItems: 'center',
  },
  percentage: {
    marginBottom: 6,
    fontFamily: Fonts.medium,
    fontSize: 9,
    color: Colors.textSecondary,
  },
  percentageActive: {
    color: Colors.success,
  },
  barArea: {
    height: CHART_HEIGHT,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  bar: {
    width: 18,
    borderRadius: 6,
    backgroundColor: Colors.border,
  },
  barActive: {
    backgroundColor: Colors.primary,
  },
  label: {
    marginTop: 6,
    fontFamily: Fonts.medium,
    fontSize: 9,
    color: Colors.textSecondary,
  },
});
