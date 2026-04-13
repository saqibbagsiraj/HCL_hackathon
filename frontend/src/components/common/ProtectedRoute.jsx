import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

/**
 * Role-based protected route.
 * 
 * Usage:
 *   <ProtectedRoute allowedRoles={['USER']}>
 *     <Home />
 *   </ProtectedRoute>
 */
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-base)',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner spinner-primary" style={{ width: 40, height: 40, margin: '0 auto 16px' }} />
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Authenticating…</p>
        </div>
      </div>
    );
  }

  // Not logged in → redirect to login, preserving intended destination
  if (!user) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // Logged in but wrong role → redirect to their home
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    const roleHome = {
      USER:       '/user/home',
      ADMIN:      '/admin/dashboard',
      RESTAURANT: '/restaurant/dashboard',
    };
    return <Navigate to={roleHome[user.role] || '/auth/login'} replace />;
  }

  return children;
};

export default ProtectedRoute;
