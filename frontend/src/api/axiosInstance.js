import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// ── REQUEST INTERCEPTOR ──────────────────────────────────────────────────────
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers['Authorization'] = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ── RESPONSE INTERCEPTOR ─────────────────────────────────────────────────────
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status } = error.response;

      // Unauthorized → clear session and redirect to login
      if (status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Only redirect if not already on auth pages
        if (!window.location.pathname.startsWith('/auth')) {
          window.location.href = '/auth/login';
        }
      }

      // Craft a friendly error message from backend response body
      const serverMsg =
        error.response.data?.message ||
        error.response.data?.error ||
        error.response.data ||
        null;

      const statusMessages = {
        400: serverMsg || 'Bad request — please check your input.',
        403: 'Access denied. You don\'t have permission for this action.',
        404: serverMsg || 'The requested resource was not found.',
        409: serverMsg || 'A conflict occurred — please try again.',
        422: serverMsg || 'Validation failed — please correct your input.',
        429: 'Too many requests — please slow down.',
        500: 'Server error — please try again in a moment.',
        503: 'Service unavailable — the server is temporarily down.',
      };

      error.friendlyMessage = statusMessages[status] || serverMsg || 'An unexpected error occurred.';
    } else if (error.code === 'ECONNABORTED') {
      error.friendlyMessage = 'Request timed out — please check your connection.';
    } else if (!error.response) {
      error.friendlyMessage = 'Network error — please check your internet connection.';
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
