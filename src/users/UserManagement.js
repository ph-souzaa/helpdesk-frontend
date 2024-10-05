import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Box, Typography, Checkbox, Table, TableBody, TableCell, TableHead, TableRow, Paper, MenuItem, Select, FormControl, InputLabel, TablePagination, CircularProgress, Snackbar, Alert, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../components/AuthContext';

const UserManagement = () => {
  const { user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [selectedRoles, setSelectedRoles] = useState({});
  const [filteredRole, setFilteredRole] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [loading, setLoading] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarType, setSnackbarType] = useState('success');
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const roles = ['Admin', 'Atendente', 'Usuario'];
  const navigate = useNavigate();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5228/v1/identity/users', { withCredentials: true });
      setUsers(response.data);
      const initialRoles = {};
      response.data.forEach(user => {
        initialRoles[user.email] = user.roles.reduce((acc, role) => {
          acc[role] = true;
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
        withCredentials: true,
      });

      setSnackbarMessage(`Role ${action === 'add' ? 'adicionada' : 'removida'} com sucesso para o usuário ${userEmail}`);
      setSnackbarType('success');
      fetchUsers();
    } catch (error) {
      console.error('Erro ao alterar a role', error);
      if (error.response && error.response.data) {
        setSnackbarMessage(error.response.data);
        if (error.response.data.includes("Não é possível remover a role 'Atendente'")) {
          setTimeout(() => {
            navigate('/');
          }, 3000);
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

  // Função para bloquear um usuário
  const blockUser = async (userId, isPermanent = false, lockoutDurationMinutes = 0) => {
    setLoading(true);
    try {
      const payload = {
        userId: userId,
        isPermanent: isPermanent,
        lockoutDurationMinutes: lockoutDurationMinutes,
      };
  
      await axios.post('http://localhost:5228/v1/identity/block-user', payload, {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        withCredentials: true,  // Se estiver usando autenticação com cookies, mantenha isso
      });
  
      setSnackbarMessage(isPermanent ? 'Usuário bloqueado permanentemente.' : `Usuário bloqueado por ${lockoutDurationMinutes} minutos.`);
      setSnackbarType('success');
      fetchUsers();  // Atualiza a lista de usuários
    } catch (error) {
      console.error('Erro ao bloquear o usuário', error);
      setSnackbarMessage('Erro ao bloquear o usuário');
      setSnackbarType('error');
    } finally {
      setLoading(false);
      setOpenSnackbar(true);
    }
  };

  // Função para desbloquear um usuário
  const unblockUser = async (userId) => {
    setLoading(true);
    try {
      const payload = { userId: userId };

      await axios.post('http://localhost:5228/v1/identity/unblock-user', payload, {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        withCredentials: true,
      });

      setSnackbarMessage('Usuário desbloqueado com sucesso.');
      setSnackbarType('success');
      fetchUsers();  // Atualiza a lista de usuários
    } catch (error) {
      console.error('Erro ao desbloquear o usuário', error);
      setSnackbarMessage('Erro ao desbloquear o usuário');
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

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterChange = (event) => {
    setFilteredRole(event.target.value);
  };

  const filteredUsers = filteredRole
    ? users.filter(user => user.roles.includes(filteredRole))
    : users;

  const paginatedUsers = filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const isUserBlocked = (user) => {
    return user.lockoutEnd && new Date(user.lockoutEnd) > new Date();
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Gerenciamento de Usuários
      </Typography>

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
                <TableCell>Ações</TableCell> {/* Coluna para ações, como bloquear/desbloquear */}
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
                  <TableCell>
                    {isUserBlocked(user) ? (
                      <Button
                        variant="contained"
                        color="success"
                        onClick={() => unblockUser(user.id)}  // Desbloqueia o usuário
                        disabled={loading}
                      >
                        Desbloquear
                      </Button>
                    ) : (
                      <>
                        <Button
                          variant="contained"
                          color="secondary"
                          onClick={() => blockUser(user.id, true)} // Bloqueia o usuário permanentemente
                          disabled={loading}
                        >
                          Bloquear
                        </Button>
                        <Button
                          variant="contained"
                          color="warning"
                          onClick={() => blockUser(user.id, false, 60)} // Bloqueia o usuário por 60 minutos
                          disabled={loading}
                          sx={{ ml: 1 }}
                        >
                          Bloquear por 60 min
                        </Button>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        <TablePagination
          component="div"
          count={filteredUsers.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

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
