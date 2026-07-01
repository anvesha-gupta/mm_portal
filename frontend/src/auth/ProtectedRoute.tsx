import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import useAuth from "./useAuth";

const ProtectedRoute = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div />;

  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;

  return <Outlet />;
};

export default ProtectedRoute;
