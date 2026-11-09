import { LinearGradient } from 'expo-linear-gradient';
import type { LucideIcon } from 'lucide-react-native';
import { useEffect } from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { Colors, Gradients } from '../constants/Colors';
import { Icons } from '../constants/Icons';
import { Fonts } from '../constants/Typography';
import GradientButton from './ui/GradientButton';

type EmptyStateProps = {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: LucideIcon;
  style?: StyleProp<ViewStyle>;
};

export default function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  icon,
  style,
}: EmptyStateProps) {
  const IconComponent = icon ?? Icons.Sprout;
  const float = useSharedValue(0);

  useEffect(() => {
    float.value = withRepeat(
      withTiming(1, { duration: 1800, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [float]);

  const floatStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -6 * float.value }],
  }));

  return (
    <View style={[styles.container, style]}>
      <Animated.View style={[styles.illustration, floatStyle]}>
        <View style={styles.halo} />
        <LinearGradient
          colors={Gradients.soft}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.circle}
        >
          <View style={styles.innerCircle}>
            <IconComponent size={46} color={Colors.primary} strokeWidth={1.7} />
          </View>
        </LinearGradient>
        <View style={[styles.sparkle, styles.sparkleTop]}>
          <Icons.Sparkles size={16} color={Colors.primaryLight} />
        </View>
        <View style={[styles.sparkle, styles.sparkleBottom]}>
          <Icons.Star size={12} color={Colors.secondary} fill={Colors.secondary} />
        </View>
      </Animated.View>

      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>

      {actionLabel && onAction ? (
        <GradientButton
          label={actionLabel}
          onPress={onAction}
          icon={Icons.Plus}
          style={styles.action}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingHorizontal: 26,
    paddingVertical: 34,
  },
  illustration: {
    width: 128,
    height: 128,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  halo: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(220, 252, 231, 0.55)',
  },
  circle: {
    width: 108,
    height: 108,
    borderRadius: 54,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(22, 163, 74, 0.14)',
  },
  innerCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: 'rgba(255,255,255,0.86)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 16,
    elevation: 4,
  },
  sparkle: {
    position: 'absolute',
  },
  sparkleTop: {
    top: 8,
    right: 6,
  },
  sparkleBottom: {
    bottom: 18,
    left: 4,
  },
  title: {
    fontFamily: Fonts.semiBold,
    fontSize: 18,
    color: Colors.text,
    textAlign: 'center',
  },
  description: {
    marginTop: 7,
    maxWidth: 290,
    fontFamily: Fonts.regular,
    fontSize: 12.5,
    lineHeight: 20,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  action: {
    width: '100%',
    maxWidth: 280,
    marginTop: 22,
  },
});
