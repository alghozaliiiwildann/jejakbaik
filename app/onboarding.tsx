import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import type { LucideIcon } from 'lucide-react-native';
import { useCallback, useRef, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type ScrollViewInstance,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import OnboardingSlide from '../components/OnboardingSlide';
import SlideIndicator from '../components/SlideIndicator';
import GradientButton from '../components/ui/GradientButton';
import { Colors, Radius, Spacing } from '../constants/Colors';
import { Icons } from '../constants/Icons';
import { Fonts } from '../constants/Typography';
import {
  ONBOARDING_GOALS,
  ONBOARDING_SOURCES,
  isOnboardingGoal,
  isOnboardingSource,
  useOnboarding,
} from '../hooks/useOnboarding';
import { tapFeedback } from '../hooks/useHaptics';

type SlideConfig = {
  key: string;
  icon: LucideIcon;
  title: string;
  description: string;
  options?: readonly string[];
  selectedOption?: string | null;
  onSelectOption?: (option: string) => void;
};

export default function OnboardingScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const {
    source,
    goal,
    selectSource,
    selectGoal,
    completeOnboarding,
  } = useOnboarding();

  const scrollRef = useRef<ScrollViewInstance>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  const slides: SlideConfig[] = [
    {
      key: 'welcome',
      icon: Icons.Footprints,
      title: 'Selamat Datang di JejakBaik 👋',
      description:
        'Bangun kebiasaan baik setiap hari, satu langkah kecil dalam satu waktu.',
    },
    {
      key: 'source',
      icon: Icons.Heart,
      title: 'Kamu tahu aplikasi ini dari mana?',
      description: 'Bantu kami memahami bagaimana kamu menemukan JejakBaik.',
      options: ONBOARDING_SOURCES,
      selectedOption: source,
      onSelectOption: (option) => {
        if (isOnboardingSource(option)) {
          selectSource(option);
        }
      },
    },
    {
      key: 'goal',
      icon: Icons.Target,
      title: 'Apa tujuan utamamu?',
      description: 'Kami akan menyesuaikan pengalaman sesuai tujuanmu.',
      options: ONBOARDING_GOALS,
      selectedOption: goal,
      onSelectOption: (option) => {
        if (isOnboardingGoal(option)) {
          selectGoal(option);
        }
      },
    },
    {
      key: 'ready',
      icon: Icons.Rocket,
      title: 'Siap memulai perjalananmu? 🚀',
      description:
        'Mulai dari satu kebiasaan kecil hari ini. Konsistensi mengalahkan kesempurnaan.',
    },
  ];

  const isLastSlide = activeIndex === slides.length - 1;

  const goToSlide = useCallback(
    (nextIndex: number) => {
      const clamped = Math.min(Math.max(nextIndex, 0), slides.length - 1);
      setActiveIndex(clamped);
      scrollRef.current?.scrollTo({ x: clamped * width, animated: true });
    },
    [slides.length, width],
  );

  const handleScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const nextIndex = Math.round(event.nativeEvent.contentOffset.x / width);
      setActiveIndex(Math.min(Math.max(nextIndex, 0), slides.length - 1));
    },
    [slides.length, width],
  );

  // Menyimpan flag first-launch + jawaban survey, lalu masuk ke beranda.
  const finishOnboarding = useCallback(async () => {
    if (isSaving) {
      return;
    }

    setIsSaving(true);
    try {
      await completeOnboarding();
      router.replace('/(tabs)/home');
    } catch {
      Alert.alert(
        'Gagal menyimpan',
        'Data onboarding tidak dapat disimpan. Silakan coba lagi ya.',
      );
    } finally {
      setIsSaving(false);
    }
  }, [completeOnboarding, isSaving, router]);

  const handlePrimaryPress = useCallback(() => {
    if (isLastSlide) {
      void finishOnboarding();
      return;
    }
    goToSlide(activeIndex + 1);
  }, [activeIndex, finishOnboarding, goToSlide, isLastSlide]);

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <Text style={styles.brand}>JejakBaik</Text>
          {isLastSlide ? (
            <View style={styles.headerSpacer} />
          ) : (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Lewati onboarding"
              onPress={() => {
                tapFeedback();
                void finishOnboarding();
              }}
              hitSlop={10}
              style={({ pressed }) => [
                styles.skipButton,
                pressed ? styles.pressed : null,
              ]}
            >
              <Text style={styles.skipLabel}>Lewati</Text>
            </Pressable>
          )}
        </View>

        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          bounces={false}
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleScrollEnd}
          style={styles.pager}
        >
          {slides.map((slide, index) => (
            <OnboardingSlide
              key={slide.key}
              width={width}
              icon={slide.icon}
              title={slide.title}
              description={slide.description}
              options={slide.options}
              selectedOption={slide.selectedOption}
              onSelectOption={slide.onSelectOption}
              animationDelay={index === 0 ? 60 : 120}
            />
          ))}
        </ScrollView>

        <View style={styles.footer}>
          <SlideIndicator count={slides.length} activeIndex={activeIndex} />

          <View style={styles.actions}>
            {activeIndex > 0 ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Kembali ke slide sebelumnya"
                onPress={() => {
                  tapFeedback();
                  goToSlide(activeIndex - 1);
                }}
                style={({ pressed }) => [
                  styles.backButton,
                  pressed ? styles.pressed : null,
                ]}
              >
                <Icons.ArrowLeft
                  size={20}
                  color={Colors.primaryDark}
                  strokeWidth={2.2}
                />
              </Pressable>
            ) : null}

            <GradientButton
              label={isLastSlide ? 'Mulai Sekarang' : 'Lanjut'}
              onPress={handlePrimaryPress}
              loading={isSaving}
              icon={isLastSlide ? Icons.ArrowRight : undefined}
              large
              style={styles.primaryButton}
            />
          </View>
        </View>
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xxl,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  brand: {
    fontFamily: Fonts.bold,
    fontSize: 18,
    letterSpacing: -0.4,
    color: Colors.primaryDark,
  },
  headerSpacer: {
    width: 52,
  },
  skipButton: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radius.pill,
  },
  skipLabel: {
    fontFamily: Fonts.semiBold,
    fontSize: 13,
    color: Colors.textSecondary,
  },
  pressed: {
    opacity: 0.7,
  },
  pager: {
    flex: 1,
  },
  footer: {
    paddingHorizontal: Spacing.xxl,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  actions: {
    marginTop: Spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  backButton: {
    width: 58,
    height: 58,
    borderRadius: Radius.button,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    flex: 1,
  },
});
