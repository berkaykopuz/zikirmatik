import { createContext, useContext, useState, ReactNode } from 'react';

import { DEFAULT_ZIKHR, ZikhrItem } from '@/constants/zikhrs';

type ZikhrContextValue = {
  selectedZikhr: ZikhrItem;
  setSelectedZikhr: (zikhr: ZikhrItem) => void;
};

const ZikhrContext = createContext<ZikhrContextValue | undefined>(undefined);

export function ZikhrProvider({ children }: { children: ReactNode }) {
  const [selectedZikhr, setSelectedZikhr] = useState(DEFAULT_ZIKHR);

  return (
    <ZikhrContext.Provider
      value={{
        selectedZikhr,
        setSelectedZikhr,
      }}
    >
      {children}
    </ZikhrContext.Provider>
  );
}

export function useZikhr() {
  const ctx = useContext(ZikhrContext);
  if (!ctx) {
    throw new Error('useZikhr must be used within a ZikhrProvider');
  }
  return ctx;
}


