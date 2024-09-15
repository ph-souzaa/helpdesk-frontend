import React, { useState, useContext } from 'react';
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
import { useNavigate, Navigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import { Fade } from '@mui/material';
import { CircularProgress } from '@mui/material';


function Login() {
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);

  if (user) {
    return <Navigate to="/" />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      await axios.post(
        'http://localhost:5228/v1/identity/login?useCookies=true',
        {
          email,
          password,
        },
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        }
      );

      const response = await axios.get('http://localhost:5228/v1/identity/me', {
        withCredentials: true,
      });
      setUser(response.data);
      setLoading(false);
      navigate('/');
    } catch (error) {
      console.error('Erro no login:', error);

      // Capturar mensagem de erro do backend
      let errorMessage = 'Falha no login. Verifique suas credenciais.';
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
            Login
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
            <TextField
              label="Senha"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Entrar'}
          </Button>
          </form>
          <Typography variant="body2" align="center" sx={{ marginTop: 2 }}>
            Não tem uma conta?{' '}
            <Link href="/register" underline="hover">
              Registre-se
            </Link>
          </Typography>
        </Paper>
      </Fade>
    </Box>
  );
}

export default Login;