import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { Colors } from '../constants/Colors';
import { Icons } from '../constants/Icons';
import { Fonts } from '../constants/Typography';
import { getHabits } from '../services/storage';

const LOADING_TIMEOUT_MS = 5000;

export default function SplashRoute() {
  const router = useRouter();
  const hasNavigated = useRef(false);

  const navigateTo = useCallback(
    (target: '/(tabs)/home' | '/error') => {
      if (hasNavigated.current) {
        return;
      }
      hasNavigated.current = true;
      router.replace(target);
    },
    [router],
  );

  useEffect(() => {
    let isActive = true;

    const timeoutId = setTimeout(() => {
      if (isActive) {
        navigateTo('/(tabs)/home');
      }
    }, LOADING_TIMEOUT_MS);

    const loadData = async () => {
      try {
        await getHabits();
      } catch {
        if (isActive) {
          clearTimeout(timeoutId);
          navigateTo('/error');
        }
        return;
      }

      if (isActive) {
        clearTimeout(timeoutId);
        navigateTo('/(tabs)/home');
      }
    };

    void loadData();

    return () => {
      isActive = false;
      clearTimeout(timeoutId);
    };
  }, [navigateTo]);

  return (
    <View style={styles.container}>
      <View style={styles.greenTint} pointerEvents="none" />
      <View style={styles.topGlow} pointerEvents="none" />

      <Svg
        width={220}
        height={220}
        viewBox="0 0 200 200"
        style={styles.leafDecoration}
        pointerEvents="none"
      >
        <Path
          d="M198 198C198 96 140 40 8 8C8 130 84 198 198 198Z"
          fill={Colors.primary}
          opacity={0.08}
        />
        <Path
          d="M188 188C136 142 92 98 44 40"
          stroke={Colors.primary}
          strokeWidth={2}
          opacity={0.12}
          fill="none"
        />
      </Svg>

      <View style={styles.content}>
        <View style={styles.logoMark}>
          <View style={styles.logoHalo} />
          <View style={[styles.sideLeaf, styles.sideLeafLeft]}>
            <Icons.Leaf
              size={34}
              color={Colors.success}
              fill={Colors.secondary}
              strokeWidth={1.5}
            />
          </View>
          <View style={[styles.sideLeaf, styles.sideLeafRight]}>
            <Icons.Leaf
              size={34}
              color={Colors.success}
              fill={Colors.secondary}
              strokeWidth={1.5}
            />
          </View>
          <View style={styles.centerLeaf}>
            <Icons.Leaf
              size={54}
              color={Colors.success}
              fill={Colors.primary}
              strokeWidth={1.5}
            />
          </View>
        </View>

        <Text style={styles.wordmark}>JejakBaik</Text>
        <Text style={styles.tagline}>
          Catat Kebiasaanmu, Lihat Perkembanganmu.
        </Text>
      </View>

      <View style={styles.footer}>
        <ActivityIndicator color={Colors.primary} size="small" />
        <Text style={styles.loadingText}>Memuat data...</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  greenTint: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(134, 239, 172, 0.14)',
  },
  topGlow: {
    position: 'absolute',
    top: -110,
    right: -80,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(220, 252, 231, 0.7)',
  },
  leafDecoration: {
    position: 'absolute',
    right: -48,
    bottom: -48,
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 32,
    marginBottom: 24,
  },
  logoMark: {
    width: 132,
    height: 124,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoHalo: {
    position: 'absolute',
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: 'rgba(220, 252, 231, 0.9)',
  },
  sideLeaf: {
    position: 'absolute',
    bottom: 36,
  },
  sideLeafLeft: {
    left: 26,
    transform: [{ rotate: '-32deg' }],
  },
  sideLeafRight: {
    right: 26,
    transform: [{ rotate: '32deg' }],
  },
  centerLeaf: {
    position: 'absolute',
    bottom: 30,
  },
  wordmark: {
    marginTop: 8,
    fontFamily: Fonts.bold,
    fontSize: 32,
    letterSpacing: -0.5,
    color: Colors.text,
  },
  tagline: {
    marginTop: 6,
    fontFamily: Fonts.regular,
    fontSize: 13,
    lineHeight: 20,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 56,
    alignItems: 'center',
    gap: 10,
  },
  loadingText: {
    fontFamily: Fonts.medium,
    fontSize: 12,
    color: Colors.textSecondary,
  },
});
