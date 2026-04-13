import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { getRestaurantsApi, getMenuApi } from '../../api/restaurantApi';
import { updateCartBadge } from '../../components/common/Navbar';
import './User.css';

// ── Local cart store (simple in-memory + sessionStorage) ─────────────────────
const CART_KEY = 'foodrush_cart';
export const getCart = () => {
  try { return JSON.parse(sessionStorage.getItem(CART_KEY)) || []; }
  catch { return []; }
};
export const saveCart = (items) => {
  sessionStorage.setItem(CART_KEY, JSON.stringify(items));
  updateCartBadge(items);
};

// ── Star component ────────────────────────────────────────────────────────────
const Stars = ({ rating = 0 }) => {
  const full = Math.round(rating);
  return (
    <div className="stars">
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{ color: i <= full ? '#FFC947' : 'var(--text-muted)', fontSize: 12 }}>★</span>
      ))}
      <span className="rating-num">{Number(rating).toFixed(1)}</span>
    </div>
  );
};

// ── Skeleton ──────────────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="restaurant-card skeleton-card">
    <div className="skeleton" style={{ height: 140, borderRadius: 'var(--radius-md)' }} />
    <div style={{ padding: '14px 0 4px' }}>
      <div className="skeleton" style={{ height: 16, width: '70%', marginBottom: 8 }} />
      <div className="skeleton" style={{ height: 12, width: '40%', marginBottom: 8 }} />
      <div className="skeleton" style={{ height: 12, width: '55%' }} />
    </div>
  </div>
);

// ── MenuItem Modal ────────────────────────────────────────────────────────────
const MenuModal = ({ restaurant, onClose }) => {
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(null);

  useEffect(() => {
    getMenuApi(restaurant.restaurant_id || restaurant.restaurantId || restaurant.id)
      .then(r => setMenu(r.data || []))
      .catch(() => {
        // Mock data for dev when backend not yet ready
        setMenu([
          { item_id: 1, name: 'Margherita Pizza', description: 'Classic tomato & cheese', price: 299, is_available: true },
          { item_id: 2, name: 'Paneer Tikka', description: 'Spiced cottage cheese', price: 199, is_available: true },
          { item_id: 3, name: 'Garlic Naan', description: 'Buttery garlic bread', price: 59, is_available: true },
          { item_id: 4, name: 'Mango Lassi', description: 'Fresh mango yogurt drink', price: 79, is_available: true },
        ]);
      })
      .finally(() => setLoading(false));
  }, [restaurant]);

  const addToCart = (item) => {
    setAdding(item.item_id);
    setTimeout(() => {
      const cart = getCart();
      const existing = cart.find(c => c.itemId === item.item_id);
      let updated;
      if (existing) {
        updated = cart.map(c => c.itemId === item.item_id ? { ...c, quantity: c.quantity + 1 } : c);
        toast.success(`${item.name} quantity updated!`);
      } else {
        const restaurantId = restaurant.restaurant_id || restaurant.restaurantId || restaurant.id;
        // Clear cart if from different restaurant
        const cartRestaurant = cart[0]?.restaurantId;
        if (cartRestaurant && cartRestaurant !== restaurantId) {
          if (!window.confirm(`Your cart has items from another restaurant. Clear it?`)) {
            setAdding(null);
            return;
          }
          updated = [{
            itemId: item.item_id,
            name: item.name,
            price: item.price,
            restaurantId,
            restaurantName: restaurant.name,
            quantity: 1,
          }];
        } else {
          updated = [...cart, {
            itemId: item.item_id,
            name: item.name,
            price: item.price,
            restaurantId,
            restaurantName: restaurant.name,
            quantity: 1,
          }];
        }
        toast.success(`${item.name} added to cart! 🛒`);
      }
      saveCart(updated);
      setAdding(null);
    }, 400);
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <motion.div
        className="modal-content glass"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ duration: 0.25 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <h2 className="modal-title">{restaurant.name}</h2>
            <p className="modal-subtitle">📍 {restaurant.location || 'Bangalore'}</p>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 72, borderRadius: 12 }} />)}
            </div>
          ) : menu.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🍽️</div>
              <p>No menu items available yet</p>
            </div>
          ) : (
            <div className="menu-list">
              {menu.map((item) => (
                <motion.div
                  key={item.item_id}
                  className={`menu-item ${!item.is_available ? 'menu-item-unavailable' : ''}`}
                  whileHover={{ scale: 1.01 }}
                >
                  <div className="menu-item-info">
                    <div className="menu-item-name">{item.name}</div>
                    <div className="menu-item-desc">{item.description}</div>
                    <div className="menu-item-price">₹{item.price}</div>
                  </div>
                  <motion.button
                    className={`btn btn-primary add-btn ${!item.is_available ? 'btn-disabled' : ''}`}
                    onClick={() => item.is_available && addToCart(item)}
                    disabled={!item.is_available || adding === item.item_id}
                    whileTap={{ scale: 0.9 }}
                  >
                    {adding === item.item_id
                      ? <div className="spinner" style={{ width: 16, height: 16 }} />
                      : item.is_available ? '+ Add' : 'Unavailable'
                    }
                  </motion.button>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

// ── Home Page ─────────────────────────────────────────────────────────────────
const FOOD_EMOJIS = ['🍕','🍔','🍣','🌮','🍜','🍛','🥗','🍗'];

const Home = () => {
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);

  const fetchRestaurants = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getRestaurantsApi({ search: search || undefined });
      setRestaurants(res.data || []);
    } catch (err) {
      // Fallback mock data while backend is in development
      setRestaurants([
        { restaurant_id: 1, name: 'Pizza Palace', location: 'Koramangala, Bangalore', rating: 4.5, is_active: true },
        { restaurant_id: 2, name: 'Burger Barn',  location: 'Indiranagar, Bangalore',  rating: 4.2, is_active: true },
        { restaurant_id: 3, name: 'Spice Garden', location: 'HSR Layout, Bangalore',   rating: 4.7, is_active: true },
        { restaurant_id: 4, name: 'Sushi Station', location: 'Whitefield, Bangalore',  rating: 4.3, is_active: true },
        { restaurant_id: 5, name: 'Taco Fiesta',  location: 'JP Nagar, Bangalore',     rating: 4.0, is_active: true },
        { restaurant_id: 6, name: 'Noodle Nest',  location: 'Marathahalli, Bangalore', rating: 4.6, is_active: true },
      ]);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(fetchRestaurants, 300);
    return () => clearTimeout(timer);
  }, [fetchRestaurants]);

  const filtered = restaurants.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    (r.location || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page-wrapper">
      {/* Hero */}
      <section className="home-hero">
        <div className="hero-bg">
          <div className="hero-blob-1" />
          <div className="hero-blob-2" />
        </div>
        <div className="container">
          <motion.div
            className="hero-content"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="hero-tag">🔥 Fresh & Hot Delivery</div>
            <h1 className="hero-title">
              Hungry? We've got you <span className="hero-highlight">covered! 🍔</span>
            </h1>
            <p className="hero-subtitle">Order from the best restaurants near you, delivered fast.</p>

            {/* Search bar */}
            <div className="search-bar">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search restaurants or cuisine..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="search-input"
              />
              {search && (
                <button className="search-clear" onClick={() => setSearch('')}>✕</button>
              )}
            </div>

            {/* quick category chips */}
            <div className="category-chips">
              {['🍕 Pizza','🍔 Burger','🍣 Sushi','🌮 Tacos','🍜 Noodles','🍛 Curry'].map(c => (
                <button key={c} className="chip" onClick={() => setSearch(c.split(' ')[1])}>
                  {c}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Restaurant grid */}
      <section className="restaurants-section container">
        <div className="section-header">
          <h2 className="section-title">
            {search ? `Results for "${search}"` : 'Popular Restaurants'} 
            {!loading && <span className="count-badge">{filtered.length}</span>}
          </h2>
          {!loading && (
            <button className="btn btn-ghost" onClick={fetchRestaurants} style={{ fontSize: 13, padding: '8px 14px' }}>
              🔄 Refresh
            </button>
          )}
        </div>

        {error && (
          <div className="error-banner">
            ⚠️ {error}
            <button onClick={fetchRestaurants} className="retry-btn">Retry</button>
          </div>
        )}

        <div className="grid-4">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
            : filtered.length === 0
              ? (
                <div className="empty-state full-width">
                  <div className="empty-icon">😔</div>
                  <h3>No restaurants found</h3>
                  <p>Try a different search term</p>
                  <button className="btn btn-secondary" onClick={() => setSearch('')}>Clear Search</button>
                </div>
              )
              : filtered.map((r, idx) => (
                <motion.div
                  key={r.restaurant_id}
                  className="restaurant-card card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => setSelectedRestaurant(r)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => e.key === 'Enter' && setSelectedRestaurant(r)}
                >
                  <div className="restaurant-thumb">
                    <div className="restaurant-emoji">
                      {FOOD_EMOJIS[idx % FOOD_EMOJIS.length]}
                    </div>
                    <div className="restaurant-tag">Open</div>
                  </div>
                  <div className="restaurant-info">
                    <h3 className="restaurant-name">{r.name}</h3>
                    <p className="restaurant-location">📍 {r.location || 'Bangalore'}</p>
                    <div className="restaurant-meta">
                      <Stars rating={r.rating} />
                      <span className="delivery-tag">🕐 30-45 min</span>
                    </div>
                  </div>
                  <div className="restaurant-cta">View Menu →</div>
                </motion.div>
              ))}
        </div>
      </section>

      {/* Menu modal */}
      <AnimatePresenceWrapper>
        {selectedRestaurant && (
          <MenuModal
            restaurant={selectedRestaurant}
            onClose={() => setSelectedRestaurant(null)}
          />
        )}
      </AnimatePresenceWrapper>
    </div>
  );
};

// Wrapper to avoid importing AnimatePresence at top level before framer-motion loads
import { AnimatePresence } from 'framer-motion';
const AnimatePresenceWrapper = ({ children }) => (
  <AnimatePresence>{children}</AnimatePresence>
);

export default Home;
