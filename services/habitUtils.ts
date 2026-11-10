import { Colors } from '../constants/Colors';
import type {
  Achievement,
  DailyProgress,
  Habit,
  OverallStats,
  ProgressSummary,
  StreakStats,
} from '../types/habit';
import {
  addDays,
  getLastDateKeys,
  parseDateKey,
  todayKey,
  toDateKey,
} from './dateUtils';

export type StreakPair = {
  current: number;
  longest: number;
};

export type HeatmapDay = {
  dateKey: string;
  completed: number;
  total: number;
  /** 0 = kosong, 1-4 = intensitas semakin tinggi. */
  level: 0 | 1 | 2 | 3 | 4;
};

function uniqueValidDates(completions: string[]): string[] {
  const dates = new Set<string>();
  for (const entry of completions) {
    if (parseDateKey(entry) !== null) {
      dates.add(entry);
    }
  }
  return [...dates].sort();
}

function getCurrentStreakFromDates(dateKeys: string[]): number {
  if (dateKeys.length === 0) {
    return 0;
  }

  const dateSet = new Set(dateKeys);
  const today = new Date();
  let cursor = today;

  // Streak tetap hidup jika hari ini belum selesai tetapi kemarin selesai.
  if (!dateSet.has(toDateKey(cursor))) {
    cursor = addDays(cursor, -1);
  }

  let current = 0;
  while (dateSet.has(toDateKey(cursor))) {
    current += 1;
    cursor = addDays(cursor, -1);
  }
  return current;
}

function getLongestStreakFromDates(dateKeys: string[]): number {
  let longest = 0;
  let run = 0;
  let previous: Date | null = null;

  for (const dateKey of dateKeys) {
    const date = parseDateKey(dateKey);
    if (!date) {
      continue;
    }

    if (previous && toDateKey(addDays(previous, 1)) === dateKey) {
      run += 1;
    } else {
      run = 1;
    }

    longest = Math.max(longest, run);
    previous = date;
  }

  return longest;
}

/** Hitung streak dari daftar tanggal selesai. */
export function computeStreaks(completions: string[]): StreakPair {
  const dates = uniqueValidDates(completions);
  return {
    current: getCurrentStreakFromDates(dates),
    longest: getLongestStreakFromDates(dates),
  };
}

/** Pastikan field streak pada habit selalu sesuai riwayat completions. */
export function withStreakFields(habit: Habit): Habit {
  const streak = computeStreaks(habit.completions);
  if (
    habit.currentStreak === streak.current &&
    habit.longestStreak === streak.longest
  ) {
    return habit;
  }
  return {
    ...habit,
    currentStreak: streak.current,
    longestStreak: streak.longest,
  };
}

export function isCompletedOn(habit: Habit, dateKey: string): boolean {
  return habit.completions.includes(dateKey);
}

export function getCompletedHabitsForDate(
  habits: Habit[],
  dateKey: string,
): Habit[] {
  return habits.filter((habit) => habit.completions.includes(dateKey));
}

export function getCompletedCount(habits: Habit[], dateKey: string): number {
  return habits.reduce(
    (count, habit) => (habit.completions.includes(dateKey) ? count + 1 : count),
    0,
  );
}

export function getDailyPercentage(habits: Habit[], dateKey: string): number {
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

export function getLast7DaysProgress(
  habits: Habit[],
  endDate: Date = new Date(),
): DailyProgress[] {
  return getLastDateKeys(7, endDate).map((dateKey) => {
    const date = parseDateKey(dateKey);
    return {
      dateKey,
      label: date ? ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'][date.getDay()] : '',
      completed: getCompletedCount(habits, dateKey),
      total: habits.length,
      percentage: getDailyPercentage(habits, dateKey),
    };
  });
}

/** Rata-rata persentase dari sekumpulan hari. */
export function getAveragePercentage(days: DailyProgress[]): number {
  if (days.length === 0) {
    return 0;
  }
  const total = days.reduce((sum, day) => sum + day.percentage, 0);
  return Math.round(total / days.length);
}

/** Progres per hari pada bulan dari tanggal acuan sampai tanggal itu. */
export function getMonthProgress(
  habits: Habit[],
  date: Date = new Date(),
): DailyProgress[] {
  const now = new Date();
  const isCurrentMonth =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth();
  const daysInMonth = new Date(
    date.getFullYear(),
    date.getMonth() + 1,
    0,
  ).getDate();
  // Pada bulan berjalan, jangan tampilkan hari setelah tanggal acuan.
  const lastDay = isCurrentMonth
    ? Math.min(now.getDate(), date.getDate())
    : daysInMonth;

  const days: DailyProgress[] = [];
  for (let day = 1; day <= lastDay; day += 1) {
    const dateKey = toDateKey(
      new Date(date.getFullYear(), date.getMonth(), day),
    );
    days.push({
      dateKey,
      label: `${day}`,
      completed: getCompletedCount(habits, dateKey),
      total: habits.length,
      percentage: getDailyPercentage(habits, dateKey),
    });
  }
  return days;
}

export function getWeeklyAverage(habits: Habit[]): number {
  return getAveragePercentage(getLast7DaysProgress(habits));
}

export function getOverallStreak(habits: Habit[]): StreakStats {
  const activeDates = new Set<string>();
  const today = todayKey();

  for (const habit of habits) {
    for (const dateKey of habit.completions) {
      if (dateKey <= today && parseDateKey(dateKey) !== null) {
        activeDates.add(dateKey);
      }
    }
  }

  const sorted = [...activeDates].sort();
  return {
    current: getCurrentStreakFromDates(sorted),
    best: getLongestStreakFromDates(sorted),
  };
}

export function getTotalCompletions(habits: Habit[]): number {
  const today = todayKey();
  return habits.reduce(
    (total, habit) =>
      total +
      habit.completions.filter(
        (dateKey) => dateKey <= today && parseDateKey(dateKey) !== null,
      ).length,
    0,
  );
}

export function getOverallStats(habits: Habit[]): OverallStats {
  const progress = getTodayProgress(habits);
  const streak = getOverallStreak(habits);

  return {
    totalHabits: habits.length,
    totalCompletions: getTotalCompletions(habits),
    completedToday: progress.completed,
    weeklyAverage: getWeeklyAverage(habits),
    currentStreak: streak.current,
    longestStreak: streak.best,
  };
}

export function getAchievements(habits: Habit[]): Achievement[] {
  const stats = getOverallStats(habits);
  const hasPerfectDay = getLast7DaysProgress(habits).some(
    (day) => day.total > 0 && day.percentage === 100,
  );

  return [
    {
      id: 'consistency-7',
      title: '7 Hari Konsisten',
      description: 'Capai streak 7 hari berturut-turut',
      target: 7,
      progress: Math.min(stats.longestStreak, 7),
      unlocked: stats.longestStreak >= 7,
      tint: Colors.primary,
    },
    {
      id: 'streak-10',
      title: 'Streak 10 Hari',
      description: 'Jaga streak aktif sampai 10 hari',
      target: 10,
      progress: Math.min(stats.currentStreak, 10),
      unlocked: stats.currentStreak >= 10,
      tint: Colors.streakFire,
    },
    {
      id: 'streak-30',
      title: '30 Hari Streak',
      description: 'Rekor streak mencapai 30 hari',
      target: 30,
      progress: Math.min(stats.longestStreak, 30),
      unlocked: stats.longestStreak >= 30,
      tint: '#F59E0B',
    },
    {
      id: 'completions-100',
      title: '100 Completions',
      description: 'Total 100 kebiasaan selesai',
      target: 100,
      progress: Math.min(stats.totalCompletions, 100),
      unlocked: stats.totalCompletions >= 100,
      tint: '#8B5CF6',
    },
    {
      id: 'perfect-week',
      title: 'Hari Sempurna',
      description: 'Selesaikan semua kebiasaan dalam sehari',
      target: 1,
      progress: hasPerfectDay ? 1 : 0,
      unlocked: hasPerfectDay,
      tint: '#0EA5E9',
    },
  ];
}

export function getHabitTotalCompletions(habit: Habit): number {
  const today = todayKey();
  return habit.completions.filter(
    (dateKey) => dateKey <= today && parseDateKey(dateKey) !== null,
  ).length;
}

export function getHeatmapData(
  habits: Habit[],
  totalDays = 30,
  endDate: Date = new Date(),
): HeatmapDay[] {
  return getLastDateKeys(totalDays, endDate).map((dateKey) => {
    const completed = getCompletedCount(habits, dateKey);
    const total = habits.length;
    const ratio = total === 0 ? 0 : completed / total;

    let level: HeatmapDay['level'] = 0;
    if (completed > 0) {
      if (ratio <= 0.25) {
        level = 1;
      } else if (ratio <= 0.5) {
        level = 2;
      } else if (ratio < 1) {
        level = 3;
      } else {
        level = 4;
      }
    }

    return { dateKey, completed, total, level };
  });
}

export function getMotivationalMessage(percentage: number): string {
  if (percentage <= 0) {
    return 'Ayo mulai hari ini! 🌱';
  }
  if (percentage < 40) {
    return 'Awal yang baik, terus lanjut! 💪';
  }
  if (percentage < 70) {
    return 'Kamu di jalur yang tepat! 🚀';
  }
  if (percentage < 100) {
    return 'Sedikit lagi, hampir sempurna! 🔥';
  }
  return 'Luar biasa! Semua selesai! 🎉';
}

export function getWeeklyTrendLabel(average: number): string {
  if (average >= 80) {
    return 'Konsistensi luar biasa minggu ini';
  }
  if (average >= 50) {
    return 'Tren yang bagus, pertahankan';
  }
  return 'Tingkatkan sedikit demi sedikit';
}

export function createHabitId(): string {
  return `${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 10)}`;
}
