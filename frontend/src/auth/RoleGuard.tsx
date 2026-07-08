import { Navigate, useLocation } from "react-router-dom";
import useAuth from "./useAuth";

interface Props {
  children: JSX.Element;
  appId: string;
}

export default function RoleGuard({
  children,
  appId,
}: Props) {
  const { user, loading, hasPermission } = useAuth();

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

  if (!hasPermission(appId)) {
    return (
      <Navigate
        to="/dashboard"
        replace
      />
    );
  }

  return children;
}