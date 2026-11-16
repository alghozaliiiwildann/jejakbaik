import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

import { StorageError } from '../services/storage';

/** Kunci AsyncStorage untuk seluruh data onboarding. */
export const HAS_SEEN_ONBOARDING_KEY = 'jejakbaik.onboarding.hasSeen.v1';
export const USER_SOURCE_KEY = 'jejakbaik.onboarding.userSource.v1';
export const USER_GOAL_KEY = 'jejakbaik.onboarding.userGoal.v1';

export const ONBOARDING_SOURCES = [
  'Teman',
  'Media Sosial',
  'Play Store',
  'Lainnya',
] as const;

export type OnboardingSource = (typeof ONBOARDING_SOURCES)[number];

export const ONBOARDING_GOALS = [
  'Hidup Sehat',
  'Produktif',
  'Belajar Hal Baru',
  'Lainnya',
] as const;

export type OnboardingGoal = (typeof ONBOARDING_GOALS)[number];

export type OnboardingAnswers = {
  source: OnboardingSource | null;
  goal: OnboardingGoal | null;
};

export function isOnboardingSource(value: unknown): value is OnboardingSource {
  return (
    typeof value === 'string' &&
    (ONBOARDING_SOURCES as readonly string[]).includes(value)
  );
}

export function isOnboardingGoal(value: unknown): value is OnboardingGoal {
  return (
    typeof value === 'string' &&
    (ONBOARDING_GOALS as readonly string[]).includes(value)
  );
}

/**
 * Dibaca oleh splash screen sebelum menentukan layar pertama:
 * onboarding (first launch) atau langsung ke beranda.
 */
export async function hasCompletedOnboarding(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(HAS_SEEN_ONBOARDING_KEY)) === 'true';
  } catch (error) {
    throw new StorageError('Gagal membaca status onboarding.', error);
  }
}

/** Menyimpan flag "sudah pernah onboarding" sekaligus jawaban survey. */
async function persistOnboarding(answers: OnboardingAnswers): Promise<void> {
  const entries: [string, string][] = [[HAS_SEEN_ONBOARDING_KEY, 'true']];

  if (answers.source !== null) {
    entries.push([USER_SOURCE_KEY, answers.source]);
  }
  if (answers.goal !== null) {
    entries.push([USER_GOAL_KEY, answers.goal]);
  }

  try {
    await AsyncStorage.multiSet(entries);
  } catch (error) {
    throw new StorageError('Gagal menyimpan data onboarding.', error);
  }
}

/** Hapus semua data onboarding. Berguna untuk menguji ulang alur first-launch. */
export async function resetOnboarding(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([
      HAS_SEEN_ONBOARDING_KEY,
      USER_SOURCE_KEY,
      USER_GOAL_KEY,
    ]);
  } catch (error) {
    throw new StorageError('Gagal menghapus data onboarding.', error);
  }
}

export type UseOnboardingResult = {
  /** true selama status first-launch masih dibaca dari storage. */
  isLoading: boolean;
  /** true bila user sudah pernah menyelesaikan onboarding. */
  hasSeenOnboarding: boolean;
  source: OnboardingSource | null;
  goal: OnboardingGoal | null;
  selectSource: (value: OnboardingSource) => void;
  selectGoal: (value: OnboardingGoal) => void;
  /** Simpan flag + jawaban, lalu tandai onboarding selesai. */
  completeOnboarding: () => Promise<void>;
  error: string | null;
};

export function useOnboarding(): UseOnboardingResult {
  const [isLoading, setIsLoading] = useState(true);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);
  const [answers, setAnswers] = useState<OnboardingAnswers>({
    source: null,
    goal: null,
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    void (async () => {
      try {
        const seen = await hasCompletedOnboarding();

        if (!isActive) {
          return;
        }

        setHasSeenOnboarding(seen);
      } catch {
        if (isActive) {
          setError('Gagal memuat data onboarding.');
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      isActive = false;
    };
  }, []);

  // Jawaban survey cukup disimpan saat onboarding selesai, bukan tiap tap.
  const selectSource = useCallback((value: OnboardingSource) => {
    setAnswers((prev) => ({ ...prev, source: value }));
  }, []);

  const selectGoal = useCallback((value: OnboardingGoal) => {
    setAnswers((prev) => ({ ...prev, goal: value }));
  }, []);

  const completeOnboarding = useCallback(async () => {
    await persistOnboarding(answers);
    setHasSeenOnboarding(true);
    setError(null);
  }, [answers]);

  return {
    isLoading,
    hasSeenOnboarding,
    source: answers.source,
    goal: answers.goal,
    selectSource,
    selectGoal,
    completeOnboarding,
    error,
  };
}
