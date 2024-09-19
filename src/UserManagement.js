import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Box, Typography, Checkbox, Table, TableBody, TableCell, TableHead, TableRow, Paper, MenuItem, Select, FormControl, InputLabel, TablePagination, CircularProgress, Snackbar, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom'; // Importa o useNavigate
import { AuthContext } from './AuthContext';

const UserManagement = () => {
  const { user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [selectedRoles, setSelectedRoles] = useState({}); // Armazena as roles selecionadas por usuário
  const [filteredRole, setFilteredRole] = useState(''); // Armazena o filtro de role
  const [page, setPage] = useState(0); // Estado da página atual
  const [rowsPerPage, setRowsPerPage] = useState(5); // Quantidade de usuários por página
  const [loading, setLoading] = useState(false); // Estado de carregamento
  const [snackbarMessage, setSnackbarMessage] = useState(''); // Armazena a mensagem do snackbar
  const [snackbarType, setSnackbarType] = useState('success'); // Tipo de mensagem no snackbar ('success', 'error')
  const [openSnackbar, setOpenSnackbar] = useState(false); // Estado do snackbar

  const roles = ['Admin', 'Atendente', 'Usuario']; // Roles disponíveis
  const navigate = useNavigate(); // Instancia o hook useNavigate

  // Função para buscar os usuários
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5228/v1/identity/users', { withCredentials: true });
      setUsers(response.data);
      // Inicializa o estado selectedRoles com as roles atuais de cada usuário
      const initialRoles = {};
      response.data.forEach(user => {
        initialRoles[user.email] = user.roles.reduce((acc, role) => {
          acc[role] = true; // Marca as roles já atribuídas como true
          return acc;
        }, {});
      });
      setSelectedRoles(initialRoles);
    } catch (error) {
      console.error('Erro ao buscar os usuários', error);
      setSnackbarMessage('Erro ao carregar os usuários');
      setSnackbarType('error');
      setOpenSnackbar(true);
    } finally {
      setLoading(false);
    }
  };

  const changeUserRole = async (userEmail, roleName, action) => {
    setLoading(true);
    try {
      const payload = {
        userEmail: userEmail,
        roleName: roleName,
        action: action,
      };
      await axios.post('http://localhost:5228/v1/identity/roles/assign', payload, {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        withCredentials: true,  // Inclui cookies de sessão na requisição
      });

      setSnackbarMessage(`Role ${action === 'add' ? 'adicionada' : 'removida'} com sucesso para o usuário ${userEmail}`);
      setSnackbarType('success');
      fetchUsers(); // Recarrega a lista de usuários após a alteração de role
    } catch (error) {
      console.error('Erro ao alterar a role', error);
      if (error.response && error.response.data) {
        setSnackbarMessage(error.response.data); // Exibe a mensagem de erro personalizada do backend
        // Verifica se é o erro específico de não poder remover a role 'Atendente'
        if (error.response.data.includes("Não é possível remover a role 'Atendente'")) {
          setTimeout(() => {
            navigate('/'); // Redireciona para a tela principal após mostrar a mensagem
          }, 3000); // Aguarda 3 segundos antes de redirecionar
        }
      } else {
        setSnackbarMessage('Erro ao alterar a role');
      }
      setSnackbarType('error');
    } finally {
      setLoading(false);
      setOpenSnackbar(true);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = (email, role) => {
    const isRoleAssigned = selectedRoles[email]?.[role] || false;

    setSelectedRoles(prevRoles => ({
      ...prevRoles,
      [email]: {
        ...prevRoles[email],
        [role]: !isRoleAssigned,
      },
    }));

    const action = isRoleAssigned ? 'remove' : 'add';
    changeUserRole(email, role, action);
  };

  // Função para lidar com a mudança de página
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Função para lidar com a mudança de itens por página
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Volta para a primeira página quando muda a quantidade de itens por página
  };

  // Função para filtrar usuários por role
  const handleFilterChange = (event) => {
    setFilteredRole(event.target.value);
  };

  // Filtra os usuários de acordo com a role selecionada
  const filteredUsers = filteredRole
    ? users.filter(user => user.roles.includes(filteredRole))
    : users;

  // Pagina os usuários filtrados
  const paginatedUsers = filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Gerenciamento de Usuários
      </Typography>

      {/* Filtro por Role */}
      <FormControl sx={{ mb: 2, minWidth: 200 }}>
        <InputLabel id="role-filter-label">Filtrar por Role</InputLabel>
        <Select
          labelId="role-filter-label"
          value={filteredRole}
          onChange={handleFilterChange}
          label="Filtrar por Role"
        >
          <MenuItem value="">Todos</MenuItem>
          {roles.map((role) => (
            <MenuItem key={role} value={role}>
              {role}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Paper>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Email</TableCell>
                <TableCell>Nome</TableCell>
                <TableCell>Roles</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedUsers.map((user) => (
                <TableRow key={user.email}>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>
                    {roles.map((role) => (
                      <Box key={role} sx={{ display: 'flex', alignItems: 'center' }}>
                        <Checkbox
                          checked={selectedRoles[user.email]?.[role] || false}
                          onChange={() => handleRoleChange(user.email, role)}
                        />
                        <Typography>{role}</Typography>
                      </Box>
                    ))}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {/* Paginação */}
        <TablePagination
          component="div"
          count={filteredUsers.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* Snackbar para mostrar mensagens de sucesso ou erro */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={() => setOpenSnackbar(false)}
      >
        <Alert onClose={() => setOpenSnackbar(false)} severity={snackbarType} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UserManagement;
