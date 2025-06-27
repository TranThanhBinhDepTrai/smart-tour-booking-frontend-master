import React, { useState } from 'react';
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
import RoleManagement from './pages/RoleManagement';
import Tour from './pages/tours/Tour';
import TourDetail from './pages/tours/TourDetail';
import BookTour from './pages/tours/BookTour';
import CustomTourPage from './pages/custom-tour/CustomTourPage';
import Profile from './pages/profile/Profile';
import AdminPromotions from './pages/admin/Promotions';
import Promotions from './pages/Promotions';
import CheckBooking from './components/CheckBooking/CheckBooking';
import BookingManagement from './pages/admin/BookingManagement';
import CustomTourManagement from './pages/admin/CustomTourManagement';
import CreatePromotion from './pages/admin/CreatePromotion';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Users from './pages/admin/Users';
import VnpayReturn from './pages/payment/VnpayReturn';
import History from './pages/history/History';
import Contact from './pages/contact/Contact';
import Revenue from './pages/admin/Revenue';
import TourCategoryList from './pages/tours/TourCategoryList';
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
        <Route path="tours/:id/book" element={<BookTour />} />
        <Route path="custom-tour" element={<CustomTourPage />} />
        <Route path="promotions" element={<Promotions />} />
        <Route path="check-booking" element={<CheckBooking />} />
        <Route path="contact" element={<Contact />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />
        <Route path="history" element={
          <ProtectedRoute>
            <History />
          </ProtectedRoute>
        } />
        <Route path="tours/category/:category" element={<TourCategoryList />} />
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
        <Route path="users" element={<Users />} />
        <Route path="tours" element={<AdminTour />} />
        <Route path="tours/create" element={<CreateTour />} />
        <Route path="tours/edit/:id" element={<EditTour />} />
        <Route path="permissions" element={<Permissions />} />
        <Route path="roles" element={<RoleManagement />} />
        <Route path="bookings" element={<BookingManagement />} />
        <Route path="promotions" element={<AdminPromotions />} />
        <Route path="promotions/create" element={<CreatePromotion />} />
        <Route path="revenue" element={<Revenue />} />
        <Route path="support" element={<CustomTourManagement />} />
      </Route>

      {/* Payment Result Route */}
      <Route path="/vnpay-return" element={<VnpayReturn />} />

      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Route>
  )
);

function App() {
  const [selectedReviewBooking, setSelectedReviewBooking] = useState(null);

  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App; 