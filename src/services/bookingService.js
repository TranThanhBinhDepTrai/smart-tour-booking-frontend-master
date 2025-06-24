import api from './api';
import { API_URL } from '../config';
import axios from 'axios';

const getAuthConfig = () => {
    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error('No token found');
    }
    return {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    };
};

export const bookingService = {
    getUserBookings: async (userId) => {
        try {
            const response = await api.get(`/bookings/user/${userId}`, getAuthConfig());
            return response.data;
        } catch (error) {
            console.error('Error in getUserBookings:', error);
            throw error;
        }
    },

    cancelBooking: async (bookingId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.delete(
                `${API_URL}/bookings/${bookingId}/cancel`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            return response.data;
        } catch (error) {
            console.error('Error in cancelBooking:', error);
            if (error.response) {
                // Server trả về response với status code lỗi
                console.error('Error response:', error.response.data);
                throw new Error(error.response.data?.message || 'Không thể hủy đơn. Vui lòng thử lại sau.');
            } else if (error.request) {
                // Request được gửi nhưng không nhận được response
                throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.');
            } else {
                // Lỗi khi setting up request
                throw new Error('Có lỗi xảy ra. Vui lòng thử lại sau.');
            }
        }
    },

    verifyVNPayPayment: async (params) => {
        try {
            // The interceptor now directly returns the data payload for this URL
            const responseData = await api.get(`/bookings/vnpay-return`, { params });
            return responseData;
        } catch (error) {
            console.error('Error verifying VNPay payment:', error);
            throw error.response?.data || error.data || { message: 'Lỗi xác thực thanh toán' };
        }
    },

    // Lấy lịch sử đặt tour của người dùng
    getUserBookingHistory: async (userId) => {
        try {
            const response = await api.get(`/bookings/user/${userId}/history`, getAuthConfig());
            return response.data;
        } catch (error) {
            console.error('Error in getUserBookingHistory:', error);
            throw error;
        }
    }
}; 