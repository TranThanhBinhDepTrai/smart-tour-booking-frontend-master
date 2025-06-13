import React, { useState, useEffect } from 'react';
import { Table, Badge, Button, Alert } from 'react-bootstrap';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import './UserBookings.css';

const UserBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { currentUser } = useAuth();

    useEffect(() => {
        fetchUserBookings();
    }, []);

    const fetchUserBookings = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`http://localhost:8080/api/v1/bookings/user/${currentUser.id}`);
            if (response.data.statusCode === 200) {
                setBookings(response.data.data);
            }
        } catch (err) {
            console.error('Lỗi khi tải danh sách đơn đặt tour:', err);
            setError('Không thể tải danh sách đơn đặt tour');
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const statusMap = {
            'PENDING': { text: 'Chờ xử lý', variant: 'warning' },
            'CONFIRMED': { text: 'Đã xác nhận', variant: 'success' },
            'CANCELLED': { text: 'Đã hủy', variant: 'danger' },
            'COMPLETED': { text: 'Hoàn thành', variant: 'info' }
        };
        const statusInfo = statusMap[status] || { text: status, variant: 'secondary' };
        return <Badge bg={statusInfo.variant}>{statusInfo.text}</Badge>;
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('vi-VN');
    };

    const formatPrice = (price) => {
        if (typeof price === 'number') {
            return price.toLocaleString('vi-VN') + ' VNĐ';
        }
        if (typeof price === 'string' && price.includes('E')) {
            const [base, exponent] = price.split('E');
            const actualPrice = parseFloat(base) * Math.pow(10, parseInt(exponent));
            return actualPrice.toLocaleString('vi-VN') + ' VNĐ';
        }
        return '0 VNĐ';
    };

    if (loading) {
        return (
            <div className="text-center my-4">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Đang tải...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <Alert variant="danger" className="my-3">
                {error}
            </Alert>
        );
    }

    if (bookings.length === 0) {
        return (
            <Alert variant="info" className="my-3">
                Bạn chưa có đơn đặt tour nào.
            </Alert>
        );
    }

    return (
        <div className="user-bookings">
            <h3 className="mb-4">Đơn đặt tour của bạn</h3>
            <div className="table-responsive">
                <Table striped bordered hover>
                    <thead>
                        <tr>
                            <th>Mã đơn</th>
                            <th>Tour</th>
                            <th>Ngày đặt</th>
                            <th>Tổng tiền</th>
                            <th>Trạng thái</th>
                            <th>Khuyến mãi</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {bookings.map((booking) => (
                            <tr key={booking.id}>
                                <td>{booking.id}</td>
                                <td>
                                    <div><strong>{booking.tour.title}</strong></div>
                                    <div>Bắt đầu: {formatDate(booking.tour.startDate)}</div>
                                    <div>Kết thúc: {formatDate(booking.tour.endDate)}</div>
                                </td>
                                <td>{booking.bookingAt}</td>
                                <td>{formatPrice(booking.totalPrice)}</td>
                                <td>{getStatusBadge(booking.status)}</td>
                                <td>
                                    {booking.promotionDto ? (
                                        <>
                                            <div><strong>{booking.promotionDto.code}</strong></div>
                                            <div>Giảm {booking.promotionDto.discountPercent}%</div>
                                        </>
                                    ) : (
                                        'Không có'
                                    )}
                                </td>
                                <td>
                                    <Button 
                                        variant="primary" 
                                        size="sm" 
                                        className="me-2"
                                        onClick={() => {/* Xem chi tiết */}}
                                    >
                                        Chi tiết
                                    </Button>
                                    {booking.status === 'PENDING' && (
                                        <Button 
                                            variant="danger" 
                                            size="sm"
                                            onClick={() => {/* Hủy đơn */}}
                                        >
                                            Hủy đơn
                                        </Button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </div>
        </div>
    );
};

export default UserBookings; 