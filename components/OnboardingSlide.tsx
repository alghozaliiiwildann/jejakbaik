import { LinearGradient } from 'expo-linear-gradient';
import type { LucideIcon } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Colors, Gradients, Radius, Shadow, Spacing } from '../constants/Colors';
import { Icons } from '../constants/Icons';
import { Fonts } from '../constants/Typography';
import { selectFeedback } from '../hooks/useHaptics';

type OnboardingSlideProps = {
  /** Lebar layar; tiap slide harus selebar viewport agar paging pas. */
  width: number;
  icon: LucideIcon;
  title: string;
  description: string;
  /** Opsi pilihan (survey / tujuan). Kosongkan untuk slide tanpa pilihan. */
  options?: readonly string[];
  selectedOption?: string | null;
  onSelectOption?: (option: string) => void;
  /** Jeda animasi masuk supaya tiap slide terasa berurutan. */
  animationDelay?: number;
};

const HORIZONTAL_PADDING = Spacing.xxl;
const OPTION_GAP = 10;

export default function OnboardingSlide({
  width,
  icon: IconComponent,
  title,
  description,
  options,
  selectedOption,
  onSelectOption,
  animationDelay = 0,
}: OnboardingSlideProps) {
  const hasOptions = options !== undefined && options.length > 0;
  const contentWidth = width - HORIZONTAL_PADDING * 2;
  const optionWidth = hasOptions
    ? (contentWidth - OPTION_GAP) / 2
    : contentWidth;

  return (
    <View style={[styles.slide, { width }]}>
      <Animated.View
        entering={FadeInDown.duration(520)
          .delay(animationDelay)
          .withInitialValues({ transform: [{ translateY: 24 }] })}
        style={styles.illustrationWrap}
      >
        <LinearGradient
          colors={Gradients.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.illustration}
        >
          <IconComponent size={62} color={Colors.white} strokeWidth={1.7} />
        </LinearGradient>
        <View style={styles.illustrationRing} pointerEvents="none" />
      </Animated.View>

      <Animated.View
        entering={FadeInDown.duration(520)
          .delay(animationDelay + 90)
          .withInitialValues({ transform: [{ translateY: 20 }] })}
        style={styles.textWrap}
      >
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </Animated.View>

      {hasOptions ? (
        <Animated.View
          entering={FadeInDown.duration(520)
            .delay(animationDelay + 180)
            .withInitialValues({ transform: [{ translateY: 16 }] })}
          style={styles.options}
        >
          {options.map((option) => {
            const isSelected = option === selectedOption;

            return (
              <Pressable
                key={option}
                accessibilityRole="radio"
                accessibilityLabel={option}
                accessibilityState={{ selected: isSelected }}
                onPress={() => {
                  selectFeedback();
                  onSelectOption?.(option);
                }}
                style={({ pressed }) => [
                  styles.option,
                  { width: optionWidth },
                  isSelected ? styles.optionSelected : null,
                  pressed ? styles.optionPressed : null,
                ]}
              >
                <View
                  style={[styles.radio, isSelected ? styles.radioSelected : null]}
                >
                  {isSelected ? (
                    <Icons.Check
                      size={12}
                      color={Colors.white}
                      strokeWidth={3.2}
                    />
                  ) : null}
                </View>
                <Text
                  numberOfLines={1}
                  style={[
                    styles.optionLabel,
                    isSelected ? styles.optionLabelSelected : null,
                  ]}
                >
                  {option}
                </Text>
              </Pressable>
            );
          })}
        </Animated.View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingBottom: Spacing.lg,
  },
  illustrationWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.section,
  },
  illustration: {
    width: 136,
    height: 136,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.floating,
  },
  illustrationRing: {
    position: 'absolute',
    width: 172,
    height: 172,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: Colors.accent,
  },
  textWrap: {
    alignItems: 'center',
  },
  title: {
    fontFamily: Fonts.bold,
    fontSize: 24,
    lineHeight: 33,
    color: Colors.text,
    textAlign: 'center',
    letterSpacing: -0.4,
  },
  description: {
    marginTop: Spacing.md,
    fontFamily: Fonts.regular,
    fontSize: 14,
    lineHeight: 22,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  options: {
    marginTop: Spacing.section,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: OPTION_GAP,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 52,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.input,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
  },
  optionSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.accent,
  },
  optionPressed: {
    opacity: 0.85,
  },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
    backgroundColor: Colors.white,
  },
  radioSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
  },
  optionLabel: {
    flexShrink: 1,
    fontFamily: Fonts.medium,
    fontSize: 13,
    color: Colors.textSecondary,
  },
  optionLabelSelected: {
    fontFamily: Fonts.semiBold,
    color: Colors.primaryDark,
  },
});
