import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import useAuth from '../../hooks/useAuth';
import './Auth.css';

const Login = () => {
  const { login } = useAuth();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 6) e.password = 'Must be at least 6 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await login({ email: form.email.trim(), password: form.password });
    } catch (err) {
      const msg = err.friendlyMessage || 'Login failed. Please try again.';
      toast.error(msg);
      if (err.response?.status === 401) {
        setErrors({ password: 'Invalid credentials' });
      }
    } finally {
      setLoading(false);
    }
  };

  const from = location.state?.from?.pathname;

  return (
    <div className="auth-page">
      {/* Animated background blobs */}
      <div className="auth-bg">
        <div className="auth-blob auth-blob-1" />
        <div className="auth-blob auth-blob-2" />
        <div className="auth-blob auth-blob-3" />
      </div>

      <motion.div
        className="auth-container"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        {/* Brand */}
        <div className="auth-brand">
          <div className="auth-logo">🍔</div>
          <span className="auth-brand-name">FoodRush</span>
        </div>

        <div className="auth-card glass">
          <div className="auth-card-header">
            <h1 className="auth-title">Welcome Back!</h1>
            <p className="auth-subtitle">Sign in to continue your food journey</p>
          </div>

          {from && from !== '/auth/login' && (
            <div className="auth-info-banner">
              🔒 Please log in to access that page
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="auth-form">
            {/* Email */}
            <div className="form-group">
              <label className="form-label">Email address</label>
              <div className="input-wrapper">
                <span className="input-icon">✉️</span>
                <input
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  className={`form-input input-with-icon ${errors.email ? 'error' : ''}`}
                  autoComplete="email"
                  disabled={loading}
                />
              </div>
              {errors.email && <span className="form-error animate-fadeIn">{errors.email}</span>}
            </div>

            {/* Password */}
            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-wrapper">
                <span className="input-icon">🔑</span>
                <input
                  type={showPass ? 'text' : 'password'}
                  name="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  className={`form-input input-with-icon input-with-action ${errors.password ? 'error' : ''}`}
                  autoComplete="current-password"
                  disabled={loading}
                />
                <button
                  type="button"
                  className="input-action-btn"
                  onClick={() => setShowPass((p) => !p)}
                  tabIndex={-1}
                >
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
              {errors.password && <span className="form-error animate-fadeIn">{errors.password}</span>}
            </div>

            {/* Submit */}
            <motion.button
              type="submit"
              className="btn btn-primary btn-full auth-submit"
              disabled={loading}
              whileTap={{ scale: 0.97 }}
            >
              {loading ? (
                <><div className="spinner" /> Signing in…</>
              ) : (
                <><span>Sign In</span> <span>→</span></>
              )}
            </motion.button>
          </form>

          <div className="divider"><span>New to FoodRush?</span></div>

          <Link to="/auth/register" className="btn btn-secondary btn-full auth-alt-btn">
            Create an Account
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
