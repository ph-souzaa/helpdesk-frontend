import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
} from '@mui/material';
import { getStatusLabel, getPriorityLabel } from './utils';
import { AuthContext } from './AuthContext';

function TicketDetails() {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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
  const [transferEmail, setTransferEmail] = useState(''); // Estado para o e-mail de transferência

  const isAdmin = user && user.roles && user.roles.includes('Admin');
  const isAtendente = user && user.roles && user.roles.includes('Atendente');

  useEffect(() => {
    async function fetchTicket() {
      try {
        let response;

        if (isAdmin) {
          response = await axios.get(`http://localhost:5228/v1/admin/${id}`, {
            withCredentials: true,
          });
        } else if (isAtendente) {
          response = await axios.get(`http://localhost:5228/v1/assignment/${id}`, {
            withCredentials: true,
          });
        } else {
          response = await axios.get(`http://localhost:5228/v1/tickets/${id}`, {
            withCredentials: true,
          });
        }

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
  }, [id, isAdmin, isAtendente]);

  const handleAddComment = async () => {
    if (!newComment) return;

    try {
      await axios.post(
        `http://localhost:5228/v1/tickets/${id}/comments`,
        { content: newComment },
        { withCredentials: true }
      );
      const response = await axios.get(
        isAdmin
          ? `http://localhost:5228/v1/admin/${id}`
          : isAtendente
          ? `http://localhost:5228/v1/assignment/${id}`
          : `http://localhost:5228/v1/tickets/${id}`,
        { withCredentials: true }
      );

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

      await axios.put(
        isAdmin
          ? `http://localhost:5228/v1/admin/${id}`
          : `http://localhost:5228/v1/assignment/${id}`,
        payload,
        { withCredentials: true }
      );

      setSuccessMessage(true);
      setTimeout(() => {
        navigate('/'); // Redirecionar para o dashboard após 2 segundos
      }, 2000);
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
        isAdmin
          ? `http://localhost:5228/v1/admin/transfer/${id}`
          : `http://localhost:5228/v1/assignment/transfer/${id}`,
        { assignmentEmail: transferEmail },
        { withCredentials: true }
      );
      setSuccessMessage(true);
      setTimeout(() => {
        navigate('/');
      }, 2000);
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
    <Box sx={{ padding: 2 }}>
      <Paper sx={{ padding: 2 }}>
        <Typography variant="h5" gutterBottom>
          Ticket #{ticket.id}: {ticket.title}
        </Typography>
        <Divider sx={{ marginBottom: 2 }} />

        <Typography variant="body1">
          <strong>Status:</strong> {getStatusLabel(ticket.status)}
        </Typography>
        <Typography variant="body1">
          <strong>Prioridade:</strong> {getPriorityLabel(ticket.priority)}
        </Typography>
        <Typography variant="body1">
          <strong>Categoria:</strong> {ticket.categoryName}
        </Typography>
        <Typography variant="body1">
          <strong>Subcategoria:</strong> {ticket.subcategoryName}
        </Typography>
        <Typography variant="body1">
          <strong>Descrição:</strong> {ticket.description}
        </Typography>
        <Typography variant="body1">
          <strong>Criado por:</strong> {ticket.userId}
        </Typography>
        {ticket.assignedTo && (
          <Typography variant="body1">
            <strong>Atribuído a:</strong> {ticket.assignedTo}
          </Typography>
        )}

        <Box sx={{ marginTop: 4 }}>
          <Typography variant="h6">Comentários</Typography>
          {comments.length === 0 && <Typography>Nenhum comentário.</Typography>}
          {comments.map((comment) => (
            <Paper key={comment.id} sx={{ padding: 2, marginTop: 2 }}>
              <Typography variant="body2" color="textSecondary">
                {comment.userId} -{' '}
                {new Date(comment.createdAt).toLocaleString()}
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
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleAddComment}
            disabled={!newComment}
          >
            Adicionar Comentário
          </Button>
        </Box>

        <Collapse in={openError}>
          <Alert
            severity="error"
            sx={{ mt: 2 }}
            onClose={() => setOpenError(false)}
          >
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
            Ticket atualizado com sucesso! Redirecionando para a dashboard...
          </Alert>
        )}

        {(isAdmin || (isAtendente && assignedTo === user.email && status === 2)) && (
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
              />
            )}

            <Button
              variant="contained"
              color="primary"
              onClick={handleUpdateTicket}
            >
              Atualizar Ticket
            </Button>
          </Box>
        )}

        {(isAdmin || (isAtendente && assignedTo === user.email && status === 2)) && (
          <Box sx={{ marginTop: 4 }}>
            <Typography variant="h6">Transferir Ticket</Typography>
            <TextField
              label="E-mail do novo atendente"
              value={transferEmail}
              onChange={(e) => setTransferEmail(e.target.value)}
              fullWidth
              margin="normal"
              required
            />
            <Button
              variant="contained"
              color="secondary"
              onClick={handleTransferTicket}
            >
              Transferir Ticket
            </Button>
          </Box>
        )}
      </Paper>
    </Box>
  );
}

export default TicketDetails;
