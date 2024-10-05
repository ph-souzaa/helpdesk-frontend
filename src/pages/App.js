import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../components/AuthContext';
import { ThemeProvider, CssBaseline } from '@mui/material';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Dashboard from '../pages//Dashboard';
import PrivateRoute from '../components/PrivateRoute';
import TicketDetails from '../tickets/TicketDetails';
import TicketCreate from '../tickets/TicketCreate';
import TicketHistory from '../tickets/TicketHistory';
import TicketEdit from '../tickets/TicketEdit';
import CategoryManagement from '../categories/CategoryManagement';
import Layout from '../components/Layout';
import theme from '../styles/theme'; 
import UserManagement from '../users/UserManagement';
import ForgotPassword from '../pages/ForgotPassword';
import ResetPassword from '../pages/ResetPassword';

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
