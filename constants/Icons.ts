import {
  AlertCircle,
  ArrowLeft,
  BarChart3,
  Bell,
  BookOpen,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  Code,
  Droplet,
  Dumbbell,
  Flame,
  Heart,
  Home,
  Leaf,
  MoreHorizontal,
  Plus,
  Smile,
  Sprout,
  Star,
  Trash2,
  Trophy,
  X,
  type LucideIcon,
} from 'lucide-react-native';

export const Icons = {
  AlertCircle,
  ArrowLeft,
  BarChart3,
  Bell,
  BookOpen,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  Code,
  Droplet,
  Dumbbell,
  Flame,
  Heart,
  Home,
  Leaf,
  MoreHorizontal,
  Plus,
  Smile,
  Sprout,
  Star,
  Trash2,
  Trophy,
  X,
} as const;

export const HABIT_ICON_NAMES = [
  'Droplet',
  'Dumbbell',
  'BookOpen',
  'Code',
  'Leaf',
  'Heart',
  'Smile',
  'Star',
  'MoreHorizontal',
] as const;

export type HabitIconName = (typeof HABIT_ICON_NAMES)[number];

export const HABIT_ICON_OPTIONS: ReadonlyArray<{
  name: HabitIconName;
  label: string;
}> = [
  { name: 'Droplet', label: 'Air' },
  { name: 'Dumbbell', label: 'Olahraga' },
  { name: 'BookOpen', label: 'Buku' },
  { name: 'Code', label: 'Koding' },
  { name: 'Leaf', label: 'Alam' },
  { name: 'Heart', label: 'Kesehatan' },
  { name: 'Smile', label: 'Mood' },
  { name: 'Star', label: 'Favorit' },
  { name: 'MoreHorizontal', label: 'Lainnya' },
];

export const HABIT_ICON_MAP: Record<HabitIconName, LucideIcon> = {
  Droplet,
  Dumbbell,
  BookOpen,
  Code,
  Leaf,
  Heart,
  Smile,
  Star,
  MoreHorizontal,
};

export function getHabitIcon(name: string): LucideIcon {
  const icon = (HABIT_ICON_MAP as Record<string, LucideIcon | undefined>)[name];
  return icon ?? Leaf;
}
