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
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import { Fade } from '@mui/material';
import { CircularProgress } from '@mui/material';


function Register() {
    const { setUser } = useContext(AuthContext);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

  
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
  
    const [error, setError] = useState('');
    const [open, setOpen] = useState(false);
  
    const handleSubmit = async (e) => {
      e.preventDefault();

      setLoading(true);
  
      if (password.length < 6) {
        setError('A senha deve ter pelo menos 6 caracteres.');
        setOpen(true);
        return;
      }
  
      try {
        await axios.post(
          'http://localhost:5228/v1/identity/register',
          {
            email,
            password,
          },
          {
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
          }
        );
  
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
                helperText="A senha deve ter pelo menos 6 caracteres."
                />
            <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ marginTop: 2 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Register'}
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
  