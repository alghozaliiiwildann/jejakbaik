import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import BarChart7Days from '../../components/BarChart7Days';
import EmptyState from '../../components/EmptyState';
import ErrorState from '../../components/ErrorState';
import ProgressCard from '../../components/ProgressCard';
import { Colors, Radius, Shadow } from '../../constants/Colors';
import { Icons } from '../../constants/Icons';
import { Fonts } from '../../constants/Typography';
import {
  getLast7DaysProgress,
  getTodayProgress,
  getWeeklyAverage,
} from '../../services/habitUtils';
import { getHabits } from '../../services/storage';
import type { Habit } from '../../types/habit';

type LoadResult = { ok: true; data: Habit[] } | { ok: false };

async function fetchHabitList(): Promise<LoadResult> {
  try {
    return { ok: true, data: await getHabits() };
  } catch {
    return { ok: false };
  }
}

type StatCardProps = {
  value: string;
  label: string;
};

function StatCard({ value, label }: StatCardProps) {
  return (
    <View
      style={styles.statCard}
      accessibilityLabel={`${label}: ${value}`}
    >
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export default function ProgressScreen() {
  const router = useRouter();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const loadHabits = useCallback(async () => {
    setIsLoading(true);
    const result = await fetchHabitList();
    if (result.ok) {
      setHabits(result.data);
      setLoadError(false);
    } else {
      setLoadError(true);
    }
    setIsLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      setIsLoading(true);

      void fetchHabitList().then((result) => {
        if (!isActive) {
          return;
        }
        if (result.ok) {
          setHabits(result.data);
          setLoadError(false);
        } else {
          setLoadError(true);
        }
        setIsLoading(false);
      });

      return () => {
        isActive = false;
      };
    }, []),
  );

  const progress = getTodayProgress(habits);
  const weekData = getLast7DaysProgress(habits);
  const weeklyAverage = getWeeklyAverage(habits);

  const renderContent = () => {
    if (loadError) {
      return <ErrorState onRetry={loadHabits} retrying={isLoading} />;
    }

    if (isLoading && habits.length === 0) {
      return (
        <View style={styles.loadingState}>
          <ActivityIndicator color={Colors.primary} />
          <Text style={styles.loadingText}>Memuat progres...</Text>
        </View>
      );
    }

    if (habits.length === 0) {
      return (
        <EmptyState
          title="Belum ada kebiasaan"
          description="Tambahkan kebiasaan agar progres dan statistikmu bisa dilihat di sini."
          actionLabel="Tambah Kebiasaan"
          onAction={() => router.push('/habit/add')}
        />
      );
    }

    return (
      <View>
        <ProgressCard
          title="Penyelesaian Hari Ini"
          completed={progress.completed}
          total={progress.total}
          percentage={progress.percentage}
          style={styles.progressCard}
        />

        <Text style={styles.sectionTitle}>Ringkasan 7 Hari Terakhir</Text>
        <View style={styles.chartCard}>
          <BarChart7Days data={weekData} />
        </View>

        <Text style={styles.sectionTitle}>Statistik</Text>
        <View style={styles.statsRow}>
          <StatCard
            value={`${habits.length}`}
            label="Total Kebiasaan"
          />
          <StatCard
            value={`${progress.completed}`}
            label="Selesai Hari Ini"
          />
          <StatCard
            value={`${weeklyAverage}%`}
            label="Rata-rata Minggu Ini"
          />
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <Text style={styles.title}>Progress</Text>
          <View style={styles.calendarButton} accessible={false}>
            <Icons.Calendar size={20} color={Colors.primary} />
          </View>
        </View>

        {renderContent()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  title: {
    fontFamily: Fonts.bold,
    fontSize: 22,
    color: Colors.text,
  },
  calendarButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.card,
  },
  progressCard: {
    marginBottom: 4,
  },
  sectionTitle: {
    marginTop: 24,
    marginBottom: 12,
    fontFamily: Fonts.semiBold,
    fontSize: 16,
    color: Colors.text,
  },
  chartCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.card,
    paddingHorizontal: 16,
    paddingVertical: 14,
    ...Shadow.card,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: Radius.card,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.card,
  },
  statValue: {
    fontFamily: Fonts.bold,
    fontSize: 20,
    color: Colors.primary,
  },
  statLabel: {
    marginTop: 4,
    fontFamily: Fonts.regular,
    fontSize: 10,
    lineHeight: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  loadingState: {
    flex: 1,
    minHeight: 320,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  loadingText: {
    fontFamily: Fonts.medium,
    fontSize: 12,
    color: Colors.textSecondary,
  },
});
