import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';

// Components
import Navbar from './components/common/Navbar';
import ProtectedRoute from './components/common/ProtectedRoute';

// Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Home from './pages/user/Home';
import Cart from './pages/user/Cart';
import Orders from './pages/user/Orders';
import RestaurantDashboard from './pages/restaurant/RestaurantDashboard';
import RestaurantMenu from './pages/restaurant/RestaurantMenu';
import RestaurantOrders from './pages/restaurant/RestaurantOrders';

// Placeholders for partner devs
const Placeholder = ({ title }) => (
  <div className="page-wrapper">
    <div className="container centered-page" style={{ flexDirection: 'column', gap: 16 }}>
      <h1 className="section-title">🚧 {title}</h1>
      <p style={{ color: 'var(--text-secondary)' }}>Being implemented by frontend partner</p>
    </div>
  </div>
);

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Toaster
          position="top-right"
          containerClassName="toaster-container"
          toastOptions={{
            duration: 3500,
            style: {
              background: 'var(--bg-glass)',
              backdropFilter: 'blur(12px)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
            },
            success: { iconTheme: { primary: 'var(--success)', secondary: '#fff' } },
            error:   { iconTheme: { primary: 'var(--error)',   secondary: '#fff' } },
          }}
        />

        <Navbar />

        <Routes>
          <Route path="/" element={<Navigate to="/auth/login" replace />} />

          {/* Auth Routes */}
          <Route path="/auth">
            <Route index element={<Navigate to="login" replace />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
          </Route>

          {/* User Routes */}
          <Route path="/user">
            <Route index element={<Navigate to="home" replace />} />
            <Route path="home"   element={<ProtectedRoute allowedRoles={['USER']}><Home /></ProtectedRoute>} />
            <Route path="cart"   element={<ProtectedRoute allowedRoles={['USER']}><Cart /></ProtectedRoute>} />
            <Route path="orders" element={<ProtectedRoute allowedRoles={['USER']}><Orders /></ProtectedRoute>} />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin">
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard"    element={<ProtectedRoute allowedRoles={['ADMIN']}><Placeholder title="Admin Dashboard" /></ProtectedRoute>} />
            <Route path="manage-users" element={<ProtectedRoute allowedRoles={['ADMIN']}><Placeholder title="Manage Users" /></ProtectedRoute>} />
          </Route>

          {/* Restaurant Routes */}
          <Route path="/restaurant">
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<ProtectedRoute allowedRoles={['RESTAURANT']}><RestaurantDashboard /></ProtectedRoute>} />
            <Route path="menu"      element={<ProtectedRoute allowedRoles={['RESTAURANT']}><RestaurantMenu /></ProtectedRoute>} />
            <Route path="orders"    element={<ProtectedRoute allowedRoles={['RESTAURANT']}><RestaurantOrders /></ProtectedRoute>} />
          </Route>

          {/* Catch all */}
          <Route path="*" element={
            <div className="page-wrapper container centered-page" style={{ flexDirection: 'column' }}>
              <div style={{ fontSize: 64, marginBottom: 16 }}>⚠️</div>
              <h1 className="section-title">404 - Page Not Found</h1>
            </div>
          } />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;
