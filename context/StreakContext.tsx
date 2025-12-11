import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import {
  DEFAULT_STREAK_STATE,
  getTodayDateString,
  isYesterday,
  loadStreakState,
  saveStreakState,
  StreakState,
  STREAK_STORAGE_KEY,
} from '@/utils/streak';

type StreakContextValue = {
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate: string | null;
  isTodayCompleted: boolean;
  onDailyGoalCompleted: () => Promise<void>;
  resetStreak: () => Promise<void>;
};

const StreakContext = createContext<StreakContextValue | undefined>(undefined);

export function StreakProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<StreakState>(DEFAULT_STREAK_STATE);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from storage
  useEffect(() => {
    void (async () => {
      const stored = await loadStreakState();
      setState(stored);
      setHydrated(true);
    })();
  }, []);

  const onDailyGoalCompleted = useCallback(async () => {
    const today = getTodayDateString();
    setState((prev) => {
      const next = (() => {
        if (!prev.lastCompletedDate) {
          return { currentStreak: 1, longestStreak: 1, lastCompletedDate: today };
        }
        if (prev.lastCompletedDate === today) {
          return prev;
        }
        if (isYesterday(prev.lastCompletedDate, today)) {
          const currentStreak = prev.currentStreak + 1;
          const longestStreak = Math.max(prev.longestStreak, currentStreak);
          return { currentStreak, longestStreak, lastCompletedDate: today };
        }
        // Missed at least one day
        const currentStreak = 1;
        const longestStreak = Math.max(prev.longestStreak, currentStreak);
        return { currentStreak, longestStreak, lastCompletedDate: today };
      })();

      void saveStreakState(next);
      return next;
    });
  }, []);

  const resetStreak = useCallback(async () => {
    setState(DEFAULT_STREAK_STATE);
    try {
      await AsyncStorage.removeItem(STREAK_STORAGE_KEY);
    } catch (error) {
      console.warn('Failed to clear streak storage', error);
    }
  }, []);

  const today = getTodayDateString();
  const value = useMemo<StreakContextValue>(
    () => ({
      currentStreak: state.currentStreak,
      longestStreak: state.longestStreak,
      lastCompletedDate: state.lastCompletedDate,
      isTodayCompleted: state.lastCompletedDate === today,
      onDailyGoalCompleted: async () => {
        if (!hydrated) return;
        await onDailyGoalCompleted();
      },
      resetStreak,
    }),
    [hydrated, onDailyGoalCompleted, resetStreak, state.currentStreak, state.lastCompletedDate, state.longestStreak, today],
  );

  return <StreakContext.Provider value={value}>{children}</StreakContext.Provider>;
}

export function useStreak() {
  const ctx = useContext(StreakContext);
  if (!ctx) {
    throw new Error('useStreak must be used within a StreakProvider');
  }
  return ctx;
}

