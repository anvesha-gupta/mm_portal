import { useContext } from 'react';
import AuthContext, { AuthContextType } from './AuthContext';

/**
 * Custom hook to access authentication state and actions.
 * Throws a helpful error when used outside of an `AuthProvider`.
 */
export default function useAuth(): AuthContextType {
	const context = useContext(AuthContext);

	if (!context) {
		throw new Error('useAuth must be used within an AuthProvider. Wrap your app with <AuthProvider>.');
	}

	return context;
}
