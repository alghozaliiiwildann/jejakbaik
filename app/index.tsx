import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import LottieView from 'lottie-react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedProps,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { Colors } from '../constants/Colors';
import { Fonts as FontTokens } from '../constants/Typography';
import AnimatedLoadingDots from '../components/splash/AnimatedLoadingDots';
import { getHabits } from '../services/storage';

const MIN_SPLASH_MS = 2000;
const MAX_SPLASH_MS = 6000;
const ARC_LENGTH = Math.PI * 100;

const AnimatedPath = Animated.createAnimatedComponent(Path);

function FloatingLeaf({
  path,
  color,
  style,
  reducedMotion,
  delay,
}: {
  path: string;
  color: string;
  style: object;
  reducedMotion: boolean;
  delay: number;
}) {
  const translateY = useSharedValue(0);
  const rotate = useSharedValue(0);

  useEffect(() => {
    if (reducedMotion) {
      translateY.value = 0;
      rotate.value = 0;
      return;
    }

    translateY.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(6, { duration: 1500, easing: Easing.inOut(Easing.sin) }),
          withTiming(-6, { duration: 1500, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
        true,
      ),
    );
    rotate.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(2.5, { duration: 1500, easing: Easing.inOut(Easing.sin) }),
          withTiming(-2.5, { duration: 1500, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
        true,
      ),
    );
  }, [delay, reducedMotion, rotate, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { rotate: `${rotate.value}deg` },
    ],
  }));

  return (
    <Animated.View style={[style, animatedStyle]}>
      <Svg width={42} height={42} viewBox="0 0 42 42">
        <Path d={path} fill={color} />
      </Svg>
    </Animated.View>
  );
}

export default function SplashRoute() {
  const router = useRouter();
  const reducedMotion = useReducedMotion();

  const wordmark = useSharedValue(0);
  const tagline = useSharedValue(0);
  const footer = useSharedValue(0);
  const arcProgress = useSharedValue(reducedMotion ? 1 : 0);

  const navigatedRef = useRef(false);

  useEffect(() => {
    wordmark.value = withDelay(
      250,
      withTiming(1, { duration: 750, easing: Easing.out(Easing.cubic) }),
    );
    tagline.value = withDelay(
      500,
      withTiming(1, { duration: 700, easing: Easing.out(Easing.cubic) }),
    );
    footer.value = withDelay(900, withTiming(1, { duration: 600 }));

    if (!reducedMotion) {
      arcProgress.value = withDelay(
        80,
        withTiming(1, { duration: 950, easing: Easing.out(Easing.cubic) }),
      );
    }
  }, [arcProgress, footer, reducedMotion, tagline, wordmark]);

  useEffect(() => {
    let isActive = true;
    const timers = new Set<ReturnType<typeof setTimeout>>();

    const delay = (ms: number) =>
      new Promise<void>((resolve) => {
        const id = setTimeout(() => {
          timers.delete(id);
          resolve();
        }, ms);
        timers.add(id);
      });

    const load = async () => {
      const dataPromise = getHabits()
        .then(() => true)
        .catch(() => false);
      const minimumDelay = delay(MIN_SPLASH_MS);
      const maximumDelay = delay(MAX_SPLASH_MS);
      const guardedData = Promise.race([
        dataPromise,
        maximumDelay.then(() => false),
      ]);

      const [dataOk] = await Promise.all([guardedData, minimumDelay]);

      if (!isActive || navigatedRef.current) {
        return;
      }
      navigatedRef.current = true;
      router.replace(dataOk ? '/(tabs)/home' : '/error');
    };

    void load();

    return () => {
      isActive = false;
      timers.forEach((id) => clearTimeout(id));
      timers.clear();
    };
  }, [router]);

  const arcProps = useAnimatedProps(() => ({
    strokeDashoffset: ARC_LENGTH * (1 - arcProgress.value),
  }));

  const wordmarkStyle = useAnimatedStyle(() => ({
    opacity: wordmark.value,
    transform: [{ translateY: interpolate(wordmark.value, [0, 1], [34, 0]) }],
  }));

  const taglineStyle = useAnimatedStyle(() => ({
    opacity: tagline.value,
    transform: [{ translateY: interpolate(tagline.value, [0, 1], [16, 0]) }],
  }));

  const footerStyle = useAnimatedStyle(() => ({
    opacity: footer.value,
  }));

  const runnerStyle = useAnimatedStyle(() => ({
    opacity: 1,
  }));

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.canvas}>
          <Svg
            width={240}
            height={240}
            viewBox="0 0 240 240"
            style={styles.arcSvg}
          >
            <AnimatedPath
              d="M 120 20 A 100 100 0 0 0 120 220"
              fill="none"
              stroke={Colors.primary}
              strokeWidth={12}
              strokeLinecap="round"
              strokeDasharray={ARC_LENGTH}
              animatedProps={arcProps}
            />
          </Svg>

          <FloatingLeaf
            path="M 6 34 C 10 18, 24 8, 36 6 C 30 18, 20 30, 8 36 Z"
            color={Colors.secondary}
            style={styles.leafLeft}
            reducedMotion={reducedMotion}
            delay={0}
          />
          <FloatingLeaf
            path="M 6 34 C 10 18, 24 8, 36 6 C 30 18, 20 30, 8 36 Z"
            color={Colors.primaryLight}
            style={styles.leafRight}
            reducedMotion={reducedMotion}
            delay={700}
          />

          <Animated.View style={[styles.runnerWrap, runnerStyle]}>
            <LottieView
              source={require('../assets/animations/jejakbaik-runner.json')}
              autoPlay={!reducedMotion}
              loop={!reducedMotion}
              style={styles.runner}
              resizeMode="contain"
              speed={1}
            />
          </Animated.View>
        </View>

        <Animated.View style={[styles.wordmarkWrap, wordmarkStyle]}>
          <Text style={styles.wordmark}>JejakBaik</Text>
        </Animated.View>

        <Animated.View style={[styles.taglineWrap, taglineStyle]}>
          <Text style={styles.taglineLine}>— Sehat Hari Ini, —</Text>
          <Text style={styles.taglineLine}>Langkah Baik Esok</Text>
        </Animated.View>

        <Animated.View style={[styles.footer, footerStyle]}>
          <AnimatedLoadingDots reducedMotion={reducedMotion} />
          <Text style={styles.footerText}>Menyiapkan perjalanan baikmu...</Text>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  safeArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  canvas: {
    width: 240,
    height: 240,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  arcSvg: {
    position: 'absolute',
  },
  runnerWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  runner: {
    width: 220,
    height: 220,
  },
  leafLeft: {
    position: 'absolute',
    right: 18,
    bottom: 28,
  },
  leafRight: {
    position: 'absolute',
    right: -4,
    bottom: 8,
    transform: [{ rotate: '35deg' }],
  },
  wordmarkWrap: {
    alignItems: 'center',
    marginTop: 4,
  },
  wordmark: {
    fontFamily: FontTokens.bold,
    fontSize: 40,
    letterSpacing: -1.4,
    color: Colors.primaryDark,
  },
  taglineWrap: {
    alignItems: 'center',
    marginTop: 12,
  },
  taglineLine: {
    fontFamily: FontTokens.medium,
    fontSize: 14,
    lineHeight: 22,
    color: Colors.primary,
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 52,
    alignItems: 'center',
  },
  footerText: {
    marginTop: 10,
    fontFamily: FontTokens.regular,
    fontSize: 12,
    color: Colors.textSecondary,
  },
});
