import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import useAuth from '../../hooks/useAuth';
import './Auth.css';

const ROLES = [
  { id: 'USER',       label: 'User',       icon: '🛍️', desc: 'Order food from restaurants' },
  { id: 'RESTAURANT', label: 'Restaurant', icon: '🍽️', desc: 'Manage your restaurant & menu' },
  { id: 'ADMIN',      label: 'Admin',      icon: '🛡️', desc: 'Administer the platform' },
];

const Register = () => {
  const { register } = useAuth();
  const [selectedRole, setSelectedRole] = useState('USER');
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '', phone: '', address: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [step, setStep] = useState(1); // 1: role select, 2: form

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    else if (form.name.trim().length < 2) e.name = 'Name must be at least 2 characters';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 6) e.password = 'Must be at least 6 characters';
    if (!form.confirmPassword) e.confirmPassword = 'Please confirm password';
    else if (form.confirmPassword !== form.password) e.confirmPassword = 'Passwords do not match';
    if (form.phone && !/^\+?[\d\s\-]{7,15}$/.test(form.phone)) e.phone = 'Enter a valid phone number';
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
      const { confirmPassword, ...payload } = form;
      await register({
        ...payload,
        name: payload.name.trim(),
        email: payload.email.trim().toLowerCase(),
        role: selectedRole,
      });
    } catch (err) {
      const msg = err.friendlyMessage || 'Registration failed. Please try again.';
      toast.error(msg);
      if (err.response?.status === 409) {
        setErrors({ email: 'This email is already registered' });
        setStep(1);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-blob auth-blob-1" />
        <div className="auth-blob auth-blob-2" />
        <div className="auth-blob auth-blob-3" />
      </div>

      <motion.div
        className="auth-container auth-container-wide"
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
            <h1 className="auth-title">Create Account</h1>
            <p className="auth-subtitle">Join thousands of food lovers today</p>
          </div>

          {/* Step Indicator */}
          <div className="auth-steps">
            <div className={`auth-step ${step >= 1 ? 'active' : ''}`}>
              <div className="auth-step-dot">{step > 1 ? '✓' : '1'}</div>
              <span>Choose Role</span>
            </div>
            <div className="auth-step-line" />
            <div className={`auth-step ${step >= 2 ? 'active' : ''}`}>
              <div className="auth-step-dot">2</div>
              <span>Your Details</span>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {/* Step 1: Role Picker */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.25 }}
              >
                <p className="role-prompt">Select your role to get started</p>
                <div className="role-grid">
                  {ROLES.map((role) => (
                    <motion.button
                      key={role.id}
                      type="button"
                      className={`role-card ${selectedRole === role.id ? 'role-card-selected' : ''}`}
                      onClick={() => setSelectedRole(role.id)}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <div className="role-icon">{role.icon}</div>
                      <div className="role-label">{role.label}</div>
                      <div className="role-desc">{role.desc}</div>
                      {selectedRole === role.id && (
                        <motion.div
                          className="role-check"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', stiffness: 400 }}
                        >✓</motion.div>
                      )}
                    </motion.button>
                  ))}
                </div>

                <motion.button
                  type="button"
                  className="btn btn-primary btn-full auth-submit"
                  onClick={() => setStep(2)}
                  whileTap={{ scale: 0.97 }}
                >
                  Continue as {ROLES.find(r => r.id === selectedRole)?.label} →
                </motion.button>
              </motion.div>
            )}

            {/* Step 2: Form */}
            {step === 2 && (
              <motion.form
                key="step2"
                onSubmit={handleSubmit}
                noValidate
                className="auth-form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
              >
                {/* Role badge */}
                <div className="selected-role-badge">
                  {ROLES.find(r => r.id === selectedRole)?.icon}{' '}
                  Registering as <strong>{selectedRole}</strong>
                  <button type="button" className="change-role-btn" onClick={() => setStep(1)}>
                    Change
                  </button>
                </div>

                {/* 2-col grid for name + email */}
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Full Name *</label>
                    <div className="input-wrapper">
                      <span className="input-icon">👤</span>
                      <input
                        type="text" name="name" placeholder="John Doe"
                        value={form.name} onChange={handleChange}
                        className={`form-input input-with-icon ${errors.name ? 'error' : ''}`}
                        autoComplete="name" disabled={loading} autoFocus
                      />
                    </div>
                    {errors.name && <span className="form-error animate-fadeIn">{errors.name}</span>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Email *</label>
                    <div className="input-wrapper">
                      <span className="input-icon">✉️</span>
                      <input
                        type="email" name="email" placeholder="you@example.com"
                        value={form.email} onChange={handleChange}
                        className={`form-input input-with-icon ${errors.email ? 'error' : ''}`}
                        autoComplete="email" disabled={loading}
                      />
                    </div>
                    {errors.email && <span className="form-error animate-fadeIn">{errors.email}</span>}
                  </div>
                </div>

                {/* Password row */}
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Password *</label>
                    <div className="input-wrapper">
                      <span className="input-icon">🔑</span>
                      <input
                        type={showPass ? 'text' : 'password'} name="password" placeholder="Min 6 characters"
                        value={form.password} onChange={handleChange}
                        className={`form-input input-with-icon input-with-action ${errors.password ? 'error' : ''}`}
                        autoComplete="new-password" disabled={loading}
                      />
                      <button type="button" className="input-action-btn" onClick={() => setShowPass(p => !p)} tabIndex={-1}>
                        {showPass ? '🙈' : '👁️'}
                      </button>
                    </div>
                    {errors.password && <span className="form-error animate-fadeIn">{errors.password}</span>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Confirm Password *</label>
                    <div className="input-wrapper">
                      <span className="input-icon">🔒</span>
                      <input
                        type={showPass ? 'text' : 'password'} name="confirmPassword" placeholder="Repeat password"
                        value={form.confirmPassword} onChange={handleChange}
                        className={`form-input input-with-icon ${errors.confirmPassword ? 'error' : ''}`}
                        autoComplete="new-password" disabled={loading}
                      />
                    </div>
                    {errors.confirmPassword && <span className="form-error animate-fadeIn">{errors.confirmPassword}</span>}
                  </div>
                </div>

                {/* Optional fields */}
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Phone <span className="optional">(optional)</span></label>
                    <div className="input-wrapper">
                      <span className="input-icon">📱</span>
                      <input
                        type="tel" name="phone" placeholder="+91 9876543210"
                        value={form.phone} onChange={handleChange}
                        className={`form-input input-with-icon ${errors.phone ? 'error' : ''}`}
                        disabled={loading}
                      />
                    </div>
                    {errors.phone && <span className="form-error animate-fadeIn">{errors.phone}</span>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Address <span className="optional">(optional)</span></label>
                    <div className="input-wrapper">
                      <span className="input-icon">📍</span>
                      <input
                        type="text" name="address" placeholder="123 Main St, City"
                        value={form.address} onChange={handleChange}
                        className="form-input input-with-icon"
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>

                {/* Strength indicator */}
                {form.password && (
                  <PasswordStrength password={form.password} />
                )}

                {/* Submit */}
                <motion.button
                  type="submit"
                  className="btn btn-primary btn-full auth-submit"
                  disabled={loading}
                  whileTap={{ scale: 0.97 }}
                >
                  {loading ? (
                    <><div className="spinner" /> Creating Account…</>
                  ) : (
                    <><span>Create Account</span> <span>🎉</span></>
                  )}
                </motion.button>
              </motion.form>
            )}
          </AnimatePresence>

          <div className="divider"><span>Already have an account?</span></div>
          <Link to="/auth/login" className="btn btn-secondary btn-full auth-alt-btn">
            Sign In Instead
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

const getStrength = (pwd) => {
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  return score;
};

const PasswordStrength = ({ password }) => {
  const score = getStrength(password);
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const colors = ['', '#ef4444', '#f59e0b', '#3b82f6', '#22c55e'];
  return (
    <div className="password-strength">
      <div className="strength-bars">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="strength-bar"
            style={{ background: i <= score ? colors[score] : 'var(--border)' }}
          />
        ))}
      </div>
      <span className="strength-label" style={{ color: colors[score] || 'var(--text-muted)' }}>
        {score > 0 ? labels[score] : 'Too short'}
      </span>
    </div>
  );
};

export default Register;
