import React, { useState } from 'react';
import axios from 'axios';
import {
  TextField,
  Button,
  Box,
  Typography,
  Link,
  Paper,
  Alert,
  Collapse,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Fade } from '@mui/material';
import { CircularProgress } from '@mui/material';

function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(''); // Campo para confirmar senha
  const [phone, setPhone] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [open, setOpen] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    // Verifica se as senhas coincidem
    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      setOpen(true);
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      setOpen(true);
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        'http://localhost:5228/v1/identity/register',
        {
          nome: name,
          email,
          celular: phone,
          password,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        }
      );

      if (response.status === 200) {
        setSuccess('Usuário registrado com sucesso. Verifique seu email para confirmação.');
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }

      setLoading(false);
    } catch (error) {
      console.error('Erro no registro:', error);

      let errorMessage = 'Falha no registro. Verifique os dados e tente novamente.';
      if (error.response && error.response.data) {
        errorMessage = error.response.data.message || errorMessage;
      }

      setError(errorMessage);
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
            Registro
          </Typography>

          <Collapse in={open}>
            <Alert
              severity="error"
              sx={{ mb: 2 }}
              onClose={() => setOpen(false)}
            >
              {error}
            </Alert>
          </Collapse>

          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              label="Nome"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Celular"
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="E-mail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Senha"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
              margin="normal"
              required
              helperText="A senha deve ter pelo menos 6 caracteres."
            />
            <TextField
              label="Confirmar Senha"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              fullWidth
              margin="normal"
              required
              helperText="Confirme sua senha."
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              sx={{ marginTop: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Registrar'}
            </Button>
          </form>

          <Typography variant="body2" align="center" sx={{ marginTop: 2 }}>
            Já tem uma conta?{' '}
            <Link href="/login" underline="hover">
              Faça login
            </Link>
          </Typography>
        </Paper>
      </Fade>
    </Box>
  );
}

export default Register;
