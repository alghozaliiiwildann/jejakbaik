import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import ConfirmDeleteDialog from '../../components/ConfirmDeleteDialog';
import EmptyState from '../../components/EmptyState';
import ErrorState from '../../components/ErrorState';
import HabitGlyph from '../../components/HabitGlyph';
import HeatmapCalendar from '../../components/HeatmapCalendar';
import GradientButton from '../../components/ui/GradientButton';
import GlassCard from '../../components/ui/GlassCard';
import { Colors, Radius, Shadow } from '../../constants/Colors';
import { Icons } from '../../constants/Icons';
import { Fonts } from '../../constants/Typography';
import { useHabitDetail } from '../../hooks/useHabits';
import {
  successFeedback,
  tapFeedback,
  warningFeedback,
} from '../../hooks/useHaptics';
import { formatFullDateId, todayKey } from '../../services/dateUtils';
import { darken, withAlpha } from '../../services/colorUtils';
import {
  getHabitTotalCompletions,
  getHeatmapData,
} from '../../services/habitUtils';

type DetailStatProps = {
  label: string;
  value: number;
  tint: string;
};

function DetailStat({ label, value, tint }: DetailStatProps) {
  return (
    <View style={styles.statCard}>
      <Text style={[styles.statValue, { color: tint }]}>{value}</Text>
      <Text style={styles.statLabel} numberOfLines={2}>
        {label}
      </Text>
    </View>
  );
}

export default function HabitDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const habitId = Array.isArray(params.id) ? params.id[0] : (params.id ?? '');

  const { habit, status, reload, toggleToday, remove } =
    useHabitDetail(habitId);

  const [isToggling, setIsToggling] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/home');
    }
  };

  const handleToggle = async () => {
    if (!habit || isToggling) {
      return;
    }

    const wasCompleted = habit.completions.includes(todayKey());

    if (wasCompleted) {
      tapFeedback();
    } else {
      successFeedback();
    }

    setIsToggling(true);
    try {
      await toggleToday();
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
      await remove();
      successFeedback();
      setIsConfirmOpen(false);
      goBack();
    } catch {
      setIsDeleting(false);
      setIsConfirmOpen(false);
      Alert.alert(
        'Gagal menghapus',
        'Kebiasaan tidak dapat dihapus. Silakan coba lagi.',
      );
    }
  };

  const simpleHeader = (
    <View style={styles.simpleHeader}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Kembali"
        hitSlop={8}
        onPress={goBack}
        style={({ pressed }) => [
          styles.backButton,
          pressed ? styles.pressed : null,
        ]}
      >
        <Icons.ArrowLeft size={20} color={Colors.text} strokeWidth={2.2} />
      </Pressable>
      <Text style={styles.simpleTitle}>Detail Kebiasaan</Text>
      <View style={styles.headerSpacer} />
    </View>
  );

  if (status === 'loading') {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <StatusBar style="dark" />
        {simpleHeader}
        <View style={styles.loadingState}>
          <ActivityIndicator color={Colors.primary} />
          <Text style={styles.loadingText}>Memuat kebiasaan...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (status === 'error') {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <StatusBar style="dark" />
        {simpleHeader}
        <ErrorState
          onRetry={() => {
            void reload();
          }}
        />
      </SafeAreaView>
    );
  }

  if (status === 'not-found' || !habit) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <StatusBar style="dark" />
        {simpleHeader}
        <EmptyState
          title="Kebiasaan tidak ditemukan"
          description="Kebiasaan ini mungkin sudah dihapus atau tidak tersedia lagi."
          actionLabel="Kembali"
          onAction={goBack}
          icon={Icons.Leaf}
        />
      </SafeAreaView>
    );
  }

  const accent = habit.color || Colors.primary;
  const today = todayKey();
  const isCompleted = habit.completions.includes(today);
  const totalCompletions = getHabitTotalCompletions(habit);
  const heatmapData = getHeatmapData([habit], 30);
  const actionColors: readonly [string, string] = isCompleted
    ? [Colors.primary, Colors.primaryLight]
    : [accent, darken(accent, 0.24)];

  const createdDate = new Date(habit.createdAt);
  const createdLabel = Number.isNaN(createdDate.getTime())
    ? 'Tanggal tidak diketahui'
    : formatFullDateId(createdDate);

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <StatusBar style="light" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={[accent, darken(accent, 0.34)]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.header, { paddingTop: insets.top + 8 }]}
        >
          <View style={styles.headerOrbLarge} pointerEvents="none" />
          <View style={styles.headerOrbSmall} pointerEvents="none" />

          <View style={styles.headerTopRow}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Kembali"
              hitSlop={8}
              onPress={goBack}
              style={({ pressed }) => [
                styles.glassButton,
                pressed ? styles.pressed : null,
              ]}
            >
              <Icons.ArrowLeft size={20} color="#FFFFFF" strokeWidth={2.2} />
            </Pressable>

            <GlassCard tone="dark" style={styles.headerBadge}>
              <Text style={styles.headerBadgeText}>DETAIL KEBIASAAN</Text>
            </GlassCard>

            <View style={styles.headerSpacer} />
          </View>

          <View style={styles.hero}>
            <View style={styles.iconCircle}>
              <HabitGlyph
                name={habit.icon}
                size={42}
                color="#FFFFFF"
                strokeWidth={1.8}
              />
            </View>

            <Text style={styles.name}>{habit.name}</Text>
            {habit.target ? (
              <Text style={styles.target}>Target: {habit.target}</Text>
            ) : null}

            <View style={styles.headerPills}>
              <GlassCard tone="dark" style={styles.pill}>
                <Text style={styles.pillText}>{habit.category}</Text>
              </GlassCard>
              {habit.currentStreak > 0 ? (
                <GlassCard tone="dark" style={styles.pill}>
                  <Icons.Flame size={12} color="#FDBA74" fill="#FB923C" />
                  <Text style={styles.pillText}>
                    {habit.currentStreak} hari beruntun
                  </Text>
                </GlassCard>
              ) : null}
            </View>
          </View>
        </LinearGradient>

        <View style={styles.body}>
          <GradientButton
            label={isCompleted ? 'Sudah selesai hari ini' : 'Selesai hari ini'}
            onPress={() => {
              void handleToggle();
            }}
            icon={isCompleted ? Icons.CircleCheck : Icons.Check}
            loading={isToggling}
            disabled={isToggling}
            colors={actionColors}
            large
          />
          <Text style={styles.actionHint}>
            {isCompleted
              ? 'Tekan lagi untuk membatalkan tanda selesai.'
              : formatFullDateId()}
          </Text>

          <View style={styles.statsRow}>
            <DetailStat
              label="Streak Saat Ini"
              value={habit.currentStreak}
              tint={Colors.streakFire}
            />
            <DetailStat
              label="Streak Terpanjang"
              value={habit.longestStreak}
              tint="#F59E0B"
            />
            <DetailStat
              label="Total Selesai"
              value={totalCompletions}
              tint={accent}
            />
          </View>

          <View style={styles.card}>
            <View style={styles.cardHead}>
              <View style={styles.cardTitleWrap}>
                <Text style={styles.cardTitle}>30 Hari Terakhir</Text>
                <Text style={styles.cardSubtitle}>
                  Perjalanan konsistensimu
                </Text>
              </View>
              <View
                style={[
                  styles.countBadge,
                  { backgroundColor: withAlpha(accent, 0.1) },
                ]}
              >
                <Text style={[styles.countBadgeText, { color: accent }]}>
                  {totalCompletions} selesai
                </Text>
              </View>
            </View>
            <HeatmapCalendar data={heatmapData} accent={accent} />
          </View>

          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Icons.Target size={17} color={Colors.primary} />
              </View>
              <View style={styles.infoTextWrap}>
                <Text style={styles.infoLabel}>Target</Text>
                <Text style={styles.infoValue}>
                  {habit.target || 'Belum ada target khusus'}
                </Text>
              </View>
            </View>
            <View style={styles.infoDivider} />
            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Icons.CalendarDays size={17} color={Colors.primary} />
              </View>
              <View style={styles.infoTextWrap}>
                <Text style={styles.infoLabel}>Dibuat sejak</Text>
                <Text style={styles.infoValue}>{createdLabel}</Text>
              </View>
            </View>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Hapus kebiasaan"
            onPress={() => {
              warningFeedback();
              setIsConfirmOpen(true);
            }}
            style={({ pressed }) => [
              styles.deleteButton,
              pressed ? styles.deletePressed : null,
            ]}
          >
            <Icons.Trash2 size={18} color={Colors.error} strokeWidth={2} />
            <Text style={styles.deleteText}>Hapus Kebiasaan</Text>
          </Pressable>
        </View>
      </ScrollView>

      <ConfirmDeleteDialog
        visible={isConfirmOpen}
        habitName={habit.name}
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
  scrollContent: {
    paddingBottom: 32,
  },
  header: {
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    paddingHorizontal: 20,
    paddingBottom: 28,
    overflow: 'hidden',
  },
  headerOrbLarge: {
    position: 'absolute',
    top: -80,
    right: -50,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
  headerOrbSmall: {
    position: 'absolute',
    bottom: -60,
    left: -40,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  glassButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerBadge: {
    borderRadius: Radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  headerBadgeText: {
    fontFamily: Fonts.semiBold,
    fontSize: 8.5,
    letterSpacing: 0.9,
    color: 'rgba(255,255,255,0.9)',
  },
  headerSpacer: {
    width: 42,
    height: 42,
  },
  hero: {
    alignItems: 'center',
    marginTop: 16,
  },
  iconCircle: {
    width: 92,
    height: 92,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.30)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 5,
  },
  name: {
    marginTop: 14,
    fontFamily: Fonts.bold,
    fontSize: 23,
    letterSpacing: -0.4,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  target: {
    marginTop: 3,
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: 'rgba(255,255,255,0.78)',
    textAlign: 'center',
  },
  headerPills: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: 12,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  pill: {
    borderRadius: Radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  pillText: {
    fontFamily: Fonts.medium,
    fontSize: 9.5,
    color: '#FFFFFF',
  },
  body: {
    paddingHorizontal: 20,
    paddingTop: 22,
  },
  actionHint: {
    marginTop: 10,
    fontFamily: Fonts.regular,
    fontSize: 10.5,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 9,
    marginTop: 22,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: Radius.card,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.85)',
    ...Shadow.soft,
  },
  statValue: {
    fontFamily: Fonts.bold,
    fontSize: 21,
    lineHeight: 25,
  },
  statLabel: {
    marginTop: 2,
    fontFamily: Fonts.regular,
    fontSize: 9.5,
    lineHeight: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  card: {
    marginTop: 22,
    backgroundColor: Colors.card,
    borderRadius: Radius.card,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.85)',
    ...Shadow.card,
  },
  cardHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  cardTitleWrap: {
    flex: 1,
    paddingRight: 10,
  },
  cardTitle: {
    fontFamily: Fonts.semiBold,
    fontSize: 14.5,
    color: Colors.text,
  },
  cardSubtitle: {
    marginTop: 2,
    fontFamily: Fonts.regular,
    fontSize: 10,
    color: Colors.textSecondary,
  },
  countBadge: {
    borderRadius: Radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  countBadgeText: {
    fontFamily: Fonts.semiBold,
    fontSize: 9.5,
  },
  infoCard: {
    marginTop: 18,
    backgroundColor: Colors.card,
    borderRadius: Radius.card,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.85)',
    ...Shadow.soft,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  infoIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoTextWrap: {
    flex: 1,
    marginLeft: 11,
  },
  infoLabel: {
    fontFamily: Fonts.medium,
    fontSize: 10,
    color: Colors.textSecondary,
  },
  infoValue: {
    marginTop: 1,
    fontFamily: Fonts.medium,
    fontSize: 12,
    color: Colors.text,
  },
  infoDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  deleteButton: {
    marginTop: 20,
    minHeight: 50,
    borderRadius: Radius.button,
    backgroundColor: Colors.softRed,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.18)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  deletePressed: {
    opacity: 0.85,
  },
  deleteText: {
    fontFamily: Fonts.semiBold,
    fontSize: 13,
    color: Colors.error,
  },
  simpleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.soft,
  },
  simpleTitle: {
    fontFamily: Fonts.semiBold,
    fontSize: 16.5,
    color: Colors.text,
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
  pressed: {
    opacity: 0.85,
  },
});
