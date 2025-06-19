import React, { useState, useEffect } from 'react';
import { Table, Badge, Alert, Spinner } from 'react-bootstrap';
import axios from 'axios';

const UserBookingHistory = ({ userId }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    const token = localStorage.getItem('token');
    axios.get(`http://localhost:8080/api/v1/bookings/user/${userId}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
      .then(res => {
        if (res.data.statusCode === 200) setBookings(res.data.data);
        else setError('Không thể tải lịch sử đặt tour');
      })
      .catch(() => setError('Không thể tải lịch sử đặt tour'))
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) return <div className="text-center my-4"><Spinner animation="border" /></div>;
  if (error) return <Alert variant="danger">{error}</Alert>;
  if (bookings.length === 0) return <Alert variant="info">Chưa có đơn đặt tour nào.</Alert>;

  return (
    <Table striped bordered hover>
      <thead>
        <tr>
          <th>Mã đơn</th>
          <th>Tour</th>
          <th>Ngày đặt</th>
          <th>Tổng tiền</th>
          <th>Trạng thái</th>
        </tr>
      </thead>
      <tbody>
        {bookings.map(b => (
          <tr key={b.id}>
            <td>{b.id}</td>
            <td>{b.tour.title}</td>
            <td>{new Date(b.bookingAt).toLocaleString('vi-VN')}</td>
            <td>{b.totalPrice.toLocaleString('vi-VN')} VNĐ</td>
            <td>
              <Badge bg={
                b.status === 'PENDING' ? 'warning' :
                b.status === 'CONFIRMED' ? 'success' :
                b.status === 'CANCELLED' ? 'danger' : 'info'
              }>
                {b.status}
              </Badge>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default UserBookingHistory; 