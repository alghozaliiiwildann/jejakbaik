import { LinearGradient } from 'expo-linear-gradient';
import type { LucideIcon } from 'lucide-react-native';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { Gradients } from '../../constants/Colors';
import { Fonts } from '../../constants/Typography';
import { pressFeedback } from '../../hooks/useHaptics';

type GradientButtonProps = {
  label: string;
  onPress: () => void;
  icon?: LucideIcon;
  loading?: boolean;
  disabled?: boolean;
  colors?: readonly [string, string, ...string[]];
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<import('react-native').TextStyle>;
  compact?: boolean;
  large?: boolean;
};

export default function GradientButton({
  label,
  onPress,
  icon,
  loading = false,
  disabled = false,
  colors = Gradients.primary,
  style,
  textStyle,
  compact = false,
  large = false,
}: GradientButtonProps) {
  const isDisabled = disabled || loading;
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const IconComponent = icon;

  const handlePress = () => {
    if (isDisabled) {
      return;
    }
    pressFeedback();
    onPress();
  };

  return (
    <Animated.View style={[styles.wrapper, animatedStyle, style]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ disabled: isDisabled, busy: loading }}
        disabled={isDisabled}
        onPress={handlePress}
        onPressIn={() => {
          scale.set(withSpring(0.97, { damping: 18, stiffness: 280 }));
        }}
        onPressOut={() => {
          scale.set(withSpring(1, { damping: 16, stiffness: 220 }));
        }}
      >
        <LinearGradient
          colors={colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.button,
            compact ? styles.buttonCompact : null,
            large ? styles.buttonLarge : null,
            isDisabled ? styles.disabled : null,
          ]}
        >
          <View style={styles.sheen} pointerEvents="none" />
          {loading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <View style={styles.content}>
              {IconComponent ? (
                <View style={styles.icon}>
                  <IconComponent size={19} color="#FFFFFF" strokeWidth={2.3} />
                </View>
              ) : null}
              <Text
                style={[
                  styles.label,
                  compact ? styles.labelCompact : null,
                  large ? styles.labelLarge : null,
                  textStyle,
                ]}
              >
                {label}
              </Text>
            </View>
          )}
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: 14,
    shadowColor: '#15803D',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 16,
    elevation: 6,
  },
  button: {
    minHeight: 56,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 22,
    overflow: 'hidden',
  },
  buttonCompact: {
    minHeight: 46,
    borderRadius: 12,
  },
  buttonLarge: {
    minHeight: 64,
    borderRadius: 18,
  },
  sheen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '52%',
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: 9,
  },
  label: {
    fontFamily: Fonts.semiBold,
    fontSize: 15,
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  labelCompact: {
    fontSize: 13,
  },
  labelLarge: {
    fontSize: 16,
  },
  disabled: {
    opacity: 0.6,
  },
});
