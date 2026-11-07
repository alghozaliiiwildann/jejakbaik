import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import CategoryChip from '../../components/CategoryChip';
import ConfirmDeleteDialog from '../../components/ConfirmDeleteDialog';
import EmptyState from '../../components/EmptyState';
import ErrorState from '../../components/ErrorState';
import PrimaryButton from '../../components/PrimaryButton';
import { Colors, Radius, Shadow } from '../../constants/Colors';
import { getHabitIcon, Icons } from '../../constants/Icons';
import { Fonts } from '../../constants/Typography';
import {
  formatFullDateId,
  getDayOfMonth,
  getLastDateKeys,
  getShortDayName,
  todayKey,
} from '../../services/dateUtils';
import { deleteHabit, getHabits, toggleCompletionToday } from '../../services/storage';
import type { Habit } from '../../types/habit';

type ScreenStatus = 'loading' | 'found' | 'not-found' | 'error';

type FetchResult =
  | { status: 'found'; habit: Habit }
  | { status: 'not-found' }
  | { status: 'error' };

async function fetchHabit(habitId: string): Promise<FetchResult> {
  try {
    const habits = await getHabits();
    const found = habits.find((habit) => habit.id === habitId);
    return found ? { status: 'found', habit: found } : { status: 'not-found' };
  } catch {
    return { status: 'error' };
  }
}

export default function HabitDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const habitId = params.id ?? '';

  const [habit, setHabit] = useState<Habit | null>(null);
  const [status, setStatus] = useState<ScreenStatus>('loading');
  const [isToggling, setIsToggling] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadHabit = useCallback(async () => {
    if (!habitId) {
      setStatus('not-found');
      return;
    }

    setStatus('loading');
    const result = await fetchHabit(habitId);
    if (result.status === 'found') {
      setHabit(result.habit);
      setStatus('found');
    } else {
      setHabit(null);
      setStatus(result.status);
    }
  }, [habitId]);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      if (!habitId) {
        setStatus('not-found');
        return () => {
          isActive = false;
        };
      }

      setStatus('loading');
      void fetchHabit(habitId).then((result) => {
        if (!isActive) {
          return;
        }
        if (result.status === 'found') {
          setHabit(result.habit);
          setStatus('found');
        } else {
          setHabit(null);
          setStatus(result.status);
        }
      });

      return () => {
        isActive = false;
      };
    }, [habitId]),
  );

  const handleToggleToday = async () => {
    if (!habit || isToggling) {
      return;
    }

    setIsToggling(true);
    try {
      await toggleCompletionToday(habit.id);
      const updatedHabits = await getHabits();
      const updated = updatedHabits.find((item) => item.id === habit.id);
      if (updated) {
        setHabit(updated);
      } else {
        setHabit(null);
        setStatus('not-found');
      }
    } catch {
      Alert.alert(
        'Gagal memperbarui',
        'Status kebiasaan tidak dapat diubah. Silakan coba lagi.',
      );
    } finally {
      setIsToggling(false);
    }
  };

  const handleDelete = async () => {
    if (!habit || isDeleting) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteHabit(habit.id);
      setIsConfirmOpen(false);
      router.back();
    } catch {
      setIsDeleting(false);
      setIsConfirmOpen(false);
      Alert.alert(
        'Gagal menghapus',
        'Kebiasaan tidak dapat dihapus. Silakan coba lagi.',
      );
    }
  };

  const today = todayKey();
  const isCompleted = habit ? habit.completions.includes(today) : false;
  const lastSevenDays = getLastDateKeys(7);
  const HabitIcon = getHabitIcon(habit?.icon ?? 'Leaf');

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.headerRow}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Kembali"
          hitSlop={8}
          onPress={() => router.back()}
          style={({ pressed }) => [
            styles.backButton,
            pressed ? styles.pressed : null,
          ]}
        >
          <Icons.ArrowLeft size={20} color={Colors.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>Detail Kebiasaan</Text>
        <View style={styles.headerSpacer} />
      </View>

      {status === 'loading' ? (
        <View style={styles.loadingState}>
          <ActivityIndicator color={Colors.primary} />
          <Text style={styles.loadingText}>Memuat kebiasaan...</Text>
        </View>
      ) : status === 'error' ? (
        <ErrorState
          onRetry={() => {
            void loadHabit();
          }}
        />
      ) : habit ? (
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.hero}>
            <View style={styles.iconCircle}>
              <HabitIcon size={44} color={Colors.primary} />
            </View>
            <Text style={styles.name}>{habit.name}</Text>
            {habit.target ? (
              <Text style={styles.target}>Target: {habit.target}</Text>
            ) : null}
            <CategoryChip category={habit.category} style={styles.chip} />
          </View>

          <PrimaryButton
            label={isCompleted ? 'Sudah selesai' : 'Selesai hari ini'}
            variant={isCompleted ? 'success' : 'primary'}
            icon={
              <Icons.CheckCircle2
                size={18}
                color={isCompleted ? Colors.success : Colors.white}
              />
            }
            onPress={() => {
              void handleToggleToday();
            }}
            loading={isToggling}
            disabled={isToggling}
          />
          <Text style={styles.todayLabel}>{formatFullDateId()}</Text>

          <View style={styles.historyCard}>
            <Text style={styles.sectionTitle}>Riwayat</Text>
            <View style={styles.historyRow}>
              {lastSevenDays.map((dateKey) => {
                const done = habit.completions.includes(dateKey);

                return (
                  <View key={dateKey} style={styles.historyItem}>
                    <Text style={styles.historyDay}>
                      {getShortDayName(dateKey)}
                    </Text>
                    <View
                      style={[
                        styles.historyCircle,
                        done
                          ? styles.historyCircleDone
                          : styles.historyCirclePending,
                      ]}
                    >
                      <Text
                        style={[
                          styles.historyDate,
                          done ? styles.historyDateDone : null,
                        ]}
                      >
                        {getDayOfMonth(dateKey)}
                      </Text>
                      {done ? (
                        <View style={styles.historyBadge}>
                          <Icons.Check
                            size={9}
                            color={Colors.primary}
                            strokeWidth={3}
                          />
                        </View>
                      ) : null}
                    </View>
                  </View>
                );
              })}
            </View>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Hapus kebiasaan"
            onPress={() => setIsConfirmOpen(true)}
            style={({ pressed }) => [
              styles.deleteButton,
              pressed ? styles.pressed : null,
            ]}
          >
            <Icons.Trash2 size={18} color={Colors.error} />
            <Text style={styles.deleteText}>Hapus Kebiasaan</Text>
          </Pressable>
        </ScrollView>
      ) : (
        <EmptyState
          title="Kebiasaan tidak ditemukan"
          description="Kebiasaan ini mungkin sudah dihapus atau tidak tersedia lagi."
          actionLabel="Kembali"
          onAction={() => router.back()}
          icon={Icons.Leaf}
        />
      )}

      <ConfirmDeleteDialog
        visible={isConfirmOpen && habit !== null}
        habitName={habit?.name ?? ''}
        processing={isDeleting}
        onCancel={() => setIsConfirmOpen(false)}
        onConfirm={() => {
          void handleDelete();
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.card,
  },
  headerTitle: {
    fontFamily: Fonts.semiBold,
    fontSize: 18,
    color: Colors.text,
  },
  headerSpacer: {
    width: 44,
    height: 44,
  },
  loadingState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  loadingText: {
    fontFamily: Fonts.medium,
    fontSize: 12,
    color: Colors.textSecondary,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 32,
  },
  hero: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.softGreen,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  name: {
    fontFamily: Fonts.bold,
    fontSize: 22,
    color: Colors.text,
    textAlign: 'center',
  },
  target: {
    marginTop: 4,
    fontFamily: Fonts.regular,
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  chip: {
    marginTop: 10,
    alignSelf: 'center',
  },
  todayLabel: {
    marginTop: 10,
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  historyCard: {
    marginTop: 24,
    backgroundColor: Colors.card,
    borderRadius: Radius.card,
    padding: 16,
    ...Shadow.card,
  },
  sectionTitle: {
    fontFamily: Fonts.semiBold,
    fontSize: 15,
    color: Colors.text,
    marginBottom: 14,
  },
  historyRow: {
    flexDirection: 'row',
  },
  historyItem: {
    flex: 1,
    alignItems: 'center',
  },
  historyDay: {
    marginBottom: 6,
    fontFamily: Fonts.medium,
    fontSize: 10,
    color: Colors.textSecondary,
  },
  historyCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyCircleDone: {
    backgroundColor: Colors.primary,
  },
  historyCirclePending: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  historyDate: {
    fontFamily: Fonts.medium,
    fontSize: 12,
    color: Colors.textSecondary,
  },
  historyDateDone: {
    color: Colors.white,
  },
  historyBadge: {
    position: 'absolute',
    top: -3,
    right: -3,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  deleteButton: {
    marginTop: 24,
    minHeight: 52,
    borderRadius: Radius.button,
    backgroundColor: Colors.softRed,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 20,
  },
  deleteText: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    color: Colors.error,
  },
  pressed: {
    opacity: 0.85,
  },
});
