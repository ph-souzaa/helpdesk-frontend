import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, TableBody, TableCell, TableHead, TableRow, Paper, Typography } from '@mui/material';

function TicketHistory() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await axios.get('http://localhost:5228/v1/tickets', {
          withCredentials: true,
        });
        setTickets(response.data.data || []); // Garante que sempre será um array
      } catch (error) {
        console.error('Erro ao buscar o histórico de tickets:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  if (loading) {
    return <Typography>Carregando...</Typography>;
  }

  if (!tickets || tickets.length === 0) {
    return <Typography>Nenhum histórico encontrado.</Typography>;
  }

  // Filtra os tickets que estão resolvidos ou cancelados
  const filteredTickets = tickets.filter(
    (ticket) => ticket.status === 3 || ticket.status === 4
  );

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden', mt: 2 }}>
      <Table stickyHeader aria-label="Tabela de Histórico de Tickets">
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Título</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Categoria</TableCell>
            <TableCell>Subcategoria</TableCell>
            <TableCell>Data de Criação</TableCell>
            <TableCell>Data de Fechamento</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredTickets.map((ticket) => (
            <TableRow key={ticket.id} hover role="checkbox" tabIndex={-1}>
              <TableCell>{ticket.id}</TableCell>
              <TableCell>{ticket.title}</TableCell>
              <TableCell>{ticket.status === 3 ? 'Resolvido' : 'Cancelado'}</TableCell>
              <TableCell>{ticket.categoryName}</TableCell>
              <TableCell>{ticket.subcategoryName}</TableCell>
              <TableCell>{new Date(ticket.createdAt).toLocaleDateString()}</TableCell>
              <TableCell>{new Date(ticket.closedAt).toLocaleDateString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
}

export default TicketHistory;
