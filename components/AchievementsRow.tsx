import type { LucideIcon } from 'lucide-react-native';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInRight } from 'react-native-reanimated';

import { Colors, Radius, Shadow } from '../constants/Colors';
import { Icons } from '../constants/Icons';
import { Fonts } from '../constants/Typography';
import { withAlpha } from '../services/colorUtils';
import type { Achievement } from '../types/habit';

const ACHIEVEMENT_ICONS: Record<string, LucideIcon> = {
  'consistency-7': Icons.Award,
  'streak-10': Icons.Flame,
  'streak-30': Icons.Trophy,
  'completions-100': Icons.Sparkles,
  'perfect-week': Icons.Star,
};

type AchievementsRowProps = {
  achievements: Achievement[];
};

export default function AchievementsRow({
  achievements,
}: AchievementsRowProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {achievements.map((achievement, index) => {
        const IconComponent =
          ACHIEVEMENT_ICONS[achievement.id] ?? Icons.Award;
        const progressRatio =
          achievement.target > 0
            ? Math.min(1, achievement.progress / achievement.target)
            : 0;

        return (
          <Animated.View
            key={achievement.id}
            entering={FadeInRight.delay(index * 70).duration(420)}
            accessible
            accessibilityLabel={`${achievement.title}: ${
              achievement.unlocked
                ? 'terbuka'
                : `terkunci, ${achievement.progress} dari ${achievement.target}`
            }`}
            style={[
              styles.card,
              achievement.unlocked ? null : styles.lockedCard,
            ]}
          >
            <View style={styles.topRow}>
              <View
                style={[
                  styles.iconWrap,
                  {
                    backgroundColor: achievement.unlocked
                      ? withAlpha(achievement.tint, 0.13)
                      : '#EFF3F8',
                  },
                ]}
              >
                <IconComponent
                  size={20}
                  color={
                    achievement.unlocked
                      ? achievement.tint
                      : Colors.textSecondary
                  }
                  strokeWidth={2.1}
                />
              </View>

              {achievement.unlocked ? (
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: withAlpha(achievement.tint, 0.13) },
                  ]}
                >
                  <Icons.Check
                    size={10}
                    color={achievement.tint}
                    strokeWidth={3}
                  />
                </View>
              ) : (
                <View style={styles.statusBadge}>
                  <Icons.Lock size={10} color={Colors.placeholder} strokeWidth={2.6} />
                </View>
              )}
            </View>

            <Text
              style={[
                styles.title,
                achievement.unlocked ? null : styles.lockedTitle,
              ]}
              numberOfLines={2}
            >
              {achievement.title}
            </Text>
            <Text style={styles.description} numberOfLines={2}>
              {achievement.description}
            </Text>

            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${Math.round(progressRatio * 100)}%`,
                    backgroundColor: achievement.unlocked
                      ? achievement.tint
                      : Colors.placeholder,
                  },
                ]}
              />
            </View>
            <View style={styles.progressRow}>
              <Text
                style={[
                  styles.progressText,
                  achievement.unlocked ? { color: achievement.tint } : null,
                ]}
              >
                {achievement.unlocked ? 'Terbuka' : 'Terkunci'}
              </Text>
              <Text style={styles.progressCount}>
                {achievement.unlocked
                  ? 'Selesai'
                  : `${achievement.progress}/${achievement.target}`}
              </Text>
            </View>
          </Animated.View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: 10,
    paddingRight: 4,
    paddingBottom: 6,
  },
  card: {
    width: 152,
    borderRadius: Radius.card,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.9)',
    padding: 13,
    ...Shadow.soft,
  },
  lockedCard: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E8EDF3',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#EFF3F8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    marginTop: 10,
    minHeight: 30,
    fontFamily: Fonts.semiBold,
    fontSize: 12.5,
    lineHeight: 15,
    color: Colors.text,
  },
  lockedTitle: {
    color: '#475569',
  },
  description: {
    marginTop: 2,
    minHeight: 28,
    fontFamily: Fonts.regular,
    fontSize: 9.5,
    lineHeight: 14,
    color: Colors.textSecondary,
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    marginTop: 10,
    backgroundColor: '#EDF1F6',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressRow: {
    marginTop: 7,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressText: {
    fontFamily: Fonts.semiBold,
    fontSize: 9,
    letterSpacing: 0.2,
    color: Colors.textSecondary,
  },
  progressCount: {
    fontFamily: Fonts.medium,
    fontSize: 9,
    color: Colors.placeholder,
  },
});
