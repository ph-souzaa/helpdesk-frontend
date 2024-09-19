import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from './AuthContext';
import axios from 'axios';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  CircularProgress,
  Container,
  Grid,
  Paper,
} from '@mui/material';
import LogoutButton from './LogoutButton';
import TicketList from './TicketList';
import { useNavigate } from 'react-router-dom';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

function Dashboard() {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState([]);
  const navigate = useNavigate();

  const [statusData, setStatusData] = useState([]);
  const [priorityData, setPriorityData] = useState([]);

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

          // Processa os dados para os gráficos
          processDataForCharts(response.data.data);
        } catch (error) {
          console.error('Erro ao buscar tickets:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    const processDataForCharts = (tickets) => {
      // Contagem de tickets por status
      const statusCount = tickets.reduce(
        (acc, ticket) => {
          acc[ticket.status] = (acc[ticket.status] || 0) + 1;
          return acc;
        },
        { open: 0, closed: 0, resolved: 0 }
      );

      const statusDataFormatted = [
        { name: 'Aberto', value: statusCount.open || 0 },
        { name: 'Fechado', value: statusCount.closed || 0 },
        { name: 'Resolvido', value: statusCount.resolved || 0 },
      ];

      // Contagem de tickets por prioridade
      const priorityCount = tickets.reduce(
        (acc, ticket) => {
          acc[ticket.priority] = (acc[ticket.priority] || 0) + 1;
          return acc;
        },
        { low: 0, medium: 0, high: 0 }
      );

      const priorityDataFormatted = [
        { name: 'Baixa', value: priorityCount.low || 0 },
        { name: 'Média', value: priorityCount.medium || 0 },
        { name: 'Alta', value: priorityCount.high || 0 },
      ];

      setStatusData(statusDataFormatted);
      setPriorityData(priorityDataFormatted);
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
    navigate('/login');
    return null;
  }

  const isAdmin = user.roles && user.roles.includes('Admin');
  const isAtendente = user.roles && user.roles.includes('Atendente');
  const isUser = user.roles && user.roles.includes('Usuario');
  const currentUserId = user.email;

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
        <Paper sx={{ padding: 3, mb: 3 }}>
          <Typography variant="h4">
            {isAdmin
              ? 'Painel de Administração'
              : isAtendente
              ? 'Painel de Atendente'
              : 'Meus Tickets'}
          </Typography>
          <Typography variant="subtitle1" sx={{ mt: 1 }}>
            {isAdmin
              ? 'Veja e gerencie todos os tickets.'
              : isAtendente
              ? 'Gerencie os tickets que estão em andamento.'
              : 'Visualize e acompanhe seus tickets.'}
          </Typography>
        </Paper>

        <Grid container spacing={3}>
          {/* Gráfico de Barras - Tickets por Status */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ padding: 3 }}>
              <Typography variant="h6">Tickets por Status</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={statusData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* Gráfico de Pizza - Tickets por Prioridade */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ padding: 3 }}>
              <Typography variant="h6">Tickets por Prioridade</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={priorityData}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={100}
                    fill="#8884d8"
                  >
                    {priorityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* Lista de Tickets */}
          <Grid item xs={12}>
            <TicketList
              tickets={tickets}
              isAdmin={isAdmin}
              isAtendente={isAtendente}
              isUser={isUser}
              currentUserId={currentUserId}
            />
          </Grid>
        </Grid>
      </Container>
    </div>
  );
}

export default Dashboard;
