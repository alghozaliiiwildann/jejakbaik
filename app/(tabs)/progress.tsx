import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import type { LucideIcon } from 'lucide-react-native';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import BarChart7Days from '../../components/BarChart7Days';
import EmptyState from '../../components/EmptyState';
import ErrorState from '../../components/ErrorState';
import HeatmapCalendar from '../../components/HeatmapCalendar';
import LineChartTrend from '../../components/LineChartTrend';
import StreakHero from '../../components/StreakHero';
import { Colors, Gradients, Radius, Shadow } from '../../constants/Colors';
import { Icons } from '../../constants/Icons';
import { Fonts } from '../../constants/Typography';
import { useHabits } from '../../hooks/useHabits';
import { formatMonthYearId } from '../../services/dateUtils';
import {
  getHeatmapData,
  getLast7DaysProgress,
  getOverallStats,
  getWeeklyTrendLabel,
} from '../../services/habitUtils';
import { withAlpha } from '../../services/colorUtils';

type SectionTitleProps = {
  title: string;
  hint?: string;
  subtitle?: string;
};

function SectionTitle({ title, hint, subtitle }: SectionTitleProps) {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionTitleWrap}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}
      </View>
      {hint ? (
        <View style={styles.hintPill}>
          <Text style={styles.hintText}>{hint}</Text>
        </View>
      ) : null}
    </View>
  );
}

type StatTileProps = {
  icon: LucideIcon;
  tint: string;
  value: string;
  label: string;
  index: number;
};

function StatTile({ icon: IconComponent, tint, value, label, index }: StatTileProps) {
  return (
    <Animated.View
      entering={FadeInDown.delay(120 + index * 70).duration(480)}
      style={styles.statTile}
    >
      <View style={[styles.statIcon, { backgroundColor: withAlpha(tint, 0.12) }]}>
        <IconComponent size={18} color={tint} strokeWidth={2.2} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Animated.View>
  );
}

export default function ProgressScreen() {
  const router = useRouter();
  const { habits, isLoading, hasError, reload } = useHabits();

  const stats = getOverallStats(habits);
  const weekData = getLast7DaysProgress(habits);
  const heatmapData = getHeatmapData(habits, 30);
  const activeDays = heatmapData.filter((day) => day.completed > 0).length;

  const header = (
    <View style={styles.headerRow}>
      <View style={styles.headerText}>
        <Text style={styles.eyebrow}>LAPORAN</Text>
        <Text style={styles.title}>Progresmu</Text>
        <Text style={styles.subtitle}>
          {formatMonthYearId()} · {getWeeklyTrendLabel(stats.weeklyAverage)}
        </Text>
      </View>
      <View style={styles.calendarBadge}>
        <Icons.CalendarDays size={20} color={Colors.primary} strokeWidth={2} />
      </View>
    </View>
  );

  if (hasError) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <StatusBar style="dark" />
        <ErrorState onRetry={reload} retrying={isLoading} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {header}

        {isLoading && habits.length === 0 ? (
          <View style={styles.loadingState}>
            <ActivityIndicator color={Colors.primary} />
            <Text style={styles.loadingText}>Menghitung progresmu...</Text>
          </View>
        ) : habits.length === 0 ? (
          <EmptyState
            title="Belum ada data progres"
            description="Tambahkan kebiasaan pertamamu agar grafik dan statistik mulai terisi."
            actionLabel="Tambah Kebiasaan"
            onAction={() => router.push('/habit/add')}
          />
        ) : (
          <>
            <StreakHero
              current={stats.currentStreak}
              best={stats.longestStreak}
              weeklyAverage={stats.weeklyAverage}
            />

            <Animated.View entering={FadeInDown.delay(60).duration(500)}>
              <SectionTitle
                title="7 Hari Terakhir"
                subtitle="Persentase kebiasaan yang selesai tiap hari"
                hint={`Rata-rata ${stats.weeklyAverage}%`}
              />
              <View style={styles.card}>
                <BarChart7Days data={weekData} />
              </View>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(100).duration(500)}>
              <SectionTitle
                title="Kalender 30 Hari"
                subtitle="Semakin hijau, semakin konsisten"
                hint={`${activeDays} hari aktif`}
              />
              <View style={styles.card}>
                <HeatmapCalendar data={heatmapData} />
              </View>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(140).duration(500)}>
              <SectionTitle
                title="Tren Penyelesaian"
                subtitle="Perjalananmu selama seminggu"
                hint={`${stats.totalCompletions} check-in`}
              />
              <View style={styles.card}>
                <LineChartTrend data={weekData} />
                <View style={styles.trendFooter}>
                  <View style={styles.trendDot} />
                  <Text style={styles.trendFooterText}>
                    {getWeeklyTrendLabel(stats.weeklyAverage)}
                  </Text>
                </View>
              </View>
            </Animated.View>

            <SectionTitle title="Statistik" subtitle="Ringkasan perjalananmu" />

            <View style={styles.statsGrid}>
              <StatTile
                icon={Icons.Layers}
                tint={Colors.primary}
                value={`${stats.totalHabits}`}
                label="Total Kebiasaan"
                index={0}
              />
              <StatTile
                icon={Icons.CheckCircle2}
                tint="#0EA5E9"
                value={`${stats.completedToday}`}
                label="Selesai Hari Ini"
                index={1}
              />
              <StatTile
                icon={Icons.TrendingUp}
                tint="#8B5CF6"
                value={`${stats.weeklyAverage}%`}
                label="Rata-rata 7 Hari"
                index={2}
              />
              <StatTile
                icon={Icons.Trophy}
                tint="#F59E0B"
                value={`${stats.longestStreak}`}
                label="Streak Terpanjang"
                index={3}
              />
            </View>

            <Animated.View entering={FadeInDown.delay(160).duration(500)}>
              <LinearGradient
                colors={Gradients.dark}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.insight}
              >
                <View style={styles.insightIcon}>
                  <Icons.Sparkles size={20} color="#BBF7D0" />
                </View>
                <View style={styles.insightTextWrap}>
                  <Text style={styles.insightTitle}>Insight untukmu</Text>
                  <Text style={styles.insightText}>
                    {stats.weeklyAverage >= 70
                      ? 'Konsistensimu tinggi. Pertahankan ritme ini dan jaga waktu istirahatmu.'
                      : 'Coba selesaikan satu kebiasaan sebelum siang hari. Awal yang cepat membuat sisa hari lebih ringan.'}
                  </Text>
                </View>
              </LinearGradient>
            </Animated.View>
          </>
        )}
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
    paddingTop: 10,
    paddingBottom: 140,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  headerText: {
    flex: 1,
    paddingRight: 12,
  },
  eyebrow: {
    fontFamily: Fonts.semiBold,
    fontSize: 9,
    letterSpacing: 1.4,
    color: Colors.primary,
  },
  title: {
    marginTop: 2,
    fontFamily: Fonts.bold,
    fontSize: 26,
    letterSpacing: -0.6,
    color: Colors.text,
  },
  subtitle: {
    marginTop: 2,
    fontFamily: Fonts.regular,
    fontSize: 11.5,
    color: Colors.textSecondary,
  },
  calendarBadge: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.soft,
  },
  sectionHeader: {
    marginTop: 26,
    marginBottom: 11,
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
    fontSize: 16,
    letterSpacing: -0.2,
    color: Colors.text,
  },
  sectionSubtitle: {
    marginTop: 2,
    fontFamily: Fonts.regular,
    fontSize: 10.5,
    color: Colors.textSecondary,
  },
  hintPill: {
    borderRadius: Radius.pill,
    backgroundColor: Colors.accent,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  hintText: {
    fontFamily: Fonts.semiBold,
    fontSize: 9.5,
    color: Colors.primaryDark,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: Radius.card,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.85)',
    ...Shadow.card,
  },
  trendFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  trendDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  trendFooterText: {
    fontFamily: Fonts.medium,
    fontSize: 10.5,
    color: Colors.textSecondary,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statTile: {
    width: '48%',
    backgroundColor: Colors.card,
    borderRadius: Radius.card,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.85)',
    ...Shadow.soft,
  },
  statIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  statValue: {
    fontFamily: Fonts.bold,
    fontSize: 22,
    lineHeight: 27,
    color: Colors.text,
  },
  statLabel: {
    marginTop: 1,
    fontFamily: Fonts.regular,
    fontSize: 10.5,
    color: Colors.textSecondary,
  },
  insight: {
    marginTop: 22,
    borderRadius: Radius.card,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    overflow: 'hidden',
  },
  insightIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: 'rgba(187, 247, 208, 0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  insightTextWrap: {
    flex: 1,
  },
  insightTitle: {
    fontFamily: Fonts.semiBold,
    fontSize: 12.5,
    color: '#FFFFFF',
  },
  insightText: {
    marginTop: 2,
    fontFamily: Fonts.regular,
    fontSize: 10.5,
    lineHeight: 16,
    color: 'rgba(255,255,255,0.72)',
  },
  loadingState: {
    flex: 1,
    minHeight: 340,
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
