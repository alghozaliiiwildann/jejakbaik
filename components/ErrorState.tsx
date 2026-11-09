import { StyleSheet, Text, Pressable, View } from 'react-native';

import { Colors, Radius } from '../constants/Colors';
import { Icons } from '../constants/Icons';
import { Fonts } from '../constants/Typography';
import GradientButton from './ui/GradientButton';

type ErrorStateProps = {
  title?: string;
  message?: string;
  onRetry: () => void;
  onGoHome?: () => void;
  retrying?: boolean;
};

export default function ErrorState({
  title = 'Gagal memuat data',
  message = 'Terjadi kesalahan saat membaca data lokal. Silakan coba lagi.',
  onRetry,
  onGoHome,
  retrying = false,
}: ErrorStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <View style={styles.iconInner}>
          <Icons.AlertCircle size={42} color={Colors.error} strokeWidth={1.9} />
        </View>
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>

      <View style={styles.actions}>
        <GradientButton
          label="Coba Lagi"
          onPress={onRetry}
          loading={retrying}
          disabled={retrying}
          colors={['#EF4444', '#DC2626']}
        />
        {onGoHome ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Kembali ke Beranda"
            disabled={retrying}
            onPress={onGoHome}
            style={({ pressed }) => [
              styles.secondary,
              pressed ? styles.secondaryPressed : null,
            ]}
          >
            <Icons.Home size={17} color={Colors.text} />
            <Text style={styles.secondaryLabel}>Kembali ke Beranda</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
    backgroundColor: Colors.background,
  },
  iconCircle: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: 'rgba(254, 226, 226, 0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 22,
  },
  iconInner: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.error,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 3,
  },
  title: {
    fontFamily: Fonts.bold,
    fontSize: 19,
    color: Colors.text,
    textAlign: 'center',
  },
  message: {
    marginTop: 8,
    maxWidth: 300,
    fontFamily: Fonts.regular,
    fontSize: 12.5,
    lineHeight: 20,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  actions: {
    width: '100%',
    maxWidth: 320,
    marginTop: 26,
    gap: 12,
  },
  secondary: {
    minHeight: 50,
    borderRadius: Radius.button,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  secondaryPressed: {
    backgroundColor: Colors.background,
  },
  secondaryLabel: {
    fontFamily: Fonts.medium,
    fontSize: 13,
    color: Colors.text,
  },
});
