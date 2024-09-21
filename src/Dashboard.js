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
  const [monthlyData, setMonthlyData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);

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
      // Mapeamento de status (1 = Aberto, 2 = Em Andamento, 3 = Resolvido, 4 = Cancelado)
      const statusMap = { 1: 'Aberto', 2: 'Em Andamento', 3: 'Resolvido', 4: 'Cancelado' };

      // Contagem de tickets por status
      const statusCount = tickets.reduce(
        (acc, ticket) => {
          const statusName = statusMap[ticket.status] || 'Desconhecido';
          acc[statusName] = (acc[statusName] || 0) + 1;
          return acc;
        },
        {}
      );

      const statusDataFormatted = Object.keys(statusCount).map((status) => ({
        name: status,
        value: statusCount[status],
      }));

      // Mapeamento de prioridade (assumindo que 1 = Baixa, 2 = Média, 3 = Alta)
      const priorityMap = { 1: 'Baixa', 2: 'Média', 3: 'Alta' };

      // Contagem de tickets por prioridade
      const priorityCount = tickets.reduce(
        (acc, ticket) => {
          const priorityName = priorityMap[ticket.priority] || 'Desconhecida';
          acc[priorityName] = (acc[priorityName] || 0) + 1;
          return acc;
        },
        {}
      );

      const priorityDataFormatted = Object.keys(priorityCount).map((priority) => ({
        name: priority,
        value: priorityCount[priority],
      }));

      // Contagem de tickets por mês
      const monthlyCount = tickets.reduce((acc, ticket) => {
        const month = new Date(ticket.createdAt).getMonth() + 1; // Mês da criação do ticket
        acc[month] = (acc[month] || 0) + 1;
        return acc;
      }, {});

      const monthlyDataFormatted = Object.keys(monthlyCount).map((month) => ({
        name: `Mês ${month}`,
        value: monthlyCount[month],
      }));

      // Contagem de tickets por categoria
      const categoryCount = tickets.reduce((acc, ticket) => {
        const categoryName = ticket.categoryName || 'Sem Categoria';
        const subcategoryName = ticket.subcategoryName || 'Sem Subcategoria';
        
        if (!acc[categoryName]) {
          acc[categoryName] = {
            categoryName: categoryName,
            subcategories: [],
            count: 0,
          };
        }

        acc[categoryName].subcategories.push(subcategoryName);
        acc[categoryName].count += 1;
        return acc;
      }, {});

      const categoryDataFormatted = Object.keys(categoryCount).map((category) => ({
        name: category,
        value: categoryCount[category].count,
        subcategories: categoryCount[category].subcategories,
      }));

      // Log dos dados formatados para conferência
      console.log('Status Data:', statusDataFormatted);
      console.log('Priority Data:', priorityDataFormatted);
      console.log('Monthly Data:', monthlyDataFormatted);
      console.log('Category Data:', categoryDataFormatted);

      setStatusData(statusDataFormatted);
      setPriorityData(priorityDataFormatted);
      setMonthlyData(monthlyDataFormatted);
      setCategoryData(categoryDataFormatted);
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
          {/* Renderizar os gráficos apenas para Admin */}
          {isAdmin && (
            <>
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

              {/* Gráfico de Barras - Tickets por Mês */}
              <Grid item xs={12} md={6}>
                <Paper sx={{ padding: 3 }}>
                  <Typography variant="h6">Tickets por Mês</Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={monthlyData}>
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>

              {/* Gráfico de Barras - Tickets por Categoria */}
              <Grid item xs={12} md={6}>
                <Paper sx={{ padding: 3 }}>
                  <Typography variant="h6">Tickets por Categoria</Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={categoryData}>
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value, name, props) => {
                        const { payload } = props;
                        return [value, `Subcategorias: ${payload.subcategories.join(', ')}`];
                      }} />
                      <Legend />
                      <Bar dataKey="value" fill="#FFBB28" />
                    </BarChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
            </>
          )}

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
