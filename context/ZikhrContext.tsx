import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { DEFAULT_ZIKHR, ZIKHR_ITEMS, ZikhrItem } from '@/constants/zikhrs';

type ZikhrContextValue = {
  zikhrs: ZikhrItem[];
  selectedZikhr: ZikhrItem;
  setSelectedZikhr: (zikhr: ZikhrItem) => void;
  addZikhr: (zikhr: ZikhrItem) => void;
};

const ZikhrContext = createContext<ZikhrContextValue | undefined>(undefined);
const STORAGE_KEY = '@zikirmatik/customZikhrs';

export function ZikhrProvider({ children }: { children: ReactNode }) {
  const [customZikhrs, setCustomZikhrs] = useState<ZikhrItem[]>([]);
  const [selectedZikhr, setSelectedZikhr] = useState(DEFAULT_ZIKHR);

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

  const value = useMemo(
    () => ({
      zikhrs,
      selectedZikhr,
      setSelectedZikhr,
      addZikhr,
    }),
    [zikhrs, selectedZikhr, addZikhr],
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

