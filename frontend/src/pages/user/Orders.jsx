import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { getMyOrdersApi } from '../../api/orderApi';
import './User.css';

const STATUS_META = {
  PLACED:     { label: 'Placed',     class: 'badge-info',    icon: '📋', step: 0 },
  CONFIRMED:  { label: 'Confirmed',  class: 'badge-info',    icon: '✅', step: 1 },
  PREPARING:  { label: 'Preparing',  class: 'badge-warning', icon: '👨‍🍳', step: 2 },
  DELIVERED:  { label: 'Delivered',  class: 'badge-success', icon: '🎉', step: 3 },
  CANCELLED:  { label: 'Cancelled',  class: 'badge-error',   icon: '❌', step: -1 },
};

const STEPS = ['Placed', 'Confirmed', 'Preparing', 'Delivered'];

const OrderCard = ({ order }) => {
  const [expanded, setExpanded] = useState(false);
  const meta = STATUS_META[order.status] || STATUS_META.PLACED;
  const stepIdx = meta.step;
  const isCancelled = order.status === 'CANCELLED';

  return (
    <motion.div
      className="order-card card"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      layout
    >
      {/* Header */}
      <div className="order-card-header" onClick={() => setExpanded(p => !p)} role="button" tabIndex={0}>
        <div className="order-id-row">
          <span className="order-id">#{order.order_id || order.orderId}</span>
          <span className={`badge ${meta.class}`}>{meta.icon} {meta.label}</span>
        </div>
        <div className="order-meta-row">
          <span className="order-restaurant">🍽️ {order.restaurantName || order.restaurant_name || 'Restaurant'}</span>
          <span className="order-amount">₹{Number(order.total_amount || order.totalAmount || 0).toFixed(2)}</span>
        </div>
        <div className="order-date">
          🕐 {new Date(order.created_at || order.createdAt).toLocaleString('en-IN', {
            dateStyle: 'medium', timeStyle: 'short'
          })}
        </div>
        <div className="expand-icon">{expanded ? '▲' : '▼'}</div>
      </div>

      {/* Progress tracker */}
      {!isCancelled && (
        <div className="order-progress">
          {STEPS.map((step, i) => (
            <div key={step} className="progress-step">
              <div className={`progress-dot ${i <= stepIdx ? 'progress-dot-done' : ''} ${i === stepIdx ? 'progress-dot-active' : ''}`}>
                {i < stepIdx ? '✓' : i + 1}
              </div>
              <div className="progress-label">{step}</div>
              {i < STEPS.length - 1 && (
                <div className={`progress-line ${i < stepIdx ? 'progress-line-done' : ''}`} />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Expanded items */}
      {expanded && (
        <motion.div
          className="order-items"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          transition={{ duration: 0.25 }}
        >
          <div className="order-items-title">Items Ordered</div>
          {(order.items || order.orderItems || []).length > 0
            ? (order.items || order.orderItems || []).map((item, i) => (
              <div key={i} className="order-item-row">
                <span>{item.name || item.itemName || `Item #${item.item_id || item.itemId}`}</span>
                <span className="order-item-qty">× {item.quantity}</span>
              </div>
            ))
            : <p className="order-items-empty">Item details not available</p>
          }
        </motion.div>
      )}
    </motion.div>
  );
};

const MOCK_ORDERS = [
  {
    order_id: 1023, status: 'DELIVERED', total_amount: 550, created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    restaurantName: 'Pizza Palace', items: [{ name: 'Margherita Pizza', quantity: 1 }, { name: 'Garlic Naan', quantity: 2 }],
  },
  {
    order_id: 1024, status: 'PREPARING', total_amount: 299, created_at: new Date(Date.now() - 3600000).toISOString(),
    restaurantName: 'Burger Barn', items: [{ name: 'Classic Burger', quantity: 2 }],
  },
  {
    order_id: 1025, status: 'CANCELLED', total_amount: 199, created_at: new Date(Date.now() - 86400000).toISOString(),
    restaurantName: 'Spice Garden', items: [{ name: 'Paneer Tikka', quantity: 1 }],
  },
];

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [error, setError] = useState(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getMyOrdersApi();
      setOrders(res.data || []);
    } catch {
      // Use mock data while backend is in dev
      setOrders(MOCK_ORDERS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const statuses = ['ALL', 'PLACED', 'CONFIRMED', 'PREPARING', 'DELIVERED', 'CANCELLED'];
  const filtered = filter === 'ALL' ? orders : orders.filter(o => o.status === filter);

  return (
    <div className="page-wrapper">
      <div className="container">
        <div className="page-header">
          <h1 className="section-title">📦 My Orders</h1>
          <button className="btn btn-ghost" onClick={fetchOrders} style={{ fontSize: 13, padding: '8px 14px' }}>
            🔄 Refresh
          </button>
        </div>

        {/* Status filter */}
        <div className="filter-chips">
          {statuses.map(s => (
            <button
              key={s}
              className={`filter-chip ${filter === s ? 'filter-chip-active' : ''}`}
              onClick={() => setFilter(s)}
            >
              {s === 'ALL' ? '🗂️ All' : `${STATUS_META[s]?.icon} ${STATUS_META[s]?.label}`}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[1,2,3].map(i => (
              <div key={i} className="skeleton" style={{ height: 120, borderRadius: 16 }} />
            ))}
          </div>
        ) : error ? (
          <div className="error-banner">
            ⚠️ {error}
            <button onClick={fetchOrders} className="retry-btn">Retry</button>
          </div>
        ) : filtered.length === 0 ? (
          <motion.div
            className="empty-state"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="empty-icon">📭</div>
            <h3>No orders found</h3>
            <p>{filter === 'ALL' ? "You haven't placed any orders yet" : `No ${filter.toLowerCase()} orders`}</p>
          </motion.div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {filtered.map((order, i) => (
              <motion.div
                key={order.order_id || order.orderId || i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <OrderCard order={order} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
