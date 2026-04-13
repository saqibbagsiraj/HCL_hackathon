import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import useAuth from '../../hooks/useAuth';
import './Navbar.css';

// Cart state is managed via a simple event-driven approach so Navbar can read it
// If you adopt Redux/Zustand later, replace this with your store selector
let cartItems = [];
const cartListeners = new Set();
export const updateCartBadge = (items) => {
  cartItems = items;
  cartListeners.forEach(fn => fn(items));
};

const NAV_LINKS = {
  USER: [
    { path: '/user/home',   label: 'Home',   icon: '🏠' },
    { path: '/user/cart',   label: 'Cart',   icon: '🛒' },
    { path: '/user/orders', label: 'Orders', icon: '📦' },
  ],
  ADMIN: [
    { path: '/admin/dashboard',    label: 'Dashboard', icon: '📊' },
  ],
  RESTAURANT: [
    { path: '/restaurant/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/restaurant/menu',      label: 'Menu',      icon: '🍽️' },
    { path: '/restaurant/orders',    label: 'Orders',    icon: '📦' },
  ],
};

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cartCount, setCartCount] = useState(() => cartItems.reduce((s, i) => s + (i.quantity || 1), 0));

  // Listen for cart changes
  useEffect(() => {
    const handler = (items) => {
      setCartCount(items.reduce((s, i) => s + (i.quantity || 1), 0));
    };
    cartListeners.add(handler);
    return () => cartListeners.delete(handler);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false); }, [location]);

  if (!user) return null;

  const links = NAV_LINKS[user.role] || [];
  const isActive = (path) => location.pathname === path;

  return (
    <motion.nav
      className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <div className="navbar-inner container">
        {/* Logo */}
        <Link to={links[0]?.path || '/'} className="navbar-logo">
          <span className="navbar-logo-icon">🍔</span>
          <span className="navbar-logo-text">FoodRush</span>
        </Link>

        {/* Desktop links */}
        <div className="navbar-links">
          {links.map((link) => (
            <Link key={link.path} to={link.path} className={`navbar-link ${isActive(link.path) ? 'navbar-link-active' : ''}`}>
              <span className="navbar-link-icon">{link.icon}</span>
              <span>{link.label}</span>
              {link.path === '/user/cart' && cartCount > 0 && (
                <motion.span
                  className="cart-badge"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  key={cartCount}
                >
                  {cartCount}
                </motion.span>
              )}
              {isActive(link.path) && (
                <motion.div className="nav-active-dot" layoutId="activeNavDot" />
              )}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div className="navbar-right">
          {/* Role badge */}
          <div className="navbar-role-badge">
            <span className="role-dot" />
            {user.role}
          </div>

          {/* User menu */}
          <div className="navbar-user">
            <div className="navbar-avatar">
              {user.name?.[0]?.toUpperCase() || '?'}
            </div>
            <div className="navbar-user-info">
              <span className="navbar-user-name">{user.name?.split(' ')[0]}</span>
            </div>
          </div>

          <motion.button
            className="navbar-logout"
            onClick={logout}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Sign out"
          >
            🚪
          </motion.button>

          {/* Mobile toggle */}
          <button className="navbar-mobile-toggle" onClick={() => setMobileOpen(p => !p)}>
            <span className={`hamburger ${mobileOpen ? 'hamburger-open' : ''}`} />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="navbar-mobile-menu"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            {links.map((link, i) => (
              <motion.div
                key={link.path}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  to={link.path}
                  className={`mobile-nav-link ${isActive(link.path) ? 'mobile-nav-link-active' : ''}`}
                >
                  <span>{link.icon}</span>
                  <span>{link.label}</span>
                  {link.path === '/user/cart' && cartCount > 0 && (
                    <span className="cart-badge cart-badge-mobile">{cartCount}</span>
                  )}
                </Link>
              </motion.div>
            ))}
            <button className="mobile-logout-btn" onClick={logout}>
              🚪 Sign Out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
