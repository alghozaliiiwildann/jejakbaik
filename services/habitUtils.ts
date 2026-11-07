import type {
  DailyProgress,
  Habit,
  MonthlyStats,
  ProgressSummary,
  StreakStats,
} from '../types/habit';
import {
  addDays,
  formatMonthYearId,
  formatShortDateId,
  getLastDateKeys,
  parseDateKey,
  todayKey,
  toDateKey,
} from './dateUtils';

export function isCompletedOn(habit: Habit, dateKey: string): boolean {
  return habit.completions.includes(dateKey);
}

export function getCompletedCount(habits: Habit[], dateKey: string): number {
  return habits.reduce(
    (count, habit) =>
      habit.completions.includes(dateKey) ? count + 1 : count,
    0,
  );
}

export function getDailyPercentage(
  habits: Habit[],
  dateKey: string,
): number {
  if (habits.length === 0) {
    return 0;
  }
  return Math.round((getCompletedCount(habits, dateKey) / habits.length) * 100);
}

export function getTodayProgress(habits: Habit[]): ProgressSummary {
  const total = habits.length;
  const completed = getCompletedCount(habits, todayKey());
  return {
    completed,
    total,
    percentage: total === 0 ? 0 : Math.round((completed / total) * 100),
  };
}

export function getLast7DaysProgress(habits: Habit[]): DailyProgress[] {
  return getLastDateKeys(7).map((dateKey) => ({
    dateKey,
    label: formatShortDateId(dateKey),
    completed: getCompletedCount(habits, dateKey),
    total: habits.length,
    percentage: getDailyPercentage(habits, dateKey),
  }));
}

export function getWeeklyAverage(habits: Habit[]): number {
  if (habits.length === 0) {
    return 0;
  }

  const days = getLast7DaysProgress(habits);
  const totalPercentage = days.reduce(
    (sum, day) => sum + day.percentage,
    0,
  );
  return Math.round(totalPercentage / days.length);
}

function getActiveDateKeys(habits: Habit[]): string[] {
  const today = todayKey();
  const activeDates = new Set<string>();

  for (const habit of habits) {
    for (const dateKey of habit.completions) {
      if (dateKey <= today && parseDateKey(dateKey) !== null) {
        activeDates.add(dateKey);
      }
    }
  }

  return [...activeDates].sort();
}

export function getStreakStats(habits: Habit[]): StreakStats {
  const activeDates = getActiveDateKeys(habits);
  if (activeDates.length === 0) {
    return { current: 0, best: 0 };
  }

  const activeDateSet = new Set(activeDates);
  const today = new Date();
  let cursor = addDays(today, 0);

  if (!activeDateSet.has(toDateKey(cursor))) {
    cursor = addDays(cursor, -1);
  }

  let current = 0;
  while (activeDateSet.has(toDateKey(cursor))) {
    current += 1;
    cursor = addDays(cursor, -1);
  }

  let best = 0;
  let run = 0;
  let previousDate: Date | null = null;

  for (const dateKey of activeDates) {
    const date = parseDateKey(dateKey);
    if (!date) {
      continue;
    }

    if (previousDate && toDateKey(addDays(previousDate, 1)) === dateKey) {
      run += 1;
    } else {
      run = 1;
    }

    best = Math.max(best, run);
    previousDate = date;
  }

  return { current, best };
}

export function getMonthlyStats(
  habits: Habit[],
  referenceDate: Date = new Date(),
): MonthlyStats {
  const year = referenceDate.getFullYear();
  const month = referenceDate.getMonth();
  const elapsedDays = referenceDate.getDate();

  let totalPercentage = 0;
  let activeDays = 0;
  let totalCheckIns = 0;
  let perfectDays = 0;

  for (let day = 1; day <= elapsedDays; day += 1) {
    const dateKey = toDateKey(new Date(year, month, day));
    const completed = getCompletedCount(habits, dateKey);

    totalPercentage += getDailyPercentage(habits, dateKey);
    totalCheckIns += completed;

    if (completed > 0) {
      activeDays += 1;
    }
    if (habits.length > 0 && completed === habits.length) {
      perfectDays += 1;
    }
  }

  return {
    monthLabel: formatMonthYearId(referenceDate),
    averagePercentage: Math.round(totalPercentage / elapsedDays),
    activeDays,
    totalCheckIns,
    perfectDays,
    elapsedDays,
  };
}

export function createHabitId(): string {
  return `${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 10)}`;
}
