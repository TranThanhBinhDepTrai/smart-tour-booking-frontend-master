import api from './api';

const API_URL = 'http://localhost:8080/api/v1';

export const roleService = {
    getAllRoles: async (current = 1, pageSize = 10) => {
        try {
            const response = await api.get(`/roles`, {
                params: {
                    current,
                    pageSize
                }
            });
            console.log('Raw API Response:', response);
            return response;
        } catch (error) {
            console.error('Error in getAllRoles:', error);
            throw error;
        }
    },

    createRole: async (roleData) => {
        return api.post(`/roles`, roleData);
    },

    updateRole: async (id, roleData) => {
        const dataToSend = {
            ...roleData,
            id: id
        };
        return api.put(`/roles`, dataToSend);
    },

    deleteRole: async (id) => {
        return api.delete(`/roles/${id}`);
    }
}; 