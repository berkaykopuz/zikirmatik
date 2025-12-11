import AsyncStorage from '@react-native-async-storage/async-storage';

export type StreakState = {
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate: string | null;
};

export const STREAK_STORAGE_KEY = 'zikirmatik_streak_state';

export const DEFAULT_STREAK_STATE: StreakState = {
  currentStreak: 0,
  longestStreak: 0,
  lastCompletedDate: null,
};

/**
 * Returns today's local date as YYYY-MM-DD.
 */
export const getTodayDateString = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const toLocalDate = (isoDate: string | null): Date | null => {
  if (!isoDate) return null;
  const [year, month, day] = isoDate.split('-').map((part) => Number.parseInt(part, 10));
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
};

/**
 * Checks if `maybeYesterday` is exactly one calendar day before `maybeToday`.
 */
export const isYesterday = (maybeYesterday: string | null, maybeToday: string | null): boolean => {
  if (!maybeYesterday || !maybeToday) return false;
  const prev = toLocalDate(maybeYesterday);
  const next = toLocalDate(maybeToday);
  if (!prev || !next) return false;
  const diffMs = next.getTime() - prev.getTime();
  const oneDayMs = 24 * 60 * 60 * 1000;
  return diffMs >= oneDayMs && diffMs < oneDayMs * 2;
};

export const loadStreakState = async (): Promise<StreakState> => {
  try {
    const raw = await AsyncStorage.getItem(STREAK_STORAGE_KEY);
    if (!raw) {
      return DEFAULT_STREAK_STATE;
    }
    const parsed = JSON.parse(raw);
    if (
      typeof parsed?.currentStreak === 'number' &&
      typeof parsed?.longestStreak === 'number' &&
      (typeof parsed?.lastCompletedDate === 'string' || parsed?.lastCompletedDate === null)
    ) {
      return {
        currentStreak: parsed.currentStreak,
        longestStreak: parsed.longestStreak,
        lastCompletedDate: parsed.lastCompletedDate,
      };
    }
    return DEFAULT_STREAK_STATE;
  } catch (error) {
    console.warn('Failed to load streak state, using defaults', error);
    return DEFAULT_STREAK_STATE;
  }
};

export const saveStreakState = async (state: StreakState) => {
  try {
    await AsyncStorage.setItem(STREAK_STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.warn('Failed to persist streak state', error);
  }
};

