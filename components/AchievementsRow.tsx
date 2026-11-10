import type { LucideIcon } from 'lucide-react-native';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  type DimensionValue,
} from 'react-native';
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
        const progressWidth = `${Math.round(
          progressRatio * 100,
        )}%` as DimensionValue;

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
              achievement.unlocked
                ? {
                    borderColor: withAlpha(achievement.tint, 0.3),
                    backgroundColor: withAlpha(achievement.tint, 0.06),
                  }
                : styles.lockedCard,
            ]}
          >
            <View
              style={[
                styles.iconWrap,
                {
                  backgroundColor: achievement.unlocked
                    ? withAlpha(achievement.tint, 0.14)
                    : '#F1F5F9',
                },
              ]}
            >
              <IconComponent
                size={22}
                color={
                  achievement.unlocked
                    ? achievement.tint
                    : Colors.textSecondary
                }
                strokeWidth={2.1}
              />
              {achievement.unlocked ? null : (
                <View style={styles.lockBadge}>
                  <Icons.Lock size={9} color="#FFFFFF" strokeWidth={2.6} />
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
                    width: progressWidth,
                    backgroundColor: achievement.unlocked
                      ? achievement.tint
                      : Colors.secondary,
                  },
                ]}
              />
            </View>
            <Text
              style={[
                styles.progressText,
                achievement.unlocked ? { color: achievement.tint } : null,
              ]}
            >
              {achievement.unlocked
                ? 'Terbuka'
                : `${achievement.progress}/${achievement.target}`}
            </Text>
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
    paddingBottom: 4,
  },
  card: {
    width: 138,
    borderRadius: Radius.card,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.85)',
    padding: 13,
    ...Shadow.soft,
  },
  lockedCard: {
    backgroundColor: '#F8FAFC',
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  lockBadge: {
    position: 'absolute',
    right: -3,
    bottom: -3,
    width: 17,
    height: 17,
    borderRadius: 9,
    backgroundColor: Colors.textSecondary,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: Fonts.semiBold,
    fontSize: 11.5,
    lineHeight: 15,
    color: Colors.text,
  },
  lockedTitle: {
    color: Colors.textSecondary,
  },
  description: {
    marginTop: 3,
    fontFamily: Fonts.regular,
    fontSize: 9,
    lineHeight: 13,
    color: Colors.textSecondary,
  },
  progressTrack: {
    height: 5,
    borderRadius: 3,
    marginTop: 10,
    backgroundColor: '#E2E8F0',
    overflow: 'hidden',
  },
  progressFill: {
    height: 5,
    borderRadius: 3,
  },
  progressText: {
    marginTop: 5,
    fontFamily: Fonts.medium,
    fontSize: 9,
    color: Colors.textSecondary,
  },
});
