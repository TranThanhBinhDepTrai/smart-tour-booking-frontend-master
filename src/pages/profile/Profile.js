import React, { useState, useEffect } from 'react';
import { Container, Card, Row, Col, Button, Form, Modal } from 'react-bootstrap';
import axios from 'axios';
import './Profile.css';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
    const [userProfile, setUserProfile] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState(null);
    const navigate = useNavigate();
    const [errors, setErrors] = useState({});

    // State cho modal đổi mật khẩu
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordData, setPasswordData] = useState({
        newPassword: '',
        confirmPassword: ''
    });

    // State cho modal xóa tài khoản
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    useEffect(() => {
        fetchUserProfile();
    }, []);

    const fetchUserProfile = async () => {
        try {
            console.log('Fetching user profile...');
            const token = localStorage.getItem('token');
            if (!token) {
                console.log('No token found, redirecting to login');
                navigate('/login');
                return;
            }

            const response = await axios.get('http://localhost:8080/api/v1/account', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            console.log('Profile API Response:', response.data);

            if (response.data.statusCode === 200 && response.data.data) {
                console.log('Setting user profile:', response.data.data);
                setUserProfile(response.data.data);
                setFormData(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching user profile:', error);
            console.error('Error response:', error.response);
            if (error.response?.status === 401) {
                navigate('/login');
            }
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        console.log('Form field changed:', name, value);
        setFormData(prev => ({
            ...prev,
            [name]: value || null
        }));

        if (name === 'birthDate') {
            const birthDate = new Date(value);
            const today = new Date();
            let age = today.getFullYear() - birthDate.getFullYear();
            const m = today.getMonth() - birthDate.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
            if (age < 18) {
                setErrors(prev => ({ ...prev, birthDate: 'Bạn phải đủ 18 tuổi.' }));
            } else {
                setErrors(prev => ({ ...prev, birthDate: null }));
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (errors.birthDate) {
            alert(errors.birthDate);
            return;
        }

        try {
            console.log('Current form data:', formData);
            const token = localStorage.getItem('token');
            
            // Yêu cầu người dùng nhập mật khẩu để xác thực
            const rawPassword = prompt('Vui lòng nhập mật khẩu để xác thực:');
            if (!rawPassword) {
                alert('Bạn cần nhập mật khẩu để cập nhật thông tin!');
                return;
            }

            // Chỉ gửi các trường cần thiết và thêm rawPassword
            const updateData = {
                id: formData.id,
                fullName: formData.fullName || '',
                password: rawPassword,
                address: formData.address || '',
                phone: formData.phone || '',
                birthDate: formData.birthDate || null,
                gender: formData.gender || null
            };
            
            console.log('Sending update request with data:', updateData);

            const response = await axios.put('http://localhost:8080/api/v1/users', 
                updateData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log('Update response:', response.data);

            if (response.data && response.data.statusCode === 200) {
                // Cập nhật lại thông tin người dùng từ response
                const updatedProfile = response.data.data;
                setUserProfile(updatedProfile);
                setFormData(updatedProfile);
                setIsEditing(false);
                alert('Cập nhật thông tin thành công!');
                // Tải lại thông tin người dùng
                fetchUserProfile();
            } else {
                throw new Error(response.data?.message || 'Cập nhật thất bại');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            if (error.response?.data) {
                console.error('Server error response:', error.response.data);
            }
            alert('Có lỗi xảy ra khi cập nhật thông tin: ' + (error.response?.data?.message || error.message));
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            alert('Mật khẩu mới không khớp!');
            return;
        }
        try {
            console.log('Changing password...');
            const token = localStorage.getItem('token');
            const response = await axios.put('http://localhost:8080/api/v1/users',
                {
                    id: userProfile.id,
                    password: passwordData.newPassword
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            console.log('Password change response:', response.data);
            if (response.data) {
                setShowPasswordModal(false);
                setPasswordData({
                    newPassword: '',
                    confirmPassword: ''
                });
                alert('Đổi mật khẩu thành công!');
            }
        } catch (err) {
            console.error('Error changing password:', err);
            console.error('Error response:', err.response);
            alert('Đổi mật khẩu thất bại: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleDeleteAccount = async () => {
        try {
            console.log('Deleting account...');
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:8080/api/v1/users/${userProfile.id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            console.log('Account deleted successfully');
            localStorage.removeItem('token');
            navigate('/login');
        } catch (err) {
            console.error('Error deleting account:', err);
            console.error('Error response:', err.response);
            alert('Xóa tài khoản thất bại: ' + (err.response?.data?.message || err.message));
        }
    };

    if (!userProfile) {
        return (
            <Container className="mt-4">
                <Card>
                    <Card.Body>
                        <div className="text-center">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Đang tải...</span>
                            </div>
                        </div>
                    </Card.Body>
                </Card>
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
                                            placeholder="Nhập họ và tên"
                                            required
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
                                            placeholder="Nhập số điện thoại"
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
                                            placeholder="Nhập địa chỉ"
                                        />
                                    </Form.Group>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Ngày sinh</Form.Label>
                                        <Form.Control
                                            type="date"
                                            name="birthDate"
                                            value={formData.birthDate ? formData.birthDate.split('T')[0] : ''}
                                            onChange={handleChange}
                                            isInvalid={!!errors.birthDate}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {errors.birthDate}
                                        </Form.Control.Feedback>
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
                                </Col>
                            </Row>
                            <div className="d-flex justify-content-end gap-2">
                                <Button variant="secondary" onClick={() => {
                                    setIsEditing(false);
                                    setFormData(userProfile); // Reset form data
                                }}>
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
                                        <p>{userProfile.role?.name || 'Người dùng'}</p>
                                    </div>
                                </Col>
                            </Row>
                            <div className="d-flex justify-content-end gap-2">
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
        </Container>
    );
};

export default Profile; 