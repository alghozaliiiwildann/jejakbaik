import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import LottieView from 'lottie-react-native';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors, Radius } from '../constants/Colors';
import { Icons } from '../constants/Icons';
import { Fonts } from '../constants/Typography';
import { getHabits } from '../services/storage';

const MIN_SPLASH_MS = 2500;

function BouncingDot({ index }: { index: number }) {
  const bounce = useSharedValue(0);

  useEffect(() => {
    bounce.value = withRepeat(
      withSequence(
        withDelay(
          index * 140,
          withTiming(1, { duration: 300, easing: Easing.out(Easing.quad) }),
        ),
        withTiming(0, { duration: 320, easing: Easing.in(Easing.quad) }),
        withDelay(240, withTiming(0, { duration: 1 })),
      ),
      -1,
      false,
    );
  }, [bounce, index]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -8 * bounce.value }],
    opacity: 0.45 + bounce.value * 0.55,
  }));

  return <Animated.View style={[styles.dot, animatedStyle]} />;
}

export default function SplashRoute() {
  const router = useRouter();
  const wordmark = useSharedValue(0);
  const tagline = useSharedValue(0);
  const footer = useSharedValue(0);

  useEffect(() => {
    wordmark.value = withDelay(
      250,
      withTiming(1, { duration: 750, easing: Easing.out(Easing.cubic) }),
    );
    tagline.value = withDelay(
      620,
      withTiming(1, { duration: 700, easing: Easing.out(Easing.cubic) }),
    );
    footer.value = withDelay(950, withTiming(1, { duration: 600 }));
  }, [footer, tagline, wordmark]);

  useEffect(() => {
    let isActive = true;

    const navigate = async () => {
      const minimumDelay = new Promise((resolve) =>
        setTimeout(resolve, MIN_SPLASH_MS),
      );

      const dataResult = getHabits()
        .then(() => true)
        .catch(() => false);

      const [dataOk] = await Promise.all([dataResult, minimumDelay]);

      if (!isActive) {
        return;
      }
      router.replace(dataOk ? '/(tabs)/home' : '/error');
    };

    void navigate();

    return () => {
      isActive = false;
    };
  }, [router]);

  const wordmarkStyle = useAnimatedStyle(() => ({
    opacity: wordmark.value,
    transform: [{ translateY: interpolate(wordmark.value, [0, 1], [38, 0]) }],
  }));

  const taglineStyle = useAnimatedStyle(() => ({
    opacity: tagline.value,
    transform: [{ translateY: interpolate(tagline.value, [0, 1], [16, 0]) }],
  }));

  const footerStyle = useAnimatedStyle(() => ({
    opacity: footer.value,
  }));

  return (
    <LinearGradient
      colors={['#F0FDF4', '#F8FAFC', '#DCFCE7']}
      start={{ x: 0.2, y: 0 }}
      end={{ x: 0.8, y: 1 }}
      style={styles.container}
    >
      <StatusBar style="dark" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.orbTop} pointerEvents="none" />
        <View style={styles.orbBottom} pointerEvents="none" />
        <View style={styles.sparkleTop} pointerEvents="none">
          <Icons.Sparkles size={22} color={Colors.primaryLight} />
        </View>
        <View style={styles.sparkleBottom} pointerEvents="none">
          <Icons.Star
            size={16}
            color={Colors.secondary}
            fill={Colors.secondary}
          />
        </View>

        <View style={styles.content}>
          <View style={styles.lottieWrap}>
            <View style={styles.lottieHalo} />
            <View style={styles.lottieRing} />
            <LottieView
              source={require('../assets/animations/walking.json')}
              autoPlay
              loop
              style={styles.lottie}
              resizeMode="contain"
            />
          </View>

          <Animated.View style={[styles.wordmarkWrap, wordmarkStyle]}>
            <Text style={styles.wordmark}>
              <Text style={styles.wordmarkAccent}>Jejak</Text>Baik
            </Text>
            <View style={styles.wordmarkUnderline} />
          </Animated.View>

          <Animated.Text style={[styles.tagline, taglineStyle]}>
            Catat kebiasaan baikmu, satu langkah setiap hari.
          </Animated.Text>
        </View>

        <Animated.View style={[styles.footer, footerStyle]}>
          <View style={styles.dotsRow}>
            <BouncingDot index={0} />
            <BouncingDot index={1} />
            <BouncingDot index={2} />
          </View>
          <Text style={styles.footerText}>Menyiapkan langkah baikmu...</Text>
        </Animated.View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbTop: {
    position: 'absolute',
    top: -100,
    right: -90,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(134, 239, 172, 0.30)',
  },
  orbBottom: {
    position: 'absolute',
    bottom: -120,
    left: -100,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(187, 247, 208, 0.35)',
  },
  sparkleTop: {
    position: 'absolute',
    top: '18%',
    right: 46,
  },
  sparkleBottom: {
    position: 'absolute',
    bottom: '24%',
    left: 48,
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  lottieWrap: {
    width: 240,
    height: 240,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  lottieHalo: {
    position: 'absolute',
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: 'rgba(255, 255, 255, 0.62)',
  },
  lottieRing: {
    position: 'absolute',
    width: 216,
    height: 216,
    borderRadius: 108,
    borderWidth: 1,
    borderColor: 'rgba(22, 163, 74, 0.14)',
  },
  lottie: {
    width: 240,
    height: 240,
  },
  wordmarkWrap: {
    alignItems: 'center',
  },
  wordmark: {
    fontFamily: Fonts.bold,
    fontSize: 38,
    letterSpacing: -1.2,
    color: Colors.text,
  },
  wordmarkAccent: {
    color: Colors.primary,
  },
  wordmarkUnderline: {
    width: 46,
    height: 4,
    borderRadius: 2,
    marginTop: 6,
    backgroundColor: Colors.secondary,
  },
  tagline: {
    marginTop: 14,
    maxWidth: 280,
    fontFamily: Fonts.regular,
    fontSize: 13,
    lineHeight: 21,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 52,
    alignItems: 'center',
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    height: 20,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: Radius.pill,
    backgroundColor: Colors.primary,
  },
  footerText: {
    marginTop: 10,
    fontFamily: Fonts.medium,
    fontSize: 11,
    letterSpacing: 0.2,
    color: Colors.textSecondary,
  },
});
