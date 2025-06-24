import api from './api';
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

export const emailService = {
    // Gửi email xác nhận đặt tour
    sendBookingConfirmation: async (bookingId) => {
        try {
            const response = await api.post(`/email/booking-confirmation/${bookingId}`, {}, getAuthConfig());
            return response.data;
        } catch (error) {
            console.error('Error sending booking confirmation email:', error);
            throw error;
        }
    },

    // Gửi email thông báo thanh toán thành công
    sendPaymentSuccess: async (bookingId) => {
        try {
            const response = await api.post(`/email/payment-success/${bookingId}`, {}, getAuthConfig());
            return response.data;
        } catch (error) {
            console.error('Error sending payment success email:', error);
            throw error;
        }
    },

    // Gửi email thông báo hủy tour
    sendBookingCancellation: async (bookingId) => {
        try {
            const response = await api.post(`/email/booking-cancellation/${bookingId}`, {}, getAuthConfig());
            return response.data;
        } catch (error) {
            console.error('Error sending booking cancellation email:', error);
            throw error;
        }
    },

    // Gửi email thông báo cập nhật trạng thái tour
    sendBookingStatusUpdate: async (bookingId, status) => {
        try {
            const response = await api.post(`/email/booking-status-update/${bookingId}`, { status }, getAuthConfig());
            return response.data;
        } catch (error) {
            console.error('Error sending booking status update email:', error);
            throw error;
        }
    }
}; 