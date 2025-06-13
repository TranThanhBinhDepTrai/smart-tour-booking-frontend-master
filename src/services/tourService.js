import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api/v1';

const getAuthConfig = () => {
    const token = localStorage.getItem('token');
    return token ? {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    } : {
        headers: {
            'Content-Type': 'application/json'
        }
    };
};

export const tourService = {
    // Lấy danh sách tour
    getTours: async (params) => {
        try {
            const response = await axios.get(`${API_URL}/tours`, { params });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Lấy chi tiết tour theo ID
    getTourById: async (id) => {
        try {
            const response = await axios.get(`${API_URL}/tours/${id}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Đặt tour
    bookTour: async (bookingData) => {
        try {
            const config = getAuthConfig();
            console.log('Booking with config:', config);
            console.log('Booking data:', bookingData);
            
            const response = await axios.post(`${API_URL}/bookings/create`, bookingData, config);
            console.log('Booking response:', response.data);
            
            // Nếu đặt tour thành công
            if (response.data.statusCode === 200) {
                // Nếu là thanh toán tiền mặt, trả về response luôn
                if (bookingData.isCashPayment) {
                    return response.data;
                }
                
                // Nếu response đã có vnPayUrl, trả về luôn
                if (response.data.data?.vnPayUrl) {
                    return response.data;
                }
            }
            
            return response.data;
        } catch (error) {
            console.error('Booking error:', error.response?.data || error);
            throw error;
        }
    },

    // Tạo tour mới (Admin)
    createTour: async (tourData) => {
        try {
            const config = getAuthConfig();
            const response = await axios.post(`${API_URL}/tours`, tourData, config);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Cập nhật tour (Admin)
    updateTour: async (id, tourData) => {
        try {
            const config = getAuthConfig();
            const response = await axios.put(`${API_URL}/tours/${id}`, tourData, config);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Xóa tour (Admin)
    deleteTour: async (id) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.delete(`${API_URL}/tours/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Tải file PDF thông tin tour
    downloadTourPDF: async (id) => {
        try {
            const response = await axios.get(`${API_URL}/tours/${id}/pdf`, {
                responseType: 'blob'
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    }
}; 