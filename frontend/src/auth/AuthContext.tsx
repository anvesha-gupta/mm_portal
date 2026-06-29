import React, { createContext, useContext, useEffect, useState } from 'react';

// Strongly-typed user model for the application
export interface User {
	id: string;
	name: string;
	email: string;
	roles?: string[]; // e.g. ['employee', 'admin']
	groups?: string[]; // AD groups or other group identifiers
}

// Shape of the authentication context exposed to consumers
export interface AuthContextType {
	user: User | null;
	isAuthenticated: boolean;
	loading: boolean;
	/**
	 * Initiates a login flow. Placeholder: implement Azure AD (MSAL) logic later.
	 * Keep this async so upstream code can await redirects/handshakes once implemented.
	 */
	login: () => Promise<void>;
	/**
	 * Logs the current user out. Placeholder: implement Azure AD sign-out later.
	 */
	logout: () => Promise<void>;
}

// Safe defaults for the context so consumers can call functions without null checks
const defaultAuthContext: AuthContextType = {
	user: null,
	isAuthenticated: false,
	loading: false,
	login: async () => {
		// TODO: Implement Azure AD login using MSAL here.
		// Example: use msalInstance.loginRedirect() or loginPopup(), then fetch profile and setUser.
		return Promise.resolve();
	},
	logout: async () => {
		// TODO: Implement Azure AD logout using MSAL here.
		// Example: use msalInstance.logoutRedirect() and clear local session data.
		return Promise.resolve();
	},
};

export const AuthContext = createContext<AuthContextType>(defaultAuthContext);

interface AuthProviderProps {
	children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState<boolean>(true);

	useEffect(() => {
		// Restore session from localStorage if present. This is a lightweight client-side
		// session restoration so the UI doesn't flash unauthenticated states during navigation.
		const raw = localStorage.getItem('mm_user');
		if (raw) {
			try {
				const parsed: User = JSON.parse(raw);
				setUser(parsed);
			} catch (e) {
				// If parsing fails, clear the stored value to avoid repeated errors
				localStorage.removeItem('mm_user');
			}
		}
		setLoading(false);
	}, []);

	const login = async () => {
		setLoading(true);
		try {
			// TODO: Replace with real Azure AD / MSAL login flow. After successful login,
			// populate `user` with values from the ID token / graph, e.g.:
			// const account = msalInstance.getActiveAccount();
			// setUser({ id: account.homeAccountId, name: account.name, email: account.username, roles: [...], groups: [...] });
			// localStorage.setItem('mm_user', JSON.stringify(user));

			// Placeholder: no-op until MSAL is integrated.
			return Promise.resolve();
		} finally {
			setLoading(false);
		}
	};

	const logout = async () => {
		setLoading(true);
		try {
			// TODO: Replace with real Azure AD sign-out. Example:
			// await msalInstance.logoutRedirect();
			setUser(null);
			localStorage.removeItem('mm_user');
			return Promise.resolve();
		} finally {
			setLoading(false);
		}
	};

	// Persist minimal user info to localStorage when setUser is called via other flows
	useEffect(() => {
		if (user) {
			try {
				localStorage.setItem('mm_user', JSON.stringify(user));
			} catch (e) {
				// ignore quota / serialization errors in client; nothing actionable here
			}
		}
	}, [user]);

	const value: AuthContextType = {
		user,
		isAuthenticated: Boolean(user),
		loading,
		login,
		logout,
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Convenience hook for consuming the auth context.
 */
export function useAuth() {
	return useContext(AuthContext);
}

export default AuthContext;
