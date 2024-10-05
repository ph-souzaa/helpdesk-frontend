import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import {
  Box,
  TextField,
  Button,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
  Alert,
  Collapse,
  CircularProgress,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../components/AuthContext'; // Importe o contexto de autenticação

function TicketEdit() {
  const { id } = useParams();
  const { user } = useContext(AuthContext); // Obter o usuário logado e seus papéis
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [subcategoryId, setSubcategoryId] = useState('');
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [priority, setPriority] = useState('');
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const isAdmin = user.roles && user.roles.includes('Admin'); // Verificar se o usuário é Admin

  useEffect(() => {
    // Carregar os dados do ticket
    const fetchTicket = async () => {
      try {
        const response = await axios.get(
          isAdmin 
            ? `http://localhost:5228/v1/admin/${id}` 
            : `http://localhost:5228/v1/tickets/${id}`, // Use o endpoint correto baseado na role
          {
            withCredentials: true,
          }
        );

        const ticket = response.data;

        // Preencher os estados com os dados do ticket
        setTitle(ticket.data.title);
        setDescription(ticket.data.description);
        setCategoryId(ticket.data.categoryId);
        setSubcategoryId(ticket.data.subcategoryId);
        setPriority(ticket.data.priority);

        // Após carregar o ticket, buscar as subcategorias da categoria associada
        if (ticket.data.categoryId) {
          const selectedCategory = categories.find(
            (category) => category.id === ticket.data.categoryId
          );

          if (selectedCategory && selectedCategory.subcategories) {
            setSubcategories(selectedCategory.subcategories);
          }
        }

        setLoading(false); // Carregamento concluído
      } catch (error) {
        console.error('Erro ao buscar ticket:', error);
        setError('Erro ao carregar o ticket.');
        setOpen(true);
        setLoading(false); // Carregamento concluído com erro
      }
    };

    fetchTicket();
  }, [id, categories, isAdmin]); // Adicionamos `isAdmin` como dependência para definir o endpoint

  // Carregar as categorias e subcategorias
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        let allCategories = [];
        let pageNumber = 1;
        let totalPages = 1;

        while (pageNumber <= totalPages) {
          const response = await axios.get(
            `http://localhost:5228/v1/categories`,
            {
              params: {
                pageNumber: pageNumber,
                pageSize: 25,
              },
              withCredentials: true,
            }
          );
          allCategories = allCategories.concat(response.data.data);
          totalPages = response.data.totalPages;
          pageNumber++;
        }

        setCategories(allCategories);
      } catch (error) {
        console.error('Erro ao buscar categorias:', error);
      }
    };

    fetchCategories();
  }, []);

  // Limpar subcategoria selecionada ao mudar a categoria
  useEffect(() => {
    if (!categoryId) {
      setSubcategories([]);
      return;
    }

    const selectedCategory = categories.find(
      (category) => category.id === categoryId
    );

    if (selectedCategory && selectedCategory.subcategories) {
      setSubcategories(selectedCategory.subcategories);
    } else {
      setSubcategories([]);
    }
  }, [categoryId, categories]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !description || !categoryId || !subcategoryId || !priority) {
      setError('Por favor, preencha todos os campos obrigatórios.');
      setOpen(true);
      return;
    }

    try {
      // Usar o endpoint correto dependendo da role do usuário
      await axios.put(
        isAdmin 
          ? `http://localhost:5228/v1/admin/${id}` 
          : `http://localhost:5228/v1/tickets/${id}`, 
        {
          title,
          description,
          categoryId,
          subcategoryId,
          priority,
        },
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        }
      );

      navigate('/'); // Redirecionar para a listagem de tickets após a edição
    } catch (error) {
      console.error('Erro ao editar ticket:', error);
      setError('Falha ao editar o ticket. Tente novamente.');
      setOpen(true);
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

  return (
    <Box sx={{ padding: 2 }}>
      <Paper sx={{ padding: 2, maxWidth: 600, margin: '0 auto' }}>
        <Typography variant="h5" gutterBottom>
          Editar Ticket
        </Typography>

        <Collapse in={open}>
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setOpen(false)}>
            {error}
          </Alert>
        </Collapse>

        <form onSubmit={handleSubmit}>
          <FormControl fullWidth margin="normal" required>
            <InputLabel id="category-label">Categoria</InputLabel>
            <Select
              labelId="category-label"
              value={categoryId}
              label="Categoria"
              onChange={(e) => setCategoryId(e.target.value)}
            >
              {categories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth margin="normal" required>
            <InputLabel id="subcategory-label">Subcategoria</InputLabel>
            <Select
              labelId="subcategory-label"
              value={subcategoryId}
              label="Subcategoria"
              onChange={(e) => setSubcategoryId(e.target.value)}
              disabled={!categoryId || subcategories.length === 0}
            >
              {subcategories.map((subcategory) => (
                <MenuItem key={subcategory.id} value={subcategory.id}>
                  {subcategory.name}
                </MenuItem>
              ))}
            </Select>
            {!categoryId && (
              <Typography variant="body2" color="textSecondary">
                Selecione uma categoria primeiro.
              </Typography>
            )}
            {categoryId && subcategories.length === 0 && (
              <Typography variant="body2" color="textSecondary">
                Nenhuma subcategoria disponível para esta categoria.
              </Typography>
            )}
          </FormControl>

          <FormControl fullWidth margin="normal" required>
            <InputLabel id="priority-label">Prioridade</InputLabel>
            <Select
              labelId="priority-label"
              value={priority}
              label="Prioridade"
              onChange={(e) => setPriority(e.target.value)}
            >
              <MenuItem value={1}>Baixa</MenuItem>
              <MenuItem value={2}>Média</MenuItem>
              <MenuItem value={3}>Alta</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Título"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            fullWidth
            margin="normal"
            required
          />

          <TextField
            label="Descrição"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            margin="normal"
            multiline
            rows={4}
            required
          />

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ marginTop: 2 }}
          >
            Salvar Alterações
          </Button>
        </form>
      </Paper>
    </Box>
  );
}

export default TicketEdit;
