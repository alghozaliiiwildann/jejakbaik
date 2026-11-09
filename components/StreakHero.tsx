import { LinearGradient } from 'expo-linear-gradient';
import { useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { Colors, Gradients, Radius } from '../constants/Colors';
import { Icons } from '../constants/Icons';
import { Fonts } from '../constants/Typography';
import GlassCard from './ui/GlassCard';

type StreakHeroProps = {
  current: number;
  best: number;
  weeklyAverage: number;
  style?: StyleProp<ViewStyle>;
};

export default function StreakHero({
  current,
  best,
  weeklyAverage,
  style,
}: StreakHeroProps) {
  const pulse = useSharedValue(1);

  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1.08, {
        duration: 1300,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true,
    );
  }, [pulse]);

  const flameStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
    opacity: 0.9 + (pulse.value - 1) * 0.8,
  }));

  const message =
    current <= 0
      ? 'Selesaikan satu kebiasaan untuk memulai streak.'
      : current < 3
        ? 'Awal yang bagus, jaga momentummu!'
        : current < 7
          ? 'Kamu sedang on fire! Pertahankan!'
          : 'Konsistensi luar biasa. Terus menyala!';

  return (
    <LinearGradient
      colors={Gradients.streak}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.card, style]}
    >
      <View style={styles.orbTop} pointerEvents="none" />
      <View style={styles.orbBottom} pointerEvents="none" />

      <View style={styles.row}>
        <View style={styles.left}>
          <GlassCard tone="dark" style={styles.badge}>
            <Text style={styles.badgeText}>🔥 STREAK AKTIF</Text>
          </GlassCard>

          <View style={styles.valueRow}>
            <Text style={styles.value}>{current}</Text>
            <Text style={styles.unit}>hari</Text>
          </View>
          <Text style={styles.subtitle}>{message}</Text>
        </View>

        <View style={styles.flameWrap}>
          <Animated.View style={[styles.flameGlow, flameStyle]} />
          <Animated.View style={[styles.flameCore, flameStyle]}>
            <Icons.Flame size={54} color="#FFD6A5" fill={Colors.streakFire} strokeWidth={1.4} />
          </Animated.View>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.footer}>
        <View style={styles.footerItem}>
          <Icons.Trophy size={14} color="#FDE68A" />
          <Text style={styles.footerText}>Rekor {best} hari</Text>
        </View>
        <View style={styles.footerItem}>
          <Icons.TrendingUp size={14} color="#BBF7D0" />
          <Text style={styles.footerText}>Rata-rata {weeklyAverage}%</Text>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.card + 4,
    padding: 20,
    overflow: 'hidden',
    shadowColor: '#14532D',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 22,
    elevation: 8,
  },
  orbTop: {
    position: 'absolute',
    top: -70,
    right: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(134, 239, 172, 0.16)',
  },
  orbBottom: {
    position: 'absolute',
    bottom: -80,
    left: -40,
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: 'rgba(74, 222, 128, 0.10)',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  left: {
    flex: 1,
    paddingRight: 10,
  },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: Radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  badgeText: {
    fontFamily: Fonts.semiBold,
    fontSize: 9,
    letterSpacing: 0.8,
    color: '#ECFDF5',
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 8,
  },
  value: {
    fontFamily: Fonts.bold,
    fontSize: 46,
    lineHeight: 52,
    letterSpacing: -2,
    color: '#FFFFFF',
  },
  unit: {
    marginLeft: 8,
    fontFamily: Fonts.medium,
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
  },
  subtitle: {
    marginTop: 2,
    fontFamily: Fonts.regular,
    fontSize: 11,
    lineHeight: 17,
    color: 'rgba(255,255,255,0.72)',
  },
  flameWrap: {
    width: 96,
    height: 96,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flameGlow: {
    position: 'absolute',
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(251, 146, 60, 0.24)',
    shadowColor: Colors.streakFire,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 24,
    elevation: 8,
  },
  flameCore: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.20)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    height: 1,
    marginVertical: 16,
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  footerText: {
    fontFamily: Fonts.medium,
    fontSize: 10.5,
    color: 'rgba(255,255,255,0.82)',
  },
});
