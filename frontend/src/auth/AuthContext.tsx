import { createContext } from "react";

export interface User {
  id: string;
  name: string;
  email: string;

  // Current logged-in role
  role: "employee" | "finance" | "hr" | "admin";
}

export interface AuthContextType {
  user: User | null;

  isAuthenticated: boolean;

  loading: boolean;

  login: (role: string) => Promise<void>;

  logout: () => Promise<void>;

  hasPermission: (appId: string) => boolean;

  refreshPermissions: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export default AuthContext;