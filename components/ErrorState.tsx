import { StyleSheet, Text, View } from 'react-native';

import { Colors } from '../constants/Colors';
import { Icons } from '../constants/Icons';
import { Fonts } from '../constants/Typography';
import PrimaryButton from './PrimaryButton';
import SecondaryButton from './SecondaryButton';

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
        <Icons.AlertCircle size={44} color={Colors.error} strokeWidth={2} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      <View style={styles.actions}>
        <PrimaryButton
          label="Coba Lagi"
          onPress={onRetry}
          loading={retrying}
          disabled={retrying}
        />
        {onGoHome ? (
          <SecondaryButton
            label="Kembali ke Home"
            onPress={onGoHome}
            disabled={retrying}
            style={styles.secondaryAction}
          />
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
    paddingHorizontal: 20,
    backgroundColor: Colors.background,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.softRed,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontFamily: Fonts.bold,
    fontSize: 20,
    color: Colors.text,
    textAlign: 'center',
  },
  message: {
    marginTop: 8,
    maxWidth: 300,
    fontFamily: Fonts.regular,
    fontSize: 13,
    lineHeight: 20,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  actions: {
    width: '100%',
    maxWidth: 320,
    marginTop: 28,
    gap: 12,
  },
  secondaryAction: {
    marginTop: 0,
  },
});
