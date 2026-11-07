import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import HabitIconPicker from '../../components/HabitIconPicker';
import PrimaryButton from '../../components/PrimaryButton';
import SecondaryButton from '../../components/SecondaryButton';
import { Colors, Radius, Shadow } from '../../constants/Colors';
import { Icons, type HabitIconName } from '../../constants/Icons';
import { Fonts } from '../../constants/Typography';
import { createHabitId } from '../../services/habitUtils';
import { addHabit } from '../../services/storage';
import { HABIT_CATEGORIES, type HabitCategory } from '../../types/habit';

export default function AddHabitScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [category, setCategory] = useState<HabitCategory>('Kesehatan');
  const [icon, setIcon] = useState<HabitIconName>('Leaf');
  const [nameError, setNameError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);

  const handleNameChange = (value: string) => {
    setName(value);
    if (nameError) {
      setNameError(null);
    }
  };

  const handleSave = async () => {
    if (isSaving) {
      return;
    }

    const trimmedName = name.trim();
    if (!trimmedName) {
      setNameError('Nama kebiasaan wajib diisi.');
      return;
    }

    const trimmedTarget = target.trim();
    setNameError(null);
    setFormError(null);
    setIsSaving(true);

    try {
      await addHabit({
        id: createHabitId(),
        name: trimmedName,
        target: trimmedTarget ? trimmedTarget : undefined,
        category,
        icon,
        createdAt: new Date().toISOString(),
        completions: [],
      });
      router.back();
    } catch {
      setFormError('Gagal menyimpan kebiasaan. Silakan coba lagi.');
      setIsSaving(false);
    }
  };

  const closeCategoryModal = () => {
    setIsCategoryOpen(false);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.headerRow}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Kembali"
          hitSlop={8}
          onPress={() => router.back()}
          style={({ pressed }) => [
            styles.backButton,
            pressed ? styles.pressed : null,
          ]}
        >
          <Icons.ArrowLeft size={20} color={Colors.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>Tambah Kebiasaan</Text>
        <View style={styles.headerSpacer} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.formGroup}>
            <Text style={styles.label}>Nama Kebiasaan *</Text>
            <TextInput
              value={name}
              onChangeText={handleNameChange}
              placeholder="Contoh: Minum air putih"
              placeholderTextColor={Colors.placeholder}
              selectionColor={Colors.primary}
              maxLength={60}
              autoCapitalize="sentences"
              style={[styles.input, nameError ? styles.inputError : null]}
            />
            {nameError ? (
              <Text style={styles.errorText}>{nameError}</Text>
            ) : null}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Target (opsional)</Text>
            <TextInput
              value={target}
              onChangeText={setTarget}
              placeholder="Contoh: 8 gelas / 30 menit"
              placeholderTextColor={Colors.placeholder}
              selectionColor={Colors.primary}
              maxLength={50}
              style={styles.input}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Kategori</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Kategori ${category}`}
              onPress={() => setIsCategoryOpen(true)}
              style={({ pressed }) => [
                styles.select,
                pressed ? styles.pressed : null,
              ]}
            >
              <Text style={styles.selectValue}>{category}</Text>
              <Icons.ChevronDown
                size={18}
                color={Colors.textSecondary}
              />
            </Pressable>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Ikon</Text>
            <HabitIconPicker selectedIcon={icon} onSelect={setIcon} />
          </View>

          {formError ? (
            <Text style={styles.formError}>{formError}</Text>
          ) : null}

          <PrimaryButton
            label="Simpan"
            onPress={() => {
              void handleSave();
            }}
            loading={isSaving}
            disabled={isSaving}
            style={styles.saveButton}
          />
          <SecondaryButton
            label="Kembali"
            onPress={() => router.back()}
            disabled={isSaving}
            style={styles.cancelButton}
          />
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal
        visible={isCategoryOpen}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={closeCategoryModal}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={StyleSheet.absoluteFill}
            accessibilityLabel="Tutup pilihan kategori"
            onPress={closeCategoryModal}
          />
          <View
            style={[
              styles.modalCard,
              { paddingBottom: Math.max(insets.bottom, 20) },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Pilih Kategori</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Tutup"
                hitSlop={8}
                onPress={closeCategoryModal}
                style={styles.modalClose}
              >
                <Icons.X size={20} color={Colors.textSecondary} />
              </Pressable>
            </View>

            {HABIT_CATEGORIES.map((item) => {
              const isSelected = item === category;

              return (
                <Pressable
                  key={item}
                  accessibilityRole="button"
                  accessibilityLabel={item}
                  accessibilityState={{ selected: isSelected }}
                  onPress={() => {
                    setCategory(item);
                    closeCategoryModal();
                  }}
                  style={({ pressed }) => [
                    styles.categoryRow,
                    isSelected ? styles.categoryRowSelected : null,
                    pressed ? styles.pressed : null,
                  ]}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      isSelected ? styles.categoryTextSelected : null,
                    ]}
                  >
                    {item}
                  </Text>
                  {isSelected ? (
                    <Icons.Check size={18} color={Colors.primary} />
                  ) : null}
                </Pressable>
              );
            })}
          </View>
        </View>
      </Modal>
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
    borderRadius: 22,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.card,
  },
  headerTitle: {
    fontFamily: Fonts.semiBold,
    fontSize: 18,
    color: Colors.text,
  },
  headerSpacer: {
    width: 44,
    height: 44,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 32,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    marginBottom: 8,
    fontFamily: Fonts.medium,
    fontSize: 14,
    color: Colors.text,
  },
  input: {
    minHeight: 52,
    borderRadius: Radius.input,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: Colors.text,
  },
  inputError: {
    borderColor: Colors.error,
  },
  errorText: {
    marginTop: 6,
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: Colors.error,
  },
  select: {
    minHeight: 52,
    borderRadius: Radius.input,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectValue: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: Colors.text,
  },
  formError: {
    marginBottom: 12,
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: Colors.error,
    textAlign: 'center',
  },
  saveButton: {
    marginTop: 4,
  },
  cancelButton: {
    marginTop: 12,
  },
  pressed: {
    opacity: 0.85,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  modalTitle: {
    fontFamily: Fonts.semiBold,
    fontSize: 18,
    color: Colors.text,
  },
  modalClose: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryRow: {
    minHeight: 48,
    borderRadius: Radius.button,
    paddingHorizontal: 12,
    marginBottom: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryRowSelected: {
    backgroundColor: Colors.softGreen,
  },
  categoryText: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: Colors.text,
  },
  categoryTextSelected: {
    fontFamily: Fonts.medium,
    color: Colors.success,
  },
});
