import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    success: { // Color para tickets "Abierto"
        main: '#4caf50', 
    },
    warning: { // Color para tickets "En progreso"
        main: '#ff9800', 
    },
  },
  typography: {
    fontFamily: 'Inter, Arial, sans-serif',
  },
});
