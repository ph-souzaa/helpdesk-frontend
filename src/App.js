import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import Login from './Login';
import Register from './Register';
import Dashboard from './Dashboard';
import PrivateRoute from './PrivateRoute';
import TicketDetails from './TicketDetails';
import TicketCreate from './TicketCreate';
import CategoryList from './CategoryList';
import TicketHistory from './TicketHistory';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<PrivateRoute element={Dashboard} />} />
          <Route path="/tickets/new" element={<PrivateRoute element={TicketCreate} />} />
          <Route path="/tickets/:id" element={<PrivateRoute element={TicketDetails} />}  />
          <Route path="/historico" element={<TicketHistory />} />
          <Route path="/categories" element={<PrivateRoute element={CategoryList} adminOnly={true} />
          }
          
  />
          
        </Routes>
      </Router>
    </AuthProvider>
  );
}


export default App;
