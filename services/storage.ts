import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  isHabitCategory,
  type Habit,
  type HabitPatch,
} from '../types/habit';
import { isHexColor } from './colorUtils';
import { todayKey } from './dateUtils';
import { withStreakFields } from './habitUtils';

export const HABITS_STORAGE_KEY = 'jejakbaik.habits.v1';
export const CELEBRATION_STORAGE_KEY = 'jejakbaik.celebration.v1';

const DATE_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const DEFAULT_COLOR = '#16A34A';

export class StorageError extends Error {
  readonly originalError?: unknown;

  constructor(message: string, originalError?: unknown) {
    super(message);
    this.name = 'StorageError';
    this.originalError = originalError;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function sanitizeCompletions(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const uniqueDates = new Set<string>();
  for (const entry of value) {
    if (typeof entry === 'string' && DATE_KEY_PATTERN.test(entry)) {
      uniqueDates.add(entry);
    }
  }
  return [...uniqueDates];
}

function readFiniteNumber(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0
    ? Math.floor(value)
    : 0;
}

function parseHabit(value: unknown): Habit | null {
  if (!isRecord(value)) {
    return null;
  }

  const { id, name, target, category, icon, color, createdAt, completions } =
    value;

  if (typeof id !== 'string' || id.trim().length === 0) {
    return null;
  }
  if (typeof name !== 'string' || name.trim().length === 0) {
    return null;
  }

  const habit: Habit = {
    id,
    name: name.trim(),
    target: typeof target === 'string' && target.trim() ? target.trim() : undefined,
    category: isHabitCategory(category) ? category : 'Lainnya',
    icon: typeof icon === 'string' && icon ? icon : 'Leaf',
    color: isHexColor(color) ? color : DEFAULT_COLOR,
    createdAt:
      typeof createdAt === 'string' ? createdAt : new Date().toISOString(),
    completions: sanitizeCompletions(completions),
    currentStreak: readFiniteNumber(value.currentStreak),
    longestStreak: readFiniteNumber(value.longestStreak),
  };

  // Riwayat selalu menjadi sumber kebenaran untuk streak.
  return withStreakFields(habit);
}

function parseHabits(raw: string): Habit[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    throw new StorageError('Data kebiasaan tidak dapat dibaca.', error);
  }

  if (!Array.isArray(parsed)) {
    throw new StorageError('Format data kebiasaan tidak valid.');
  }

  return parsed
    .map(parseHabit)
    .filter((habit): habit is Habit => habit !== null);
}

async function readHabits(): Promise<Habit[]> {
  try {
    const raw = await AsyncStorage.getItem(HABITS_STORAGE_KEY);
    if (raw === null) {
      return [];
    }
    return parseHabits(raw);
  } catch (error) {
    if (error instanceof StorageError) {
      throw error;
    }
    throw new StorageError('Gagal memuat data kebiasaan.', error);
  }
}

async function writeHabits(habits: Habit[]): Promise<void> {
  try {
    await AsyncStorage.setItem(HABITS_STORAGE_KEY, JSON.stringify(habits));
  } catch (error) {
    throw new StorageError('Gagal menyimpan data kebiasaan.', error);
  }
}

let mutationQueue: Promise<unknown> = Promise.resolve();

function enqueueMutation<T>(task: () => Promise<T>): Promise<T> {
  const result = mutationQueue.then(task, task);
  mutationQueue = result.catch(() => undefined);
  return result;
}

export async function getHabits(): Promise<Habit[]> {
  return readHabits();
}

export async function getHabitById(id: string): Promise<Habit | null> {
  const habits = await readHabits();
  return habits.find((habit) => habit.id === id) ?? null;
}

export function saveHabits(habits: Habit[]): Promise<void> {
  return enqueueMutation(() =>
    writeHabits(habits.map((habit) => withStreakFields(habit))),
  );
}

export function addHabit(habit: Habit): Promise<void> {
  return enqueueMutation(async () => {
    const habits = await readHabits();
    if (habits.some((existing) => existing.id === habit.id)) {
      throw new StorageError('Kebiasaan dengan ID yang sama sudah ada.');
    }
    await writeHabits([...habits, withStreakFields(habit)]);
  });
}

export function updateHabit(id: string, patch: HabitPatch): Promise<void> {
  return enqueueMutation(async () => {
    const habits = await readHabits();
    let found = false;

    const nextHabits = habits.map((habit) => {
      if (habit.id !== id) {
        return habit;
      }
      found = true;
      const merged: Habit = {
        ...habit,
        ...patch,
        id: habit.id,
        createdAt: habit.createdAt,
        completions: patch.completions
          ? sanitizeCompletions(patch.completions)
          : habit.completions,
        color: patch.color && isHexColor(patch.color) ? patch.color : habit.color,
      };
      return withStreakFields(merged);
    });

    if (!found) {
      throw new StorageError('Kebiasaan tidak ditemukan.');
    }

    await writeHabits(nextHabits);
  });
}

export function deleteHabit(id: string): Promise<void> {
  return enqueueMutation(async () => {
    const habits = await readHabits();
    const nextHabits = habits.filter((habit) => habit.id !== id);

    if (nextHabits.length === habits.length) {
      throw new StorageError('Kebiasaan tidak ditemukan.');
    }

    await writeHabits(nextHabits);
  });
}

/** Apakah confetti 100% sudah pernah dimainkan hari ini. */
export async function hasCelebratedToday(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(CELEBRATION_STORAGE_KEY)) === todayKey();
  } catch (error) {
    throw new StorageError('Gagal membaca status perayaan.', error);
  }
}

export async function markCelebratedToday(): Promise<void> {
  try {
    await AsyncStorage.setItem(CELEBRATION_STORAGE_KEY, todayKey());
  } catch (error) {
    throw new StorageError('Gagal menyimpan status perayaan.', error);
  }
}

export function toggleCompletionToday(id: string): Promise<void> {
  return enqueueMutation(async () => {
    const habits = await readHabits();
    const dateKey = todayKey();
    let found = false;

    const nextHabits = habits.map((habit) => {
      if (habit.id !== id) {
        return habit;
      }

      found = true;
      const completions = new Set(habit.completions);
      if (completions.has(dateKey)) {
        completions.delete(dateKey);
      } else {
        completions.add(dateKey);
      }

      return withStreakFields({
        ...habit,
        completions: [...completions].sort(),
      });
    });

    if (!found) {
      throw new StorageError('Kebiasaan tidak ditemukan.');
    }

    await writeHabits(nextHabits);
  });
}
