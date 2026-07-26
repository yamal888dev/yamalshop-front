import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#5b2be0', // ม่วง Yamal
      light: '#8259ff',
      dark: '#3d16ab',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#ff7a00', // ส้มตัดกับม่วง
      contrastText: '#ffffff',
    },
    background: {
      default: '#f6f7fb',
      paper: '#ffffff',
    },
    success: { main: '#1aab5b' },
  },
  typography: {
    fontFamily: '"Kanit", "Segoe UI", "Helvetica Neue", Arial, sans-serif',
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 500 },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
    },
    MuiCard: {
      styleOverrides: {
        root: { borderRadius: 16 },
      },
    },
  },
});

export default theme;
