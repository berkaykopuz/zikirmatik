import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { DEFAULT_ZIKHR, ZIKHR_ITEMS, ZikhrItem } from '@/constants/zikhrs';

type ZikhrContextValue = {
  zikhrs: ZikhrItem[];
  selectedZikhr: ZikhrItem;
  setSelectedZikhr: (zikhr: ZikhrItem) => void;
  addZikhr: (zikhr: ZikhrItem) => void;
  deleteZikhr: (zikhr: ZikhrItem) => void;
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
      deleteZikhr,
    }),
    [zikhrs, selectedZikhr, addZikhr, deleteZikhr],
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

