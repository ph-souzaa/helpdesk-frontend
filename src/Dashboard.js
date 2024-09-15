import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from './AuthContext';
import axios from 'axios';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  CircularProgress,
  Button,
  Container,
} from '@mui/material';
import LogoutButton from './LogoutButton';
import TicketList from './TicketList';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTickets = async () => {
      if (user) {
        try {
          let response;
          let isAdmin = user.roles && user.roles.includes('Admin');
          let isAtendente = user.roles && user.roles.includes('Atendente');

          if (isAdmin) {
            // Usuário é administrador
            response = await axios.get(
              'http://localhost:5228/v1/admin?pageNumber=1&pageSize=25',
              {
                withCredentials: true,
              }
            );
          } else if (isAtendente) {
            // Usuário é atendente
            response = await axios.get(
              'http://localhost:5228/v1/assignment?pageNumber=1&pageSize=25',
              {
                withCredentials: true,
              }
            );
          } else {
            // Usuário comum
            response = await axios.get(
              'http://localhost:5228/v1/tickets?pageNumber=1&pageSize=25',
              {
                withCredentials: true,
              }
            );
          }
          setTickets(response.data.data);
        } catch (error) {
          console.error('Erro ao buscar tickets:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchTickets();
  }, [user]);

  if (user === undefined || loading) {
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

  if (user === null) {
    window.location.href = '/login';
    return null;
  }

  const isAdmin = user.roles && user.roles.includes('Admin');
  const isAtendente = user.roles && user.roles.includes('Atendente');

  return (
    <div>
      {/* Barra de Navegação Fixa no Topo */}
      <AppBar position="fixed">
        <Toolbar>
          <Typography
            variant="h6"
            onClick={() => navigate('/')}
            sx={{ flexGrow: 1, cursor: 'pointer' }}
          >
            Helpdesk
          </Typography>
          <Typography variant="body1" sx={{ marginRight: 2 }}>
            {user.email}
          </Typography>
          <LogoutButton />
        </Toolbar>
      </AppBar>

      {/* Conteúdo Principal */}
      <Container sx={{ marginTop: 8 }}>
        <Typography variant="h4" gutterBottom>
          Bem-vindo ao Helpdesk
        </Typography>

        {isAdmin && (
          <Typography variant="subtitle1">
            Você está logado como administrador.
          </Typography>
        )}

        {isAtendente && (
          <Typography variant="subtitle1">
            Você está logado como atendente.
          </Typography>
        )}

        <Box sx={{ marginBottom: 2 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/tickets/new')}
            sx={{ marginRight: 2 }}
          >
            Novo Ticket
          </Button>

          {isAdmin && (
            <Button
              variant="contained"
              color="secondary"
              onClick={() => navigate('/categories')}
              sx={{ marginRight: 2 }}
            >
              Gerenciar Categorias
            </Button>
          )}

          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/historico')}
          >
            Ver Histórico de Tickets
          </Button>
        </Box>

        {/* Lista de Tickets */}
        <TicketList tickets={tickets} isAdmin={isAdmin} isAtendente={isAtendente} />
      </Container>
    </div>
  );
}

export default Dashboard;
