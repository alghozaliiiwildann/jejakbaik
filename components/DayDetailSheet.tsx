import { LinearGradient } from 'expo-linear-gradient';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, { SlideInDown } from 'react-native-reanimated';

import { Colors, Radius, Shadow } from '../constants/Colors';
import { Icons } from '../constants/Icons';
import { Fonts } from '../constants/Typography';
import { selectFeedback, tapFeedback } from '../hooks/useHaptics';
import { formatLongDateId } from '../services/dateUtils';
import type { DailyProgress, Habit } from '../types/habit';
import HabitGlyph from './HabitGlyph';

type DayDetailSheetProps = {
  visible: boolean;
  day: DailyProgress | null;
  habits: Habit[];
  onClose: () => void;
};

export default function DayDetailSheet({
  visible,
  day,
  habits,
  onClose,
}: DayDetailSheetProps) {
  if (!day) {
    return null;
  }

  const completedHabits = habits.filter((habit) =>
    habit.completions.includes(day.dateKey),
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Tutup detail hari"
          onPress={onClose}
          style={StyleSheet.absoluteFill}
        />

        <Animated.View
          entering={SlideInDown.springify().damping(18).stiffness(160)}
          style={styles.sheet}
        >
          <View style={styles.handle} />

          <View style={styles.headerRow}>
            <View style={styles.headerText}>
              <Text style={styles.date}>{formatLongDateId(day.dateKey)}</Text>
              <Text style={styles.subtitle}>Rincian kebiasaan hari itu</Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Tutup"
              hitSlop={8}
              onPress={() => {
                tapFeedback();
                onClose();
              }}
              style={({ pressed }) => [
                styles.closeButton,
                pressed ? styles.pressed : null,
              ]}
            >
              <Icons.CircleX size={19} color={Colors.textSecondary} />
            </Pressable>
          </View>

          <LinearGradient
            colors={['#F0FDF4', '#DCFCE7']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.summary}
          >
            <View style={styles.summaryValueRow}>
              <Text style={styles.summaryValue}>{day.percentage}</Text>
              <Text style={styles.summaryPercent}>%</Text>
            </View>
            <View style={styles.summaryInfo}>
              <Text style={styles.summaryLabel}>Penyelesaian</Text>
              <Text style={styles.summaryRatio}>
                {day.completed} dari {day.total} kebiasaan
              </Text>
            </View>
          </LinearGradient>

          <Text style={styles.sectionLabel}>
            Kebiasaan Selesai ({completedHabits.length})
          </Text>

          {completedHabits.length === 0 ? (
            <View style={styles.emptyState}>
              <Icons.Sprout size={26} color={Colors.textSecondary} />
              <Text style={styles.emptyText}>
                Belum ada kebiasaan yang selesai pada hari ini.
              </Text>
            </View>
          ) : (
            <ScrollView
              style={styles.list}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            >
              {completedHabits.map((habit) => (
                <View key={habit.id} style={styles.habitRow}>
                  <View
                    style={[
                      styles.habitIcon,
                      { backgroundColor: `${habit.color}1F` },
                    ]}
                  >
                    <HabitGlyph
                      name={habit.icon}
                      size={16}
                      color={habit.color}
                      strokeWidth={2.2}
                    />
                  </View>
                  <Text style={styles.habitName} numberOfLines={1}>
                    {habit.name}
                  </Text>
                  <View style={styles.checkBadge}>
                    <Icons.Check size={12} color="#FFFFFF" strokeWidth={3} />
                  </View>
                </View>
              ))}
            </ScrollView>
          )}

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Tutup detail hari"
            onPress={() => {
              selectFeedback();
              onClose();
            }}
            style={({ pressed }) => [
              styles.doneButton,
              pressed ? styles.pressed : null,
            ]}
          >
            <Text style={styles.doneLabel}>Tutup</Text>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: Colors.card,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 26,
    ...Shadow.floating,
  },
  handle: {
    alignSelf: 'center',
    width: 42,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#E2E8F0',
    marginBottom: 14,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  headerText: {
    flex: 1,
    paddingRight: 10,
  },
  date: {
    fontFamily: Fonts.semiBold,
    fontSize: 15.5,
    color: Colors.text,
  },
  subtitle: {
    marginTop: 2,
    fontFamily: Fonts.regular,
    fontSize: 10.5,
    color: Colors.textSecondary,
  },
  closeButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: Radius.card,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: 'rgba(22, 163, 74, 0.12)',
  },
  summaryValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  summaryValue: {
    fontFamily: Fonts.bold,
    fontSize: 38,
    lineHeight: 42,
    letterSpacing: -1.4,
    color: Colors.primaryDark,
  },
  summaryPercent: {
    marginLeft: 1,
    fontFamily: Fonts.semiBold,
    fontSize: 15,
    color: Colors.primary,
  },
  summaryInfo: {
    flex: 1,
  },
  summaryLabel: {
    fontFamily: Fonts.medium,
    fontSize: 11,
    color: Colors.primaryDark,
  },
  summaryRatio: {
    marginTop: 2,
    fontFamily: Fonts.regular,
    fontSize: 10.5,
    color: Colors.textSecondary,
  },
  sectionLabel: {
    marginTop: 18,
    marginBottom: 8,
    fontFamily: Fonts.semiBold,
    fontSize: 12,
    color: Colors.text,
  },
  list: {
    maxHeight: 220,
  },
  listContent: {
    gap: 8,
    paddingBottom: 4,
  },
  habitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.button,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#EEF2F6',
    paddingHorizontal: 10,
    paddingVertical: 9,
  },
  habitIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  habitName: {
    flex: 1,
    marginHorizontal: 10,
    fontFamily: Fonts.medium,
    fontSize: 12.5,
    color: Colors.text,
  },
  checkBadge: {
    width: 22,
    height: 22,
    borderRadius: 8,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 22,
    gap: 8,
  },
  emptyText: {
    fontFamily: Fonts.regular,
    fontSize: 11,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  doneButton: {
    marginTop: 16,
    minHeight: 46,
    borderRadius: Radius.button,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneLabel: {
    fontFamily: Fonts.semiBold,
    fontSize: 13,
    color: Colors.primaryDark,
  },
  pressed: {
    opacity: 0.82,
  },
});
