import { useAuthContext } from '../context/AuthContext';

/**
 * Convenience hook — alias for useAuthContext.
 * Provides: user, loading, login, register, logout, isAuthenticated
 */
const useAuth = () => useAuthContext();

export default useAuth;
