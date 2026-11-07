import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  isHabitCategory,
  type Habit,
  type HabitPatch,
} from '../types/habit';
import { todayKey } from './dateUtils';

export const HABITS_STORAGE_KEY = 'jejakbaik.habits.v1';

const DATE_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

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

function parseHabit(value: unknown): Habit | null {
  if (!isRecord(value)) {
    return null;
  }

  const { id, name, target, category, icon, createdAt, completions } = value;

  if (typeof id !== 'string' || id.trim().length === 0) {
    return null;
  }
  if (typeof name !== 'string' || name.trim().length === 0) {
    return null;
  }

  return {
    id,
    name,
    target: typeof target === 'string' && target.trim() ? target : undefined,
    category: isHabitCategory(category) ? category : 'Lainnya',
    icon: typeof icon === 'string' && icon ? icon : 'Leaf',
    createdAt: typeof createdAt === 'string' ? createdAt : new Date().toISOString(),
    completions: sanitizeCompletions(completions),
  };
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

export function saveHabits(habits: Habit[]): Promise<void> {
  return enqueueMutation(() => writeHabits(habits));
}

export function addHabit(habit: Habit): Promise<void> {
  return enqueueMutation(async () => {
    const habits = await readHabits();
    if (habits.some((existing) => existing.id === habit.id)) {
      throw new StorageError('Kebiasaan dengan ID yang sama sudah ada.');
    }
    await writeHabits([...habits, habit]);
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
      return {
        ...habit,
        ...patch,
        id: habit.id,
        createdAt: habit.createdAt,
        completions: patch.completions
          ? sanitizeCompletions(patch.completions)
          : habit.completions,
      };
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

      return { ...habit, completions: [...completions] };
    });

    if (!found) {
      throw new StorageError('Kebiasaan tidak ditemukan.');
    }

    await writeHabits(nextHabits);
  });
}
