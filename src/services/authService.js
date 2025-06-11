import axios from 'axios';

const API_URL = 'http://localhost:8080/api/v1'; // Spring Boot backend URL

const register = async (userData) => {
  try {
    // Chuyển đổi ngày sinh sang định dạng ISO string
    if (userData.birthDate) {
      userData.birthDate = new Date(userData.birthDate).toISOString().split('T')[0];
    }

    const response = await axios.post(`${API_URL}/register`, userData);
    if (response.data) {
      // Nếu đăng ký thành công, có thể lưu token hoặc thông tin user vào localStorage
      console.log('Đăng ký thành công:', response.data);
    }
    return response.data;
  } catch (error) {
    console.error('Lỗi đăng ký:', error.response?.data || error.message);
    if (error.response?.data?.message) {
      throw { message: error.response.data.message };
    }
    throw { message: 'Đã xảy ra lỗi khi đăng ký' };
  }
};

const authService = {
  register,
};

export default authService; 