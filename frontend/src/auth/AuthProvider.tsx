import React, { useEffect, useState } from "react";
import AuthContext, { User } from "./AuthContext";
import { accessService, RolePermissionResponse, UserAppOverrideResponse } from "../services/accessService";

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
  
  // Permission system states
  const [rolePermissions, setRolePermissions] = useState<RolePermissionResponse[]>([]);
  const [userOverrides, setUserOverrides] = useState<UserAppOverrideResponse[]>([]);

  // Function to refresh permissions dynamically from storage/database
  async function refreshPermissions(userId?: string, roleId?: string) {
    const targetUserId = userId || user?.id;
    const targetRoleId = roleId || user?.role;
    
    if (!targetUserId || !targetRoleId) {
      setRolePermissions([]);
      setUserOverrides([]);
      return;
    }

    try {
      const [rp, uo] = await Promise.all([
        accessService.getRolePermissions(),
        accessService.getUserOverrides(targetUserId),
      ]);
      setRolePermissions(rp);
      setUserOverrides(uo);
    } catch (err) {
      console.error("Failed to load permissions:", err);
    }
  }

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
        const role = me.role_id as UserRole;
        const userId = me.id;

        // Load permissions BEFORE setting user and loading state
        // to prevent route guard authorization race conditions
        const [rp, uo] = await Promise.all([
          accessService.getRolePermissions(),
          accessService.getUserOverrides(userId),
        ]);
        
        setRolePermissions(rp);
        setUserOverrides(uo);

        setUser({
          id: userId,
          name: me.display_name,
          email: me.email,
          role: role,
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

  async function login(role: string) {
    try {
      const inputRole = role as UserRole;
      const response = await fetch(
        `${API_BASE_URL}/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            role: inputRole,
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

      const userId = data.user.id;
      const userRole = data.user.role_id as UserRole;

      // Load permissions for this user before setting the user context
      const [rp, uo] = await Promise.all([
        accessService.getRolePermissions(),
        accessService.getUserOverrides(userId),
      ]);
      
      setRolePermissions(rp);
      setUserOverrides(uo);

      setUser({
        id: userId,
        name: data.user.display_name,
        email: data.user.email,
        role: userRole,
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
    setRolePermissions([]);
    setUserOverrides([]);
  }

  // =====================================================
  // PERMISSION ENGINE: User Override -> Role Permissions
  // =====================================================

  function hasPermission(appId: string): boolean {
    if (!user) return false;

    // 1. User Override Precedence
    const override = userOverrides.find(
      (o) => o.user_id === user.id && o.app_id.toLowerCase() === appId.toLowerCase()
    );
    if (override) {
      return override.override_type === "grant";
    }

    // 2. Role Permissions Precedence
    return rolePermissions.some(
      (rp) =>
        rp.role_id.toLowerCase() === user.role.toLowerCase() &&
        rp.app_id.toLowerCase() === appId.toLowerCase()
    );
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        logout,
        hasPermission,
        refreshPermissions: () => refreshPermissions(),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}