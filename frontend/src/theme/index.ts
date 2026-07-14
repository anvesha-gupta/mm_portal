import { createTheme } from '@mui/material/styles';
import type { PaletteMode } from '@mui/material';

export function createAppTheme(mode: PaletteMode) {
  return createTheme({
    palette: {
      mode,
      ...(mode === 'dark'
        ? {
            background: { default: '#08080F', paper: '#12121F' },
            primary: { main: '#7C3AED' },
            secondary: { main: '#A855F7' },
            text: { primary: '#FFFFFF', secondary: 'rgba(255,255,255,0.65)' },
          }
        : {
            background: { default: '#F4F4F8', paper: '#FFFFFF' },
            primary: { main: '#7C3AED' },
            secondary: { main: '#A855F7' },
            text: { primary: '#0F0F1A', secondary: 'rgba(15,15,26,0.6)' },
          }),
    },
    typography: { fontFamily: 'Inter, sans-serif' },
  });
}

export default createAppTheme('dark');
