import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Box,
  Button,
  TextField,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
  CircularProgress,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Divider,
} from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';

function CategoryManagement() {
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newCategory, setNewCategory] = useState('');
  const [newSubcategory, setNewSubcategory] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [slaResponseTime, setSlaResponseTime] = useState('00:00:00');
  const [slaResolutionTime, setSlaResolutionTime] = useState('00:00:00');
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingSubcategory, setEditingSubcategory] = useState(null);

  // Recuperar todas as categorias e subcategorias na montagem
  useEffect(() => {
    const fetchCategoriesAndSubcategories = async () => {
      try {
        const categoryResponse = await axios.get('http://localhost:5228/v1/categories', {
          withCredentials: true,
        });
        const subcategoryResponse = await axios.get('http://localhost:5228/v1/subcategories', {
          withCredentials: true,
        });
        setCategories(categoryResponse.data.data || []);
        setSubcategories(subcategoryResponse.data.data || []);
      } catch (error) {
        console.error('Erro ao buscar categorias e subcategorias:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoriesAndSubcategories();
  }, []);

  // Função para criar uma nova categoria
  const handleCreateCategory = async () => {
    if (!newCategory) return;

    try {
      const response = await axios.post(
        'http://localhost:5228/v1/categories',
        { name: newCategory },
        { withCredentials: true }
      );
      setCategories((prev) => [...prev, response.data.data]);
      setNewCategory('');
    } catch (error) {
      console.error('Erro ao criar categoria:', error);
    }
  };

  // Função para criar uma nova subcategoria
  const handleCreateSubcategory = async () => {
    if (!newSubcategory || !selectedCategory) return;

    try {
      const response = await axios.post(
        'http://localhost:5228/v1/subcategories',
        {
          name: newSubcategory,
          categoryId: selectedCategory,
          slaResponseTime,
          slaResolutionTime,
        },
        { withCredentials: true }
      );
      setSubcategories((prev) => [...prev, response.data.data]);
      setNewSubcategory('');
      setSelectedCategory(null);
      setSlaResponseTime('00:00:00');
      setSlaResolutionTime('00:00:00');
    } catch (error) {
      console.error('Erro ao criar subcategoria:', error);
    }
  };

  // Função para editar uma categoria
  const handleEditCategory = async (category) => {
    if (!editingCategory) return;

    try {
      await axios.put(
        `http://localhost:5228/v1/categories/${category.id}`,
        { name: editingCategory },
        { withCredentials: true }
      );
      setCategories((prev) =>
        prev.map((cat) =>
          cat.id === category.id ? { ...cat, name: editingCategory } : cat
        )
      );
      setEditingCategory(null);
    } catch (error) {
      console.error('Erro ao editar categoria:', error);
    }
  };

  // Função para editar uma subcategoria
  const handleEditSubcategory = async (subcategory) => {
    if (!editingSubcategory) return;

    try {
      await axios.put(
        `http://localhost:5228/v1/subcategories/${subcategory.id}`,
        { name: editingSubcategory },
        { withCredentials: true }
      );
      setSubcategories((prev) =>
        prev.map((sub) =>
          sub.id === subcategory.id ? { ...sub, name: editingSubcategory } : sub
        )
      );
      setEditingSubcategory(null);
    } catch (error) {
      console.error('Erro ao editar subcategoria:', error);
    }
  };

  // Função para deletar uma categoria
  const handleDeleteCategory = async (categoryId) => {
    try {
      await axios.delete(`http://localhost:5228/v1/categories/${categoryId}`, {
        withCredentials: true,
      });
      setCategories((prev) => prev.filter((cat) => cat.id !== categoryId));
    } catch (error) {
      console.error('Erro ao deletar categoria:', error);
    }
  };

  // Função para deletar uma subcategoria
  const handleDeleteSubcategory = async (subcategoryId) => {
    try {
      await axios.delete(`http://localhost:5228/v1/subcategories/${subcategoryId}`, {
        withCredentials: true,
      });
      setSubcategories((prev) => prev.filter((sub) => sub.id !== subcategoryId));
    } catch (error) {
      console.error('Erro ao deletar subcategoria:', error);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ padding: 4, maxWidth: '1200px', margin: 'auto' }}>
      <Typography variant="h4" gutterBottom textAlign="center">
        Gerenciamento de Categorias e Subcategorias
      </Typography>

      {/* Formulário de Criação de Categoria */}
      <Paper sx={{ padding: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Criar Nova Categoria
        </Typography>
        <TextField
          label="Nome da Categoria"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          fullWidth
          margin="normal"
        />
        <Button variant="contained" onClick={handleCreateCategory}>
          Criar Categoria
        </Button>
      </Paper>

      {/* Formulário de Criação de Subcategoria */}
      <Paper sx={{ padding: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Criar Nova Subcategoria
        </Typography>
        <TextField
          label="Nome da Subcategoria"
          value={newSubcategory}
          onChange={(e) => setNewSubcategory(e.target.value)}
          fullWidth
          margin="normal"
        />
        <FormControl fullWidth margin="normal">
          <InputLabel id="category-select-label">Selecionar Categoria</InputLabel>
          <Select
            labelId="category-select-label"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map((category) => (
              <MenuItem key={category.id} value={category.id}>
                {category.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          label="SLA Response Time"
          value={slaResponseTime}
          onChange={(e) => setSlaResponseTime(e.target.value)}
          fullWidth
          margin="normal"
        />
        <TextField
          label="SLA Resolution Time"
          value={slaResolutionTime}
          onChange={(e) => setSlaResolutionTime(e.target.value)}
          fullWidth
          margin="normal"
        />
        <Button variant="contained" onClick={handleCreateSubcategory}>
          Criar Subcategoria
        </Button>
      </Paper>

      <Divider />

      {/* Listagem de Categorias */}
      <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
        Categorias
      </Typography>
      <Table sx={{ mb: 4 }}>
        <TableHead>
          <TableRow>
            <TableCell>Nome</TableCell>
            <TableCell>Ações</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {categories.map((category) => (
            <TableRow key={category.id}>
              <TableCell>
                {editingCategory === category.id ? (
                  <TextField
                    value={editingCategory}
                    onChange={(e) => setEditingCategory(e.target.value)}
                    fullWidth
                  />
                ) : (
                  category.name
                )}
              </TableCell>
              <TableCell>
                <IconButton onClick={() => handleDeleteCategory(category.id)}>
                  <Delete />
                </IconButton>
                <IconButton onClick={() => handleEditCategory(category)}>
                  <Edit />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Listagem de Subcategorias */}
      <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
        Subcategorias
      </Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Nome</TableCell>
            <TableCell>Categoria</TableCell>
            <TableCell>Ações</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {subcategories.map((subcategory) => (
            <TableRow key={subcategory.id}>
              <TableCell>
                {editingSubcategory === subcategory.id ? (
                  <TextField
                    value={editingSubcategory}
                    onChange={(e) => setEditingSubcategory(e.target.value)}
                    fullWidth
                  />
                ) : (
                  subcategory.name
                )}
              </TableCell>
              <TableCell>
                {categories.find((cat) => cat.id === subcategory.categoryId)?.name || 'Desconhecido'}
              </TableCell>
              <TableCell>
                <IconButton onClick={() => handleDeleteSubcategory(subcategory.id)}>
                  <Delete />
                </IconButton>
                <IconButton onClick={() => handleEditSubcategory(subcategory)}>
                  <Edit />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}

export default CategoryManagement;
