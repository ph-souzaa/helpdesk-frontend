import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#6200ea', // Roxo moderno
    },
    secondary: {
      main: '#03dac6', // Verde água moderno
    },
    background: {
      default: '#f0f2f5', // Cinza claro moderno para o fundo
      paper: '#ffffff', // Fundo dos componentes como Paper
    },
    text: {
      primary: '#333333', // Texto primário mais escuro
      secondary: '#666666', // Texto secundário
    },
  },
  typography: {
    fontFamily: 'Roboto, sans-serif', // Fonte moderna
    h5: {
      fontWeight: 600, // Título mais forte
    },
    button: {
      textTransform: 'none', // Botões sem letras maiúsculas automáticas
    },
  },
});

export default theme;
