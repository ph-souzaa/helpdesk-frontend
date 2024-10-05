import React, { useState, useEffect } from 'react';
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
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

function TicketCreate() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [subcategoryId, setSubcategoryId] = useState('');
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [priority, setPriority] = useState('');
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Buscar todas as categorias com suas subcategorias
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

  useEffect(() => {
    // Limpar subcategoria selecionada ao mudar a categoria
    setSubcategoryId('');

    if (categoryId) {
      // Encontrar as subcategorias associadas à categoria selecionada
      const selectedCategory = categories.find(
        (category) => category.id === categoryId
      );
      if (selectedCategory) {
        setSubcategories(selectedCategory.subcategories);
      } else {
        setSubcategories([]);
      }
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
      await axios.post(
        'http://localhost:5228/v1/tickets',
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

      navigate('/');
    } catch (error) {
      console.error('Erro ao criar ticket:', error);
      setError('Falha ao criar o ticket. Tente novamente.');
      setOpen(true);
    }
  };

  return (
    <Box sx={{ padding: 2 }}>
      <Paper sx={{ padding: 2, maxWidth: 600, margin: '0 auto' }}>
        <Typography variant="h5" gutterBottom>
          Criar Novo Ticket
        </Typography>

        <Collapse in={open}>
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setOpen(false)}>
            {error}
          </Alert>
        </Collapse>

        <form onSubmit={handleSubmit}>
          {/* Categoria */}
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

          {/* Subcategoria */}
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

          {/* Prioridade */}
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

          {/* Título */}
          <TextField
            label="Título"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            fullWidth
            margin="normal"
            required
          />

          {/* Descrição */}
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
            Criar Ticket
          </Button>
        </form>
      </Paper>
    </Box>
  );
}

export default TicketCreate;
