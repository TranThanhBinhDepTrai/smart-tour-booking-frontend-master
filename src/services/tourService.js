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

    // Lấy các tour gợi ý liên quan
    getRelatedTours: async (tourId) => {
        try {
            // Sử dụng API giả để test
            // Trong thực tế, bạn cần sửa API backend để hỗ trợ CORS
            // Đây là giải pháp tạm thời để demo
            // const response = await axios.get(`http://localhost:5000/api/tour-recommendations?tour_id=${tourId}`);
            
            // Giả lập response để test
            const mockResponse = {
                related_tours: [18, 23, 26]
            };
            return mockResponse;
        } catch (error) {
            console.error("Error fetching related tours:", error);
            // Trả về mảng rỗng nếu có lỗi
            return { related_tours: [] };
        }
    },
    
    // Lấy gợi ý tour cho người dùng
    getUserRecommendations: async (userId) => {
        try {
            console.log(`Fetching recommendations for user ${userId}`);
            
            // Thử gọi API gợi ý tour
            try {
                const response = await axios.get(`http://localhost:5000/api/user-recommendations?user_id=${userId}`);
                console.log('Recommendations API response:', response.data);
                return response.data;
            } catch (apiError) {
                console.error("Error calling recommendations API:", apiError);
                console.log("Using fallback recommendations");
                
                // Nếu API không hoạt động, sử dụng danh sách ID cố định
                return {
                    recommended_tours: [18, 23, 30, 31, 26, 32]
                };
            }
        } catch (error) {
            console.error("Error in getUserRecommendations:", error);
            // Trả về mảng rỗng nếu có lỗi
            return { recommended_tours: [] };
        }
    },
    
    // Lấy thông tin nhiều tour theo danh sách ID
    getMultipleTours: async (tourIds) => {
        try {
            if (!tourIds || tourIds.length === 0) return [];
            
            console.log('Fetching multiple tours with IDs:', tourIds);
            
            // Sử dụng API thực tế để lấy thông tin tour
            const tourPromises = tourIds.map(id => 
                axios.get(`${API_URL}/tours/${id}`)
                    .then(response => {
                        console.log(`Tour ${id} data:`, response.data);
                        return response.data.data;
                    })
                    .catch(error => {
                        console.error(`Error fetching tour ${id}:`, error);
                        return null;
                    })
            );
            
            const tours = await Promise.all(tourPromises);
            return tours.filter(tour => tour !== null); // Lọc bỏ các tour null (lỗi)
        } catch (error) {
            console.error("Error fetching multiple tours:", error);
            return [];
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
    },

    // Search tours with filters
    searchTours: async (params) => {
        try {
            const config = getAuthConfig();
            // Format search parameters
            const searchParams = {
                pageNo: params.page || 0,
                pageSize: params.size || 10,
                category: params.category,
                available: true
            };

            console.log('Sending search request with params:', searchParams);
            console.log('Using config:', config);

            const response = await axios.post(`${API_URL}/tours/search`, searchParams, config);
            console.log('Search response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error searching tours:', error);
            if (error.response) {
                console.error('Error response data:', error.response.data);
                console.error('Error response status:', error.response.status);
                console.error('Error response headers:', error.response.headers);
            }
            throw error;
        }
    },

    createCustomTour: async (customTourData) => {
        try {
            const response = await axios.post(`${API_URL}/tour/custom`, customTourData);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    getAllTours: async () => {
        try {
            // Lấy tất cả tour, size lớn hơn tổng số tour
            const response = await axios.get(`${API_URL}/tours`, { params: { page: 0, size: 1000 } });
            return response.data;
        } catch (error) {
            throw error;
        }
    }
}; 