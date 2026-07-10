import React, { useEffect, useRef, useState } from "react";
import AuthContext, { User } from "./AuthContext";
import {
  initializeMsal,
  loginWithMicrosoftRedirect,
  takePendingLoginRole,
} from "./msalInstance";
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
  const loginInProgress = useRef(false);

  const [rolePermissions, setRolePermissions] = useState<RolePermissionResponse[]>([]);
  const [userOverrides, setUserOverrides] = useState<UserAppOverrideResponse[]>([]);

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

  /** Exchanges an Azure ID token for an app session by calling the backend. */
  async function completeBackendLogin(role: string, azureToken: string) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        role,
        azure_token: azureToken,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        typeof data.detail === "string"
          ? data.detail
          : JSON.stringify(data)
      );
    }

    sessionStorage.setItem(TOKEN_KEY, data.access_token);

    const [rp, uo] = await Promise.all([
      accessService.getRolePermissions(),
      accessService.getUserOverrides(data.user.id),
    ]);

    setRolePermissions(rp);
    setUserOverrides(uo);

    setUser({
      id: data.user.id,
      name: data.user.display_name,
      email: data.user.email,
      role: data.user.role_id,
    });
  }

  useEffect(() => {
    async function initialize() {
      try {
        // First: check if this page load is the browser returning from
        // Microsoft's login redirect.
        const redirectResponse = await initializeMsal();

        if (redirectResponse?.idToken) {
          const pendingRole = takePendingLoginRole();

          if (pendingRole) {
            await completeBackendLogin(pendingRole, redirectResponse.idToken);
            setLoading(false);
            return;
          }
        }

        // Otherwise: normal restore-from-existing-session path.
        const token = sessionStorage.getItem(TOKEN_KEY);

        if (!token) {
          setLoading(false);
          return;
        }

        const response = await fetch(`${API_BASE_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Session expired.");
        }

        const me = await response.json();
        const role = me.role_id as UserRole;
        const userId = me.id;

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
        console.error("Login/restore failed:", err);
        sessionStorage.removeItem(TOKEN_KEY);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    initialize();
  }, []);

  async function login(role: string) {
    if (loginInProgress.current) {
      return;
    }

    loginInProgress.current = true;

    try {
      // This navigates the browser away to Microsoft's login page.
      // Nothing after this line runs until the app reloads on return.
      await loginWithMicrosoftRedirect(role);
    } catch (err) {
      loginInProgress.current = false;
      console.error(err);
      throw err;
    }
  }

  async function logout() {
    sessionStorage.removeItem(TOKEN_KEY);
    setUser(null);
    setRolePermissions([]);
    setUserOverrides([]);
  }

  function hasPermission(appId: string): boolean {
    if (!user) return false;

    const override = userOverrides.find(
      (o) => o.user_id === user.id && o.app_id.toLowerCase() === appId.toLowerCase()
    );
    if (override) {
      return override.override_type === "grant";
    }

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