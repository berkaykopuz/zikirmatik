import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { ZIKHR_ITEMS, ZikhrItem } from '@/constants/zikhrs';

export type CompletedZikhr = {
  id: string;
  name: string;
  description: string;
  count: number;
  completedAt: string;
};

type ZikhrProgressMap = Record<string, number>;

type ZikhrContextValue = {
  zikhrs: ZikhrItem[];
  selectedZikhr: ZikhrItem | null;
  setSelectedZikhr: (zikhr: ZikhrItem | null) => void;
  addZikhr: (zikhr: ZikhrItem) => void;
  updateZikhrCount: (name: string, count: number) => void;
  deleteZikhr: (zikhr: ZikhrItem) => void;
  completedZikhrs: CompletedZikhr[];
  addCompletedZikhr: (zikhr: ZikhrItem) => void;
  zikhrProgress: ZikhrProgressMap;
  updateZikhrProgress: (name: string, count: number) => void;
  resetZikhrProgress: (name: string) => void;
  getZikhrCount: (name: string, fallbackCount: number) => number;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  sfxEnabled: boolean;
  setSfxEnabled: (enabled: boolean) => void;
  volumeCountEnabled: boolean;
  setVolumeCountEnabled: (enabled: boolean) => void;
  vibrationEnabled: boolean;
  setVibrationEnabled: (enabled: boolean) => void;
  appearanceMode: 'beads' | 'digital';
  setAppearanceMode: (mode: 'beads' | 'digital') => void;
  backgroundImage: string | null;
  setBackgroundImage: (image: string | null) => void;
  resetAllData: () => Promise<void>;
};

const ZikhrContext = createContext<ZikhrContextValue | undefined>(undefined);
const STORAGE_KEY = '@zikirmatik/customZikhrs';
const COMPLETED_STORAGE_KEY = '@zikirmatik/completedZikhrs';
const PROGRESS_STORAGE_KEY = '@zikirmatik/zikhrProgress';
const COUNT_OVERRIDE_STORAGE_KEY = '@zikirmatik/zikhrCountOverrides';

const SELECTED_STORAGE_KEY = '@zikirmatik/selectedZikhr';
const SETTINGS_STORAGE_KEY = '@zikirmatik/settings';

export function ZikhrProvider({ children }: { children: ReactNode }) {
  const [customZikhrs, setCustomZikhrs] = useState<ZikhrItem[]>([]);
  const [selectedZikhr, setSelectedZikhr] = useState<ZikhrItem | null>(null);
  const [selectionHydrated, setSelectionHydrated] = useState(false);
  const [customsHydrated, setCustomsHydrated] = useState(false);
  const [completedZikhrs, setCompletedZikhrs] = useState<CompletedZikhr[]>([]);
  const [progressMap, setProgressMap] = useState<ZikhrProgressMap>({});
  const [countOverrides, setCountOverrides] = useState<Record<string, number>>({});
  const [soundEnabled, setSoundEnabledState] = useState(true);
  const [sfxEnabled, setSfxEnabledState] = useState(true);
  const [volumeCountEnabled, setVolumeCountEnabledState] = useState(true);
  const [vibrationEnabled, setVibrationEnabledState] = useState(true);
  const [appearanceMode, setAppearanceModeState] = useState<'beads' | 'digital'>('beads');
  const [backgroundImage, setBackgroundImageState] = useState<string | null>(null);

  const zikhrs = useMemo(() => {
    const merged = [...ZIKHR_ITEMS, ...customZikhrs];
    if (!Object.keys(countOverrides).length) {
      return merged;
    }
    return merged.map((item) => {
      const override = countOverrides[item.name];
      return override ? { ...item, count: override } : item;
    });
  }, [customZikhrs, countOverrides]);

  const saveCountOverrides = useCallback(async (data: Record<string, number>) => {
    try {
      await AsyncStorage.setItem(COUNT_OVERRIDE_STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save zikhr count overrides', error);
    }
  }, []);

  const saveCustomZikhrs = useCallback(async (items: ZikhrItem[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.warn('Failed to save zikhrs to storage', error);
    }
  }, []);

  const saveSelectedZikhr = useCallback(async (zikhr: ZikhrItem | null) => {
    try {
      if (zikhr) {
        await AsyncStorage.setItem(SELECTED_STORAGE_KEY, JSON.stringify(zikhr));
      } else {
        await AsyncStorage.removeItem(SELECTED_STORAGE_KEY);
      }
    } catch (error) {
      console.warn('Failed to persist selected zikhr', error);
    }
  }, []);

  const selectZikhr = useCallback(
    (zikhr: ZikhrItem | null) => {
      setSelectedZikhr(zikhr);
      void saveSelectedZikhr(zikhr);
    },
    [saveSelectedZikhr],
  );

  const addZikhr = useCallback(
    (zikhr: ZikhrItem) => {
      setCustomZikhrs((prev) => {
        const updated = [...prev, zikhr];
        void saveCustomZikhrs(updated);
        return updated;
      });
      selectZikhr(zikhr);
    },
    [saveCustomZikhrs, selectZikhr],
  );

  const updateZikhrCount = useCallback(
    (name: string, count: number) => {
      const safeCount = Math.max(1, Math.floor(count));

      // Persist override for all zikhrs (built-in + custom)
      setCountOverrides((prev) => {
        const next = { ...prev, [name]: safeCount };
        void saveCountOverrides(next);
        return next;
      });

      // If it is a custom zikhr, also update the stored entity so it survives clearing overrides
      setCustomZikhrs((prev) => {
        const index = prev.findIndex((item) => item.name === name);
        if (index === -1) {
          return prev;
        }
        const updated = [...prev];
        updated[index] = { ...updated[index], count: safeCount };
        void saveCustomZikhrs(updated);
        return updated;
      });

      // Keep selected zikhr in sync with the new count
      setSelectedZikhr((prev) => {
        if (!prev || prev.name !== name) return prev;
        const nextSelected = { ...prev, count: safeCount };
        void saveSelectedZikhr(nextSelected);
        return nextSelected;
      });
    },
    [saveCountOverrides, saveCustomZikhrs, saveSelectedZikhr],
  );

  const getZikhrCount = useCallback(
    (name: string, fallbackCount: number) => {
      const override = countOverrides[name];
      if (override !== undefined) return override;
      return fallbackCount;
    },
    [countOverrides],
  );
  const saveProgressMap = useCallback(async (data: ZikhrProgressMap) => {
    try {
      await AsyncStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save zikhr progress to storage', error);
    }
  }, []);

  const resetZikhrProgress = useCallback(
    (name: string) => {
      setProgressMap((prev) => {
        if (!prev[name]) {
          return prev;
        }
        const updated = { ...prev };
        delete updated[name];
        void saveProgressMap(updated);
        return updated;
      });
    },
    [saveProgressMap],
  );

  const deleteZikhr = useCallback(
    (zikhr: ZikhrItem) => {
      // update the zikhr list without deleted one
      setCustomZikhrs((prev) => {
        const updated = prev.filter((item) => item.name !== zikhr.name);
        void saveCustomZikhrs(updated);
        return updated;
      });
      resetZikhrProgress(zikhr.name);
      // If the deleted zikhr is currently selected, switch to default
      if (selectedZikhr?.name === zikhr.name) {
        selectZikhr(null);
      }
    },
    [resetZikhrProgress, saveCustomZikhrs, selectZikhr, selectedZikhr],
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



  const updateZikhrProgress = useCallback(
    (name: string, count: number) => {
      setProgressMap((prev) => {
        const nextValue = Math.max(0, count);
        const updated = { ...prev, [name]: nextValue };
        void saveProgressMap(updated);
        return updated;
      });
    },
    [saveProgressMap],
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

    void loadCustomZikhrs().finally(() => setCustomsHydrated(true));
  }, []);

  useEffect(() => {
    const loadCountOverrides = async () => {
      try {
        const stored = await AsyncStorage.getItem(COUNT_OVERRIDE_STORAGE_KEY);
        if (stored) {
          const parsed: Record<string, number> = JSON.parse(stored);
          if (parsed && typeof parsed === 'object') {
            setCountOverrides(parsed);
          }
        }
      } catch (error) {
        console.warn('Failed to load zikhr count overrides', error);
      }
    };

    void loadCountOverrides();
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

  useEffect(() => {
    const loadProgress = async () => {
      try {
        const stored = await AsyncStorage.getItem(PROGRESS_STORAGE_KEY);
        if (stored) {
          const parsed: ZikhrProgressMap = JSON.parse(stored);
          if (parsed && typeof parsed === 'object') {
            setProgressMap(parsed);
          }
        }
      } catch (error) {
        console.warn('Failed to load zikhr progress from storage', error);
      }
    };

    void loadProgress();
  }, []);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const stored = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (typeof parsed.soundEnabled === 'boolean') setSoundEnabledState(parsed.soundEnabled);
          if (typeof parsed.sfxEnabled === 'boolean') setSfxEnabledState(parsed.sfxEnabled);
          if (typeof parsed.volumeCountEnabled === 'boolean') setVolumeCountEnabledState(parsed.volumeCountEnabled);
          if (typeof parsed.vibrationEnabled === 'boolean') setVibrationEnabledState(parsed.vibrationEnabled);
          if (parsed.appearanceMode) setAppearanceModeState(parsed.appearanceMode);
          if (parsed.backgroundImage !== undefined) setBackgroundImageState(parsed.backgroundImage);
        }
      } catch (error) {
        console.warn('Failed to load settings', error);
      }
    };
    void loadSettings();
  }, []);

  useEffect(() => {
    if (selectionHydrated || !customsHydrated) {
      return;
    }

    const loadSelectedZikhr = async () => {
      try {
        const stored = await AsyncStorage.getItem(SELECTED_STORAGE_KEY);
        if (!stored) {
          setSelectionHydrated(true);
          return;
        }
        const parsed: ZikhrItem = JSON.parse(stored);
        const match = zikhrs.find((item) => item.name === parsed.name) ?? null;
        selectZikhr(match);
      } catch (error) {
        console.warn('Failed to load selected zikhr', error);
        selectZikhr(null);
      } finally {
        setSelectionHydrated(true);
      }
    };

    void loadSelectedZikhr();
  }, [customsHydrated, selectZikhr, selectionHydrated, zikhrs]);

  // Keep selected zikhr updated when overrides change
  useEffect(() => {
    if (!selectedZikhr) return;
    const match = zikhrs.find((item) => item.name === selectedZikhr.name);
    if (match && match.count !== selectedZikhr.count) {
      setSelectedZikhr(match);
      void saveSelectedZikhr(match);
    }
  }, [selectedZikhr, zikhrs, saveSelectedZikhr]);

  const value = useMemo(
    () => ({
      zikhrs,
      selectedZikhr,
      setSelectedZikhr: selectZikhr,
      addZikhr,
      updateZikhrCount,
      deleteZikhr,
      completedZikhrs,
      addCompletedZikhr,
      zikhrProgress: progressMap,
      updateZikhrProgress,
      resetZikhrProgress,
      getZikhrCount,
      soundEnabled,
      setSoundEnabled: (enabled: boolean) => {
        setSoundEnabledState(enabled);
        void AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify({ soundEnabled: enabled, sfxEnabled, volumeCountEnabled,vibrationEnabled, appearanceMode, backgroundImage }));
      },
      sfxEnabled,
      setSfxEnabled: (enabled: boolean) => {
        setSfxEnabledState(enabled);
        void AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify({ soundEnabled, sfxEnabled: enabled, volumeCountEnabled, vibrationEnabled,  appearanceMode, backgroundImage }));
      },
      volumeCountEnabled,
      setVolumeCountEnabled: (enabled: boolean) => {
        setVolumeCountEnabledState(enabled);
        void AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify({ soundEnabled, sfxEnabled, volumeCountEnabled: enabled, vibrationEnabled, appearanceMode, backgroundImage }));
      },
      vibrationEnabled,
      setVibrationEnabled: (enabled: boolean) => {
        setVibrationEnabledState(enabled);
        void AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify({ soundEnabled, sfxEnabled, volumeCountEnabled, vibrationEnabled: enabled, appearanceMode, backgroundImage }));
      },
      appearanceMode,
      setAppearanceMode: (mode: 'beads' | 'digital') => {
        setAppearanceModeState(mode);
        void AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify({ soundEnabled, sfxEnabled, volumeCountEnabled, vibrationEnabled, appearanceMode: mode, backgroundImage }));
      },
      backgroundImage,
      setBackgroundImage: (image: string | null) => {
        setBackgroundImageState(image);
        void AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify({ soundEnabled, sfxEnabled, volumeCountEnabled, vibrationEnabled, appearanceMode, backgroundImage: image }));
      },
      resetAllData: async () => {
        try {
          await AsyncStorage.clear();
          setCustomZikhrs([]);
          setSelectedZikhr(null);
          setCompletedZikhrs([]);
          setProgressMap({});
          setCountOverrides({});
          setSoundEnabledState(true);
          setSfxEnabledState(true);
          setVolumeCountEnabledState(true);
          setVibrationEnabledState(true);
          setAppearanceModeState('beads');
          setBackgroundImageState(null);
        } catch (error) {
          console.warn('Failed to reset data', error);
        }
      },
    }),
    [
      zikhrs,
      selectedZikhr,
      selectZikhr,
      addZikhr,
      updateZikhrCount,
      deleteZikhr,
      completedZikhrs,
      addCompletedZikhr,
      progressMap,
      updateZikhrProgress,
      resetZikhrProgress,
      getZikhrCount,
      soundEnabled,
      sfxEnabled,
      volumeCountEnabled,
      vibrationEnabled,
      appearanceMode,
      backgroundImage,
    ],
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
