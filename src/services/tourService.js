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
            
            // Nếu thanh toán qua ngân hàng và đặt tour thành công
            if (!bookingData.isCashPayment && response.data.statusCode === 200) {
                // Kiểm tra và log dữ liệu booking
                const bookingResponse = response.data;
                console.log('Booking details:', bookingResponse);
                
                // Lấy ID từ response
                const bookingId = bookingResponse.data?.id;
                // Lấy tổng tiền từ bookingData
                const amount = bookingData.totalPrice || (bookingData.adults * bookingData.adultPrice + bookingData.children * bookingData.childPrice);
                
                if (!bookingId || !amount) {
                    console.error('Missing booking data:', { bookingId, amount });
                    throw new Error('Missing required booking data');
                }
                
                console.log('Payment params:', { bookingId, amount });
                
                // Tạo URL với các tham số được encode đúng cách
                const params = new URLSearchParams({
                    bookingId: bookingId.toString(), // Đảm bảo chuyển sang string
                    amount: Math.round(amount).toString(), // Làm tròn và chuyển sang string
                    orderInfo: `Thanh toan tour booking ${bookingId}`,
                    returnUrl: 'http://localhost:3000/payment-result'
                }).toString();
                
                console.log('Payment URL:', `${API_URL}/bookings/vnpay-payment?${params}`);
                
                // Gọi API tạo URL thanh toán VNPay
                const paymentResponse = await axios.get(
                    `${API_URL}/bookings/vnpay-payment?${params}`,
                    config
                );
                
                console.log('Payment response:', paymentResponse.data);
                
                // Chuyển hướng đến trang thanh toán VNPay
                if (paymentResponse.data.paymentUrl) {
                    window.location.href = paymentResponse.data.paymentUrl;
                } else {
                    throw new Error('No payment URL received from VNPay');
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