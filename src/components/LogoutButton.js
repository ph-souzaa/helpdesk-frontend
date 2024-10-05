import React, { useContext } from 'react';
import { IconButton } from '@mui/material';  // Remova a importação incorreta de Logout aqui
import LogoutIcon from '@mui/icons-material/Logout';  // Corrija a importação do ícone de logout
import axios from 'axios';
import { AuthContext } from '../components/AuthContext';

function LogoutButton() {
  const { setUser } = useContext(AuthContext);

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:5228/v1/identity/logout', null, {
        withCredentials: true,
      });
      setUser(null);
      window.location.href = '/login'; // Redireciona para a página de login após logout
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      alert('Erro ao fazer logout. Tente novamente.');
    }
  };

  return (
    <IconButton color="inherit" onClick={handleLogout}>
      <LogoutIcon />  {/* Usa o ícone de logout corretamente importado */}
    </IconButton>
  );
}

export default LogoutButton;
