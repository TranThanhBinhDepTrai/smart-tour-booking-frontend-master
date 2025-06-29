import React, { useState, useEffect } from 'react';
import { Container, Card, Row, Col, Button, Form, Modal, Alert, Table, Spinner } from 'react-bootstrap';
import axios from 'axios';
import './Profile.css';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
    const [userProfile, setUserProfile] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState(null);
    const navigate = useNavigate();
    const [errors, setErrors] = useState({});

    // State cho modal xác thực mật khẩu
    const [showPasswordVerifyModal, setShowPasswordVerifyModal] = useState(false);
    const [passwordVerify, setPasswordVerify] = useState('');
    const [pendingAction, setPendingAction] = useState(null); // 'edit' hoặc 'changePassword'

    // State cho modal đổi mật khẩu
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordData, setPasswordData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    // State cho modal xóa tài khoản
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // State cho modal lịch sử đánh giá
    const [showReviewHistoryModal, setShowReviewHistoryModal] = useState(false);
    const [userReviews, setUserReviews] = useState([]);
    const [reviewLoading, setReviewLoading] = useState(false);
    const [reviewError, setReviewError] = useState('');
    const [editReview, setEditReview] = useState(null);
    const [editData, setEditData] = useState({ rating: 5, comment: '' });
    const [showEditModal, setShowEditModal] = useState(false);
    const [editLoading, setEditLoading] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [successMsg, setSuccessMsg] = useState('');

    // State cho xác thực mật khẩu đổi mật khẩu
    const [isPasswordVerified, setIsPasswordVerified] = useState(false);

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

    // Hàm xác thực mật khẩu
    const verifyPassword = async (password) => {
        try {
            const token = localStorage.getItem('token');
            // Sử dụng API /account để xác thực mật khẩu
            const response = await axios.put('http://localhost:8080/api/v1/account', {
                id: userProfile.id,
                fullName: userProfile.fullName,
                email: userProfile.email,
                address: userProfile.address,
                phone: userProfile.phone,
                birthDate: userProfile.birthDate,
                gender: userProfile.gender,
                password: password
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.data && response.data.statusCode === 200;
        } catch (err) {
            console.error('Password verification error:', err);
            return false;
        }
    };

    // Xử lý khi click nút chỉnh sửa
    const handleEditClick = () => {
        setPendingAction('edit');
        setShowPasswordVerifyModal(true);
    };

    // Xử lý khi click nút đổi mật khẩu
    const handleChangePasswordClick = () => {
        setPendingAction('changePassword');
        setShowPasswordVerifyModal(true);
    };

    // Xử lý xác thực mật khẩu
    const handlePasswordVerify = async () => {
        if (!passwordVerify.trim()) {
            alert('Vui lòng nhập mật khẩu!');
            return;
        }

        try {
            const isValid = await verifyPassword(passwordVerify);
            if (isValid) {
                setShowPasswordVerifyModal(false);
                setPasswordVerify('');
                if (pendingAction === 'edit') {
                    setIsEditing(true);
                } else if (pendingAction === 'changePassword') {
                    setIsPasswordVerified(true); // Đánh dấu đã xác thực
                    setShowPasswordModal(true);
                }
            } else {
                alert('Mật khẩu không đúng!');
            }
        } catch (err) {
            alert('Có lỗi xảy ra khi xác thực mật khẩu!');
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
            
            // Chỉ gửi các trường cần thiết
            const updateData = {
                id: formData.id,
                fullName: formData.fullName || '',
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
        
        if (!isPasswordVerified && !passwordData.oldPassword.trim()) {
            alert('Vui lòng nhập mật khẩu cũ!');
            return;
        }
        
        if (!passwordData.newPassword.trim()) {
            alert('Vui lòng nhập mật khẩu mới!');
            return;
        }
        
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            alert('Mật khẩu mới không khớp!');
            return;
        }

        try {
            // Xác thực mật khẩu cũ trước nếu chưa xác thực qua modal
            if (!isPasswordVerified) {
                const isValidOldPassword = await verifyPassword(passwordData.oldPassword);
                if (!isValidOldPassword) {
                    alert('Mật khẩu cũ không đúng!');
                    return;
                }
            }

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
            if (response.data) {
                setShowPasswordModal(false);
                setPasswordData({
                    oldPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                });
                setIsPasswordVerified(false);
                alert('Đổi mật khẩu thành công!');
            }
        } catch (err) {
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

    const fetchUserReviews = async () => {
        setReviewLoading(true);
        setReviewError('');
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`http://localhost:8080/api/v1/reviews/user/${userProfile.id}`, {
                headers: token ? { 'Authorization': `Bearer ${token}` } : {}
            });
            setUserReviews(res.data.data || []);
        } catch (err) {
            setReviewError('Không thể tải lịch sử đánh giá');
        } finally {
            setReviewLoading(false);
        }
    };

    const handleEditReviewClick = (review) => {
        setEditReview(review);
        setEditData({ rating: review.rating, comment: review.comment });
        setShowEditModal(true);
        setSuccessMsg('');
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setEditLoading(true);
        setSuccessMsg('');
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:8080/api/v1/reviews/${editReview.id}`, {
                rating: editData.rating,
                comment: editData.comment,
                tourId: editReview.tourId,
                userId: editReview.userId
            }, {
                headers: token ? { 'Authorization': `Bearer ${token}` } : {}
            });
            setSuccessMsg('Cập nhật thành công!');
            setShowEditModal(false);
            fetchUserReviews();
        } catch (err) {
            setReviewError('Lỗi khi cập nhật đánh giá');
        } finally {
            setEditLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa đánh giá này?')) return;
        setDeleteLoading(true);
        setDeleteId(id);
        setSuccessMsg('');
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:8080/api/v1/reviews/${id}`, {
                headers: token ? { 'Authorization': `Bearer ${token}` } : {}
            });
            setSuccessMsg('Xóa thành công!');
            fetchUserReviews();
        } catch (err) {
            setReviewError('Lỗi khi xóa đánh giá');
        } finally {
            setDeleteLoading(false);
            setDeleteId(null);
        }
    };

    // Khi đóng modal đổi mật khẩu, reset lại xác thực
    const handleClosePasswordModal = () => {
        setShowPasswordModal(false);
        setPasswordData({
            oldPassword: '',
            newPassword: '',
            confirmPassword: ''
        });
        setIsPasswordVerified(false);
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
                                <Button variant="primary" onClick={handleEditClick}>
                                    Chỉnh sửa thông tin
                                </Button>
                                <Button variant="warning" onClick={handleChangePasswordClick}>
                                    Đổi mật khẩu
                                </Button>
                                <Button variant="info" onClick={() => { setShowReviewHistoryModal(true); fetchUserReviews(); }}>
                                    Lịch sử đánh giá
                                </Button>
                                <Button variant="danger" onClick={() => setShowDeleteModal(true)}>
                                    Xóa tài khoản
                                </Button>
                            </div>
                        </>
                    )}
                </Card.Body>
            </Card>

            {/* Modal xác thực mật khẩu */}
            <Modal show={showPasswordVerifyModal} onHide={() => setShowPasswordVerifyModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Xác thực mật khẩu</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Vui lòng nhập mật khẩu hiện tại để xác thực:</p>
                    <Form.Group>
                        <Form.Control
                            type="password"
                            placeholder="Nhập mật khẩu"
                            value={passwordVerify}
                            onChange={(e) => setPasswordVerify(e.target.value)}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                    handlePasswordVerify();
                                }
                            }}
                        />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => {
                        setShowPasswordVerifyModal(false);
                        setPasswordVerify('');
                        setPendingAction(null);
                    }}>
                        Hủy
                    </Button>
                    <Button variant="primary" onClick={handlePasswordVerify}>
                        Xác nhận
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Modal đổi mật khẩu */}
            <Modal show={showPasswordModal} onHide={handleClosePasswordModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Đổi mật khẩu</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handlePasswordChange}>
                        {/* Ẩn trường mật khẩu cũ nếu đã xác thực qua modal */}
                        {!isPasswordVerified && (
                            <Form.Group className="mb-3">
                                <Form.Label>Mật khẩu cũ</Form.Label>
                                <Form.Control
                                    type="password"
                                    value={passwordData.oldPassword}
                                    onChange={(e) => setPasswordData({...passwordData, oldPassword: e.target.value})}
                                    required
                                />
                            </Form.Group>
                        )}
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
                            <Button variant="secondary" onClick={handleClosePasswordModal}>
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

            {/* Modal lịch sử đánh giá */}
            <Modal show={showReviewHistoryModal} onHide={() => setShowReviewHistoryModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Lịch sử đánh giá của bạn</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {successMsg && <Alert variant="success">{successMsg}</Alert>}
                    {reviewLoading ? (
                        <div>Đang tải...</div>
                    ) : reviewError ? (
                        <div className="text-danger">{reviewError}</div>
                    ) : (
                        <Table striped bordered hover>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Số sao</th>
                                    <th>Bình luận</th>
                                    <th>TourId</th>
                                    <th>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {userReviews.length === 0 ? (
                                    <tr><td colSpan={5} className="text-center">Bạn chưa có đánh giá nào</td></tr>
                                ) : userReviews.map(r => (
                                    <tr key={r.id}>
                                        <td>{r.id}</td>
                                        <td>{r.rating}</td>
                                        <td>{r.comment}</td>
                                        <td>{r.tourId}</td>
                                        <td>
                                            <Button variant="warning" size="sm" className="me-2" onClick={() => handleEditReviewClick(r)}>
                                                Sửa
                                            </Button>
                                            <Button variant="danger" size="sm" onClick={() => handleDelete(r.id)} disabled={deleteLoading && deleteId === r.id}>
                                                {deleteLoading && deleteId === r.id ? 'Đang xóa...' : 'Xóa'}
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    )}
                    {/* Modal sửa đánh giá */}
                    <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
                        <Modal.Header closeButton>
                            <Modal.Title>Sửa đánh giá</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <Form onSubmit={handleEditSubmit}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Số sao</Form.Label>
                                    <Form.Select
                                        value={editData.rating}
                                        onChange={e => setEditData({ ...editData, rating: Number(e.target.value) })}
                                        required
                                    >
                                        <option value={5}>5 - Tuyệt vời</option>
                                        <option value={4}>4 - Tốt</option>
                                        <option value={3}>3 - Bình thường</option>
                                        <option value={2}>2 - Kém</option>
                                        <option value={1}>1 - Rất tệ</option>
                                    </Form.Select>
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Bình luận</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={3}
                                        value={editData.comment}
                                        onChange={e => setEditData({ ...editData, comment: e.target.value })}
                                        required
                                    />
                                </Form.Group>
                                <div className="d-flex justify-content-end gap-2">
                                    <Button variant="secondary" onClick={() => setShowEditModal(false)}>
                                        Đóng
                                    </Button>
                                    <Button variant="primary" type="submit" disabled={editLoading}>
                                        {editLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
                                    </Button>
                                </div>
                            </Form>
                        </Modal.Body>
                    </Modal>
                </Modal.Body>
            </Modal>
        </Container>
    );
};

export default Profile; 