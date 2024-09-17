import React, { useState, useContext } from 'react';
import { Box, AppBar, Toolbar, Typography, IconButton, Drawer, List, ListItem, ListItemIcon, ListItemText, CssBaseline, Divider } from '@mui/material';
import { Menu as MenuIcon, Logout as LogoutIcon, Home as HomeIcon, History as HistoryIcon, Add as AddIcon, Category as CategoryIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import LogoutButton from './LogoutButton';
import { AuthContext } from './AuthContext';
import { useMediaQuery, useTheme } from '@mui/material';

function Layout({ children }) {
  const [drawerOpen, setDrawerOpen] = useState(true); // Drawer sempre aberto em telas grandes
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm')); // Detecta se é um dispositivo móvel

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const menuItems = [
    { text: 'Dashboard', icon: <HomeIcon />, path: '/' },
    { text: 'Novo Ticket', icon: <AddIcon />, path: '/tickets/new' },
    { text: 'Histórico de Tickets', icon: <HistoryIcon />, path: '/historico' },
    { text: 'Gerenciar Categorias', icon: <CategoryIcon />, adminOnly: true, path: '/categories' }
  ];

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      {/* Barra de Navegação Superior */}
      <AppBar position="fixed" sx={{ zIndex: 1201 }}>
        <Toolbar>
          {isMobile && ( // Só mostra o botão de menu em dispositivos móveis
            <IconButton edge="start" color="inherit" aria-label="menu" onClick={toggleDrawer} sx={{ marginRight: 2 }}>
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="h6" sx={{ flexGrow: 1, cursor: 'pointer' }} onClick={() => navigate('/')}>
            Helpdesk
          </Typography>
          <Typography variant="body1" sx={{ marginRight: 2 }}>
            {user.email}
          </Typography>
          <LogoutButton />
        </Toolbar>
      </AppBar>

      {/* Drawer */}
      <Drawer
        variant={isMobile ? 'temporary' : 'permanent'} 
        open={isMobile ? drawerOpen : true} 
        onClose={isMobile ? toggleDrawer : undefined} 
        sx={{
          width: isMobile ? (drawerOpen ? 240 : 0) : 240, 
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 240,
            boxSizing: 'border-box',
          },
        }}
      >
        <Toolbar />
        <Divider />
        <List>
          {menuItems.map((item) => {
            if (item.adminOnly && !user.roles.includes('Admin')) return null;
            return (
              <ListItem button key={item.text} onClick={() => navigate(item.path)}>
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItem>
            );
          })}
        </List>
      </Drawer>

      {/* Conteúdo Principal */}
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}

export default Layout;
