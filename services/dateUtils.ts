const DAY_NAMES = [
  'Minggu',
  'Senin',
  'Selasa',
  'Rabu',
  'Kamis',
  'Jumat',
  'Sabtu',
] as const;

const SHORT_DAY_NAMES = [
  'Min',
  'Sen',
  'Sel',
  'Rab',
  'Kam',
  'Jum',
  'Sab',
] as const;

const MONTH_NAMES = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
] as const;

const SHORT_MONTH_NAMES = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'Mei',
  'Jun',
  'Jul',
  'Agu',
  'Sep',
  'Okt',
  'Nov',
  'Des',
] as const;

export function padTwo(value: number): string {
  return value < 10 ? `0${value}` : `${value}`;
}

export function toDateKey(date: Date): string {
  return [
    date.getFullYear(),
    padTwo(date.getMonth() + 1),
    padTwo(date.getDate()),
  ].join('-');
}

export function todayKey(): string {
  return toDateKey(new Date());
}

export function parseDateKey(dateKey: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateKey);
  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

export function addDays(date: Date, amount: number): Date {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate() + amount,
  );
}

export function getLastDateKeys(
  totalDays: number,
  endDate: Date = new Date(),
): string[] {
  if (totalDays <= 0) {
    return [];
  }

  const keys: string[] = [];
  for (let offset = totalDays - 1; offset >= 0; offset -= 1) {
    const date = new Date(
      endDate.getFullYear(),
      endDate.getMonth(),
      endDate.getDate() - offset,
    );
    keys.push(toDateKey(date));
  }
  return keys;
}

export function getGreeting(date: Date = new Date()): string {
  const hour = date.getHours();
  if (hour >= 5 && hour < 11) {
    return 'Selamat pagi';
  }
  if (hour >= 11 && hour < 15) {
    return 'Selamat siang';
  }
  if (hour >= 15 && hour < 19) {
    return 'Selamat sore';
  }
  return 'Selamat malam';
}

export function formatFullDateId(date: Date = new Date()): string {
  return `${DAY_NAMES[date.getDay()]}, ${date.getDate()} ${
    MONTH_NAMES[date.getMonth()]
  } ${date.getFullYear()}`;
}

export function formatMonthYearId(date: Date = new Date()): string {
  return `${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`;
}

export function formatMonthShortId(dateKey: string): string {
  const date = parseDateKey(dateKey);
  return date ? SHORT_MONTH_NAMES[date.getMonth()] : '';
}

export function formatDayMonthId(dateKey: string): string {
  const date = parseDateKey(dateKey);
  return date ? `${date.getDate()} ${SHORT_MONTH_NAMES[date.getMonth()]}` : dateKey;
}

export function formatLongDateId(dateKey: string): string {
  const date = parseDateKey(dateKey);
  return date ? formatFullDateId(date) : dateKey;
}

export function getShortDayName(dateKey: string): string {
  const date = parseDateKey(dateKey);
  return date ? SHORT_DAY_NAMES[date.getDay()] : '';
}

export function getDayOfMonth(dateKey: string): string {
  const date = parseDateKey(dateKey);
  return date ? `${date.getDate()}` : '';
}

/** 0 = Minggu, 1 = Senin, ... */
export function getWeekdayIndex(dateKey: string): number {
  const date = parseDateKey(dateKey);
  return date ? date.getDay() : 0;
}

export function isFutureDateKey(dateKey: string): boolean {
  return dateKey > todayKey();
}
