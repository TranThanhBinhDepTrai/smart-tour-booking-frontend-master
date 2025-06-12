import axios from 'axios';

const API_URL = 'http://localhost:8080/api/v1';

const getAuthConfig = () => {
    const token = localStorage.getItem('token');
    return token ? {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    } : {};
};

export const userService = {
    getAllUsers: async (current = 1, pageSize = 10) => {
        try {
            const response = await axios.get(
                `${API_URL}/users?current=${current}&pageSize=${pageSize}`,
                getAuthConfig()
            );
            console.log('Get all users response:', response.data);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: error.message };
        }
    },

    getUserById: async (id) => {
        try {
            const response = await axios.get(
                `${API_URL}/users/${id}`,
                getAuthConfig()
            );
            console.log('User detail response:', response.data);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: error.message };
        }
    },

    updateUser: async (userData) => {
        try {
            const dataToSend = { ...userData };
            if (!dataToSend.password) {
                delete dataToSend.password;
            }

            const response = await axios.put(
                `${API_URL}/users`,
                dataToSend,
                getAuthConfig()
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: error.message };
        }
    },

    deleteUser: async (id) => {
        try {
            const response = await axios.delete(
                `${API_URL}/users/${id}`,
                getAuthConfig()
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: error.message };
        }
    },

    blockUser: async (id) => {
        try {
            const response = await axios.put(
                `${API_URL}/users/${id}/block`,
                {},
                getAuthConfig()
            );
            console.log('Block user response:', response.data);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: error.message };
        }
    },

    unblockUser: async (id) => {
        try {
            const response = await axios.put(
                `${API_URL}/users/${id}/unblock`,
                {},
                getAuthConfig()
            );
            console.log('Unblock user response:', response.data);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: error.message };
        }
    }
}; 