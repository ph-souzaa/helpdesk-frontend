import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Typography,
  CircularProgress,
  Paper,
  Divider,
  TextField,
  Button,
  Alert,
  Collapse,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Stack,
  Grid,
} from '@mui/material';
import { getStatusLabel, getPriorityLabel } from './utils';
import { AuthContext } from './AuthContext';

function TicketDetails() {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [status, setStatus] = useState('');
  const [solutionResolved, setSolutionResolved] = useState('');
  const [reasonCanceled, setReasonCanceled] = useState('');
  const [error, setError] = useState('');
  const [openError, setOpenError] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [successMessage, setSuccessMessage] = useState(false);
  const [transferEmail, setTransferEmail] = useState('');
  const [attendants, setAttendants] = useState([]);
  const isAdmin = user && user.roles && user.roles.includes('Admin');
  const isAtendente = user && user.roles && user.roles.includes('Atendente');

  const fetchAttendants = async () => {
    try {
      const response = await axios.get('http://localhost:5228/v1/identity/users?role=Atendente', {
        headers: {
          Accept: '*/*',
        },
        withCredentials: true,
      });
      setAttendants(response.data); // Atualiza a lista de atendentes
    } catch (error) {
      console.error('Erro ao buscar atendentes', error);
    }
  };

  useEffect(() => {
    fetchAttendants();
  }, []);

  useEffect(() => {
    async function fetchTicket() {
      try {
        const response = await axios.get(`http://localhost:5228/v1/assignment/${id}`, {
          withCredentials: true,
        });
        const ticketData = response.data.data || response.data;
        setTicket(ticketData);
        setComments(ticketData.comments || []);
        setStatus(ticketData.status);
        setAssignedTo(ticketData.assignedTo || '');
        setSolutionResolved(ticketData.solutionResolved || '');
        setReasonCanceled(ticketData.reasonCanceled || '');
      } catch (error) {
        console.error('Erro ao buscar detalhes do ticket:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchTicket();
  }, [id]);

  const handleAddComment = async () => {
    if (!newComment) return;
    try {
      await axios.post(
        `http://localhost:5228/v1/tickets/${id}/comments`,
        { content: newComment },
        { withCredentials: true }
      );
      const response = await axios.get(`http://localhost:5228/v1/assignment/${id}`, {
        withCredentials: true,
      });
      const ticketData = response.data.data || response.data;
      setComments(ticketData.comments || []);
      setNewComment('');
    } catch (error) {
      console.error('Erro ao adicionar comentário:', error);
      setError('Erro ao adicionar comentário. Tente novamente.');
      setOpenError(true);
    }
  };

  const handleUpdateTicket = async () => {
    setValidationError('');
    if (status === 3 && !solutionResolved) {
      setValidationError('A solução é obrigatória para resolver o ticket.');
      return;
    } else if (status === 4 && !reasonCanceled) {
      setValidationError('O motivo do cancelamento é obrigatório.');
      return;
    }
    try {
      const payload = { status };
      if (status === 3) {
        payload.solutionResolved = solutionResolved;
      } else if (status === 4) {
        payload.reasonCanceled = reasonCanceled;
      }
      await axios.put(`http://localhost:5228/v1/assignment/${id}`, payload, {
        withCredentials: true,
      });
      setSuccessMessage(true);
    } catch (error) {
      console.error('Erro ao atualizar ticket:', error);
      setError('Erro ao atualizar ticket. Tente novamente.');
      setOpenError(true);
    }
  };

  const handleTransferTicket = async () => {
    if (!transferEmail) {
      setValidationError('O e-mail de transferência é obrigatório.');
      return;
    }
    try {
      await axios.put(
        `http://localhost:5228/v1/assignment/transfer/${id}`,
        { assignmentEmail: transferEmail },
        { withCredentials: true }
      );
      setSuccessMessage(true);
    } catch (error) {
      console.error('Erro ao transferir o ticket:', error);
      setError('Erro ao transferir o ticket. Tente novamente.');
      setOpenError(true);
    }
  };

  if (loading) {
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

  if (!ticket) {
    return <Typography>Ticket não encontrado.</Typography>;
  }

  return (
    <Box sx={{ padding: 4 }}>
      <Paper sx={{ padding: 3, boxShadow: 3, borderRadius: 2 }}>
        <Typography
          variant="h4"
          gutterBottom
          sx={{ fontWeight: 'bold', color: '#1976d2', textAlign: 'center' }}
        >
          Detalhes do Ticket #{ticket.id}
        </Typography>
        <Divider sx={{ marginBottom: 3 }} />

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Chip label={`Status: ${getStatusLabel(ticket.status)}`} color="primary" />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Chip label={`Prioridade: ${getPriorityLabel(ticket.priority)}`} color="warning" />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Chip label={`Categoria: ${ticket.categoryName}`} color="secondary" />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Chip label={`Subcategoria: ${ticket.subcategoryName}`} />
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', marginRight: 2 }}>
                Descrição:
              </Typography>
              <Typography
                variant="body1"
                sx={{ fontStyle: 'italic', color: '#616161', wordBreak: 'break-word', overflowWrap: 'break-word' }}
              >
                {ticket.description}
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', marginRight: 1 }}>
                Criado por:
              </Typography>
              <Typography variant="body1" sx={{ color: '#424242', wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                <strong>{ticket.userId}</strong>
              </Typography>
            </Box>
          </Grid>

          {ticket.assignedTo && (
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', marginRight: 1 }}>
                  Atribuído a:
                </Typography>
                <Typography variant="body1" sx={{ color: '#424242', wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                  <strong>{ticket.assignedTo}</strong>
                </Typography>
              </Box>
            </Grid>
          )}
        </Grid>

        <Divider sx={{ marginTop: 3 }} />

        <Box sx={{ marginTop: 4 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', marginBottom: 2 }}>
            Comentários
          </Typography>
          {comments.length === 0 && <Typography>Nenhum comentário.</Typography>}
          {comments.map((comment) => (
            <Paper
              key={comment.id}
              sx={{
                padding: 2,
                marginTop: 2,
                boxShadow: 2,
                wordBreak: 'break-word',
                overflowWrap: 'break-word',
              }}
            >
              <Typography variant="body2" color="textSecondary">
                {comment.userId} - {new Date(comment.createdAt).toLocaleString()}
              </Typography>
              <Typography variant="body1">{comment.content}</Typography>
            </Paper>
          ))}

          <TextField
            label="Novo Comentário"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            fullWidth
            multiline
            rows={3}
            margin="normal"
            variant="outlined"
            sx={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}
          />
          <Button variant="contained" color="primary" onClick={handleAddComment} disabled={!newComment}>
            Adicionar Comentário
          </Button>
        </Box>

        <Collapse in={openError}>
          <Alert severity="error" sx={{ mt: 2 }} onClose={() => setOpenError(false)}>
            {error}
          </Alert>
        </Collapse>

        {validationError && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            {validationError}
          </Alert>
        )}

        {successMessage && (
          <Alert severity="success" sx={{ mt: 2 }}>
            Ticket atualizado com sucesso!
          </Alert>
        )}

        {(isAdmin || isAtendente) && (
          <Box sx={{ marginTop: 4 }}>
            <Typography variant="h6">Atualizar Status do Ticket</Typography>
            <FormControl fullWidth margin="normal">
              <InputLabel id="status-label">Status</InputLabel>
              <Select
                labelId="status-label"
                value={status}
                label="Status"
                onChange={(e) => setStatus(e.target.value)}
              >
                <MenuItem value={1}>Aberto</MenuItem>
                <MenuItem value={2}>Em andamento</MenuItem>
                <MenuItem value={3}>Resolvido</MenuItem>
                <MenuItem value={4}>Cancelado</MenuItem>
              </Select>
            </FormControl>

            {status === 3 && (
              <TextField
                label="Solução"
                value={solutionResolved}
                onChange={(e) => setSolutionResolved(e.target.value)}
                fullWidth
                margin="normal"
                multiline
                rows={3}
                required
                variant="outlined"
              />
            )}

            {status === 4 && (
              <TextField
                label="Motivo do Cancelamento"
                value={reasonCanceled}
                onChange={(e) => setReasonCanceled(e.target.value)}
                fullWidth
                margin="normal"
                multiline
                rows={3}
                required
                variant="outlined"
              />
            )}

            <Button variant="contained" color="primary" onClick={handleUpdateTicket}>
              Atualizar Ticket
            </Button>
          </Box>
        )}

        {(isAdmin || (isAtendente && assignedTo === user.email && status === 2)) && (
          <Box sx={{ marginTop: 4 }}>
            <Typography variant="h6">Transferir Ticket</Typography>

            <FormControl fullWidth margin="normal">
              <InputLabel id="select-attendant-label">Selecionar Atendente</InputLabel>
              <Select
                labelId="select-attendant-label"
                value={transferEmail}
                onChange={(e) => setTransferEmail(e.target.value)}
                required
              >
                <MenuItem value="">
                  <em>Selecione um Atendente</em>
                </MenuItem>
                {attendants.map((attendant) => (
                  <MenuItem key={attendant.email} value={attendant.email}>
                    {attendant.name} ({attendant.email})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button variant="contained" color="secondary" onClick={handleTransferTicket}>
              Transferir Ticket
            </Button>
          </Box>
        )}
      </Paper>
    </Box>
  );
}

export default TicketDetails;
