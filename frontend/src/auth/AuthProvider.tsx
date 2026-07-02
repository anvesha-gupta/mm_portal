import React, { useEffect, useMemo, useState } from "react";
import AuthContext, { User } from "./AuthContext";
import AuthService from "./authService";
import { msalInstance } from "./msalInstance";

const TOKEN_KEY = "mm_auth_token";
const LEGACY_TOKEN_KEY = "token";
const APP_ENV = (import.meta.env.VITE_APP_ENV || "local").toLowerCase();
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

interface Props {
  children: React.ReactNode;
}

export function AuthProvider({ children }: Props) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  const auth = useMemo(() => new AuthService(msalInstance), []);

  useEffect(() => {
    async function init() {
      if (APP_ENV === "local") {
        const token = localStorage.getItem(TOKEN_KEY);
        if (token) {
          try {
            const response = await fetch(`${API_BASE_URL}/auth/me`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });
            if (response.ok) {
              const data = await response.json();
              setUser({
                id: data.id,
                name: data.display_name,
                email: data.email,
              });
            } else {
              localStorage.removeItem(TOKEN_KEY);
              localStorage.removeItem(LEGACY_TOKEN_KEY);
            }
          } catch (err) {
            console.error("Local auth init failed:", err);
          }
        }
        setLoading(false);
      } else {
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
          console.error("Auth init failed:", err);
        } finally {
          setLoading(false);
        }
      }
    }

    init();
  }, [auth]);

  // ✅ FIXED LOGIN (STRICT + CLEAN)
  async function login(username?: string, password?: string) {
    if (APP_ENV === "local") {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || "Login failed");
      }

      if (data.access_token) {
        localStorage.setItem(TOKEN_KEY, data.access_token);
        localStorage.setItem(LEGACY_TOKEN_KEY, data.access_token);
      }

      if (data.user) {
        setUser({
          id: data.user.id,
          name: data.user.display_name,
          email: data.user.email,
        });
      } else {
        const meRes = await fetch(`${API_BASE_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${data.access_token}`,
          },
        });
        if (meRes.ok) {
          const meData = await meRes.json();
          setUser({
            id: meData.id,
            name: meData.display_name,
            email: meData.email,
          });
        }
      }
    } else {
      await auth.login();
    }
  }

  async function logout() {
    if (APP_ENV !== "local") {
      await auth.logout();
    }
    setUser(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(LEGACY_TOKEN_KEY);
  }

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