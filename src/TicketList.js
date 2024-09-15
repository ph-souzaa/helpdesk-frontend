import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  Typography,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { getStatusLabel, getPriorityLabel } from './utils';

function TicketList({ tickets, isAtendente }) {
  const navigate = useNavigate();

  if (!tickets || tickets.length === 0) {
    return <Typography>Nenhum ticket encontrado.</Typography>;
  }

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

  // Filtrar tickets abertos ou em andamento apenas para atendentes
  const filteredTickets = tickets.filter(
    (ticket) => ticket.status === 1 || ticket.status === 2
  );

  return (
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
            <TableCell>Criado por</TableCell>
            <TableCell>Data Prevista de Resposta</TableCell>
            <TableCell>Data Prevista de Resolução</TableCell>
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

            return (
              <TableRow
                key={ticket.id}
                hover
                role="checkbox"
                tabIndex={-1}
                onClick={() => navigate(`/tickets/${ticket.id}`)}
                sx={{ cursor: 'pointer' }}
              >
                <TableCell>{ticket.id}</TableCell>
                <TableCell>{ticket.title}</TableCell>
                <TableCell>{getStatusLabel(ticket.status)}</TableCell>
                <TableCell>{getPriorityLabel(ticket.priority)}</TableCell>
                <TableCell>{ticket.categoryName || 'Sem categoria'}</TableCell>
                <TableCell>
                  {new Date(ticket.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>{ticket.userId || 'Desconhecido'}</TableCell>
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
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Paper>
  );
}

export default TicketList;
