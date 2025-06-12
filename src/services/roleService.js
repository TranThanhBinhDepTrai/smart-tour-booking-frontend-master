import axios from 'axios';
import { API_URL } from '../config';
import { getAuthConfig } from '../utils/auth';

export const roleService = {
    getAllRoles: async (current = 1, pageSize = 10) => {
        try {
            const response = await axios.get(
                `${API_URL}/roles`,
                {
                    ...getAuthConfig(),
                    params: {
                        current,
                        pageSize
                    }
                }
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: error.message };
        }
    },

    getAllPermissions: async () => {
        try {
            const response = await axios.get(
                `${API_URL}/permissions?current=1&pageSize=1000`,
                getAuthConfig()
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: error.message };
        }
    },

    updateRole: async (roleData) => {
        try {
            const response = await axios.put(
                `${API_URL}/roles`,
                roleData,
                getAuthConfig()
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: error.message };
        }
    },

    createRole: async (roleData) => {
        try {
            const response = await axios.post(
                `${API_URL}/roles`,
                roleData,
                getAuthConfig()
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: error.message };
        }
    },

    deleteRole: async (id) => {
        try {
            const response = await axios.delete(
                `${API_URL}/roles/${id}`,
                getAuthConfig()
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: error.message };
        }
    }
}; 