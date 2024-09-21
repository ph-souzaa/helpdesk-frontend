import React, { useState } from 'react';
import axios from 'axios';
import {
  TextField,
  Button,
  Box,
  Typography,
  Paper,
  Alert,
  Collapse,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { Fade } from '@mui/material';
import { CircularProgress } from '@mui/material';

function ResetPassword() {
  const navigate = useNavigate();
  const { userId, token } = useParams(); // Capturando userId e token da URL
  const [loading, setLoading] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post(
        'http://localhost:5228/v1/identity/reset-password',
        { userId, token, newPassword },
        {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        }
      );

      setSuccess('Senha redefinida com sucesso.');
      setLoading(false);
      setTimeout(() => navigate('/login'), 5000); // Redireciona para a tela de login após 5 segundos
    } catch (error) {
      setError('Ocorreu um erro ao redefinir sua senha.');
      setOpen(true);
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
      }}
    >
      <Fade in={true} timeout={500}>
        <Paper elevation={3} sx={{ padding: 4, maxWidth: 400, width: '100%' }}>
          <Typography variant="h5" component="h1" gutterBottom align="center">
            Redefinir senha
          </Typography>

          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          <Collapse in={open}>
            <Alert
              severity="error"
              sx={{ mb: 2 }}
              onClose={() => setOpen(false)}
            >
              {error}
            </Alert>
          </Collapse>

          <form onSubmit={handleSubmit}>
            <TextField
              label="Nova senha"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              fullWidth
              margin="normal"
              required
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              sx={{ marginTop: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Redefinir senha'}
            </Button>
          </form>
        </Paper>
      </Fade>
    </Box>
  );
}

export default ResetPassword;
