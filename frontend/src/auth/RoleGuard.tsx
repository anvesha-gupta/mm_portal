import { Navigate, useLocation } from "react-router-dom";
import useAuth from "./useAuth";

interface Props {
  children: JSX.Element;
  roles: string[];
}

export default function RoleGuard({
  children,
  roles,
}: Props) {
  const { user, loading } = useAuth();

  const location = useLocation();

  if (loading) {
    return null;
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location,
        }}
      />
    );
  }

  if (!roles.includes(user.role)) {
    return (
      <Navigate
        to="/dashboard"
        replace
      />
    );
  }

  return children;
}