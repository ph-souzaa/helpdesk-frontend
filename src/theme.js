import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1a73e8', // Azul personalizado
    },
    secondary: {
      main: '#e53935', // Vermelho personalizado
    },
  },
  typography: {
    fontFamily: 'Montserrat, sans-serif',
  },
});


export default theme;
