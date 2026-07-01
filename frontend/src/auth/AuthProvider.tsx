import React, { useEffect, useMemo, useState } from "react";
import AuthContext, { User } from "./AuthContext";
import AuthService from "./authService";
import { msalInstance } from "./msalInstance";

const TOKEN_KEY = "mm_auth_token";
const LEGACY_TOKEN_KEY = "token";

interface Props {
  children: React.ReactNode;
}

export function AuthProvider({ children }: Props) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  const auth = useMemo(() => new AuthService(msalInstance), []);

  useEffect(() => {
    async function init() {
      try {
        await auth.initialize();

        const result = await auth.getUser();

        if (result?.account) {
          if (result.token) {
            localStorage.setItem(TOKEN_KEY, result.token);
            localStorage.setItem(LEGACY_TOKEN_KEY, result.token);
          }

          setUser({
            id: result.account.homeAccountId,
            name: result.account.name ?? "",
            email: result.account.username,
          });
        }
      } catch (err) {
        console.error("Auth init failed", err);
      } finally {
        setLoading(false);
      }
    }

    init();
  }, [auth]);

  const login = () => auth.login();

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(LEGACY_TOKEN_KEY);
    return auth.logout();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
