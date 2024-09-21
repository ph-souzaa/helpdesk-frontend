import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import { CircularProgress, Box } from '@mui/material';

const PrivateRoute = ({ element: Component, adminOnly = false, ...rest }) => {
  const { user } = useContext(AuthContext);

  // Mostra um spinner de carregamento enquanto o estado do usuário está sendo verificado
  if (user === undefined) {
    return (
      <Box
        sx={{
          height: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Se o usuário não estiver logado, redireciona para a página de login
  if (user === null) {
    return <Navigate to="/login" />;
  }

  // Verifica se a rota é exclusiva para administradores
  if (adminOnly && !(user.roles && user.roles.includes('Admin'))) {
    return <Navigate to="/" />;
  }

  // Renderiza o componente se o usuário estiver autenticado e tiver permissão
  return <Component {...rest} />;
};

export default PrivateRoute;
