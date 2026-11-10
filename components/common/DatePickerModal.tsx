import { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Colors, Radius, Shadow } from '../../constants/Colors';
import { Icons } from '../../constants/Icons';
import { Fonts } from '../../constants/Typography';
import { selectFeedback, tapFeedback } from '../../hooks/useHaptics';
import { toDateKey } from '../../services/dateUtils';
import GradientButton from '../ui/GradientButton';

const MIN_YEAR = 2000;
const COLUMNS = 7;
const GAP = 6;
const WEEKDAYS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
const MONTHS = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

type DatePickerModalProps = {
  visible: boolean;
  selectedDate: Date;
  onClose: () => void;
  onSelect: (date: Date) => void;
};

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export default function DatePickerModal({
  visible,
  selectedDate,
  onClose,
  onSelect,
}: DatePickerModalProps) {
  const today = new Date();
  const [viewDate, setViewDate] = useState(() => startOfMonth(selectedDate));
  const [mode, setMode] = useState<'days' | 'years'>('days');
  const [gridWidth, setGridWidth] = useState(0);

  const cellSize =
    gridWidth > 0 ? (gridWidth - GAP * (COLUMNS - 1)) / COLUMNS : 0;

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const todayKeyValue = toDateKey(today);

  const canGoPrev = year > MIN_YEAR || month > 0;
  const canGoNext =
    year < today.getFullYear() ||
    (year === today.getFullYear() && month < today.getMonth());

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstWeekday = new Date(year, month, 1).getDay();
  const years = Array.from(
    { length: today.getFullYear() - MIN_YEAR + 1 },
    (_, index) => MIN_YEAR + index,
  );

  const resetView = () => {
    setViewDate(startOfMonth(selectedDate));
    setMode('days');
  };

  const goToMonth = (offset: number) => {
    tapFeedback();
    setViewDate(new Date(year, month + offset, 1));
  };

  const handleSelectDay = (day: number) => {
    const picked = new Date(year, month, day);
    if (toDateKey(picked) > todayKeyValue) {
      return;
    }
    selectFeedback();
    onSelect(picked);
  };

  const handleSelectYear = (pickedYear: number) => {
    const maxMonth =
      pickedYear === today.getFullYear() ? today.getMonth() : 11;
    selectFeedback();
    setViewDate(new Date(pickedYear, Math.min(month, maxMonth), 1));
    setMode('days');
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
      onShow={resetView}
    >
      <View style={styles.overlay}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Tutup pemilih tanggal"
          onPress={onClose}
          style={StyleSheet.absoluteFill}
        />

        <Animated.View entering={FadeInDown.duration(240)} style={styles.sheet}>
          <View style={styles.headerRow}>
            <View style={styles.headerTitleWrap}>
              <Text style={styles.headerTitle}>Pilih Tanggal</Text>
              <Text style={styles.headerSubtitle}>
                Lihat progres pada hari tertentu
              </Text>
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

          <View style={styles.monthRow}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Bulan sebelumnya"
              disabled={!canGoPrev}
              onPress={() => goToMonth(-1)}
              style={({ pressed }) => [
                styles.navButton,
                !canGoPrev ? styles.navDisabled : null,
                pressed && canGoPrev ? styles.pressed : null,
              ]}
            >
              <Icons.ChevronLeft size={18} color={Colors.text} strokeWidth={2.4} />
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Pilih bulan dan tahun"
              onPress={() => {
                selectFeedback();
                setMode(mode === 'days' ? 'years' : 'days');
              }}
              style={({ pressed }) => [
                styles.monthLabelButton,
                pressed ? styles.pressed : null,
              ]}
            >
              <Text style={styles.monthLabel}>
                {MONTHS[month]} {year}
              </Text>
              <Icons.ChevronDown
                size={15}
                color={Colors.primary}
                strokeWidth={2.4}
              />
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Bulan berikutnya"
              disabled={!canGoNext}
              onPress={() => goToMonth(1)}
              style={({ pressed }) => [
                styles.navButton,
                !canGoNext ? styles.navDisabled : null,
                pressed && canGoNext ? styles.pressed : null,
              ]}
            >
              <Icons.ChevronRight size={18} color={Colors.text} strokeWidth={2.4} />
            </Pressable>
          </View>

          {mode === 'years' ? (
            <ScrollView
              style={styles.yearScroll}
              contentContainerStyle={styles.yearGrid}
              showsVerticalScrollIndicator={false}
            >
              {years.map((pickedYear) => {
                const isActive = pickedYear === year;
                return (
                  <Pressable
                    key={pickedYear}
                    accessibilityRole="button"
                    accessibilityLabel={`Tahun ${pickedYear}`}
                    onPress={() => handleSelectYear(pickedYear)}
                    style={({ pressed }) => [
                      styles.yearChip,
                      isActive ? styles.yearChipActive : null,
                      pressed ? styles.pressed : null,
                    ]}
                  >
                    <Text
                      style={[
                        styles.yearText,
                        isActive ? styles.yearTextActive : null,
                      ]}
                    >
                      {pickedYear}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          ) : (
            <>
              <View style={styles.weekdayRow}>
                {WEEKDAYS.map((label) => (
                  <Text key={label} style={styles.weekdayText}>
                    {label}
                  </Text>
                ))}
              </View>

              <View
                style={styles.dayGrid}
                onLayout={(event) =>
                  setGridWidth(event.nativeEvent.layout.width)
                }
              >
                {Array.from({ length: firstWeekday }).map((_, index) => (
                  <View
                    key={`blank-${index}`}
                    style={{ width: cellSize, height: cellSize }}
                  />
                ))}

                {Array.from({ length: daysInMonth }, (_, index) => index + 1).map(
                  (day) => {
                    const dateKey = toDateKey(new Date(year, month, day));
                    const isFuture = dateKey > todayKeyValue;
                    const isSelected =
                      toDateKey(selectedDate) === dateKey;
                    const isToday = dateKey === todayKeyValue;

                    return (
                      <Pressable
                        key={dateKey}
                        accessibilityRole="button"
                        accessibilityLabel={`${day} ${MONTHS[month]} ${year}`}
                        accessibilityState={{
                          selected: isSelected,
                          disabled: isFuture,
                        }}
                        disabled={isFuture}
                        onPress={() => handleSelectDay(day)}
                        style={[
                          styles.dayCell,
                          {
                            width: cellSize,
                            height: cellSize,
                            borderRadius: cellSize / 2,
                          },
                          isToday && !isSelected ? styles.dayToday : null,
                          isSelected ? styles.daySelected : null,
                          isFuture ? styles.dayFuture : null,
                        ]}
                      >
                        <Text
                          style={[
                            styles.dayText,
                            isSelected ? styles.dayTextSelected : null,
                          ]}
                        >
                          {day}
                        </Text>
                      </Pressable>
                    );
                  },
                )}
              </View>

              <GradientButton
                label="Lompat ke Hari Ini"
                icon={Icons.CalendarDays}
                compact
                onPress={() => {
                  selectFeedback();
                  onSelect(new Date());
                }}
                style={styles.todayButton}
              />
            </>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
  },
  sheet: {
    borderRadius: Radius.card + 4,
    backgroundColor: Colors.card,
    padding: 18,
    ...Shadow.floating,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  headerTitleWrap: {
    flex: 1,
    paddingRight: 10,
  },
  headerTitle: {
    fontFamily: Fonts.bold,
    fontSize: 17,
    letterSpacing: -0.3,
    color: Colors.text,
  },
  headerSubtitle: {
    marginTop: 2,
    fontFamily: Fonts.regular,
    fontSize: 10.5,
    color: Colors.textSecondary,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navDisabled: {
    opacity: 0.35,
  },
  monthLabelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Radius.pill,
    backgroundColor: Colors.accent,
  },
  monthLabel: {
    fontFamily: Fonts.semiBold,
    fontSize: 13,
    color: Colors.primaryDark,
  },
  weekdayRow: {
    flexDirection: 'row',
    gap: GAP,
    marginBottom: 6,
  },
  weekdayText: {
    flex: 1,
    textAlign: 'center',
    fontFamily: Fonts.medium,
    fontSize: 9.5,
    color: Colors.textSecondary,
  },
  dayGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GAP,
  },
  dayCell: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayToday: {
    borderWidth: 1.4,
    borderColor: Colors.primary,
  },
  daySelected: {
    backgroundColor: Colors.primary,
  },
  dayFuture: {
    opacity: 0.3,
  },
  dayText: {
    fontFamily: Fonts.medium,
    fontSize: 12,
    color: Colors.text,
  },
  dayTextSelected: {
    fontFamily: Fonts.semiBold,
    color: '#FFFFFF',
  },
  yearScroll: {
    maxHeight: 250,
  },
  yearGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingBottom: 4,
  },
  yearChip: {
    width: '22%',
    paddingVertical: 10,
    borderRadius: Radius.button,
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  yearChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  yearText: {
    fontFamily: Fonts.medium,
    fontSize: 12,
    color: Colors.text,
  },
  yearTextActive: {
    fontFamily: Fonts.semiBold,
    color: '#FFFFFF',
  },
  todayButton: {
    marginTop: 16,
  },
  pressed: {
    opacity: 0.8,
  },
});
