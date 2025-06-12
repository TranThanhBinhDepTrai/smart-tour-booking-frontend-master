import axios from 'axios';
import { API_URL } from '../config';

const getAuthConfig = () => {
    const token = localStorage.getItem('token');
    return {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    };
};

export const accountService = {
    login: async (username, password) => {
        try {
            console.log('Sending login request with:', { username, password });
            console.log('API URL:', `${API_URL}/login`);
            
            const response = await axios.post(`${API_URL}/login`, {
                username,
                password
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            console.log('Login response:', response);
            return response;
        } catch (error) {
            console.error('Login error details:', {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message,
                config: {
                    url: error.config?.url,
                    method: error.config?.method,
                    data: error.config?.data,
                    headers: error.config?.headers
                }
            });
            throw error;
        }
    },

    getCurrentUser: async () => {
        try {
            const response = await axios.get(`${API_URL}/account`, getAuthConfig());
            return response;
        } catch (error) {
            console.error('Error getting current user:', error);
            throw error;
        }
    },

    register: async (userData) => {
        try {
            const response = await axios.post(`${API_URL}/auth/register`, userData);
            return response;
        } catch (error) {
            console.error('Register error:', error);
            throw error;
        }
    },

    updateProfile: async (userData) => {
        try {
            const response = await axios.put(`${API_URL}/account`, userData, getAuthConfig());
            return response;
        } catch (error) {
            console.error('Update profile error:', error);
            throw error;
        }
    },

    changePassword: async (passwordData) => {
        try {
            const response = await axios.put(`${API_URL}/account/change-password`, passwordData, getAuthConfig());
            return response;
        } catch (error) {
            console.error('Change password error:', error);
            throw error;
        }
    }
}; 