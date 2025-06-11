import React, { createContext, useContext, useState, useEffect } from 'react';
import api, { authService } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Hàm chuẩn hóa dữ liệu user
const normalizeUserData = (userData) => {
  return {
    id: userData.id,
    fullName: userData.name,
    email: userData.email,
    role: userData.role
  };
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Kiểm tra user trong localStorage
    const user = authService.getCurrentUser() || authService.getCurrentAdmin();
    if (user) {
      setCurrentUser(user);
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      setError(null);
      const response = await api.post('/login', { username, password });
      console.log('Login response:', response.data);
      
      if (response.data && response.data.accessToken) {
        const userData = {
          id: response.data.user.id,
          email: response.data.user.email,
          fullName: response.data.user.name,
          role: response.data.user.role
        };

        // Lưu token và thông tin user
        localStorage.setItem('token', response.data.accessToken);
        
        // Kiểm tra role ID
        const roleId = response.data.user.role?.id;
        
        // Role ID 2 = Admin, Role ID 1 = User
        if (roleId === 2) {
          localStorage.setItem('admin', JSON.stringify(userData));
        } else {
          localStorage.setItem('user', JSON.stringify(userData));
        }

        setCurrentUser(userData);
        return userData;
      }
      throw new Error('Invalid response data');
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Đăng nhập thất bại');
      throw err;
    }
  };

  const logout = () => {
    authService.logout();
    setCurrentUser(null);
  };

  const isAdmin = () => {
    return currentUser?.role?.id === 2; // Role ID 2 = Admin
  };

  const isUser = () => {
    return currentUser?.role?.id === 1; // Role ID 1 = User
  };

  const value = {
    currentUser,
    login,
    logout,
    isAdmin,
    isUser,
    loading,
    error
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 