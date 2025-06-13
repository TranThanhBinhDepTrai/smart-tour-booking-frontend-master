import React, { useState, useEffect } from 'react';
import { Container, Card, Row, Col, Button, Form, Modal } from 'react-bootstrap';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import './Profile.css';

const Profile = () => {
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState(null);
    const navigate = useNavigate();

    // State cho modal đổi mật khẩu
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordData, setPasswordData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    // State cho modal xóa tài khoản
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await api.get('/account');
                console.log('Profile API Response:', response.data);
                if (response.data && response.data.data) {
                    const profileData = response.data.data;
                    console.log('Name field from API:', profileData.fullName);
                    console.log('Full profile data:', profileData);
                    setUserProfile(profileData);
                    setFormData({
                        fullName: profileData.fullName || '',
                        email: profileData.email || '',
                        phone: profileData.phone || '',
                        address: profileData.address || '',
                        birthDate: profileData.birthDate || '',
                        gender: profileData.gender || ''
                    });
                } else {
                    throw new Error('Invalid response format');
                }
                setLoading(false);
            } catch (err) {
                console.error('Profile fetch error:', err);
                setError('Không thể tải thông tin tài khoản');
                setLoading(false);
                if (err.response?.status === 401) {
                    navigate('/login');
                }
            }
        };

        fetchProfile();
    }, [navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        console.log('Field changed:', name, 'New value:', value);
        setFormData(prev => {
            const newData = {
                ...prev,
                [name]: value
            };
            console.log('New form data:', newData);
            return newData;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            console.log('Current profile state before update:', userProfile);
            console.log('Form data being submitted:', formData);
            
            // Tạo object chỉ chứa các trường đã thay đổi
            const updatedFields = {};
            Object.keys(formData).forEach(key => {
                if (formData[key] !== userProfile[key] && formData[key] !== '') {
                    updatedFields[key] = formData[key];
                    console.log(`Field '${key}' changed from '${userProfile[key]}' to '${formData[key]}'`);
                }
            });

            console.log('Fields to update:', updatedFields);

            if (Object.keys(updatedFields).length === 0) {
                console.log('No fields to update');
                setIsEditing(false);
                return;
            }

            // Thêm id vào request body
            const requestBody = {
                ...userProfile,  // Giữ lại tất cả thông tin hiện tại
                ...updatedFields // Cập nhật các trường đã thay đổi
            };
            console.log('Sending request with body:', requestBody);

            const response = await api.put('/users', requestBody);
            console.log('Update Profile Response:', response);

            if (response.data && response.data.data) {
                setUserProfile(response.data.data);
                setIsEditing(false);
                alert('Cập nhật thông tin thành công!');
            } else {
                throw new Error('Invalid update response format');
            }
        } catch (err) {
            console.error('Update profile error:', err);
            console.error('Error response data:', err.response?.data);
            const errorMessage = err.response?.data?.message || err.message || 'Không thể cập nhật thông tin tài khoản';
            setError(errorMessage);
            alert('Lỗi: ' + errorMessage);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            alert('Mật khẩu mới không khớp!');
            return;
        }
        try {
            const response = await api.put('/users', {
                id: userProfile.id,
                password: passwordData.newPassword
            });
            if (response.data) {
                setShowPasswordModal(false);
                setPasswordData({
                    oldPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                });
                alert('Đổi mật khẩu thành công!');
            }
        } catch (err) {
            alert('Đổi mật khẩu thất bại: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleDeleteAccount = async () => {
        try {
            await api.delete(`/users/${userProfile.id}`);
            localStorage.removeItem('token');
            navigate('/login');
        } catch (err) {
            alert('Xóa tài khoản thất bại: ' + (err.response?.data?.message || err.message));
        }
    };

    if (loading) return <div className="text-center mt-5">Đang tải...</div>;
    if (error) return <div className="text-center mt-5 text-danger">{error}</div>;
    if (!userProfile) return <div className="text-center mt-5">Không tìm thấy thông tin tài khoản</div>;

    // Log current profile data
    console.log('Current Profile State:', userProfile);

    return (
        <div className="profile-container">
            <Card className="profile-card">
                <Card.Header className="profile-header">
                    Thông tin tài khoản
                </Card.Header>
                <Card.Body className="profile-body">
                    {isEditing ? (
                        <Form onSubmit={handleSubmit}>
                            <Row>
                                <Col md={6}>
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
                                        <Form.Label>Email</Form.Label>
                                        <Form.Control
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            disabled
                                        />
                                    </Form.Group>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Số điện thoại</Form.Label>
                                        <Form.Control
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
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
                                            value={formData.address}
                                            onChange={handleChange}
                                        />
                                    </Form.Group>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Ngày sinh</Form.Label>
                                        <Form.Control
                                            type="date"
                                            name="birthDate"
                                            value={formData.birthDate}
                                            onChange={handleChange}
                                        />
                                    </Form.Group>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Giới tính</Form.Label>
                                        <Form.Select
                                            name="gender"
                                            value={formData.gender}
                                            onChange={handleChange}
                                        >
                                            <option value="">Chọn giới tính</option>
                                            <option value="MALE">Nam</option>
                                            <option value="FEMALE">Nữ</option>
                                            <option value="OTHER">Khác</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                            </Row>
                            <div className="d-flex justify-content-end gap-2 mt-3">
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
                                    <div className="profile-info-group">
                                        <div className="profile-label">Họ và tên</div>
                                        <div className="profile-value">
                                            {(() => {
                                                console.log('Rendering name value:', userProfile.fullName);
                                                return userProfile.fullName || 'Chưa cập nhật';
                                            })()}
                                        </div>
                                    </div>
                                    <div className="profile-info-group">
                                        <div className="profile-label">Email</div>
                                        <div className="profile-value">{userProfile.email}</div>
                                    </div>
                                    <div className="profile-info-group">
                                        <div className="profile-label">Số điện thoại</div>
                                        <div className="profile-value">{userProfile.phone || 'Chưa cập nhật'}</div>
                                    </div>
                                </Col>
                                <Col md={6}>
                                    <div className="profile-info-group">
                                        <div className="profile-label">Địa chỉ</div>
                                        <div className="profile-value">{userProfile.address || 'Chưa cập nhật'}</div>
                                    </div>
                                    <div className="profile-info-group">
                                        <div className="profile-label">Ngày sinh</div>
                                        <div className="profile-value">
                                            {userProfile.birthDate ? new Date(userProfile.birthDate).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}
                                        </div>
                                    </div>
                                    <div className="profile-info-group">
                                        <div className="profile-label">Giới tính</div>
                                        <div className="profile-value">
                                            {userProfile.gender === 'MALE' ? 'Nam' :
                                             userProfile.gender === 'FEMALE' ? 'Nữ' :
                                             userProfile.gender === 'OTHER' ? 'Khác' : 'Chưa cập nhật'}
                                        </div>
                                    </div>
                                    <div className="profile-info-group">
                                        <div className="profile-label">Vai trò</div>
                                        <div className="profile-value">
                                            {userProfile.role?.name === 'admin' ? 'Quản trị viên' : 'Người dùng'}
                                        </div>
                                    </div>
                                </Col>
                            </Row>
                            <div className="d-flex justify-content-end gap-2 mt-3">
                                <Button variant="primary" onClick={() => setIsEditing(true)}>
                                    Chỉnh sửa thông tin
                                </Button>
                                <Button variant="warning" onClick={() => setShowPasswordModal(true)}>
                                    Đổi mật khẩu
                                </Button>
                                <Button variant="danger" onClick={() => setShowDeleteModal(true)}>
                                    Xóa tài khoản
                                </Button>
                            </div>
                        </>
                    )}
                </Card.Body>
            </Card>

            {/* Modal đổi mật khẩu */}
            <Modal show={showPasswordModal} onHide={() => setShowPasswordModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Đổi mật khẩu</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handlePasswordChange}>
                        <Form.Group className="mb-3">
                            <Form.Label>Mật khẩu mới</Form.Label>
                            <Form.Control
                                type="password"
                                value={passwordData.newPassword}
                                onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Xác nhận mật khẩu mới</Form.Label>
                            <Form.Control
                                type="password"
                                value={passwordData.confirmPassword}
                                onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                                required
                            />
                        </Form.Group>
                        <div className="d-flex justify-content-end gap-2">
                            <Button variant="secondary" onClick={() => setShowPasswordModal(false)}>
                                Hủy
                            </Button>
                            <Button variant="primary" type="submit">
                                Xác nhận
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>

            {/* Modal xác nhận xóa tài khoản */}
            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Xác nhận xóa tài khoản</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Bạn có chắc chắn muốn xóa tài khoản? Hành động này không thể hoàn tác!</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                        Hủy
                    </Button>
                    <Button variant="danger" onClick={handleDeleteAccount}>
                        Xác nhận xóa
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default Profile; 