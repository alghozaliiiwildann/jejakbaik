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
  createdAt: string;
  completions: string[];
};

export type HabitPatch = Partial<
  Pick<Habit, 'name' | 'target' | 'category' | 'icon' | 'completions'>
>;

export type DailyProgress = {
  dateKey: string;
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
