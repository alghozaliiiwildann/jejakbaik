import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import CategoryChip from '../../components/CategoryChip';
import ColorPicker from '../../components/ColorPicker';
import HabitCard from '../../components/HabitCard';
import HabitIconPicker from '../../components/HabitIconPicker';
import CustomInput from '../../components/ui/CustomInput';
import GradientButton from '../../components/ui/GradientButton';
import { Colors, Gradients, Radius, Shadow } from '../../constants/Colors';
import { Icons, type HabitIconName } from '../../constants/Icons';
import { Fonts } from '../../constants/Typography';
import {
  successFeedback,
  tapFeedback,
  warningFeedback,
} from '../../hooks/useHaptics';
import { createHabitId } from '../../services/habitUtils';
import { addHabit } from '../../services/storage';
import {
  HABIT_CATEGORIES,
  type Habit,
  type HabitCategory,
} from '../../types/habit';

export default function AddHabitScreen() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [category, setCategory] = useState<HabitCategory>('Kesehatan');
  const [icon, setIcon] = useState<HabitIconName>('Leaf');
  const [color, setColor] = useState<string>(Colors.primary);
  const [nameError, setNameError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const bounce = useSharedValue(0);

  useEffect(() => {
    bounce.value = withRepeat(
      withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [bounce]);

  const bounceStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate(bounce.value, [0, 1], [4, -7]) }],
  }));

  const trimmedName = name.trim();
  const trimmedTarget = target.trim();

  const previewHabit: Habit = {
    id: 'preview',
    name: trimmedName || 'Kebiasaan Baru',
    target: trimmedTarget || undefined,
    category,
    icon,
    color,
    createdAt: new Date().toISOString(),
    completions: [],
    currentStreak: 0,
    longestStreak: 0,
  };

  const handleSave = async () => {
    if (isSaving) {
      return;
    }

    if (!trimmedName) {
      setNameError('Nama kebiasaan wajib diisi.');
      warningFeedback();
      return;
    }

    setNameError(null);
    setFormError(null);
    setIsSaving(true);

    try {
      await addHabit({
        id: createHabitId(),
        name: trimmedName,
        target: trimmedTarget || undefined,
        category,
        icon,
        color,
        createdAt: new Date().toISOString(),
        completions: [],
        currentStreak: 0,
        longestStreak: 0,
      });
      successFeedback();
      router.back();
    } catch {
      setFormError('Gagal menyimpan kebiasaan. Silakan coba lagi.');
      setIsSaving(false);
    }
  };

  const previewName = trimmedName || 'Kebiasaan Baru';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar style="dark" />

      <View style={styles.headerRow}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Kembali"
          hitSlop={8}
          onPress={() => {
            tapFeedback();
            router.back();
          }}
          style={({ pressed }) => [
            styles.backButton,
            pressed ? styles.pressed : null,
          ]}
        >
          <Icons.ArrowLeft size={20} color={Colors.text} strokeWidth={2.2} />
        </Pressable>

        <Text style={styles.headerTitle}>Buat Kebiasaan Baru</Text>

        <View style={styles.headerSpacer} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.illustration}>
            <View style={styles.illustrationHalo} pointerEvents="none" />
            <View style={styles.illustrationRing} pointerEvents="none" />
            <LinearGradient
              colors={Gradients.primary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.illustrationCircle}
            >
              <Animated.View style={bounceStyle}>
                <Icons.Rocket size={38} color="#FFFFFF" strokeWidth={1.9} />
              </Animated.View>
            </LinearGradient>
            <View style={styles.sparkleTop} pointerEvents="none">
              <Icons.Sparkles size={18} color={Colors.primaryLight} />
            </View>
            <View style={styles.sparkleBottom} pointerEvents="none">
              <Icons.Star
                size={13}
                color={Colors.secondary}
                fill={Colors.secondary}
              />
            </View>
          </View>

          <Text style={styles.headline}>Wujudkan versi terbaik dirimu</Text>
          <Text style={styles.subheadline}>
            Mulai dari satu kebiasaan kecil, lalu jaga konsistensinya.
          </Text>

          <View style={styles.form}>
            <View style={styles.inputBlock}>
              <CustomInput
                label="Nama Kebiasaan *"
                value={name}
                onChangeText={(value) => {
                  setName(value);
                  if (nameError) {
                    setNameError(null);
                  }
                }}
                leftIcon={Icons.PenLine}
                placeholder="Contoh: Minum air putih"
                error={nameError}
                maxLength={60}
                returnKeyType="next"
              />
            </View>

            <View style={styles.inputBlock}>
              <CustomInput
                label="Target (opsional)"
                value={target}
                onChangeText={setTarget}
                leftIcon={Icons.Target}
                placeholder="Contoh: 8 gelas / 30 menit"
                maxLength={50}
                returnKeyType="done"
              />
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHead}>
                <Text style={styles.sectionLabel}>Kategori</Text>
                <Text style={styles.sectionHint}>Pilih satu</Text>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.chipsRow}
              >
                {HABIT_CATEGORIES.map((item) => (
                  <CategoryChip
                    key={item}
                    category={item}
                    selected={category === item}
                    onPress={() => setCategory(item)}
                  />
                ))}
              </ScrollView>
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHead}>
                <Text style={styles.sectionLabel}>Ikon</Text>
                <Text style={styles.sectionHint}>Pilih yang paling cocok</Text>
              </View>
              <HabitIconPicker selectedIcon={icon} onSelect={setIcon} />
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHead}>
                <Text style={styles.sectionLabel}>Warna Aksen</Text>
                <Text style={styles.sectionHint}>Buat makin personal</Text>
              </View>
              <ColorPicker value={color} onChange={setColor} />
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHead}>
                <Text style={styles.sectionLabel}>Pratinjau</Text>
                <Text style={styles.sectionHint}>Live</Text>
              </View>
              <View style={styles.previewWrap}>
                <View style={styles.previewBadge}>
                  <View
                    style={[styles.previewDot, { backgroundColor: color }]}
                  />
                  <Text style={styles.previewBadgeText} numberOfLines={1}>
                    {previewName}
                  </Text>
                </View>
                <HabitCard
                  habit={previewHabit}
                  completed={false}
                  onPress={() => undefined}
                  onToggle={() => undefined}
                  interactive={false}
                />
              </View>
            </View>

            {formError ? (
              <Text style={styles.formError}>{formError}</Text>
            ) : null}

            <GradientButton
              label="Simpan Kebiasaan"
              onPress={() => {
                void handleSave();
              }}
              icon={Icons.Check}
              loading={isSaving}
              disabled={isSaving}
              style={styles.saveButton}
            />

            <View style={styles.privacyNote}>
              <Icons.Sprout size={13} color={Colors.primary} />
              <Text style={styles.privacyText}>
                Datamu tersimpan aman di perangkat ini.
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  flex: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.soft,
  },
  headerTitle: {
    fontFamily: Fonts.semiBold,
    fontSize: 16.5,
    letterSpacing: -0.2,
    color: Colors.text,
  },
  headerSpacer: {
    width: 44,
    height: 44,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 36,
  },
  illustration: {
    alignSelf: 'center',
    width: 128,
    height: 118,
    alignItems: 'center',
    justifyContent: 'center',
  },
  illustrationHalo: {
    position: 'absolute',
    width: 116,
    height: 116,
    borderRadius: 58,
    backgroundColor: 'rgba(220, 252, 231, 0.75)',
  },
  illustrationRing: {
    position: 'absolute',
    width: 126,
    height: 126,
    borderRadius: 63,
    borderWidth: 1,
    borderColor: 'rgba(22, 163, 74, 0.16)',
  },
  illustrationCircle: {
    width: 88,
    height: 88,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primaryDark,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.28,
    shadowRadius: 18,
    elevation: 7,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
  },
  sparkleTop: {
    position: 'absolute',
    top: 2,
    right: 4,
  },
  sparkleBottom: {
    position: 'absolute',
    bottom: 8,
    left: 8,
  },
  headline: {
    marginTop: 6,
    fontFamily: Fonts.bold,
    fontSize: 20,
    letterSpacing: -0.4,
    color: Colors.text,
    textAlign: 'center',
  },
  subheadline: {
    marginTop: 5,
    marginBottom: 24,
    fontFamily: Fonts.regular,
    fontSize: 11.5,
    lineHeight: 18,
    color: Colors.textSecondary,
    textAlign: 'center',
    alignSelf: 'center',
    maxWidth: 280,
  },
  form: {
    gap: 4,
  },
  inputBlock: {
    marginBottom: 14,
  },
  section: {
    marginTop: 10,
    marginBottom: 10,
  },
  sectionHead: {
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionLabel: {
    fontFamily: Fonts.semiBold,
    fontSize: 13.5,
    color: Colors.text,
  },
  sectionHint: {
    fontFamily: Fonts.regular,
    fontSize: 10,
    color: Colors.textSecondary,
  },
  chipsRow: {
    gap: 8,
    paddingRight: 4,
  },
  previewWrap: {
    gap: 8,
  },
  previewBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    marginBottom: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(255,255,255,0.75)',
  },
  previewDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  previewBadgeText: {
    fontFamily: Fonts.medium,
    fontSize: 9.5,
    color: Colors.textSecondary,
  },
  formError: {
    marginTop: 8,
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: Colors.error,
    textAlign: 'center',
  },
  saveButton: {
    marginTop: 22,
  },
  privacyNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 14,
  },
  privacyText: {
    fontFamily: Fonts.regular,
    fontSize: 10,
    color: Colors.textSecondary,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.96 }],
  },
});
