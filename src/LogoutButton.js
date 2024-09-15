import React, { useContext } from 'react';
import { Button } from '@mui/material';
import axios from 'axios';
import { AuthContext } from './AuthContext';

function LogoutButton() {
  const { setUser } = useContext(AuthContext);

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:5228/v1/identity/logout', null, {
        withCredentials: true,
      });
      setUser(null);
      window.location.href = '/login';
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      alert('Erro ao fazer logout. Tente novamente.');
    }
  };

  return (
    <Button color="inherit" onClick={handleLogout}>
      Sair
    </Button>
  );
}

export default LogoutButton;
