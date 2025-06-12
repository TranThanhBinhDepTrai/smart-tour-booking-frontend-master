import api from './api';

export const permissionService = {
    getAllPermissions: async (current = 1, pageSize = 10) => {
        try {
            const response = await api.get(`/permissions`, {
                params: {
                    current,
                    pageSize
                }
            });
            console.log('Raw API Response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error in getAllPermissions:', error);
            throw error;
        }
    },

    createPermission: async (permissionData) => {
        const response = await api.post(`/permissions`, permissionData);
        return response.data;
    },

    updatePermission: async (permissionData) => {
        try {
            const response = await api.post(`/permissions`, permissionData);
            console.log('Update Response:', response.data);
            
            if (response.data.statusCode !== 200 && response.data.statusCode !== 201) {
                throw new Error(response.data.message || 'Cập nhật thất bại');
            }
            
            return response.data.data;
        } catch (error) {
            console.error('Error in updatePermission:', error);
            throw error;
        }
    },

    deletePermission: async (id) => {
        try {
            const response = await api.delete(`/permissions/${id}`);
            console.log('Delete Response:', response.data);
            
            if (response.data.statusCode !== 200 && response.data.statusCode !== 201) {
                throw new Error(response.data.message || 'Xóa thất bại');
            }
            
            return response.data;
        } catch (error) {
            console.error('Error in deletePermission:', error);
            throw error;
        }
    }
}; 