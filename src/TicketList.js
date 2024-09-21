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
  Collapse,
  Box,
  TableContainer,
  TablePagination,
} from '@mui/material';
import { Edit, Visibility, KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getStatusLabel, getPriorityLabel } from './utils';

function TicketList({ tickets, isAdmin, isAtendente, isUser, currentUserId }) {
  const navigate = useNavigate();
  const [openRow, setOpenRow] = useState(null); // Para armazenar a linha expandida

  const handleRowClick = (ticketId) => {
    setOpenRow((prevOpenRow) => (prevOpenRow === ticketId ? null : ticketId));
  };

  const addSLAToDate = (createdAt, slaTime) => {
    if (!createdAt || !slaTime) return null;
    const createdDate = new Date(createdAt);
    const [hours, minutes, seconds] = slaTime.split(':').map(Number);
    createdDate.setHours(createdDate.getHours() + hours);
    createdDate.setMinutes(createdDate.getMinutes() + minutes);
    createdDate.setSeconds(createdDate.getSeconds() + seconds);
    return createdDate;
  };

  const sortByNewest = (a, b) => new Date(b.createdAt) - new Date(a.createdAt);

  const filteredTickets = tickets
    .filter((ticket) => {
      if (isAtendente) return ticket.status === 1 || ticket.status === 2;
      else if (isUser) return ticket.status === 1 || ticket.status === 2;
      return true;
    })
    .sort(sortByNewest);

  return (
    <Box>
      <Paper sx={{ width: '100%', overflow: 'hidden', mt: 2 }}>
        <TableContainer>
          <Table stickyHeader aria-label="Collapsible Table">
            <TableHead>
              <TableRow>
                <TableCell />
                <TableCell>ID</TableCell>
                <TableCell>Título</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Prioridade</TableCell>
                <TableCell>Data de Criação</TableCell>
                <TableCell>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTickets.map((ticket) => {
                const responseDeadline = addSLAToDate(ticket.createdAt, ticket.slaResponseTime);
                const resolutionDeadline = addSLAToDate(ticket.createdAt, ticket.slaResolutionTime);
                const canEdit = isAdmin || ticket.userId === currentUserId;

                return (
                  <React.Fragment key={ticket.id}>
                    <TableRow hover role="checkbox" tabIndex={-1}>
                      <TableCell>
                        <IconButton
                          aria-label="expand row"
                          size="small"
                          onClick={() => handleRowClick(ticket.id)}
                        >
                          {openRow === ticket.id ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                        </IconButton>
                      </TableCell>
                      <TableCell>{ticket.id}</TableCell>
                      <TableCell>{ticket.title}</TableCell>
                      <TableCell>{getStatusLabel(ticket.status)}</TableCell>
                      <TableCell>{getPriorityLabel(ticket.priority)}</TableCell>
                      <TableCell>{new Date(ticket.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        {canEdit && (
                          <Tooltip title="Editar">
                            <IconButton
                              color="primary"
                              onClick={() => navigate(`/tickets/${ticket.id}/edit`)}
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

                    {/* Linha expandida com mais detalhes */}
                    <TableRow>
                      <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                        <Collapse in={openRow === ticket.id} timeout="auto" unmountOnExit>
                          <Box margin={2}>
                            <Typography variant="subtitle1" gutterBottom component="div">
                              Informações Adicionais
                            </Typography>
                            <Typography variant="body2">
                              <strong>Criado por:</strong> {ticket.userId || 'Desconhecido'}
                            </Typography>
                            {ticket.assignedTo && (
                              <Typography variant="body2">
                                <strong>Atendente:</strong> {ticket.assignedTo}
                              </Typography>
                            )}
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}

export default TicketList;
