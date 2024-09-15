import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';

const PrivateRoute = ({ element: Component, adminOnly = false, ...rest }) => {
  const { user } = useContext(AuthContext);

  if (user === undefined) {
    return <div>Carregando...</div>;
  }

  if (user === null) {
    return <Navigate to="/login" />;
  }

  if (adminOnly && !(user.roles && user.roles.includes('Admin'))) {
    return <Navigate to="/" />;
  }

  return <Component {...rest} />;
};

export default PrivateRoute;
