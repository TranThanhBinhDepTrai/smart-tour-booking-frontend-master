import React, { createContext, useContext, useState, useEffect } from 'react';
import api, { authService } from '../services/api';
import { accountService } from '../services/accountService';

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

  const login = async (username, password) => {
    try {
      setError(null);
      const response = await accountService.login(username, password);
      console.log('Full login response:', response);
      console.log('Response data structure:', JSON.stringify(response.data, null, 2));
      
      // Check if we have a successful response
      if (response.data && response.data.statusCode === 200 && response.data.data) {
        const { accessToken } = response.data.data;
        
        if (accessToken) {
          localStorage.setItem('token', accessToken);
          
          // Fetch full user details
          const userDetailsResponse = await accountService.getCurrentUser();
          console.log('User details response:', userDetailsResponse);
          
          if (userDetailsResponse.data?.data) {
            const userData = userDetailsResponse.data.data;
            setCurrentUser(userData);
            return userData;
          }
        }
      }
      throw new Error('Đăng nhập thất bại');
    } catch (err) {
      console.error('Login error:', err);
      if (err.response?.data?.message) {
        setError(err.response.data.message);
        throw new Error(err.response.data.message);
      }
      setError('Đăng nhập thất bại. Vui lòng kiểm tra lại tên đăng nhập và mật khẩu.');
      throw err;
    }
  };

  const loadUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setCurrentUser(null);
        return null;
      }

      const response = await accountService.getCurrentUser();
      console.log('Load user response:', response);

      if (response.data?.data) {
        const userData = response.data.data;
        setCurrentUser(userData);
        return userData;
      }
      return null;
    } catch (error) {
      console.error('Error loading user:', error);
      logout();
      return null;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setCurrentUser(null);
  };

  const isAdmin = () => {
    return currentUser?.role?.id === 2;
  };

  const isUser = () => {
    return currentUser?.role?.id === 1;
  };

  useEffect(() => {
    loadUser();
  }, []);

  const value = {
    currentUser,
    login,
    logout,
    isAdmin,
    isUser,
    loading,
    error,
    loadUser
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 