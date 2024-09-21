import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import { ThemeProvider, CssBaseline } from '@mui/material';
import Login from './Login';
import Register from './Register';
import Dashboard from './Dashboard';
import PrivateRoute from './PrivateRoute';
import TicketDetails from './TicketDetails';
import TicketCreate from './TicketCreate';
import TicketHistory from './TicketHistory';
import CategoryManagement from './CategoryManagement';
import Layout from './Layout';
import theme from './theme'; 
import TicketEdit from './TicketEdit';
import UserManagement from './UserManagement';
import ForgotPassword from './ForgotPassword';
import ResetPassword from './ResetPassword';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:userId/:token" element={<ResetPassword />} />

            {/* Rotas Privadas com Layout Moderno */}
            <Route
              path="/"
              element={
                <PrivateRoute
                  element={() => (
                    <Layout>
                      <Dashboard />
                    </Layout>
                  )}
                />
              }
            />
            <Route
              path="/tickets/new"
              element={
                <PrivateRoute
                  element={() => (
                    <Layout>
                      <TicketCreate />
                    </Layout>
                  )}
                />
              }
            />
            <Route
              path="/tickets/:id/edit"
              element={
                <PrivateRoute
                  element={() => (
                    <Layout>
                      <TicketEdit />
                    </Layout>
                  )}
                />
              }
            />
            <Route
              path="/tickets/:id"
              element={
                <PrivateRoute
                  element={() => (
                    <Layout>
                      <TicketDetails />
                    </Layout>
                  )}
                />
              }
            />
            <Route
              path="/historico"
              element={
                <PrivateRoute
                  element={() => (
                    <Layout>
                      <TicketHistory />
                    </Layout>
                  )}
                />
              }
            />
            <Route
              path="/categories"
              element={
                <PrivateRoute
                  element={() => (
                    <Layout>
                      <CategoryManagement />
                    </Layout>
                  )}
                />
              }
            />
            <Route
              path="/users"
              element={
                <PrivateRoute
                  element={() => (
                    <Layout>
                      <UserManagement />
                    </Layout>
                  )}
                  adminOnly={true}
                />
              }
            />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
