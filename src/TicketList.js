import React, { useState } from 'react';
import {
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  Tooltip,
  IconButton,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Box,
} from '@mui/material';
import { Edit, Visibility } from '@mui/icons-material'; // Ícones do Material UI
import { useNavigate } from 'react-router-dom';
import { getStatusLabel, getPriorityLabel } from './utils';

function TicketList({ tickets, isAdmin, isAtendente, isUser, currentUserId }) {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState(''); // Para armazenar a pesquisa
  const [statusFilter, setStatusFilter] = useState(''); // Filtro de status
  const [priorityFilter, setPriorityFilter] = useState(''); // Filtro de prioridade

  // Função para adicionar o SLA ao createdAt
  const addSLAToDate = (createdAt, slaTime) => {
    if (!createdAt || !slaTime) return null;

    const createdDate = new Date(createdAt);
    const [hours, minutes, seconds] = slaTime.split(':').map(Number);

    createdDate.setHours(createdDate.getHours() + hours);
    createdDate.setMinutes(createdDate.getMinutes() + minutes);
    createdDate.setSeconds(createdDate.getSeconds() + seconds);

    return createdDate;
  };

  // Função para ordenar tickets pela data mais recente
  const sortByNewest = (a, b) => new Date(b.createdAt) - new Date(a.createdAt);

  // Função para filtrar tickets baseados em busca, status, prioridade e papel do usuário
  const filteredTickets = tickets
    .filter((ticket) => {
      // Filtrar tickets dependendo da role do usuário
      if (isAtendente) {
        return ticket.status === 1 || ticket.status === 2; // Aberto e Em Atendimento para atendente
      } else if (isUser) {
        return ticket.status === 1 || ticket.status === 2; // Apenas tickets abertos e em atendimento para usuários
      }
      return true; // Mostrar todos para admins
    })
    .filter((ticket) => {
      // Filtro de pesquisa
      if (searchTerm) {
        const searchIn = `${ticket.id} ${ticket.title} ${ticket.description}`;
        return searchIn.toLowerCase().includes(searchTerm.toLowerCase());
      }
      return true;
    })
    .filter((ticket) => {
      // Filtro de status
      if (statusFilter) return ticket.status === Number(statusFilter);
      return true;
    })
    .filter((ticket) => {
      // Filtro de prioridade
      if (priorityFilter) return ticket.priority === Number(priorityFilter);
      return true;
    })
    .sort(sortByNewest); // Ordenar do mais recente para o mais antigo

  return (
    <Box>
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
            <MenuItem value={1}>Aberto</MenuItem>
            <MenuItem value={2}>Em andamento</MenuItem>
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
        <Table stickyHeader aria-label="Tabela de Tickets">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Título</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Prioridade</TableCell>
              <TableCell>Categoria</TableCell>
              <TableCell>Data de Criação</TableCell>
              {!isAdmin && isAtendente && <TableCell>Criado por</TableCell>}
              <TableCell>Data Prevista de Resposta</TableCell>
              <TableCell>Data Prevista de Resolução</TableCell>
              <TableCell>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredTickets.map((ticket) => {
              const responseDeadline = addSLAToDate(
                ticket.createdAt,
                ticket.slaResponseTime
              );
              const resolutionDeadline = addSLAToDate(
                ticket.createdAt,
                ticket.slaResolutionTime
              );

              const canEdit = isAdmin || ticket.userId === currentUserId;

              return (
                <TableRow key={ticket.id} hover role="checkbox" tabIndex={-1}>
                  <TableCell>{ticket.id}</TableCell>
                  <TableCell>{ticket.title}</TableCell>
                  <TableCell>{getStatusLabel(ticket.status)}</TableCell>
                  <TableCell>{getPriorityLabel(ticket.priority)}</TableCell>
                  <TableCell>
                    {ticket.categoryName || 'Sem categoria'}
                  </TableCell>
                  <TableCell>
                    {new Date(ticket.createdAt).toLocaleDateString()}
                  </TableCell>
                  {!isAdmin && isAtendente && (
                    <TableCell>{ticket.userId || 'Desconhecido'}</TableCell>
                  )}
                  <TableCell>
                    {responseDeadline
                      ? responseDeadline.toLocaleString()
                      : 'N/A'}
                  </TableCell>
                  <TableCell>
                    {resolutionDeadline
                      ? resolutionDeadline.toLocaleString()
                      : 'N/A'}
                  </TableCell>
                  <TableCell>
                    {canEdit && (
                      <Tooltip title="Editar">
                        <IconButton
                          color="primary"
                          onClick={() =>
                            navigate(`/tickets/${ticket.id}/edit`)
                          }
                          sx={{ marginRight: 1 }}
                        >
                          <Edit />
                        </IconButton>
                      </Tooltip>
                    )}
                    <Tooltip title="Ver Detalhes">
                      <IconButton
                        color="secondary"
                        onClick={() => navigate(`/tickets/${ticket.id}`)}
                      >
                        <Visibility />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}

export default TicketList;
