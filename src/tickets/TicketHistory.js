import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout'; // Importe o novo Layout
import { AuthContext } from '../components/AuthContext'; // Importe o contexto de autenticação

function TicketHistory() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // Hook para navegação
  const { user } = useContext(AuthContext); // Obter o usuário logado

  const [searchTerm, setSearchTerm] = useState(''); // Estado para armazenar a pesquisa
  const [statusFilter, setStatusFilter] = useState(''); // Filtro de status
  const [priorityFilter, setPriorityFilter] = useState(''); // Filtro de prioridade

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        let response;

        // Verifique o papel do usuário
        if (user.roles.includes('Atendente')) {
          // Se for Atendente, buscar tickets atribuídos
          response = await axios.get('http://localhost:5228/v1/assignment', {
            withCredentials: true,
          });
        } else if (user.roles.includes('Admin')) {
          // Se for Admin, buscar todos os tickets
          response = await axios.get('http://localhost:5228/v1/admin', {
            withCredentials: true,
          });
        } else {
          // Caso contrário, buscar tickets referentes ao usuário comum
          response = await axios.get('http://localhost:5228/v1/tickets', {
            withCredentials: true,
          });
        }

        setTickets(response.data.data || []); // Garante que sempre será um array
      } catch (error) {
        console.error('Erro ao buscar o histórico de tickets:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [user]); // Reexecutar sempre que o usuário mudar

  if (loading) {
    return <Typography>Carregando...</Typography>;
  }

  if (!tickets || tickets.length === 0) {
    return (
      <Layout>
        <Typography>Nenhum histórico encontrado.</Typography>
      </Layout>
    );
  }
  
  // Função para ordenar tickets pela data mais recente
  const sortByNewest = (a, b) => new Date(b.createdAt) - new Date(a.createdAt);

  // Filtrar tickets que estão resolvidos ou cancelados e aplicar busca e filtros
  const filteredTickets = tickets
    .filter((ticket) => ticket.status === 3 || ticket.status === 4) // Filtrar resolvidos/cancelados
    .filter((ticket) => {
      if (searchTerm) {
        const searchIn = `${ticket.id} ${ticket.title} ${ticket.description}`;
        return searchIn.toLowerCase().includes(searchTerm.toLowerCase());
      }
      return true;
    })
    .filter((ticket) => {
      if (statusFilter) return ticket.status === Number(statusFilter);
      return true;
    })
    .filter((ticket) => {
      if (priorityFilter) return ticket.priority === Number(priorityFilter);
      return true;
    })
    .sort(sortByNewest); // Ordenar pelo mais recente

  return (
    <Layout>
      {/* Filtros de Pesquisa */}
      <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
        <TextField
          label="Pesquisar Ticket"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar por número, título ou descrição"
          variant="outlined"
          sx={{ flex: 1 }}
        />

        <FormControl variant="outlined" sx={{ minWidth: 150 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            label="Status"
          >
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value={3}>Resolvido</MenuItem>
            <MenuItem value={4}>Cancelado</MenuItem>
          </Select>
        </FormControl>

        <FormControl variant="outlined" sx={{ minWidth: 150 }}>
          <InputLabel>Prioridade</InputLabel>
          <Select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            label="Prioridade"
          >
            <MenuItem value="">Todas</MenuItem>
            <MenuItem value={1}>Baixa</MenuItem>
            <MenuItem value={2}>Média</MenuItem>
            <MenuItem value={3}>Alta</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Paper sx={{ width: '100%', overflow: 'hidden', mt: 2 }}>
        <Table stickyHeader aria-label="Tabela de Histórico de Tickets">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Título</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Categoria</TableCell>
              <TableCell>Usuário de Criação</TableCell>
              <TableCell>Atendente</TableCell>
              <TableCell>Data de Criação</TableCell>
              <TableCell>Data de Fechamento</TableCell>
              <TableCell>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredTickets.map((ticket) => (
              <TableRow key={ticket.id} hover role="checkbox" tabIndex={-1}>
                <TableCell>{ticket.id}</TableCell>
                <TableCell>{ticket.title}</TableCell>
                <TableCell>{ticket.status === 3 ? 'Resolvido' : 'Cancelado'}</TableCell>
                <TableCell>{ticket.categoryName || 'Sem categoria'}</TableCell>
                <TableCell>{ticket.userId || 'Desconhecido'}</TableCell>
                <TableCell>{ticket.assignedTo || 'Nenhum'}</TableCell>
                <TableCell>{new Date(ticket.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>{ticket.closedAt ? new Date(ticket.closedAt).toLocaleDateString() : 'N/A'}</TableCell>
                <TableCell>
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => navigate(`/tickets/${ticket.id}`)}
                  >
                    Ver Detalhes
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Layout>
  );
}

export default TicketHistory;
