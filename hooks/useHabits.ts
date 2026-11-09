import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import {
  deleteHabit,
  getHabitById,
  getHabits,
  toggleCompletionToday,
} from '../services/storage';
import type { Habit } from '../types/habit';

export function useHabits() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const load = useCallback(async (showLoading = false) => {
    if (showLoading) {
      setIsLoading(true);
    }
    try {
      const next = await getHabits();
      setHabits(next);
      setHasError(false);
    } catch {
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      void (async () => {
        try {
          const next = await getHabits();
          if (isActive) {
            setHabits(next);
            setHasError(false);
          }
        } catch {
          if (isActive) {
            setHasError(true);
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
    }, []),
  );

  const reload = useCallback(() => load(true), [load]);

  const toggleHabit = useCallback(async (id: string) => {
    await toggleCompletionToday(id);
    const next = await getHabits();
    setHabits(next);
    setHasError(false);
    return next;
  }, []);

  const removeHabit = useCallback(async (id: string) => {
    await deleteHabit(id);
    setHabits((previous) => previous.filter((habit) => habit.id !== id));
  }, []);

  return { habits, isLoading, hasError, reload, toggleHabit, removeHabit };
}

export type HabitDetailStatus = 'loading' | 'ready' | 'not-found' | 'error';

export function useHabitDetail(habitId: string) {
  const [habit, setHabit] = useState<Habit | null>(null);
  const [status, setStatus] = useState<HabitDetailStatus>('loading');

  const load = useCallback(async () => {
    if (!habitId) {
      setStatus('not-found');
      return;
    }

    setStatus('loading');
    try {
      const found = await getHabitById(habitId);
      if (found) {
        setHabit(found);
        setStatus('ready');
      } else {
        setHabit(null);
        setStatus('not-found');
      }
    } catch {
      setStatus('error');
    }
  }, [habitId]);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      if (!habitId) {
        setStatus('not-found');
        return () => {
          isActive = false;
        };
      }

      void (async () => {
        try {
          const found = await getHabitById(habitId);
          if (!isActive) {
            return;
          }
          if (found) {
            setHabit(found);
            setStatus('ready');
          } else {
            setHabit(null);
            setStatus('not-found');
          }
        } catch {
          if (isActive) {
            setStatus('error');
          }
        }
      })();

      return () => {
        isActive = false;
      };
    }, [habitId]),
  );

  const toggleToday = useCallback(async () => {
    if (!habit) {
      return;
    }
    await toggleCompletionToday(habit.id);
    const found = await getHabitById(habit.id);
    setHabit(found);
    setStatus(found ? 'ready' : 'not-found');
  }, [habit]);

  const remove = useCallback(async () => {
    if (!habit) {
      return;
    }
    await deleteHabit(habit.id);
    setHabit(null);
  }, [habit]);

  return { habit, status, reload: load, toggleToday, remove };
}
