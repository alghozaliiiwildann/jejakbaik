import { BlurView } from 'expo-blur';
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

type GlassCardProps = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  intensity?: number;
  tone?: 'light' | 'dark';
  tintColor?: string;
};

/**
 * Glassmorphism tipis. iOS mendapat blur asli; Android/web memakai
 * lapisan translucent sehingga tetap terbaca dan konsisten.
 */
export default function GlassCard({
  children,
  style,
  intensity = 40,
  tone = 'light',
  tintColor,
}: GlassCardProps) {
  const isDark = tone === 'dark';

  return (
    <BlurView
      intensity={intensity}
      tint={isDark ? 'dark' : 'light'}
      style={[
        styles.glass,
        {
          backgroundColor: tintColor
            ? tintColor
            : isDark
              ? 'rgba(15, 23, 42, 0.28)'
              : 'rgba(255, 255, 255, 0.22)',
          borderColor: isDark
            ? 'rgba(255, 255, 255, 0.18)'
            : 'rgba(255, 255, 255, 0.55)',
        },
        style,
      ]}
    >
      {children}
    </BlurView>
  );
}

const styles = StyleSheet.create({
  glass: {
    borderWidth: 1,
    overflow: 'hidden',
  },
});
