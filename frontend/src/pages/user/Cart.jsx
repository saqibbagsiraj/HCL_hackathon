import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { placeOrderApi } from '../../api/orderApi';
import { getCart, saveCart } from './Home';
import './User.css';

const Cart = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [placed, setPlaced] = useState(false);

  useEffect(() => {
    setItems(getCart());
  }, []);

  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const restaurantId = items[0]?.restaurantId;
  const restaurantName = items[0]?.restaurantName || 'Restaurant';

  const updateQty = (itemId, delta) => {
    const updated = items.map(i =>
      i.itemId === itemId ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i
    ).filter(i => i.quantity > 0);
    setItems(updated);
    saveCart(updated);
    if (delta < 0) toast('Item removed', { icon: '🗑️' });
  };

  const removeItem = (itemId) => {
    const updated = items.filter(i => i.itemId !== itemId);
    setItems(updated);
    saveCart(updated);
    toast('Removed from cart', { icon: '🗑️' });
  };

  const clearCart = () => {
    setItems([]);
    saveCart([]);
    toast('Cart cleared', { icon: '🧹' });
  };

  const handleCheckout = async () => {
    if (items.length === 0) return;
    setLoading(true);
    try {
      const payload = {
        restaurantId,
        items: items.map(i => ({ itemId: i.itemId, quantity: i.quantity })),
      };
      await placeOrderApi(payload);
      setPlaced(true);
      saveCart([]);
      setItems([]);
    } catch (err) {
      toast.error(err.friendlyMessage || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (placed) {
    return (
      <div className="page-wrapper">
        <div className="container centered-page">
          <motion.div
            className="success-card card"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <motion.div
              className="success-icon"
              animate={{ rotate: [0, 10, -10, 10, 0] }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              🎉
            </motion.div>
            <h2 className="success-title">Order Placed!</h2>
            <p className="success-subtitle">Your food is being prepared. Sit back and relax!</p>
            <div className="success-actions">
              <button className="btn btn-primary" onClick={() => navigate('/user/orders')}>
                📦 Track Order
              </button>
              <button className="btn btn-secondary" onClick={() => navigate('/user/home')}>
                🏠 Back to Home
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div className="container">
        <div className="page-header">
          <h1 className="section-title">🛒 Your Cart</h1>
          {items.length > 0 && (
            <button className="btn btn-ghost" onClick={clearCart} style={{ fontSize: 13 }}>
              🧹 Clear All
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <motion.div
            className="empty-state"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="empty-icon">🛒</div>
            <h3>Your cart is empty</h3>
            <p>Browse restaurants and add items to get started</p>
            <button className="btn btn-primary" onClick={() => navigate('/user/home')}>
              🍔 Browse Restaurants
            </button>
          </motion.div>
        ) : (
          <div className="cart-layout">
            {/* Items */}
            <div className="cart-items">
              <div className="cart-restaurant-badge">
                🍽️ {restaurantName}
              </div>

              <AnimatePresence>
                {items.map((item) => (
                  <motion.div
                    key={item.itemId}
                    className="cart-item card"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20, height: 0, marginBottom: 0 }}
                    transition={{ duration: 0.25 }}
                    layout
                  >
                    <div className="cart-item-info">
                      <div className="cart-item-emoji">🍽️</div>
                      <div>
                        <div className="cart-item-name">{item.name}</div>
                        <div className="cart-item-price">₹{item.price} each</div>
                      </div>
                    </div>

                    <div className="cart-item-controls">
                      <div className="qty-controls">
                        <motion.button
                          className="qty-btn"
                          onClick={() => updateQty(item.itemId, -1)}
                          whileTap={{ scale: 0.85 }}
                        >−</motion.button>
                        <span className="qty-val">{item.quantity}</span>
                        <motion.button
                          className="qty-btn qty-btn-add"
                          onClick={() => updateQty(item.itemId, 1)}
                          whileTap={{ scale: 0.85 }}
                        >+</motion.button>
                      </div>
                      <div className="cart-item-subtotal">₹{(item.price * item.quantity).toFixed(2)}</div>
                      <motion.button
                        className="remove-btn"
                        onClick={() => removeItem(item.itemId)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >✕</motion.button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Summary */}
            <div className="cart-summary glass">
              <h3 className="summary-title">Order Summary</h3>

              <div className="summary-rows">
                {items.map(i => (
                  <div key={i.itemId} className="summary-row">
                    <span>{i.name} × {i.quantity}</span>
                    <span>₹{(i.price * i.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="summary-divider" />

              <div className="summary-row summary-delivery">
                <span>🛵 Delivery</span>
                <span className="free-tag">FREE</span>
              </div>
              <div className="summary-row summary-total">
                <span>Total</span>
                <span>₹{total.toFixed(2)}</span>
              </div>

              <motion.button
                className="btn btn-primary btn-full checkout-btn"
                onClick={handleCheckout}
                disabled={loading || items.length === 0}
                whileTap={{ scale: 0.97 }}
              >
                {loading ? (
                  <><div className="spinner" /> Placing Order…</>
                ) : (
                  <>🎯 Place Order — ₹{total.toFixed(2)}</>
                )}
              </motion.button>

              <button
                className="btn btn-ghost btn-full"
                onClick={() => navigate('/user/home')}
                style={{ marginTop: 8, fontSize: 13 }}
              >
                ← Add More Items
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
