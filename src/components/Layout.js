import React, { useState, useContext } from 'react';
import { styled, useTheme, ThemeProvider, createTheme } from '@mui/material/styles';
import {
  Box, AppBar as MuiAppBar, Toolbar, Typography, IconButton, Drawer as MuiDrawer, List, ListItem, ListItemIcon, ListItemText, CssBaseline, Divider, Tooltip
} from '@mui/material';
import { Menu as MenuIcon, ChevronLeft as ChevronLeftIcon, ChevronRight as ChevronRightIcon, Home as HomeIcon, History as HistoryIcon, Add as AddIcon, Category as CategoryIcon, People as PeopleIcon, Brightness4 as Brightness4Icon, Brightness7 as Brightness7Icon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../components/AuthContext';
import LogoutButton from './LogoutButton';

const drawerWidth = 240;

// Estilos para o Drawer quando está aberto
const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
});

// Estilos para o Drawer quando está fechado
const closedMixin = (theme) => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden',
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up('sm')]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

// Customização do AppBar para interagir com o Drawer
const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

// Customização do Drawer
const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
    ...(open && {
      ...openedMixin(theme),
      '& .MuiDrawer-paper': openedMixin(theme),
    }),
    ...(!open && {
      ...closedMixin(theme),
      '& .MuiDrawer-paper': closedMixin(theme),
    }),
  })
);

// Estilo para o Header do Drawer
const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
}));

function Layout({ children }) {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const theme = useTheme();

  const [open, setOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false); // Estado para troca de tema

  const toggleDrawer = () => {
    setOpen(!open);
  };

  // Alterna entre o tema claro e escuro
  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  // Definição do tema dinâmico
  const appliedTheme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
    },
  });

  const menuItems = [
    { text: 'Dashboard', icon: <HomeIcon />, path: '/' },
    { text: 'Novo Ticket', icon: <AddIcon />, path: '/tickets/new' },
    { text: 'Histórico de Tickets', icon: <HistoryIcon />, path: '/historico' },
    { text: 'Gerenciar Categorias', icon: <CategoryIcon />, adminOnly: true, path: '/categories' },
    { text: 'Gerenciar Usuários', icon: <PeopleIcon />, adminOnly: true, path: '/users' }
  ];

  return (
    <ThemeProvider theme={appliedTheme}>
      <Box sx={{ display: 'flex' }}>
        <CssBaseline />
        {/* AppBar */}
        <AppBar position="fixed" open={open}>
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              onClick={toggleDrawer}
              edge="start"
              sx={{
                marginRight: 5,
                ...(open && { display: 'none' }),
              }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap sx={{ flexGrow: 1, cursor: 'pointer' }} onClick={() => navigate('/')}>
              Helpdesk
            </Typography>

            <Typography variant="body1" sx={{ marginRight: 2 }}>
              Olá, {user.name}
            </Typography>
            {/* Botão de troca de tema */}
            <IconButton color="inherit" onClick={toggleTheme} sx={{ marginRight: 2 }}>
              {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
              
            <LogoutButton />
          </Toolbar>
        </AppBar>

        {/* Drawer */}
        <Drawer variant="permanent" open={open}>
          <DrawerHeader>
            <IconButton onClick={toggleDrawer}>
              {theme.direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />}
            </IconButton>
          </DrawerHeader>
          <Divider />
          <List>
            {menuItems.map((item) => {
              // Verifica se o item é apenas para admin
              if (item.adminOnly && !user?.roles?.includes('Admin')) return null;

              return (
                <Tooltip title={item.text} placement="right" disableHoverListener={open} key={item.text}>
                  <ListItem button onClick={() => navigate(item.path)}>
                    <ListItemIcon>{item.icon}</ListItemIcon>
                    <ListItemText primary={item.text} sx={{ opacity: open ? 1 : 0 }} />
                  </ListItem>
                </Tooltip>
              );
            })}
          </List>
        </Drawer>

        {/* Conteúdo Principal */}
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <DrawerHeader />
          {children}
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default Layout;
