import { StyleSheet, Text, View } from 'react-native';

import { Colors, Radius, Shadow } from '../constants/Colors';
import { Icons } from '../constants/Icons';
import { Fonts } from '../constants/Typography';

type StreakCardProps = {
  current: number;
  best: number;
};

export default function StreakCard({ current, best }: StreakCardProps) {
  return (
    <View
      style={styles.card}
      accessibilityLabel={`Streak saat ini ${current} hari, rekor ${best} hari`}
    >
      <View style={styles.row}>
        <View style={styles.iconCircle}>
          <Icons.Flame
            size={24}
            color={Colors.primary}
            fill={Colors.secondary}
          />
        </View>

        <View style={styles.info}>
          <Text style={styles.label}>Streak Saat Ini</Text>
          <View style={styles.valueRow}>
            <Text style={styles.value}>{current}</Text>
            <Text style={styles.unit}>hari beruntun</Text>
          </View>
        </View>

        <View style={styles.badge}>
          <Icons.Trophy size={13} color={Colors.success} />
          <Text style={styles.badgeText}>Rekor {best}</Text>
        </View>
      </View>

      <Text style={styles.hint}>
        {current === 0
          ? 'Selesaikan satu kebiasaan hari ini untuk memulai streak.'
          : 'Hari berturut-turut dengan minimal satu kebiasaan selesai.'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: Radius.card,
    padding: 16,
    ...Shadow.card,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: Colors.softGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  label: {
    fontFamily: Fonts.medium,
    fontSize: 12,
    color: Colors.textSecondary,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: 2,
  },
  value: {
    fontFamily: Fonts.bold,
    fontSize: 26,
    lineHeight: 30,
    color: Colors.primary,
  },
  unit: {
    marginLeft: 6,
    marginBottom: 3,
    fontFamily: Fonts.medium,
    fontSize: 12,
    color: Colors.textSecondary,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: Radius.pill,
    backgroundColor: Colors.softGreen,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeText: {
    fontFamily: Fonts.medium,
    fontSize: 11,
    color: Colors.success,
  },
  hint: {
    marginTop: 12,
    fontFamily: Fonts.regular,
    fontSize: 11,
    lineHeight: 16,
    color: Colors.textSecondary,
  },
});
