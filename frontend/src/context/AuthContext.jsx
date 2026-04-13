import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { loginApi, registerApi } from '../api/authApi';
import { decodeToken, isTokenExpired, getRoleFromToken } from '../utils/jwtDecode';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // MOCK USER FOR DESIGN CHECK (Change back to null later)
  const [user, setUser]       = useState({ name: 'Designer', email: 'test@test.com', role: 'ADMIN', token: 'fake' });
  const [loading, setLoading] = useState(false);  // Set boolean false to bypass loading spinner
  const navigate = useNavigate();

  // ── Hydrate from localStorage on mount ──────────────────────────────────
  useEffect(() => {
    // COMMENTED OUT HYDRATION TO KEEP MOCK USER ALIVE
    /*
    const token = localStorage.getItem('token');
    if (token && !isTokenExpired(token)) {
      const stored = localStorage.getItem('user');
      if (stored) {
        try { setUser(JSON.parse(stored)); } catch { clearSession(); }
      }
    } else {
      clearSession();
    }
    setLoading(false);
    */
  }, []);

  // ── Helpers ─────────────────────────────────────────────────────────────
  const clearSession = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const persistSession = (token, userData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const roleRedirect = useCallback((role) => {
    const map = {
      USER:       '/user/home',
      ADMIN:      '/admin/dashboard',
      RESTAURANT: '/restaurant/dashboard',
    };
    navigate(map[role] || '/auth/login', { replace: true });
  }, [navigate]);

  // ── Login ────────────────────────────────────────────────────────────────
  const login = async (credentials) => {
    const response = await loginApi(credentials);
    const { token, name, email } = response.data;

    const role = getRoleFromToken(token);
    if (!role) throw new Error('Invalid token — no role found.');

    const userData = { name, email, role, token };
    persistSession(token, userData);
    toast.success(`Welcome back, ${name}! 👋`);
    roleRedirect(role);
    return userData;
  };

  // ── Register ─────────────────────────────────────────────────────────────
  const register = async (formData) => {
    const response = await registerApi(formData);
    const { token, name, email } = response.data;

    const role = getRoleFromToken(token);
    if (!role) throw new Error('Invalid token — no role found.');

    const userData = { name, email, role, token };
    persistSession(token, userData);
    toast.success(`Account created! Welcome, ${name}! 🎉`);
    roleRedirect(role);
    return userData;
  };

  // ── Logout ───────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    clearSession();
    toast.success('Logged out successfully.');
    navigate('/auth/login', { replace: true });
  }, [navigate]);

  const value = { user, loading, login, register, logout, isAuthenticated: !!user };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used within <AuthProvider>');
  return ctx;
};

export default AuthContext;
