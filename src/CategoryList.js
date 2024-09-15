import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';

function CategoryList() {
  const [categories, setCategories] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [categoryName, setCategoryName] = useState('');
  const [editCategoryId, setEditCategoryId] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('http://localhost:5228/v1/categories', {
        withCredentials: true,
      });
      setCategories(response.data);
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
    }
  };

  const handleOpenDialog = (category = null) => {
    if (category) {
      setCategoryName(category.name);
      setEditCategoryId(category.id);
    } else {
      setCategoryName('');
      setEditCategoryId(null);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCategoryName('');
    setEditCategoryId(null);
  };

  const handleSaveCategory = async () => {
    try {
      if (editCategoryId) {
        // Atualizar categoria existente
        await axios.put(
          `http://localhost:5228/v1/categories/${editCategoryId}`,
          { name: categoryName },
          { withCredentials: true }
        );
      } else {
        // Criar nova categoria
        await axios.post(
          'http://localhost:5228/v1/categories',
          { name: categoryName },
          { withCredentials: true }
        );
      }
      fetchCategories();
      handleCloseDialog();
    } catch (error) {
      console.error('Erro ao salvar categoria:', error);
    }
  };

  const handleDeleteCategory = async (id) => {
    try {
      await axios.delete(`http://localhost:5228/v1/categories/${id}`, {
        withCredentials: true,
      });
      fetchCategories();
    } catch (error) {
      console.error('Erro ao deletar categoria:', error);
    }
  };

  return (
    <Box sx={{ padding: 2 }}>
      <Typography variant="h5" gutterBottom>
        Gerenciar Categorias
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={() => handleOpenDialog()}
        sx={{ marginBottom: 2 }}
      >
        Nova Categoria
      </Button>
      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Nome</TableCell>
              <TableCell>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {categories.map((category) => (
              <TableRow key={category.id}>
                <TableCell>{category.id}</TableCell>
                <TableCell>{category.name}</TableCell>
                <TableCell>
                  <Button
                    onClick={() => handleOpenDialog(category)}
                    color="primary"
                  >
                    Editar
                  </Button>
                  <Button
                    onClick={() => handleDeleteCategory(category.id)}
                    color="secondary"
                  >
                    Excluir
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>
          {editCategoryId ? 'Editar Categoria' : 'Nova Categoria'}
        </DialogTitle>
        <DialogContent>
          <TextField
            label="Nome da Categoria"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            fullWidth
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleSaveCategory} variant="contained" color="primary">
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default CategoryList;
