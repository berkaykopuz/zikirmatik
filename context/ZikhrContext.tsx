import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { DEFAULT_ZIKHR, ZIKHR_ITEMS, ZikhrItem } from '@/constants/zikhrs';

export type CompletedZikhr = {
  id: string;
  name: string;
  description: string;
  count: number;
  completedAt: string;
};

type ZikhrContextValue = {
  zikhrs: ZikhrItem[];
  selectedZikhr: ZikhrItem;
  setSelectedZikhr: (zikhr: ZikhrItem) => void;
  addZikhr: (zikhr: ZikhrItem) => void;
  deleteZikhr: (zikhr: ZikhrItem) => void;
  completedZikhrs: CompletedZikhr[];
  addCompletedZikhr: (zikhr: ZikhrItem) => void;
};

const ZikhrContext = createContext<ZikhrContextValue | undefined>(undefined);
const STORAGE_KEY = '@zikirmatik/customZikhrs';
const COMPLETED_STORAGE_KEY = '@zikirmatik/completedZikhrs';

export function ZikhrProvider({ children }: { children: ReactNode }) {
  const [customZikhrs, setCustomZikhrs] = useState<ZikhrItem[]>([]);
  const [selectedZikhr, setSelectedZikhr] = useState(DEFAULT_ZIKHR);
  const [completedZikhrs, setCompletedZikhrs] = useState<CompletedZikhr[]>([]);

  const zikhrs = useMemo(() => [...ZIKHR_ITEMS, ...customZikhrs], [customZikhrs]);

  const saveCustomZikhrs = useCallback(async (items: ZikhrItem[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.warn('Failed to save zikhrs to storage', error);
    }
  }, []);

  const addZikhr = useCallback(
    (zikhr: ZikhrItem) => {
      setCustomZikhrs((prev) => {
        const updated = [...prev, zikhr];
        void saveCustomZikhrs(updated);
        return updated;
      });
      setSelectedZikhr(zikhr);
    },
    [saveCustomZikhrs],
  );

  const deleteZikhr = useCallback(
    (zikhr: ZikhrItem) => {
      // update the zikhr list without deleted one
      setCustomZikhrs((prev) => {
        const updated = prev.filter((item) => item.name !== zikhr.name);
        void saveCustomZikhrs(updated);
        return updated;
      });
      // If the deleted zikhr is currently selected, switch to default
      if (selectedZikhr.name === zikhr.name) {
        setSelectedZikhr(DEFAULT_ZIKHR);
      }
    },
    [saveCustomZikhrs, selectedZikhr],
  );

  const saveCompletedZikhrs = useCallback(async (items: CompletedZikhr[]) => {
    try {
      await AsyncStorage.setItem(COMPLETED_STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.warn('Failed to save completed zikhrs to storage', error);
    }
  }, []);

  const addCompletedZikhr = useCallback(
    (zikhr: ZikhrItem) => {
      setCompletedZikhrs((prev) => {
        const newEntry: CompletedZikhr = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          name: zikhr.name,
          description: zikhr.description,
          count: zikhr.count,
          completedAt: new Date().toISOString(),
        };
        const updated = [newEntry, ...prev].slice(0, 100);
        void saveCompletedZikhrs(updated);
        return updated;
      });
    },
    [saveCompletedZikhrs],
  );

  useEffect(() => {
    const loadCustomZikhrs = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed: ZikhrItem[] = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            setCustomZikhrs(parsed);
          }
        }
      } catch (error) {
        console.warn('Failed to load zikhrs from storage', error);
      }
    };

    void loadCustomZikhrs();
  }, []);

  useEffect(() => {
    const loadCompletedZikhrs = async () => {
      try {
        const stored = await AsyncStorage.getItem(COMPLETED_STORAGE_KEY);
        if (stored) {
          const parsed: CompletedZikhr[] = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            setCompletedZikhrs(parsed);
          }
        }
      } catch (error) {
        console.warn('Failed to load completed zikhrs from storage', error);
      }
    };

    void loadCompletedZikhrs();
  }, []);

  const value = useMemo(
    () => ({
      zikhrs,
      selectedZikhr,
      setSelectedZikhr,
      addZikhr,
      deleteZikhr,
      completedZikhrs,
      addCompletedZikhr,
    }),
    [zikhrs, selectedZikhr, addZikhr, deleteZikhr, completedZikhrs, addCompletedZikhr],
  );

  return <ZikhrContext.Provider value={value}>{children}</ZikhrContext.Provider>;
}

export function useZikhr() {
  const ctx = useContext(ZikhrContext);
  if (!ctx) {
    throw new Error('useZikhr must be used within a ZikhrProvider');
  }
  return ctx;
}

