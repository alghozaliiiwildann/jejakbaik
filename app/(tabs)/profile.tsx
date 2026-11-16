import * as ImagePicker from 'expo-image-picker';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import CustomInput from '../../components/ui/CustomInput';
import GradientButton from '../../components/ui/GradientButton';
import { Colors, Radius, Spacing } from '../../constants/Colors';
import { Icons } from '../../constants/Icons';
import { Fonts } from '../../constants/Typography';
import { useUser } from '../../hooks/useUser';
import { pressFeedback, tapFeedback } from '../../hooks/useHaptics';

type MenuItemProps = {
  icon: typeof Icons.User;
  label: string;
  onPress: () => void;
  danger?: boolean;
};

function MenuItem({ icon: IconComponent, label, onPress, danger = false }: MenuItemProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={() => {
        tapFeedback();
        onPress();
      }}
      style={({ pressed }) => [styles.menuItem, pressed ? styles.menuPressed : null]}
    >
      <View
        style={[
          styles.menuIconWrap,
          danger ? styles.menuIconDanger : null,
        ]}
      >
        <IconComponent
          size={19}
          color={danger ? Colors.error : Colors.primary}
          strokeWidth={2.1}
        />
      </View>
      <Text style={[styles.menuLabel, danger ? styles.menuLabelDanger : null]}>
        {label}
      </Text>
      <Icons.ChevronRight size={18} color={Colors.textSecondary} strokeWidth={2} />
    </Pressable>
  );
}

export default function ProfileScreen() {
  const { user, updateName, updatePhoto, logout, deleteAllData } = useUser();

  const [isNameModalVisible, setIsNameModalVisible] = useState(false);
  const [draftName, setDraftName] = useState(user.name);

  const openNameModal = useCallback(() => {
    setDraftName(user.name);
    setIsNameModalVisible(true);
  }, [user.name]);

  const saveName = useCallback(async () => {
    try {
      await updateName(draftName);
      setIsNameModalVisible(false);
    } catch {
      Alert.alert('Gagal', 'Nama tidak dapat disimpan. Coba lagi ya.');
    }
  }, [draftName, updateName]);

  const pickPhoto = useCallback(async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          'Izin galeri dibutuhkan',
          'Aktifkan izin galeri agar foto profil bisa dipilih.',
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]?.uri) {
        await updatePhoto(result.assets[0].uri);
      }
    } catch {
      Alert.alert('Gagal', 'Foto profil tidak dapat dipilih. Coba lagi ya.');
    }
  }, [updatePhoto]);

  const handleDeleteAllData = useCallback(() => {
    Alert.alert(
      'Hapus Semua Data?',
      'Semua kebiasaan, riwayat, dan data profil akan dihapus permanen. Tindakan ini tidak bisa dibatalkan.',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: () => {
            void (async () => {
              try {
                await deleteAllData();
                Alert.alert('Selesai', 'Semua data berhasil dihapus.');
              } catch {
                Alert.alert('Gagal', 'Data tidak dapat dihapus. Coba lagi ya.');
              }
            })();
          },
        },
      ],
    );
  }, [deleteAllData]);

  const handleLogout = useCallback(() => {
    Alert.alert('Keluar', 'Kamu akan keluar dari akun ini.', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Keluar',
        style: 'destructive',
        onPress: () => {
          void (async () => {
            try {
              await logout();
              Alert.alert('Berhasil', 'Kamu sudah keluar.');
            } catch {
              Alert.alert('Gagal', 'Tidak dapat keluar. Coba lagi ya.');
            }
          })();
        },
      },
    ]);
  }, [logout]);

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profil</Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.profileCard}>
            <View style={styles.avatarWrap}>
              <View style={styles.avatar}>
                {user.photoUri ? (
                  <Image
                    source={{ uri: user.photoUri }}
                    style={styles.avatarImage}
                  />
                ) : (
                  <Text style={styles.avatarText}>
                    {user.name.charAt(0).toUpperCase()}
                  </Text>
                )}
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Ganti foto profil"
                onPress={() => {
                  pressFeedback();
                  void pickPhoto();
                }}
                style={({ pressed }) => [
                  styles.cameraButton,
                  pressed ? styles.pressed : null,
                ]}
              >
                <Icons.Camera size={16} color="#FFFFFF" strokeWidth={2.2} />
              </Pressable>
            </View>

            <Text style={styles.name}>{user.name}</Text>
            <Text style={styles.email}>
              {user.provider === 'google' && user.email
                ? user.email
                : 'Akun Tamu'}
            </Text>
          </View>

          <View style={styles.menuCard}>
            <MenuItem
              icon={Icons.PenLine}
              label="Ubah Nama"
              onPress={openNameModal}
            />

            <MenuItem
              icon={Icons.Trash2}
              label="Reset Semua Data"
              onPress={handleDeleteAllData}
              danger
            />
          </View>

          <View style={styles.aboutCard}>
            <Text style={styles.aboutTitle}>Tentang Aplikasi</Text>
            <Text style={styles.aboutDescription}>
              Habit Tracker adalah aplikasi sederhana yang dirancang untuk membantu
              Anda membangun kebiasaan baik setiap hari. Catat kemajuan Anda,
              capai target harian, dan tingkatkan kualitas hidup secara
              konsisten.
            </Text>
            <Text style={styles.aboutVersion}>Versi 1.0.0</Text>
          </View>

          <GradientButton
            label="Keluar"
            onPress={handleLogout}
            icon={Icons.LogOut}
            colors={['#EF4444', '#DC2626']}
            style={styles.logoutButton}
          />
        </ScrollView>
      </SafeAreaView>

      <Modal
        animationType="fade"
        transparent
        visible={isNameModalVisible}
        onRequestClose={() => setIsNameModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Ubah Nama</Text>
            <CustomInput
              label="Nama"
              value={draftName}
              onChangeText={setDraftName}
              leftIcon={Icons.User}
              autoCapitalize="words"
              maxLength={40}
            />
            <View style={styles.modalActions}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Batal ubah nama"
                onPress={() => setIsNameModalVisible(false)}
                style={({ pressed }) => [
                  styles.modalCancelButton,
                  pressed ? styles.pressed : null,
                ]}
              >
                <Text style={styles.modalCancelLabel}>Batal</Text>
              </Pressable>
              <View style={styles.modalSaveWrap}>
                <GradientButton
                  label="Simpan"
                  onPress={() => void saveName()}
                  compact
                />
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.xxl,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  headerTitle: {
    fontFamily: Fonts.bold,
    fontSize: 24,
    color: Colors.text,
  },
  content: {
    paddingHorizontal: Spacing.xxl,
    paddingBottom: 120,
    gap: Spacing.lg,
  },
  profileCard: {
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: Radius.card,
    padding: Spacing.xxl,
    borderWidth: 1,
    borderColor: Colors.border,
    ...{
      shadowColor: Colors.shadow,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.06,
      shadowRadius: 14,
      elevation: 3,
    },
  },
  avatarWrap: {
    position: 'relative',
    marginBottom: Spacing.md,
  },
  avatar: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: Colors.white,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarText: {
    fontFamily: Fonts.bold,
    fontSize: 40,
    color: Colors.primaryDark,
  },
  cameraButton: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: Colors.white,
  },
  name: {
    fontFamily: Fonts.bold,
    fontSize: 22,
    color: Colors.text,
  },
  email: {
    marginTop: 4,
    fontFamily: Fonts.regular,
    fontSize: 13,
    color: Colors.textSecondary,
  },
  menuCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.card,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  menuPressed: {
    backgroundColor: Colors.background,
  },
  menuIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 13,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuIconDanger: {
    backgroundColor: Colors.softRed,
  },
  menuLabel: {
    flex: 1,
    fontFamily: Fonts.medium,
    fontSize: 14,
    color: Colors.text,
  },
  menuLabelDanger: {
    color: Colors.error,
  },
  aboutCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.card,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  aboutTitle: {
    fontFamily: Fonts.bold,
    fontSize: 16,
    color: Colors.text,
  },
  aboutDescription: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    lineHeight: 20,
    color: Colors.textSecondary,
  },
  aboutVersion: {
    fontFamily: Fonts.semiBold,
    fontSize: 12,
    color: Colors.primary,
  },
  logoutButton: {
    marginTop: Spacing.sm,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'center',
    padding: Spacing.xxl,
  },
  modalCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.card,
    padding: Spacing.xl,
    gap: Spacing.md,
  },
  modalTitle: {
    fontFamily: Fonts.bold,
    fontSize: 18,
    color: Colors.text,
  },
  modalActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: Spacing.sm,
  },
  modalCancelButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  modalCancelLabel: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  modalSaveWrap: {
    minWidth: 110,
  },
  pressed: {
    opacity: 0.7,
  },
});
