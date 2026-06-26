import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#08080F',
      paper: '#12121F',
    },
    primary: {
      main: '#7C3AED'
    },
    secondary: {
      main: '#A855F7'
    },
    text: {
      primary: '#FFFFFF',
      secondary: 'rgba(255,255,255,0.75)'
    }
  },
  typography: {
    fontFamily: 'Inter, sans-serif'
  }
});

export default theme;
