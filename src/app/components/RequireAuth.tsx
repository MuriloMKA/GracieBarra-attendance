import React from 'react';
import { Navigate } from 'react-router';
import { useData, UserRole } from '../context/DataContext';

interface RequireAuthProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const RequireAuth: React.FC<RequireAuthProps> = ({ children, allowedRoles }) => {
  const { currentUser } = useData();

  if (!currentUser) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    return <Navigate to={currentUser.role === 'admin' ? '/admin' : '/student'} replace />;
  }

  return <>{children}</>;
};
