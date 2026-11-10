import type { LucideIcon } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import AnimatedNumber from './common/AnimatedNumber';
import { Colors, Radius, Shadow } from '../constants/Colors';
import { Icons } from '../constants/Icons';
import { Fonts } from '../constants/Typography';
import { withAlpha } from '../services/colorUtils';

type QuickStatsProps = {
  currentStreak: number;
  totalCompleted: number;
  longestStreak: number;
};

type StatItem = {
  icon: LucideIcon;
  tint: string;
  value: number;
  label: string;
};

export default function QuickStats({
  currentStreak,
  totalCompleted,
  longestStreak,
}: QuickStatsProps) {
  const items: StatItem[] = [
    {
      icon: Icons.Flame,
      tint: Colors.streakFire,
      value: currentStreak,
      label: 'Streak Saat Ini',
    },
    {
      icon: Icons.CheckCircle2,
      tint: Colors.primary,
      value: totalCompleted,
      label: 'Total Selesai',
    },
    {
      icon: Icons.Trophy,
      tint: '#F59E0B',
      value: longestStreak,
      label: 'Streak Terpanjang',
    },
  ];

  return (
    <View style={styles.row}>
      {items.map((item, index) => {
        const IconComponent = item.icon;
        return (
          <Animated.View
            key={item.label}
            entering={FadeInDown.delay(120 + index * 90).duration(520)}
            style={styles.card}
            accessibilityLabel={`${item.label}: ${item.value}`}
          >
            <View
              style={[
                styles.iconCircle,
                { backgroundColor: withAlpha(item.tint, 0.13) },
              ]}
            >
              <IconComponent size={18} color={item.tint} strokeWidth={2.2} />
            </View>
            <AnimatedNumber
              value={item.value}
              style={styles.value}
            />
            <Text style={styles.label} numberOfLines={2}>
              {item.label}
            </Text>
          </Animated.View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 9,
    marginTop: 14,
  },
  card: {
    flex: 1,
    borderRadius: Radius.card,
    backgroundColor: Colors.card,
    paddingVertical: 13,
    paddingHorizontal: 11,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.8)',
    ...Shadow.soft,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  value: {
    fontFamily: Fonts.bold,
    fontSize: 21,
    lineHeight: 25,
    color: Colors.text,
  },
  label: {
    marginTop: 1,
    fontFamily: Fonts.regular,
    fontSize: 10,
    lineHeight: 14,
    color: Colors.textSecondary,
  },
});
