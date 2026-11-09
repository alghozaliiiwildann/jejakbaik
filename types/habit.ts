export const HABIT_CATEGORIES = [
  'Kesehatan',
  'Produktivitas',
  'Pendidikan',
  'Hiburan',
  'Self Care',
  'Lainnya',
] as const;

export type HabitCategory = (typeof HABIT_CATEGORIES)[number];

export type Habit = {
  id: string;
  name: string;
  target?: string;
  category: HabitCategory;
  icon: string;
  color: string;
  createdAt: string;
  /** Tanggal selesai dalam format "YYYY-MM-DD". */
  completions: string[];
  /** Dihitung ulang setiap data dibaca/disimpan. */
  currentStreak: number;
  longestStreak: number;
};

export type HabitPatch = Partial<
  Pick<Habit, 'name' | 'target' | 'category' | 'icon' | 'color' | 'completions'>
>;

export type DailyProgress = {
  dateKey: string;
  /** Label hari singkat, contoh "Sen". */
  label: string;
  completed: number;
  total: number;
  percentage: number;
};

export type ProgressSummary = {
  completed: number;
  total: number;
  percentage: number;
};

export type StreakStats = {
  current: number;
  best: number;
};

export type OverallStats = {
  totalHabits: number;
  totalCompletions: number;
  completedToday: number;
  weeklyAverage: number;
  currentStreak: number;
  longestStreak: number;
};

export type MonthlyStats = {
  monthLabel: string;
  averagePercentage: number;
  activeDays: number;
  totalCheckIns: number;
  perfectDays: number;
  elapsedDays: number;
};

export function isHabitCategory(value: unknown): value is HabitCategory {
  return (
    typeof value === 'string' &&
    (HABIT_CATEGORIES as readonly string[]).includes(value)
  );
}
