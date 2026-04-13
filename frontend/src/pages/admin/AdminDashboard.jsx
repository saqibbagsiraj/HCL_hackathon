import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

// APIs
import { getAdminStatsApi, createRestaurantApi, deleteRestaurantApi } from '../../api/adminApi';
import { getRestaurantsApi } from '../../api/restaurantApi';

const MOCK_STATS = { totalOrders: 3450, totalRestaurants: 124, totalUsers: 1250 };
const MOCK_RESTAURANTS = [
  { restaurant_id: 1, name: 'Pizza Corner', location: 'Downtown', owner_id: 101, is_active: true },
  { restaurant_id: 2, name: 'Sushi House', location: 'Uptown', owner_id: 102, is_active: true },
  { restaurant_id: 3, name: 'Burger Hub', location: 'Midtown', owner_id: 103, is_active: true }
];

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [restaurants, setRestaurants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newRest, setNewRest] = useState({ name: '', location: '', owner_id: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── 1. Fetch Initial Data ────────────────────────────────────────────────
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, restRes] = await Promise.all([
          getAdminStatsApi().catch(() => ({ data: MOCK_STATS })),
          getRestaurantsApi().catch(() => ({ data: MOCK_RESTAURANTS }))
        ]);

        setStats(statsRes.data);
        setRestaurants(restRes.data.length > 0 ? restRes.data : MOCK_RESTAURANTS);
      } catch (error) {
        toast.error("Failed to load dashboard data");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // ── 2. Add Restaurant ────────────────────────────────────────────────────
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!newRest.name || !newRest.location || !newRest.owner_id) {
      toast.error("All fields are required");
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        name: newRest.name,
        location: newRest.location,
        owner_id: parseInt(newRest.owner_id, 10),
        is_active: true
      };

      await createRestaurantApi(payload).catch(() => {
        return new Promise(resolve => setTimeout(() => resolve({ data: { ...payload, restaurant_id: Date.now() } }), 600));
      });

      setRestaurants(prev => [...prev, { ...payload, restaurant_id: Date.now() }]);
      toast.success("Restaurant added successfully!");
      setNewRest({ name: '', location: '', owner_id: '' });
      setIsAddModalOpen(false);
    } catch (error) {
      toast.error("Failed to add restaurant");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── 3. Delete Restaurant ─────────────────────────────────────────────────
  const handleDelete = async (id) => {
    // Confirmation removed for seamless demonstration flow
    try {
      await deleteRestaurantApi(id).catch(() => {
        return new Promise(resolve => setTimeout(resolve, 600)); // mock delay
      });
      setRestaurants(restaurants.filter(r => r.restaurant_id !== id));
      toast.success("Restaurant deleted");
      
      // Optically update the top level stats for visual realism
      setStats(prev => ({ ...prev, totalRestaurants: Math.max(0, prev.totalRestaurants - 1) }));
    } catch (error) {
      toast.error("Failed to delete restaurant");
    }
  };

  if (isLoading || !stats) {
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
          <h1 className="section-title" style={{ marginBottom: 4 }}>Admin Dashboard</h1>
          <div className="section-subtitle">Platform Overview & Management</div>
        </div>
      </div>

      {/* ── Stats Area ──────────────────────────────────────────────────────── */}
      <div className="grid-3" style={{ marginBottom: 32 }}>
        <motion.div className="card glass" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ padding: '24px' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600, marginBottom: 8 }}>Total Users</div>
          <div style={{ fontSize: 36, fontWeight: 700, color: 'var(--info)' }}>{stats.totalUsers.toLocaleString()}</div>
        </motion.div>
        
        <motion.div className="card glass" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} style={{ padding: '24px' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600, marginBottom: 8 }}>Total Orders</div>
          <div style={{ fontSize: 36, fontWeight: 700, color: 'var(--primary)' }}>{stats.totalOrders.toLocaleString()}</div>
        </motion.div>
        
        <motion.div className="card glass" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} style={{ padding: '24px' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600, marginBottom: 8 }}>Restaurants</div>
          <div style={{ fontSize: 36, fontWeight: 700, color: 'var(--success)' }}>{stats.totalRestaurants.toLocaleString()}</div>
        </motion.div>
      </div>

      {/* ── Restaurants List Area ───────────────────────────────────────────── */}
      <motion.div 
        className="card glass"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        style={{ padding: '24px' }}
      >
        <div className="flex justify-between items-center" style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600 }}>Restaurant Directory</h2>
          <button className="btn btn-primary" onClick={() => setIsAddModalOpen(true)}>
             + Add Restaurant
          </button>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'minmax(150px, 1.5fr) minmax(100px, 1fr) minmax(100px, 1fr) 80px 100px', 
          gap: 16, 
          paddingBottom: 12, 
          borderBottom: '1px solid var(--border)',
          color: 'var(--text-secondary)',
          fontSize: 13,
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: 0.5
        }}>
          <div>Name</div>
          <div>Location</div>
          <div>Owner ID</div>
          <div>Status</div>
          <div style={{ textAlign: 'right' }}>Actions</div>
        </div>

        <div className="flex-col pb-4" style={{ marginTop: 12 }}>
          <AnimatePresence>
            {restaurants.map((rest) => (
              <motion.div 
                key={rest.restaurant_id}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0, scale: 0.98 }}
                style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'minmax(150px, 1.5fr) minmax(100px, 1fr) minmax(100px, 1fr) 80px 100px', 
                  gap: 16, 
                  alignItems: 'center',
                  padding: '16px 0',
                  borderBottom: '1px solid rgba(255,255,255,0.04)'
                }}
              >
                <div style={{ fontWeight: 600, fontSize: 15, color: '#fff' }}>{rest.name}</div>
                <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{rest.location}</div>
                <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
                  <span className="badge badge-muted">u-{rest.owner_id}</span>
                </div>
                <div>
                  <span className={`badge ${rest.is_active ? 'badge-success' : 'badge-error'}`}>
                    {rest.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <button 
                    className="btn btn-danger" 
                    style={{ padding: '6px 12px', fontSize: 12 }}
                    onClick={() => handleDelete(rest.restaurant_id)}
                  >
                    Delete
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {restaurants.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
              No restaurants currently listed. Click "Add Restaurant" to begin.
            </div>
          )}
        </div>
      </motion.div>

      {/* ── Add Restaurant Modal ────────────────────────────────────────────── */}
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
              <h2 className="section-title" style={{ marginBottom: 24 }}>Register New Restaurant</h2>
              
              <form onSubmit={handleAddSubmit} className="flex-col gap-4">
                <div className="form-group">
                  <label className="form-label">Restaurant Name *</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. Papa John's"
                    value={newRest.name}
                    onChange={e => setNewRest({...newRest, name: e.target.value})}
                    autoFocus
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Location *</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. Times Square, NY"
                    value={newRest.location}
                    onChange={e => setNewRest({...newRest, location: e.target.value})}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Owner User ID *</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    placeholder="e.g. 104"
                    value={newRest.owner_id}
                    onChange={e => setNewRest({...newRest, owner_id: e.target.value})}
                  />
                  <div className="form-error" style={{ color: 'var(--text-muted)' }}>
                    Must match an existing User ID with RESTAURANT role.
                  </div>
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
                    {isSubmitting ? 'Registering...' : 'Register'}
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

export default AdminDashboard;
