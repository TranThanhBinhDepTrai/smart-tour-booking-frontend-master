import axios from 'axios';

const API_URL = 'http://localhost:8080/api/v1';

export const bookingService = {
    getUserBookings: async (userId) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No token found');
            }

            const response = await axios.get(`${API_URL}/bookings/user/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error in getUserBookings:', error);
            throw error;
        }
    },

    cancelBooking: async (bookingId) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No token found');
            }

            const response = await axios.delete(`${API_URL}/bookings/${bookingId}/cancel`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
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
    }
}; 