import React, { useEffect, useState } from "react";
import AuthContext, { User } from "./AuthContext";

const TOKEN_KEY = "mm_auth_token";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://127.0.0.1:8000";

type UserRole =
  | "employee"
  | "finance"
  | "hr"
  | "admin";

interface Props {
  children: React.ReactNode;
}

export function AuthProvider({ children }: Props) {
  const [loading, setLoading] = useState(true);

  const [user, setUser] = useState<User | null>(null);

  // =====================================================
  // RESTORE LOGIN
  // =====================================================

  useEffect(() => {
    async function initialize() {
      const token = sessionStorage.getItem(TOKEN_KEY);

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${API_BASE_URL}/auth/me`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Session expired.");
        }

        const me = await response.json();

        setUser({
          id: me.id,
          name: me.display_name,
          email: me.email,
          role: me.role_id as UserRole,
        });
      } catch (err) {
        console.error("Restore login failed:", err);

        sessionStorage.removeItem(TOKEN_KEY);

        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    initialize();
  }, []);

  // =====================================================
  // LOGIN
  // =====================================================

  async function login(role: UserRole) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/auth/login`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            role,
          }),
        }
      );

      const data = await response.json();

      console.log("LOGIN RESPONSE:", data);

      if (!response.ok) {
        throw new Error(
           typeof data.detail === "string"
             ? data.detail
             : JSON.stringify(data, null, 2)
         );
         }

      sessionStorage.setItem(
        TOKEN_KEY,
        data.access_token
      );

      setUser({
        id: data.user.id,
        name: data.user.display_name,
        email: data.user.email,
        role: data.user.role_id as UserRole,
      });
    } catch (err: any) {
      console.error("LOGIN ERROR:", err);

      if (err instanceof Error) {
        throw err;
      }

      throw new Error(
        typeof err === "string"
          ? err
          : "Unable to sign in."
      );
    }
  }

  // =====================================================
  // LOGOUT
  // =====================================================

  async function logout() {
    sessionStorage.removeItem(TOKEN_KEY);

    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}