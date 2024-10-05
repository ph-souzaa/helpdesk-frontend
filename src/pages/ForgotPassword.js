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
import { useNavigate } from 'react-router-dom';
import { Fade } from '@mui/material';
import { CircularProgress } from '@mui/material';

function ForgotPassword() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post(
        'http://localhost:5228/v1/identity/forgot-password',
        { email },
        {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        }
      );

      setSuccess('Se um usuário com esse email existir, um link de redefinição de senha será enviado.');
      setLoading(false);
      setTimeout(() => navigate('/login'), 5000); // Redireciona para a tela de login após 5 segundos
    } catch (error) {
      setError('Ocorreu um erro ao tentar enviar o link de redefinição de senha.');
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
            Esqueceu sua senha?
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
              label="E-mail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Enviar'}
            </Button>
          </form>
        </Paper>
      </Fade>
    </Box>
  );
}

export default ForgotPassword;
