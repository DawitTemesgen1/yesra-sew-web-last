import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#B58E2A', // Ethiopian Gold
      dark: '#8C6B1F',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#2C2C2C', // Dark Grey/Black
    },
    background: {
      default: '#F5F5F5',
      paper: '#ffffff',
    },
    text: {
      primary: '#2C2C2C',
      secondary: '#666666',
    },
  },
  typography: {
    fontFamily: '"Poppins", "Noto Sans Ethiopic", "Roboto", sans-serif',
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: {
    borderRadius: 16, // Matches Flutter rounded corners
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '10px 24px',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
          },
        },
      },
    },
  },
});

export default theme;
