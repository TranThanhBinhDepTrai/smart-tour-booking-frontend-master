import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api/v1';

// Tạo instance axios với cấu hình mặc định
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

// Thêm interceptor để xử lý token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        console.log('Token from localStorage:', token);
        
        if (token) {
            // Kiểm tra format của token
            const cleanToken = token.replace('Bearer ', '');
            console.log('Clean token:', cleanToken);
            
            // Kiểm tra xem token có phải là JWT hợp lệ không
            const tokenParts = cleanToken.split('.');
            if (tokenParts.length === 3) {
                try {
                    // Decode phần payload của token
                    const payload = JSON.parse(atob(tokenParts[1]));
                    console.log('Token payload:', payload);
                    console.log('Token expiration:', new Date(payload.exp * 1000));
                    
                    // Kiểm tra token hết hạn
                    if (payload.exp && payload.exp * 1000 < Date.now()) {
                        console.warn('Token has expired!');
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                        window.location.href = '/login';
                        return config;
                    }
                } catch (e) {
                    console.error('Error decoding token:', e);
                }
            } else {
                console.warn('Token is not in valid JWT format!');
            }

            // Set token vào header
            config.headers.Authorization = `Bearer ${cleanToken}`;
            console.log('Final Authorization header:', config.headers.Authorization);
        } else {
            console.warn('No token found in localStorage!');
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor để xử lý response
api.interceptors.response.use(
    (response) => {
        // For VNPay, return the raw data object directly to avoid nested data structures.
        if (response.config.url.includes('/bookings/vnpay-return')) {
            return response.data;
        }
        
        // Nếu response có cấu trúc {statusCode, data, message}
        if (response.data && response.data.statusCode === 200) {
            response.data = response.data.data;
            return response;
        }
        // Nếu response là data trực tiếp
        return response;
    },
    (error) => {
        if (error.response) {
            // Server error
            console.error('API Error Response:', {
                status: error.response.status,
                data: error.response.data,
                headers: error.response.headers
            });

            // If 401 Unauthorized
            if (error.response.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login';
            }

            // If response has message, throw error with that message
            if (error.response.data && error.response.data.message) {
                return Promise.reject(new Error(error.response.data.message));
            }
        }
        return Promise.reject(error);
    }
);

// Các hàm xử lý authentication
export const authService = {
    // Đăng nhập người dùng thường
    login: async (username, password) => {
        try {
            const response = await api.post('/login', { username, password });
            console.log('Login response:', response.data);
            
            if (response.data && response.data.accessToken) {
                const userData = {
                    id: response.data.user.id,
                    email: response.data.user.email,
                    fullName: response.data.user.name,
                    role: response.data.user.role
                };
                
                localStorage.setItem('token', response.data.accessToken);
                localStorage.setItem('user', JSON.stringify(userData));
                
                return {
                    data: userData,
                    token: response.data.accessToken
                };
            }
            throw new Error('Invalid response data');
        } catch (error) {
            console.error('Login error details:', {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message
            });
            
            if (error.response) {
                throw error.response.data;
            } else if (error.request) {
                throw { message: 'Cannot connect to server. Please check your connection and try again.' };
            } else {
                throw { message: 'An error occurred. Please try again.' };
            }
        }
    },

    // Đăng nhập admin
    loginAdmin: async (username, password) => {
        try {
            const response = await api.post('/login', { username, password });
            console.log('Admin login response:', response.data);
            
            if (response.data && response.data.accessToken) {
                // Check admin role
                if (!response.data.user.role || response.data.user.role.name !== 'ADMIN') {
                    throw new Error('Account does not have admin privileges');
                }

                const userData = {
                    id: response.data.user.id,
                    email: response.data.user.email,
                    fullName: response.data.user.name,
                    role: response.data.user.role
                };

                localStorage.setItem('token', response.data.accessToken);
                localStorage.setItem('admin', JSON.stringify(userData));
                
                return {
                    data: userData,
                    token: response.data.accessToken
                };
            }
            throw new Error('Invalid response data');
        } catch (error) {
            console.error('Login Error:', {
                message: error.message,
                response: error.response?.data
            });
            
            throw { 
                message: error.message || 'An error occurred during login',
                details: error.response?.data
            };
        }
    },

    // Đăng xuất
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('admin');
    },

    // Kiểm tra người dùng đã đăng nhập
    getCurrentUser: () => {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    },

    // Kiểm tra admin đã đăng nhập
    getCurrentAdmin: () => {
        const adminStr = localStorage.getItem('admin');
        return adminStr ? JSON.parse(adminStr) : null;
    }
};

export const register = async (userData) => {
    try {
        const response = await api.post('/register', userData);
        return response.data;
    } catch (error) {
        console.error('Register error details:', {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message
        });
        throw error;
    }
};

export default api; 