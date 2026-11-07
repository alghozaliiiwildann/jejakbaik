import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Colors, Radius, Shadow } from '../constants/Colors';
import { Icons } from '../constants/Icons';
import { Fonts } from '../constants/Typography';

type ConfirmDeleteDialogProps = {
  visible: boolean;
  habitName: string;
  processing?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export default function ConfirmDeleteDialog({
  visible,
  habitName,
  processing = false,
  onCancel,
  onConfirm,
}: ConfirmDeleteDialogProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <Pressable
          style={StyleSheet.absoluteFill}
          accessibilityLabel="Tutup dialog"
          onPress={processing ? undefined : onCancel}
        />
        <View style={styles.card}>
          <View style={styles.iconCircle}>
            <Icons.Trash2 size={30} color={Colors.error} />
          </View>
          <Text style={styles.title}>Hapus Kebiasaan?</Text>
          <Text style={styles.message}>
            &quot;{habitName}&quot; akan dihapus permanen beserta riwayatnya.
            Tindakan ini tidak bisa dibatalkan.
          </Text>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Ya, hapus kebiasaan"
            accessibilityState={{ disabled: processing, busy: processing }}
            disabled={processing}
            onPress={onConfirm}
            style={({ pressed }) => [
              styles.deleteButton,
              pressed && !processing ? styles.pressed : null,
              processing ? styles.disabled : null,
            ]}
          >
            {processing ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={styles.deleteLabel}>Ya, Hapus</Text>
            )}
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Batal menghapus"
            disabled={processing}
            onPress={onCancel}
            style={({ pressed }) => [
              styles.cancelButton,
              pressed ? styles.cancelPressed : null,
            ]}
          >
            <Text style={styles.cancelLabel}>Batal</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    borderRadius: Radius.card + 4,
    backgroundColor: Colors.card,
    padding: 24,
    alignItems: 'center',
    ...Shadow.floating,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.softRed,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontFamily: Fonts.bold,
    fontSize: 18,
    color: Colors.text,
    textAlign: 'center',
  },
  message: {
    marginTop: 8,
    marginBottom: 20,
    fontFamily: Fonts.regular,
    fontSize: 13,
    lineHeight: 20,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  deleteButton: {
    width: '100%',
    minHeight: 52,
    borderRadius: Radius.button,
    backgroundColor: Colors.error,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  deleteLabel: {
    fontFamily: Fonts.semiBold,
    fontSize: 15,
    color: Colors.white,
  },
  cancelButton: {
    width: '100%',
    minHeight: 48,
    borderRadius: Radius.button,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    paddingVertical: 12,
  },
  cancelPressed: {
    backgroundColor: Colors.background,
  },
  cancelLabel: {
    fontFamily: Fonts.medium,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  pressed: {
    opacity: 0.9,
  },
  disabled: {
    opacity: 0.7,
  },
});
