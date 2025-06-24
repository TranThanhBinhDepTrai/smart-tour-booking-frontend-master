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

export const promotionService = {
    // Public method that doesn't require authentication
    getPublicPromotions: async (page = 0, limit = 10) => {
        try {
            const response = await axios.get(
                `${API_URL}/public/promotions?page=${page}&limit=${limit}`
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: error.message };
        }
    },

    // Get promotion details by ID
    getPromotionById: async (id) => {
        try {
            const response = await axios.get(
                `${API_URL}/promotions/${id}`,
                getAuthConfig()
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: error.message };
        }
    },

    // Search promotions
    searchPromotions: async (keyword) => {
        try {
            const response = await axios.get(
                `${API_URL}/promotions/search?keyword=${encodeURIComponent(keyword)}`,
                getAuthConfig()
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: error.message };
        }
    },

    // Protected methods that require authentication
    getAllPromotions: async (page = 0, limit = 10) => {
        try {
            const response = await axios.get(
                `${API_URL}/promotions?page=${page}&limit=${limit}`,
                getAuthConfig()
            );
            return response.data;
        } catch (error) {
            // Nếu lỗi 401 (Unauthorized) hoặc 403 (Forbidden), vẫn tiếp tục hiển thị
            if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                return { data: [] }; // Trả về mảng rỗng để component có thể hiển thị thông báo phù hợp
            }
            throw error.response?.data || { message: error.message };
        }
    },

    // Kiểm tra mã giảm giá có hợp lệ không
    validatePromotionCode: async (code) => {
        try {
            const response = await axios.get(`${API_URL}/promotions/validate/${code}`);
            return response.data;
        } catch (error) {
            console.error('Error validating promotion code:', error);
            throw error.response?.data || { message: error.message };
        }
    },

    sendPromotionEmails: async (promotionCode, emails) => {
        try {
            const response = await axios.post(
                `${API_URL}/promotions/send`,
                { promotionCode, emails },
                getAuthConfig()
            );
            return response.data;
        } catch (error) {
            console.error('Error sending promotion emails:', error);
            throw error.response?.data || { message: error.message };
        }
    },

    createPromotion: async (promotionData) => {
        try {
            const response = await axios.post(
                `${API_URL}/promotions`, 
                { ...promotionData, active: true },
                getAuthConfig()
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: error.message };
        }
    },

    updatePromotion: async (id, promotionData) => {
        try {
            const response = await axios.put(
                `${API_URL}/promotions/${id}`, 
                promotionData,
                getAuthConfig()
            );
            console.log('Update promotion response:', response.data);
            
            if (response.data.statusCode !== 200) {
                throw new Error(response.data.message || 'Cập nhật thất bại');
            }
            
            return response.data;
        } catch (error) {
            console.error('Update promotion error:', error.response?.data || error);
            throw error.response?.data || { message: error.message };
        }
    },

    togglePromotionStatus: async (id) => {
        try {
            const response = await axios.delete(
                `${API_URL}/promotions/${id}`,
                getAuthConfig()
            );
            console.log('Toggle promotion status response:', response.data);
            
            // Nếu không có lỗi từ server, coi như thành công
            if (!response.data.error) {
                return {
                    statusCode: 200,
                    message: 'Success',
                    data: response.data
                };
            } else {
                throw new Error(response.data.message || 'Vô hiệu hóa thất bại');
            }
        } catch (error) {
            console.error('Toggle promotion status error:', error);
            throw error.response?.data || error;
        }
    },

    deletePromotion: async (id) => {
        try {
            const response = await axios.delete(
                `${API_URL}/promotions/${id}`,
                getAuthConfig()
            );
            return response.data;
        } catch (error) {
            console.error('Delete promotion error:', error.response?.data);
            throw error.response?.data || { message: error.message };
        }
    },

    getAvailablePromotions: async () => {
        try {
            const response = await axios.get(`${API_URL}/promotions`, getAuthConfig());
            return response;
        } catch (error) {
            console.error('Error fetching promotions:', error);
            throw error;
        }
    },

    // Lấy danh sách mã khuyến mãi của user (yêu cầu đăng nhập)
    getUserPromotions: async (page = 0, size = 100) => {
        try {
            const response = await axios.get(
                `${API_URL}/promotions/custom?page=${page}&size=${size}`,
                getAuthConfig()
            );
            return response.data;
        } catch (error) {
            if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                return { data: [] };
            }
            throw error.response?.data || { message: error.message };
        }
    }
}; 