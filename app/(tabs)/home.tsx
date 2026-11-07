import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import EmptyState from '../../components/EmptyState';
import ErrorState from '../../components/ErrorState';
import HabitCard from '../../components/HabitCard';
import ProgressCard from '../../components/ProgressCard';
import { Colors, Shadow } from '../../constants/Colors';
import { Icons } from '../../constants/Icons';
import { Fonts } from '../../constants/Typography';
import {
  formatFullDateId,
  getGreeting,
  todayKey,
} from '../../services/dateUtils';
import { getTodayProgress } from '../../services/habitUtils';
import { getHabits, toggleCompletionToday } from '../../services/storage';
import type { Habit } from '../../types/habit';

type LoadResult = { ok: true; data: Habit[] } | { ok: false };

async function fetchHabitList(): Promise<LoadResult> {
  try {
    return { ok: true, data: await getHabits() };
  } catch {
    return { ok: false };
  }
}

function ListSeparator() {
  return <View style={styles.separator} />;
}

export default function HomeScreen() {
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

  const handleToggle = useCallback(async (id: string) => {
    try {
      await toggleCompletionToday(id);
      const updated = await getHabits();
      setHabits(updated);
    } catch {
      Alert.alert(
        'Gagal memperbarui',
        'Status kebiasaan tidak dapat diubah. Silakan coba lagi.',
      );
    }
  }, []);

  const today = todayKey();
  const progress = getTodayProgress(habits);

  const listHeader = (
    <View>
      <View style={styles.headerRow}>
        <View style={styles.headerText}>
          <Text style={styles.greeting}>Hai, Arief 👋</Text>
          <Text style={styles.salutation}>{getGreeting()}!</Text>
          <Text style={styles.date}>{formatFullDateId()}</Text>
        </View>
        <View style={styles.bellButton} accessible={false}>
          <Icons.Bell size={20} color={Colors.textSecondary} />
        </View>
      </View>

      <ProgressCard
        completed={progress.completed}
        total={progress.total}
        percentage={progress.percentage}
        style={styles.progressCard}
      />

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Daftar Kebiasaan</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Lihat semua progres kebiasaan"
          hitSlop={8}
          onPress={() => router.push('/(tabs)/progress')}
          style={styles.seeAllButton}
        >
          <Text style={styles.seeAllText}>Lihat Semua</Text>
        </Pressable>
      </View>
    </View>
  );

  const renderContent = () => {
    if (loadError) {
      return <ErrorState onRetry={loadHabits} retrying={isLoading} />;
    }

    if (isLoading && habits.length === 0) {
      return (
        <View style={styles.loadingState}>
          <ActivityIndicator color={Colors.primary} />
          <Text style={styles.loadingText}>Memuat kebiasaan...</Text>
        </View>
      );
    }

    return (
      <FlatList
        data={habits}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={
          <EmptyState
            title="Belum ada kebiasaan"
            description="Mulai bangun rutinitas baikmu dengan menambahkan kebiasaan pertama."
            actionLabel="Tambah Kebiasaan"
            onAction={() => router.push('/habit/add')}
          />
        }
        ItemSeparatorComponent={ListSeparator}
        renderItem={({ item }) => (
          <HabitCard
            habit={item}
            completed={item.completions.includes(today)}
            onPress={() => router.push(`/habit/${item.id}`)}
            onToggle={() => {
              void handleToggle(item.id);
            }}
          />
        )}
      />
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {renderContent()}

      {!loadError ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Tambah kebiasaan"
          onPress={() => router.push('/habit/add')}
          style={({ pressed }) => [
            styles.fab,
            pressed ? styles.fabPressed : null,
          ]}
        >
          <Icons.Plus size={26} color={Colors.white} />
        </Pressable>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 120,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  headerText: {
    flex: 1,
    marginRight: 12,
  },
  greeting: {
    fontFamily: Fonts.bold,
    fontSize: 22,
    color: Colors.text,
  },
  salutation: {
    marginTop: 4,
    fontFamily: Fonts.medium,
    fontSize: 14,
    color: Colors.primary,
  },
  date: {
    marginTop: 4,
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: Colors.textSecondary,
  },
  bellButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.card,
  },
  progressCard: {
    marginTop: 20,
  },
  sectionHeader: {
    marginTop: 24,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontFamily: Fonts.semiBold,
    fontSize: 16,
    color: Colors.text,
  },
  seeAllButton: {
    minHeight: 44,
    justifyContent: 'center',
    paddingLeft: 12,
  },
  seeAllText: {
    fontFamily: Fonts.medium,
    fontSize: 12,
    color: Colors.primary,
  },
  separator: {
    height: 12,
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
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.floating,
  },
  fabPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.97 }],
  },
});
