import React from "react";
import { Navigate } from "react-router";
import { useData, UserRole } from "../context/DataContext";

interface RequireAuthProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const RequireAuth: React.FC<RequireAuthProps> = ({
  children,
  allowedRoles,
}) => {
  const { currentUser, authInitialized } = useData();

  if (!authInitialized) {
    return null;
  }

  if (!currentUser) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    return (
      <Navigate
        to={currentUser.role === "student" ? "/student" : "/admin"}
        replace
      />
    );
  }

  return <>{children}</>;
};
