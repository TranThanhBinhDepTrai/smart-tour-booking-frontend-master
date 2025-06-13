import React, { useState, useEffect } from 'react';
import { Container, Card, Row, Col, Button, Form } from 'react-bootstrap';
import axios from 'axios';
import './Profile.css';

const Profile = () => {
    const [userProfile, setUserProfile] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState(null);

    useEffect(() => {
        fetchUserProfile();
    }, []);

    const fetchUserProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                return;
            }

            const response = await axios.get('http://localhost:8080/api/v1/account', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.data.statusCode === 200) {
                setUserProfile(response.data.data);
                setFormData(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching user profile:', error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const response = await axios.put('http://localhost:8080/api/v1/users', 
                {
                    id: formData.id,
                    fullName: formData.fullName,
                    password: formData.password,
                    address: formData.address,
                    phone: formData.phone,
                    birthDate: formData.birthDate,
                    gender: formData.gender
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            if (response.data) {
                const updatedData = {
                    ...userProfile,
                    fullName: formData.fullName,
                    address: formData.address,
                    phone: formData.phone,
                    birthDate: formData.birthDate,
                    gender: formData.gender
                };
                setUserProfile(updatedData);
                setFormData(updatedData);
                setIsEditing(false);
                alert('Cập nhật thông tin thành công!');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Có lỗi xảy ra khi cập nhật thông tin!');
        }
    };

    if (!userProfile) {
        return (
            <Container className="mt-4">
                <div className="text-center">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            </Container>
        );
    }

    return (
        <Container className="mt-4">
            <Card>
                <Card.Header className="bg-primary text-white">
                    <h4 className="mb-0">Thông tin tài khoản</h4>
                </Card.Header>
                <Card.Body>
                    {isEditing ? (
                        <Form onSubmit={handleSubmit}>
                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Họ và tên</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="fullName"
                                            value={formData.fullName || ''}
                                            onChange={handleChange}
                                        />
                                    </Form.Group>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Email</Form.Label>
                                        <Form.Control
                                            type="email"
                                            value={formData.email || ''}
                                            disabled
                                        />
                                    </Form.Group>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Số điện thoại</Form.Label>
                                        <Form.Control
                                            type="tel"
                                            name="phone"
                                            value={formData.phone || ''}
                                            onChange={handleChange}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Địa chỉ</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="address"
                                            value={formData.address || ''}
                                            onChange={handleChange}
                                        />
                                    </Form.Group>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Ngày sinh</Form.Label>
                                        <Form.Control
                                            type="date"
                                            name="birthDate"
                                            value={formData.birthDate || ''}
                                            onChange={handleChange}
                                        />
                                    </Form.Group>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Giới tính</Form.Label>
                                        <Form.Select
                                            name="gender"
                                            value={formData.gender || ''}
                                            onChange={handleChange}
                                        >
                                            <option value="">Chọn giới tính</option>
                                            <option value="MALE">Nam</option>
                                            <option value="FEMALE">Nữ</option>
                                            <option value="OTHER">Khác</option>
                                        </Form.Select>
                                    </Form.Group>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Mật khẩu (để xác thực)</Form.Label>
                                        <Form.Control
                                            type="password"
                                            name="password"
                                            onChange={handleChange}
                                            required
                                            placeholder="Nhập mật khẩu để xác thực"
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                            <div className="d-flex justify-content-end gap-2">
                                <Button variant="secondary" onClick={() => setIsEditing(false)}>
                                    Hủy
                                </Button>
                                <Button variant="primary" type="submit">
                                    Lưu thay đổi
                                </Button>
                            </div>
                        </Form>
                    ) : (
                        <>
                            <Row>
                                <Col md={6}>
                                    <div className="mb-3">
                                        <strong>Họ và tên:</strong>
                                        <p>{userProfile.fullName || 'Chưa cập nhật'}</p>
                                    </div>
                                    <div className="mb-3">
                                        <strong>Email:</strong>
                                        <p>{userProfile.email}</p>
                                    </div>
                                    <div className="mb-3">
                                        <strong>Số điện thoại:</strong>
                                        <p>{userProfile.phone || 'Chưa cập nhật'}</p>
                                    </div>
                                </Col>
                                <Col md={6}>
                                    <div className="mb-3">
                                        <strong>Địa chỉ:</strong>
                                        <p>{userProfile.address || 'Chưa cập nhật'}</p>
                                    </div>
                                    <div className="mb-3">
                                        <strong>Ngày sinh:</strong>
                                        <p>{userProfile.birthDate ? new Date(userProfile.birthDate).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}</p>
                                    </div>
                                    <div className="mb-3">
                                        <strong>Giới tính:</strong>
                                        <p>
                                            {userProfile.gender === 'MALE' ? 'Nam' :
                                             userProfile.gender === 'FEMALE' ? 'Nữ' :
                                             userProfile.gender === 'OTHER' ? 'Khác' : 'Chưa cập nhật'}
                                        </p>
                                    </div>
                                    <div className="mb-3">
                                        <strong>Vai trò:</strong>
                                        <p>{userProfile.role?.name === 'admin' ? 'Quản trị viên' : 'Người dùng'}</p>
                                    </div>
                                </Col>
                            </Row>
                            <div className="d-flex justify-content-end">
                                <Button variant="primary" onClick={() => setIsEditing(true)}>
                                    Chỉnh sửa thông tin
                                </Button>
                            </div>
                        </>
                    )}
                </Card.Body>
            </Card>
        </Container>
    );
};

export default Profile; 