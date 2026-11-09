import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { Colors, Radius, Shadow } from '../constants/Colors';
import { Fonts } from '../constants/Typography';
import { getMotivationalMessage } from '../services/habitUtils';
import CircularProgress from './CircularProgress';
import ProgressBar from './ProgressBar';

type ProgressCardProps = {
  completed: number;
  total: number;
  percentage: number;
  title?: string;
  style?: StyleProp<ViewStyle>;
};

export default function ProgressCard({
  completed,
  total,
  percentage,
  title = 'Progres Hari Ini',
  style,
}: ProgressCardProps) {
  return (
    <LinearGradient
      colors={['#FFFFFF', '#F0FDF4']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.card, style]}
    >
      <View style={styles.glow} pointerEvents="none" />

      <View style={styles.row}>
        <CircularProgress percentage={percentage} size={118} strokeWidth={11} />

        <View style={styles.info}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.count}>
            <Text style={styles.countStrong}>{completed}</Text>
            <Text> dari {total} kebiasaan</Text>
          </Text>

          <View style={styles.messagePill}>
            <Text style={styles.message} numberOfLines={2}>
              {getMotivationalMessage(percentage)}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerLabel}>Semangat hari ini</Text>
        <Text style={styles.footerValue}>
          {completed === total && total > 0 ? 'Sempurna ✨' : `${percentage}%`}
        </Text>
      </View>
      <ProgressBar progress={percentage} height={7} />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.card + 4,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(22, 163, 74, 0.10)',
    ...Shadow.floating,
  },
  glow: {
    position: 'absolute',
    top: -40,
    right: -30,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(134, 239, 172, 0.20)',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  info: {
    flex: 1,
    marginLeft: 16,
  },
  title: {
    fontFamily: Fonts.semiBold,
    fontSize: 16,
    color: Colors.text,
  },
  count: {
    marginTop: 3,
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: Colors.textSecondary,
  },
  countStrong: {
    fontFamily: Fonts.bold,
    color: Colors.primary,
  },
  messagePill: {
    alignSelf: 'flex-start',
    marginTop: 10,
    borderRadius: Radius.pill,
    backgroundColor: Colors.accent,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  message: {
    fontFamily: Fonts.medium,
    fontSize: 10.5,
    lineHeight: 15,
    color: Colors.primaryDark,
  },
  footer: {
    marginTop: 18,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  footerLabel: {
    fontFamily: Fonts.medium,
    fontSize: 11,
    color: Colors.textSecondary,
  },
  footerValue: {
    fontFamily: Fonts.semiBold,
    fontSize: 11,
    color: Colors.primary,
  },
});
