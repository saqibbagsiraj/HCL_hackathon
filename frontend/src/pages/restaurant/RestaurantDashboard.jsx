import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

// API services
import { getMyRestaurantApi, getMenuApi, addMenuItemApi } from '../../api/restaurantApi';
import { getRestaurantOrdersApi } from '../../api/orderApi';

const RestaurantDashboard = () => {
  // State
  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', description: '', price: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── 1. Fetch Initial Data ────────────────────────────────────────────────
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Mock fallback if API fails (since backend is under development)
        let restId = 1; 

        try {
          const restRes = await getMyRestaurantApi();
          setRestaurant(restRes.data);
          restId = restRes.data.restaurant_id || restRes.data.id;
        } catch (err) {
          console.warn("Could not fetch restaurant profile, using fallback 1", err);
          setRestaurant({ id: 1, name: "Sample Restaurant" });
        }

        // Fetch Menu and Orders concurrently
        try {
          const [menuRes, ordersRes] = await Promise.all([
            getMenuApi(restId).catch(() => ({ data: [] })),
            getRestaurantOrdersApi(restId).catch(() => ({ data: [] }))
          ]);

          // Fallback to mock data if empty (for UI testing)
          if (menuRes.data.length === 0) {
            setMenuItems([
              { item_id: 1, name: 'Cheeseburger', price: 8.99, is_available: true },
              { item_id: 2, name: 'Caesar Salad', price: 7.50, is_available: true }
            ]);
          } else {
            setMenuItems(menuRes.data);
          }

          if (ordersRes.data.length === 0) {
            setOrders([
              { order_id: '#2058', summary: '2x Margherita Pizza', status: 'PLACED' },
              { order_id: '#2057', summary: '1x Sushi Platter', status: 'DELIVERED' }
            ]);
          } else {
            setOrders(ordersRes.data);
          }
        } catch (e) {
          console.error("Error fetching menu/orders", e);
        }

      } catch (error) {
        toast.error("Failed to load dashboard data");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // ── 2. Add Menu Item ─────────────────────────────────────────────────────
  const handleAddItemSubmit = async (e) => {
    e.preventDefault();
    if (!newItem.name || !newItem.price) {
      toast.error("Name and price are required");
      return;
    }

    try {
      setIsSubmitting(true);
      const restId = restaurant?.restaurant_id || parseInt(restaurant?.id) || 1;
      
      const payload = {
        name: newItem.name,
        description: newItem.description,
        price: parseFloat(newItem.price),
        is_available: true
      };

      // Call API
      await addMenuItemApi(restId, payload).catch(err => {
        console.warn("Backend not ready, mocking save...", err);
        // Simulate network delay
        return new Promise(resolve => setTimeout(() => resolve({ data: { ...payload, item_id: Date.now() } }), 600));
      });

      // Update local state for immediate feedback
      setMenuItems(prev => [...prev, { ...payload, item_id: Date.now() }]);
      
      toast.success("Menu item added!");
      setNewItem({ name: '', description: '', price: '' });
      setIsAddModalOpen(false);
    } catch (error) {
      toast.error("Failed to add item");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Handlers for mock functionality ──────────────────────────────────────
  const handleDeleteMenuItem = (id) => setMenuItems(menuItems.filter(item => item.item_id !== id));
  
  const handleMarkOrderComplete = (id) => {
    setOrders(orders.map(order => 
      order.order_id === id ? { ...order, status: 'DELIVERED' } : order
    ));
    toast.success("Order marked as Delivered");
  };

  const getStatusBadge = (status) => {
    if (status === 'DELIVERED') return 'badge-success';
    if (status === 'CANCELLED') return 'badge-error';
    if (status === 'PREPARING') return 'badge-info';
    return 'badge-warning'; // PLACED or CONFIRMED
  };

  if (isLoading) {
    return (
      <div className="page-wrapper container flex items-center justify-center">
        <div className="spinner spinner-primary"></div>
      </div>
    );
  }

  return (
    <div className="page-wrapper container">
      <div className="flex justify-between items-center" style={{ marginBottom: 24 }}>
        <div>
          <h1 className="section-title" style={{ marginBottom: 4 }}>Restaurant Dashboard</h1>
          {restaurant && <div className="section-subtitle">Managing {restaurant.name}</div>}
        </div>
        <button className="btn btn-primary" onClick={() => setIsAddModalOpen(true)}>
          <span style={{ fontSize: '18px', fontWeight: 'bold' }}>+</span> Add New Item
        </button>
      </div>

      <div className="grid-2-dashboard" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '24px',
        alignItems: 'start'
      }}>
        
        {/* ── Manage Menu Panel ────────────────────────────────────────── */}
        <motion.div 
          className="card glass" 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ padding: '24px' }}
        >
          <div className="flex justify-between items-center" style={{ marginBottom: '20px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600 }}>Manage Menu</h2>
            <span className="badge badge-muted">{menuItems.length} Items</span>
          </div>

          <div className="flex-col gap-3">
            <AnimatePresence>
              {menuItems.map((item, index) => (
                <motion.div 
                  key={item.item_id}
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginBottom: 12 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  className="flex items-center justify-between overflow-hidden"
                  style={{
                    padding: '12px',
                    background: 'var(--bg-surface)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border)'
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div style={{
                      width: '48px', height: '48px', borderRadius: 'var(--radius-sm)', 
                      background: 'var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '20px'
                    }}>
                      🍔
                    </div>
                    <div>
                      <div style={{ fontWeight: 500, fontSize: '15px' }}>{item.name}</div>
                      <div style={{ color: 'var(--primary-light)', fontSize: '13px', marginTop: '2px', fontWeight: 600 }}>
                        ${Number(item.price).toFixed(2)}
                      </div>
                      {item.description && (
                        <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{item.description}</div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleDeleteMenuItem(item.item_id)}
                      className="btn-ghost" 
                      style={{ padding: '6px', fontSize: '18px', lineHeight: 1 }}
                      title="Delete item"
                    >
                      ×
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {menuItems.length === 0 && (
              <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>
                Menu is empty. Click "Add New Item".
              </div>
            )}
          </div>
        </motion.div>

        {/* ── New Orders Panel ─────────────────────────────────────────── */}
        <motion.div 
          className="card glass"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{ padding: '24px' }}
        >
          <div className="flex justify-between items-center" style={{ marginBottom: '20px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600 }}>Recent Orders</h2>
            <button className="btn-ghost" style={{ padding: '4px 8px', borderRadius: 'var(--radius-sm)' }}>Refresh</button>
          </div>

          <div className="flex-col gap-3">
            {orders.map((order, index) => (
              <motion.div 
                key={order.order_id}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + (index * 0.1) }}
                className="flex items-center justify-between"
                style={{
                  padding: '16px 12px',
                  background: 'var(--bg-surface)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)'
                }}
              >
                <div className="flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span style={{ fontWeight: 600, fontSize: '14px', color: 'var(--primary-light)' }}>
                      Order {order.order_id}
                    </span>
                    {order.summary && (
                      <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>• {order.summary}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`badge ${getStatusBadge(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                </div>
                
                <button 
                  className="btn-primary" 
                  onClick={() => handleMarkOrderComplete(order.order_id)}
                  disabled={order.status === 'DELIVERED' || order.status === 'CANCELLED'}
                  style={{ 
                    padding: '6px 12px', 
                    fontSize: '12px', 
                    opacity: (order.status === 'DELIVERED' || order.status === 'CANCELLED') ? 0.3 : 1 
                  }}
                >
                  {order.status === 'DELIVERED' ? 'Done' : 'Complete'}
                </button>
              </motion.div>
            ))}
            
            {orders.length === 0 && (
              <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>
                No recent orders found.
              </div>
            )}
          </div>
        </motion.div>

      </div>

      {/* ── Add Item Modal ────────────────────────────────────────────── */}
      <AnimatePresence>
        {isAddModalOpen && (
          <motion.div 
            className="flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0,
              background: 'rgba(0,0,0,0.6)',
              backdropFilter: 'blur(4px)',
              zIndex: 9999,
              padding: 24
            }}
          >
            <motion.div 
              className="card glass"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              style={{ width: '100%', maxWidth: 440, padding: 32 }}
            >
              <h2 className="section-title" style={{ marginBottom: 24 }}>Add Menu Item</h2>
              
              <form onSubmit={handleAddItemSubmit} className="flex-col gap-4">
                <div className="form-group">
                  <label className="form-label">Item Name *</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. Garlic Bread"
                    value={newItem.name}
                    onChange={e => setNewItem({...newItem, name: e.target.value})}
                    autoFocus
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Price ($) *</label>
                  <input 
                    type="number" 
                    step="0.01"
                    className="form-input" 
                    placeholder="4.99"
                    value={newItem.price}
                    onChange={e => setNewItem({...newItem, price: e.target.value})}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea 
                    className="form-input" 
                    placeholder="Brief description of the item"
                    rows={3}
                    value={newItem.description}
                    onChange={e => setNewItem({...newItem, description: e.target.value})}
                  />
                </div>

                <div className="flex justify-between gap-3" style={{ marginTop: 16 }}>
                  <button 
                    type="button" 
                    className="btn btn-secondary btn-full"
                    onClick={() => setIsAddModalOpen(false)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary btn-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Saving...' : 'Add Item'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default RestaurantDashboard;
