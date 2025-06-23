import React, { useState } from 'react';
import { Container, Card, Button, Form } from 'react-bootstrap';
import { authService } from '../services/api';
import './Profile.css';

const Profile = () => {
    const user = authService.getCurrentUser() || authService.getCurrentAdmin();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        username: user?.username || '',
        email: user?.email || '',
        fullName: user?.fullName || '',
        phone: user?.phone || ''
    });

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        // TODO: Implement save profile functionality
        setIsEditing(false);
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const getAuthConfig = () => {
        const token = localStorage.getItem('token');
        if (!token) {
            return {}; // Không có token thì trả về config rỗng
        }
        return {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        };
    };

    if (!user) {
        return (
            <Container className="mt-4">
                <Card>
                    <Card.Body>
                        <h4>Vui lòng đăng nhập để xem thông tin tài khoản</h4>
                    </Card.Body>
                </Card>
            </Container>
        );
    }

    return (
        <Container className="mt-4">
            <Card>
                <Card.Header as="h4">Thông tin tài khoản</Card.Header>
                <Card.Body>
                    {isEditing ? (
                        <Form onSubmit={handleSave}>
                            <Form.Group className="mb-3">
                                <Form.Label>Tên đăng nhập</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    disabled
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Email</Form.Label>
                                <Form.Control
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Họ và tên</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Số điện thoại</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                />
                            </Form.Group>
                            <div className="d-flex gap-2">
                                <Button variant="primary" type="submit">
                                    Lưu thay đổi
                                </Button>
                                <Button variant="secondary" onClick={() => setIsEditing(false)}>
                                    Hủy
                                </Button>
                            </div>
                        </Form>
                    ) : (
                        <>
                            <div className="profile-info">
                                <div className="info-row">
                                    <strong>Tên đăng nhập:</strong>
                                    <span>{user.username}</span>
                                </div>
                                <div className="info-row">
                                    <strong>Email:</strong>
                                    <span>{user.email}</span>
                                </div>
                                <div className="info-row">
                                    <strong>Họ và tên:</strong>
                                    <span>{user.fullName}</span>
                                </div>
                                <div className="info-row">
                                    <strong>Vai trò:</strong>
                                    <span>{user.role === 'ADMIN' ? 'Quản trị viên' : 'Người dùng'}</span>
                                </div>
                                <div className="info-row">
                                    <strong>Số điện thoại:</strong>
                                    <span>{user.phone || 'Chưa cập nhật'}</span>
                                </div>
                            </div>
                            <Button variant="primary" onClick={handleEdit} className="mt-3">
                                Chỉnh sửa thông tin
                            </Button>
                        </>
                    )}
                </Card.Body>
            </Card>
        </Container>
    );
};

export default Profile; 