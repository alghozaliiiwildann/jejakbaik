import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import AnimatedWavingHand from '../../components/common/AnimatedWavingHand';
import Confetti from '../../components/Confetti';
import EmptyState from '../../components/EmptyState';
import ErrorState from '../../components/ErrorState';
import HabitCard from '../../components/HabitCard';
import ProgressCard from '../../components/ProgressCard';
import QuickStats from '../../components/QuickStats';
import GlassCard from '../../components/ui/GlassCard';
import { Colors, Gradients, Radius, Shadow } from '../../constants/Colors';
import { Icons } from '../../constants/Icons';
import { MOTIVATIONAL_QUOTES } from '../../constants/Quotes';
import { Fonts } from '../../constants/Typography';
import { useHabits } from '../../hooks/useHabits';
import { pressFeedback, successFeedback, tapFeedback } from '../../hooks/useHaptics';
import { formatFullDateId, getGreeting, todayKey } from '../../services/dateUtils';
import {
  getOverallStreak,
  getTodayProgress,
  getTotalCompletions,
} from '../../services/habitUtils';
import {
  hasCelebratedToday,
  markCelebratedToday,
} from '../../services/storage';
import type { Habit } from '../../types/habit';

const USER_NAME = 'Arief';

function ListSeparator() {
  return <View style={styles.separator} />;
}

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { habits, isLoading, hasError, reload, toggleHabit } = useHabits();

  const [showConfetti, setShowConfetti] = useState(false);
  const [quote] = useState(
    () =>
      MOTIVATIONAL_QUOTES[
        Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)
      ],
  );
  const confettiTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const today = todayKey();
  const progress = getTodayProgress(habits);
  const overall = getOverallStreak(habits);
  const totalCompleted = getTotalCompletions(habits);
  const allDone = habits.length > 0 && progress.completed === progress.total;

  const fabPulse = useSharedValue(1);

  useEffect(() => {
    fabPulse.value = withRepeat(
      withTiming(1.055, {
        duration: 1100,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true,
    );
  }, [fabPulse]);

  useEffect(
    () => () => {
      if (confettiTimer.current) {
        clearTimeout(confettiTimer.current);
      }
    },
    [],
  );

  const celebrate = useCallback(() => {
    if (confettiTimer.current) {
      clearTimeout(confettiTimer.current);
    }
    setShowConfetti(true);
    confettiTimer.current = setTimeout(() => {
      setShowConfetti(false);
      confettiTimer.current = null;
    }, 3200);
  }, []);

  const handleToggle = useCallback(
    async (habit: Habit) => {
      const isCompleted = habit.completions.includes(today);

      if (isCompleted) {
        tapFeedback();
      } else {
        successFeedback();
      }

      try {
        const next = await toggleHabit(habit.id);
        const nextProgress = getTodayProgress(next);
        if (
          nextProgress.total > 0 &&
          nextProgress.completed === nextProgress.total
        ) {
          try {
            const alreadyCelebrated = await hasCelebratedToday();
            if (!alreadyCelebrated) {
              celebrate();
              await markCelebratedToday();
            }
          } catch {
            // Perayaan opsional: kegagalan storage tidak boleh menggagalkan check-in.
          }
        }
      } catch {
        Alert.alert(
          'Gagal memperbarui',
          'Status kebiasaan tidak dapat diubah. Silakan coba lagi.',
        );
      }
    },
    [celebrate, today, toggleHabit],
  );

  const fabStyle = useAnimatedStyle(() => ({
    transform: [{ scale: fabPulse.value }],
  }));

  const listHeader = (
    <View>
      <LinearGradient
        colors={Gradients.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerOrbLarge} pointerEvents="none" />
        <View style={styles.headerOrbSmall} pointerEvents="none" />
        <View style={styles.headerRing} pointerEvents="none" />

        <View style={[styles.headerContent, { paddingTop: insets.top + 12 }]}>
          <View style={styles.topRow}>
            <View style={styles.greetingWrap}>
              <View style={styles.greetingRow}>
                <Text style={styles.greeting}>Hai, {USER_NAME}</Text>
                <AnimatedWavingHand size={26} />
              </View>
              <Text style={styles.greetingSub}>
                {getGreeting()}! Siap jadi lebih baik?
              </Text>
            </View>

            <View style={styles.headerActions}>
              <View style={styles.bellButton}>
                <Icons.Bell size={17} color="#FFFFFF" strokeWidth={2} />
              </View>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{USER_NAME.charAt(0)}</Text>
              </View>
            </View>
          </View>

          <View style={styles.dateRow}>
            <Icons.CalendarDays
              size={13}
              color="rgba(255,255,255,0.82)"
              strokeWidth={2}
            />
            <Text style={styles.dateText}>{formatFullDateId()}</Text>
          </View>

          <GlassCard tone="dark" style={styles.streakBadge}>
            <Icons.Flame size={14} color="#FDBA74" fill="#FB923C" />
            <Text style={styles.streakBadgeText}>
              {overall.current > 0
                ? `${overall.current} hari streak!`
                : 'Mulai streak pertamamu!'}
            </Text>
            <View style={styles.streakDivider} />
            <Icons.Trophy size={12} color="#FDE68A" />
            <Text style={styles.streakBadgeMuted}>Rekor {overall.best}</Text>
          </GlassCard>
        </View>
      </LinearGradient>

      <View style={styles.overlapSection}>
        <ProgressCard
          completed={progress.completed}
          total={progress.total}
          percentage={progress.percentage}
        />

        <QuickStats
          currentStreak={overall.current}
          totalCompleted={totalCompleted}
          longestStreak={overall.best}
        />

        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleWrap}>
            <Text style={styles.sectionTitle}>Kebiasaan Hari Ini</Text>
            <Text style={styles.sectionSubtitle}>
              {allDone
                ? 'Semua selesai, kamu luar biasa! 🎉'
                : 'Satu langkah kecil, hasil besar.'}
            </Text>
          </View>
          <View
            style={[styles.countPill, allDone ? styles.countPillDone : null]}
          >
            <Text
              style={[
                styles.countPillText,
                allDone ? styles.countPillTextDone : null,
              ]}
            >
              {progress.completed}/{progress.total}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  if (hasError) {
    return (
      <View style={styles.screen}>
        <StatusBar style="dark" />
        <ErrorState onRetry={reload} retrying={isLoading} />
      </View>
    );
  }

  if (isLoading && habits.length === 0) {
    return (
      <View style={[styles.screen, styles.loadingScreen]}>
        <StatusBar style="light" />
        <LinearGradient
          colors={Gradients.header}
          style={StyleSheet.absoluteFill}
        />
        <ActivityIndicator color="#FFFFFF" />
        <Text style={styles.loadingText}>Menyiapkan harimu...</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />

      <FlatList
        data={habits}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={listHeader}
        ItemSeparatorComponent={ListSeparator}
        refreshing={isLoading && habits.length > 0}
        onRefresh={() => {
          void reload();
        }}
        ListEmptyComponent={
          <EmptyState
            title="Belum ada kebiasaan"
            description="Mulai perjalananmu dengan menambahkan satu kebiasaan kecil hari ini."
            actionLabel="Tambah Kebiasaan"
            onAction={() => router.push('/habit/add')}
          />
        }
        ListFooterComponent={
          <View style={styles.footerWrap}>
            <LinearGradient
              colors={['#DCFCE7', '#F0FDF4']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.quoteCard}
            >
              <View style={styles.quoteIcon}>
                <Icons.Sparkles size={17} color={Colors.primary} />
              </View>
              <View style={styles.quoteTextWrap}>
                <Text style={styles.quoteLabel}>QUOTE HARI INI</Text>
                <Text style={styles.quoteText}>“{quote}”</Text>
              </View>
            </LinearGradient>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.itemWrap}>
            <HabitCard
              habit={item}
              completed={item.completions.includes(today)}
              onPress={() => router.push(`/habit/${item.id}`)}
              onToggle={() => {
                void handleToggle(item);
              }}
            />
          </View>
        )}
      />

      <Animated.View
        style={[
          styles.fabWrap,
          { bottom: Math.max(insets.bottom, 10) + 88 },
          fabStyle,
        ]}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Tambah kebiasaan baru"
          onPress={() => {
            pressFeedback();
            router.push('/habit/add');
          }}
          style={({ pressed }) => [
            styles.fab,
            pressed ? styles.fabPressed : null,
          ]}
        >
          <LinearGradient
            colors={Gradients.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.fabGradient}
          >
            <Icons.Plus size={26} color="#FFFFFF" strokeWidth={2.6} />
          </LinearGradient>
        </Pressable>
      </Animated.View>

      <Confetti active={showConfetti} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  listContent: {
    paddingBottom: 170,
  },
  header: {
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: 'hidden',
    paddingBottom: 78,
  },
  headerOrbLarge: {
    position: 'absolute',
    top: -80,
    right: -60,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(255,255,255,0.11)',
  },
  headerOrbSmall: {
    position: 'absolute',
    bottom: -50,
    left: -40,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(220,252,231,0.10)',
  },
  headerRing: {
    position: 'absolute',
    top: 34,
    right: 24,
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
  },
  headerContent: {
    paddingHorizontal: 20,
    paddingBottom: 6,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  greetingWrap: {
    flex: 1,
    paddingRight: 12,
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  greeting: {
    fontFamily: Fonts.bold,
    fontSize: 24,
    letterSpacing: -0.4,
    color: '#FFFFFF',
  },
  greetingSub: {
    marginTop: 2,
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: 'rgba(255,255,255,0.78)',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bellButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.26)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: Fonts.semiBold,
    fontSize: 18,
    color: '#FFFFFF',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
  },
  dateText: {
    fontFamily: Fonts.medium,
    fontSize: 11.5,
    color: 'rgba(255,255,255,0.82)',
  },
  streakBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: Radius.pill,
    paddingHorizontal: 11,
    paddingVertical: 7,
    marginTop: 12,
  },
  streakBadgeText: {
    fontFamily: Fonts.semiBold,
    fontSize: 10.5,
    color: '#FFFFFF',
  },
  streakDivider: {
    width: 1,
    height: 10,
    marginHorizontal: 2,
    backgroundColor: 'rgba(255,255,255,0.24)',
  },
  streakBadgeMuted: {
    fontFamily: Fonts.medium,
    fontSize: 10,
    color: 'rgba(255,255,255,0.72)',
  },
  overlapSection: {
    marginTop: -54,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    marginTop: 26,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitleWrap: {
    flex: 1,
    paddingRight: 10,
  },
  sectionTitle: {
    fontFamily: Fonts.semiBold,
    fontSize: 16.5,
    letterSpacing: -0.2,
    color: Colors.text,
  },
  sectionSubtitle: {
    marginTop: 2,
    fontFamily: Fonts.regular,
    fontSize: 11,
    color: Colors.textSecondary,
  },
  countPill: {
    minWidth: 48,
    borderRadius: Radius.pill,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignItems: 'center',
  },
  countPillDone: {
    backgroundColor: Colors.accent,
    borderColor: Colors.secondary,
  },
  countPillText: {
    fontFamily: Fonts.semiBold,
    fontSize: 11,
    color: Colors.textSecondary,
  },
  countPillTextDone: {
    color: Colors.primaryDark,
  },
  itemWrap: {
    paddingHorizontal: 20,
  },
  separator: {
    height: 10,
  },
  footerWrap: {
    paddingHorizontal: 20,
    paddingTop: 18,
  },
  quoteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: Radius.card,
    padding: 15,
    borderWidth: 1,
    borderColor: 'rgba(22, 163, 74, 0.12)',
  },
  quoteIcon: {
    width: 38,
    height: 38,
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.72)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quoteTextWrap: {
    flex: 1,
  },
  quoteLabel: {
    fontFamily: Fonts.semiBold,
    fontSize: 8.5,
    letterSpacing: 1,
    color: Colors.primaryDark,
  },
  quoteText: {
    marginTop: 3,
    fontFamily: Fonts.medium,
    fontSize: 11.5,
    lineHeight: 17,
    color: Colors.text,
  },
  fabWrap: {
    position: 'absolute',
    right: 20,
  },
  fab: {
    width: 58,
    height: 58,
    borderRadius: 20,
    ...Shadow.floating,
    shadowColor: Colors.primaryDark,
    shadowOpacity: 0.38,
  },
  fabGradient: {
    flex: 1,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
  },
  fabPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.94 }],
  },
  loadingScreen: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontFamily: Fonts.medium,
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
  },
});
