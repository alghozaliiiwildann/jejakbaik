import { LinearGradient } from 'expo-linear-gradient';
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
import { Colors, Gradients, Radius, Shadow, Spacing } from '../../constants/Colors';
import { Icons } from '../../constants/Icons';
import { Fonts } from '../../constants/Typography';
import { useHabits } from '../../hooks/useHabits';
import { useUser } from '../../hooks/useUser';
import { pressFeedback, tapFeedback } from '../../hooks/useHaptics';
import { withAlpha } from '../../services/colorUtils';
import { formatFullDateId } from '../../services/dateUtils';
import { getOverallStats } from '../../services/habitUtils';

type MenuItemProps = {
  icon: typeof Icons.User;
  label: string;
  description?: string;
  onPress: () => void;
  danger?: boolean;
};

function MenuItem({
  icon: IconComponent,
  label,
  description,
  onPress,
  danger = false,
}: MenuItemProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={() => {
        tapFeedback();
        onPress();
      }}
      style={({ pressed }) => [
        styles.menuItem,
        pressed ? styles.menuPressed : null,
      ]}
    >
      <View
        style={[styles.menuIconWrap, danger ? styles.menuIconDanger : null]}
      >
        <IconComponent
          size={18}
          color={danger ? Colors.error : Colors.primary}
          strokeWidth={2.1}
        />
      </View>

      <View style={styles.menuTextWrap}>
        <Text style={[styles.menuLabel, danger ? styles.menuLabelDanger : null]}>
          {label}
        </Text>
        {description ? (
          <Text style={styles.menuDescription} numberOfLines={1}>
            {description}
          </Text>
        ) : null}
      </View>

      <Icons.ChevronRight size={17} color={Colors.placeholder} strokeWidth={2} />
    </Pressable>
  );
}

type MenuDividerProps = {
  inset?: number;
};

function MenuDivider({ inset = 62 }: MenuDividerProps) {
  return <View style={[styles.menuDivider, { marginLeft: inset }]} />;
}

type StatProps = {
  icon: typeof Icons.User;
  tint: string;
  value: string | number;
  label: string;
};

function ProfileStat({ icon: IconComponent, tint, value, label }: StatProps) {
  return (
    <View style={styles.stat}>
      <View style={[styles.statIcon, { backgroundColor: withAlpha(tint, 0.12) }]}>
        <IconComponent size={14} color={tint} strokeWidth={2.3} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export default function ProfileScreen() {
  const { user, updateName, updatePhoto, logout, deleteAllData } = useUser();
  const { habits } = useHabits();
  const stats = getOverallStats(habits);

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

  const accountLabel =
    user.provider === 'google' && user.email ? user.email : 'Akun Tamu';

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={Gradients.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <View style={styles.heroOrb} pointerEvents="none" />
          <View style={styles.heroRing} pointerEvents="none" />

          <SafeAreaView edges={['top']}>
            <View style={styles.heroTop}>
              <View>
                <Text style={styles.heroEyebrow}>AKUN SAYA</Text>
                <Text style={styles.heroTitle}>Profil</Text>
              </View>
              <View style={styles.heroDatePill}>
                <Icons.CalendarDays
                  size={12}
                  color="rgba(255,255,255,0.9)"
                  strokeWidth={2}
                />
                <Text style={styles.heroDateText}>{formatFullDateId()}</Text>
              </View>
            </View>

            <View style={styles.identity}>
              <View style={styles.avatarWrap}>
                <View style={styles.avatarRing}>
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
                  <Icons.Camera size={14} color={Colors.primary} strokeWidth={2.4} />
                </Pressable>
              </View>

              <Text style={styles.name} numberOfLines={1}>
                {user.name}
              </Text>

              <View style={styles.accountPill}>
                <Icons.User size={11} color="rgba(255,255,255,0.92)" strokeWidth={2.2} />
                <Text style={styles.accountText} numberOfLines={1}>
                  {accountLabel}
                </Text>
              </View>
            </View>
          </SafeAreaView>
        </LinearGradient>

        <View style={styles.body}>
          <View style={styles.statsCard}>
            <ProfileStat
              icon={Icons.Layers}
              tint={Colors.primary}
              value={stats.totalHabits}
              label="Kebiasaan"
            />
            <View style={styles.statDivider} />
            <ProfileStat
              icon={Icons.Flame}
              tint={Colors.streakFire}
              value={stats.currentStreak}
              label="Streak"
            />
            <View style={styles.statDivider} />
            <ProfileStat
              icon={Icons.CheckCircle2}
              tint="#3B82F6"
              value={stats.totalCompletions}
              label="Check-in"
            />
          </View>

          <Text style={styles.sectionLabel}>Pengaturan Akun</Text>
          <View style={styles.card}>
            <MenuItem
              icon={Icons.PenLine}
              label="Ubah Nama"
              description="Sesuaikan nama yang tampil di beranda"
              onPress={openNameModal}
            />
            <MenuDivider />
            <MenuItem
              icon={Icons.Camera}
              label="Ganti Foto Profil"
              description="Pilih foto dari galeri perangkat"
              onPress={() => void pickPhoto()}
            />
          </View>

          <Text style={styles.sectionLabel}>Data & Penyimpanan</Text>
          <View style={styles.card}>
            <MenuItem
              icon={Icons.Trash2}
              label="Reset Semua Data"
              description="Hapus kebiasaan, riwayat, dan profil"
              onPress={handleDeleteAllData}
              danger
            />
          </View>

          <Text style={styles.sectionLabel}>Tentang Aplikasi</Text>
          <View style={styles.aboutCard}>
            <View style={styles.aboutTop}>
              <View style={styles.appIcon}>
                <Icons.Sprout size={20} color={Colors.primary} strokeWidth={2.2} />
              </View>
              <View style={styles.aboutHeading}>
                <Text style={styles.aboutTitle}>JejakBaik</Text>
                <Text style={styles.aboutSubtitle}>Habit tracker harian</Text>
              </View>
              <View style={styles.versionPill}>
                <Text style={styles.versionText}>v1.0.0</Text>
              </View>
            </View>
            <Text style={styles.aboutDescription}>
              JejakBaik membantu kamu membangun kebiasaan kecil setiap hari.
              Catat progres, jaga streak, dan lihat perkembanganmu dalam
              grafik yang sederhana. Semua data tersimpan di perangkatmu.
            </Text>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Keluar"
            onPress={handleLogout}
            style={({ pressed }) => [
              styles.logoutButton,
              pressed ? styles.pressed : null,
            ]}
          >
            <Icons.LogOut size={17} color={Colors.error} strokeWidth={2.2} />
            <Text style={styles.logoutText}>Keluar dari Akun</Text>
          </Pressable>
        </View>
      </ScrollView>

      <Modal
        animationType="fade"
        transparent
        visible={isNameModalVisible}
        onRequestClose={() => setIsNameModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalIcon}>
              <Icons.PenLine size={19} color={Colors.primary} strokeWidth={2.2} />
            </View>
            <Text style={styles.modalTitle}>Ubah Nama</Text>
            <Text style={styles.modalSubtitle}>
              Nama ini akan ditampilkan di beranda dan profilmu.
            </Text>
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
  content: {
    paddingBottom: 140,
  },
  hero: {
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    paddingBottom: 74,
    overflow: 'hidden',
  },
  heroOrb: {
    position: 'absolute',
    top: -70,
    right: -50,
    width: 210,
    height: 210,
    borderRadius: 105,
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
  heroRing: {
    position: 'absolute',
    bottom: -60,
    left: -36,
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xxl,
    paddingTop: Spacing.md,
  },
  heroEyebrow: {
    fontFamily: Fonts.semiBold,
    fontSize: 9,
    letterSpacing: 1.6,
    color: 'rgba(255,255,255,0.72)',
  },
  heroTitle: {
    marginTop: 2,
    fontFamily: Fonts.bold,
    fontSize: 24,
    letterSpacing: -0.4,
    color: '#FFFFFF',
  },
  heroDatePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 4,
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  heroDateText: {
    fontFamily: Fonts.medium,
    fontSize: 9.5,
    color: 'rgba(255,255,255,0.9)',
  },
  identity: {
    alignItems: 'center',
    marginTop: 18,
    paddingHorizontal: Spacing.xxl,
  },
  avatarWrap: {
    position: 'relative',
  },
  avatarRing: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.92)',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarText: {
    fontFamily: Fonts.bold,
    fontSize: 34,
    color: Colors.primaryDark,
  },
  cameraButton: {
    position: 'absolute',
    right: 0,
    bottom: 2,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(220,252,231,0.9)',
    ...Shadow.soft,
  },
  name: {
    marginTop: 12,
    maxWidth: '86%',
    fontFamily: Fonts.bold,
    fontSize: 21,
    letterSpacing: -0.3,
    color: '#FFFFFF',
  },
  accountPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 6,
    maxWidth: '86%',
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(15, 23, 42, 0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
    paddingHorizontal: 11,
    paddingVertical: 4,
  },
  accountText: {
    flexShrink: 1,
    fontFamily: Fonts.medium,
    fontSize: 10.5,
    color: 'rgba(255,255,255,0.94)',
  },
  body: {
    paddingHorizontal: Spacing.xxl,
  },
  statsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: -42,
    backgroundColor: Colors.card,
    borderRadius: Radius.card,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 14,
    ...Shadow.card,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
  },
  statIcon: {
    width: 28,
    height: 28,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  statValue: {
    fontFamily: Fonts.bold,
    fontSize: 17,
    lineHeight: 22,
    color: Colors.text,
  },
  statLabel: {
    fontFamily: Fonts.regular,
    fontSize: 9.5,
    color: Colors.textSecondary,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#EEF2F6',
  },
  sectionLabel: {
    marginTop: 22,
    marginBottom: 8,
    marginLeft: 2,
    fontFamily: Fonts.semiBold,
    fontSize: 10,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    color: Colors.textSecondary,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: Radius.card,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    ...Shadow.soft,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  menuPressed: {
    backgroundColor: '#F8FAFC',
  },
  menuIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuIconDanger: {
    backgroundColor: Colors.softRed,
  },
  menuTextWrap: {
    flex: 1,
    minWidth: 0,
  },
  menuLabel: {
    fontFamily: Fonts.medium,
    fontSize: 13.5,
    color: Colors.text,
  },
  menuLabelDanger: {
    color: Colors.error,
  },
  menuDescription: {
    marginTop: 1,
    fontFamily: Fonts.regular,
    fontSize: 10,
    color: Colors.textSecondary,
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  aboutCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.card,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 15,
    ...Shadow.soft,
  },
  aboutTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  appIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aboutHeading: {
    flex: 1,
  },
  aboutTitle: {
    fontFamily: Fonts.semiBold,
    fontSize: 14.5,
    color: Colors.text,
  },
  aboutSubtitle: {
    marginTop: 1,
    fontFamily: Fonts.regular,
    fontSize: 10.5,
    color: Colors.textSecondary,
  },
  versionPill: {
    borderRadius: Radius.pill,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  versionText: {
    fontFamily: Fonts.semiBold,
    fontSize: 9.5,
    color: Colors.textSecondary,
  },
  aboutDescription: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    fontFamily: Fonts.regular,
    fontSize: 11.5,
    lineHeight: 18,
    color: Colors.textSecondary,
  },
  logoutButton: {
    marginTop: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 50,
    borderRadius: Radius.button,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  logoutText: {
    fontFamily: Fonts.semiBold,
    fontSize: 13.5,
    color: Colors.error,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'center',
    padding: Spacing.xxl,
  },
  modalCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.card + 4,
    padding: Spacing.xl,
    gap: 10,
  },
  modalIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontFamily: Fonts.bold,
    fontSize: 18,
    color: Colors.text,
  },
  modalSubtitle: {
    marginTop: -4,
    marginBottom: 4,
    fontFamily: Fonts.regular,
    fontSize: 11.5,
    lineHeight: 17,
    color: Colors.textSecondary,
  },
  modalActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: Spacing.sm,
    marginTop: 4,
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
