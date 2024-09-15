import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import LogoutButton from './LogoutButton';

const Layout = ({ children }) => {
  const navigate = useNavigate();

  return (
    <Box>
      {/* Barra de navegação */}
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Helpdesk
          </Typography>
          <Button color="inherit" onClick={() => navigate('/')}>
            Home
          </Button>
          <Button color="inherit" onClick={() => navigate('/user')}>
            Usuário
          </Button>
          <Button color="inherit" onClick={() => navigate('/historico')}>
            Histórico
          </Button>
          <LogoutButton />
        </Toolbar>
      </AppBar>

      {/* Conteúdo da página */}
      <Box sx={{ padding: 2 }}>
        {children}
      </Box>
    </Box>
  );
};

export default Layout;
