import React from 'react';
import { 
  createBrowserRouter,
  RouterProvider,
  createRoutesFromElements,
  Route,
  Navigate,
  useLocation
} from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';
import Home from './pages/home/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/admin/Dashboard';
import AdminTour from './pages/admin/AdminTour';
import CreateTour from './pages/admin/CreateTour';
import EditTour from './pages/admin/EditTour';
import Permissions from './pages/admin/Permissions';
import Roles from './pages/admin/Roles';
import Tour from './pages/tours/Tour';
import TourDetail from './pages/tours/TourDetail';
import Profile from './pages/profile/Profile';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import './App.css';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { currentUser } = useAuth();
  const location = useLocation();
  
  if (!currentUser) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
};

// Admin Route Component
const AdminRoute = ({ children }) => {
  const { currentUser, isAdmin } = useAuth();
  const location = useLocation();

  if (!currentUser) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (!isAdmin()) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route>
      {/* Public Routes */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="tours" element={<Tour />} />
        <Route path="tours/:id" element={<TourDetail />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />
      </Route>

      {/* Admin Routes */}
      <Route path="/admin" element={
        <AdminRoute>
          <AdminLayout />
        </AdminRoute>
      }>
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="profile" element={<Profile />} />
        <Route path="tours" element={<AdminTour />} />
        <Route path="tours/create" element={<CreateTour />} />
        <Route path="tours/edit/:id" element={<EditTour />} />
        <Route path="permissions" element={<Permissions />} />
        <Route path="roles" element={<Roles />} />
        <Route path="bookings" element={<Dashboard />} />
        <Route path="promotions" element={<Dashboard />} />
        <Route path="revenue" element={<Dashboard />} />
        <Route path="support" element={<Dashboard />} />
      </Route>

      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Route>
  )
);

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App; 