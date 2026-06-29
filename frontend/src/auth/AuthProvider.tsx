import React, { useEffect, useState } from 'react';
import AuthContext, { AuthContextType, User } from './AuthContext';

interface AuthProviderProps {
	children: React.ReactNode;
}

/**
 * AuthProvider component wires up the `AuthContext` and exposes a minimal,
 * production-ready auth state container. The `login` and `logout` methods are
 * placeholders — integrate Azure AD / MSAL in these functions later.
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState<boolean>(true);

	// Simulate restoring a session on mount. In a real implementation this would
	// verify tokens, refresh sessions, or consult a backend / MSAL cache.
	useEffect(() => {
		const raw = localStorage.getItem('mm_user');
		if (raw) {
			try {
				setUser(JSON.parse(raw) as User);
			} catch {
				localStorage.removeItem('mm_user');
			}
		}
		// End of restore – set loading false so UI can render.
		setLoading(false);
	}, []);

	// Placeholder login: implement Azure AD (MSAL) flow here later.
	const login = async (): Promise<void> => {
		setLoading(true);
		try {
			// TODO: Integrate MSAL login (loginPopup/loginRedirect) and set user.
			return Promise.resolve();
		} finally {
			setLoading(false);
		}
	};

	// Placeholder logout: implement Azure AD sign-out here later.
	const logout = async (): Promise<void> => {
		setLoading(true);
		try {
			// TODO: Integrate MSAL logout (logoutRedirect) and clear user session.
			setUser(null);
			localStorage.removeItem('mm_user');
			return Promise.resolve();
		} finally {
			setLoading(false);
		}
	};

	const contextValue: AuthContextType = {
		user,
		isAuthenticated: Boolean(user),
		loading,
		login,
		logout,
	};

	return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
