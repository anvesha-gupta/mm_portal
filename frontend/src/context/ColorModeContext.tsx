import { createContext, useContext, useState, useMemo, type ReactNode } from 'react';
import type { PaletteMode } from '@mui/material';

interface ColorModeContextType {
  mode: PaletteMode;
  toggleColorMode: () => void;
}

const ColorModeContext = createContext<ColorModeContextType>({
  mode: 'dark',
  toggleColorMode: () => {},
});

export function ColorModeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<PaletteMode>(() => {
    return (localStorage.getItem('colorMode') as PaletteMode) ?? 'dark';
  });

  const value = useMemo(
    () => ({
      mode,
      toggleColorMode: () => {
        setMode((prev) => {
          const next = prev === 'dark' ? 'light' : 'dark';
          localStorage.setItem('colorMode', next);
          return next;
        });
      },
    }),
    [mode]
  );

  return <ColorModeContext.Provider value={value}>{children}</ColorModeContext.Provider>;
}

export function useColorMode() {
  return useContext(ColorModeContext);
}
