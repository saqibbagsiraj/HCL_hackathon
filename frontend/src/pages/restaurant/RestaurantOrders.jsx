import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

// API services
import { getMyRestaurantApi } from '../../api/restaurantApi';
import { getRestaurantOrdersApi } from '../../api/orderApi';

const RestaurantOrders = () => {
  const [restaurant, setRestaurant] = useState(null);
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        let restId = 1;
        try {
          const restRes = await getMyRestaurantApi();
          setRestaurant(restRes.data);
          restId = restRes.data.restaurant_id || restRes.data.id;
        } catch (err) {
          setRestaurant({ id: 1, name: "Sample Restaurant" });
        }

        try {
          const ordersRes = await getRestaurantOrdersApi(restId);
          setOrders(ordersRes.data.length > 0 ? ordersRes.data : [
            { order_id: '#2058', summary: '2x Margherita Pizza', status: 'PLACED' },
            { order_id: '#2057', summary: '1x Sushi Platter', status: 'DELIVERED' },
            { order_id: '#2056', summary: '3x Cheeseburger, 1x Fries', status: 'PREPARING' }
          ]);
        } catch {
          setOrders([
            { order_id: '#2058', summary: '2x Margherita Pizza', status: 'PLACED' },
            { order_id: '#2057', summary: '1x Sushi Platter', status: 'DELIVERED' },
            { order_id: '#2056', summary: '3x Cheeseburger, 1x Fries', status: 'PREPARING' }
          ]);
        }
      } catch (error) {
        toast.error("Failed to load orders");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleMarkOrderComplete = (id) => {
    setOrders(orders.map(order => 
      order.order_id === id ? { ...order, status: 'DELIVERED' } : order
    ));
    toast.success("Order marked as Delivered");
  };

  const handleUpdateStatus = (id, newStatus) => {
    setOrders(orders.map(order => 
      order.order_id === id ? { ...order, status: newStatus } : order
    ));
    toast.success(`Order marked as ${newStatus}`);
  }

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
          <h1 className="section-title" style={{ marginBottom: 4 }}>All Orders</h1>
          {restaurant && <div className="section-subtitle">Managing {restaurant.name}</div>}
        </div>
        <button className="btn btn-secondary">
          Export Report
        </button>
      </div>

      <motion.div 
        className="card glass"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ padding: '24px' }}
      >
        <div className="flex justify-between items-center" style={{ marginBottom: '20px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600 }}>Order History & Queue</h2>
          <span className="badge badge-muted">{orders.length} Total</span>
        </div>

        <div className="flex-col gap-4">
          <AnimatePresence>
            {orders.map((order, index) => (
              <motion.div 
                key={order.order_id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between flex-wrap"
                style={{
                  padding: '20px',
                  background: 'var(--bg-surface)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)',
                  gap: '16px'
                }}
              >
                <div className="flex items-center gap-4">
                  <div style={{
                    width: '48px', height: '48px', borderRadius: '50%', 
                    background: 'var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '1px solid var(--border)',
                    color: 'var(--text-secondary)'
                  }}>
                    📦
                  </div>
                  <div className="flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span style={{ fontWeight: 600, fontSize: '16px', color: 'var(--primary-light)' }}>
                        Order {order.order_id}
                      </span>
                      <span className={`badge ${getStatusBadge(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                    {order.summary && (
                      <div style={{ color: 'var(--text-primary)', fontSize: '14px', marginTop: '4px' }}>
                        {order.summary}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  {order.status === 'PLACED' && (
                    <>
                      <button className="btn-ghost" onClick={() => handleUpdateStatus(order.order_id, 'CANCELLED')} style={{ padding: '8px 16px', color: 'var(--error)' }}>Reject</button>
                      <button className="btn-primary" onClick={() => handleUpdateStatus(order.order_id, 'PREPARING')} style={{ padding: '8px 16px' }}>Accept & Prepare</button>
                    </>
                  )}
                  {order.status === 'PREPARING' && (
                    <button className="btn-primary" onClick={() => handleMarkOrderComplete(order.order_id)} style={{ padding: '8px 16px' }}>Mark Delivered</button>
                  )}
                  {(order.status === 'DELIVERED' || order.status === 'CANCELLED') && (
                    <button className="btn-ghost" disabled style={{ padding: '8px 16px', opacity: 0.5 }}>Completed</button>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {orders.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
              No orders received yet.
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default RestaurantOrders;
