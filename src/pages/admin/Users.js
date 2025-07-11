import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Modal, Form, Alert, Badge, InputGroup } from 'react-bootstrap';
import { userService } from '../../services/userService';
import { roleService } from '../../services/roleService';
import './Users.css';
import UserBookingHistory from '../../components/UserBookingHistory';
import { FaSearch } from 'react-icons/fa';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState(null);
    const [formData, setFormData] = useState({
        id: null,
        fullName: '',
        email: '',
        address: '',
        phone: '',
        birthDate: '',
        gender: 'MALE',
        password: ''
    });
    const [showRoleModal, setShowRoleModal] = useState(false);
    const [permissions, setPermissions] = useState([]);
    const [selectedPermissions, setSelectedPermissions] = useState([]);
    const [roleFormData, setRoleFormData] = useState({
        id: null,
        name: '',
        description: '',
        active: true,
        permissions: []
    });
    const [searchTerm, setSearchTerm] = useState("");
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [historyUser, setHistoryUser] = useState(null);
    const [validationError, setValidationError] = useState('');

    const loadUsers = async (page = currentPage) => {
        try {
            setLoading(true);
            const response = await userService.getAllUsers(page, pageSize);
            if (response?.data) {
                console.log('Loaded users:', response.data.result);
                setUsers(response.data.result);
                setTotalItems(response.data.meta.total);
                setTotalPages(response.data.meta.pages);
                setCurrentPage(page);
                setError('');
            }
        } catch (err) {
            console.error('Error loading users:', err);
            setError('Không thể tải danh sách người dùng');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUsers(1);
    }, []);

    const handleClose = () => {
        setShowModal(false);
        setSelectedUser(null);
        setFormData({
            id: null,
            fullName: '',
            email: '',
            address: '',
            phone: '',
            birthDate: '',
            gender: 'MALE',
            password: ''
        });
    };

    const handleDetailClose = () => {
        setShowDetailModal(false);
        setSelectedUser(null);
    };

    const handleShowDetail = async (userId) => {
        try {
            const response = await userService.getUserById(userId);
            if (response?.data) {
                setSelectedUser(response.data);
                setShowDetailModal(true);
            }
        } catch (err) {
            console.error('Error loading user details:', err);
            setError('Không thể tải thông tin người dùng');
        }
    };

    const handleShow = (user = null) => {
        if (user) {
            setFormData({
                id: user.id,
                fullName: user.fullName,
                email: user.email,
                address: user.address,
                phone: user.phone,
                birthDate: user.birthDate,
                gender: user.gender,
                password: ''
            });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setValidationError('');
        // Email validation
        const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
        if (!emailRegex.test(formData.email)) {
            setValidationError('Email không hợp lệ!');
            return;
        }
        // Phone validation (Vietnam: 10 digits, starts with 0)
        const phoneRegex = /^0\d{9}$/;
        if (!phoneRegex.test(formData.phone)) {
            setValidationError('Số điện thoại phải là 10 số và bắt đầu bằng 0!');
            return;
        }
        try {
            setError('');
            await userService.updateUser(formData);
            handleClose();
            await loadUsers(currentPage);
        } catch (err) {
            console.error('Error saving user:', err);
            setError(err.message || 'Không thể cập nhật thông tin người dùng');
        }
    };

    const handleDelete = async (userId) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa tài khoản này không?')) return;
        try {
            await userService.deleteUser(userId);
            window.location.reload();
        } catch (err) {
            setError('Không thể xóa người dùng');
        }
    };

    const handleBlockUser = async (userId) => {
        if (!window.confirm('Bạn có chắc chắn muốn khóa tài khoản này không?')) return;
        try {
            await userService.blockUser(userId);
            window.location.reload();
        } catch (err) {
            setError('Không thể khóa người dùng');
        }
    };

    const handleUnblockUser = async (userId) => {
        if (!window.confirm('Bạn có chắc chắn muốn mở khóa tài khoản này không?')) return;
        try {
            await userService.unblockUser(userId);
            window.location.reload();
        } catch (err) {
            setError('Không thể mở khóa người dùng');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handlePageChange = async (newPage) => {
        await loadUsers(newPage);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('vi-VN');
    };

    // Hàm kiểm tra trạng thái khóa
    const isUserLocked = (user) => {
        // Kiểm tra các trường có thể chứa trạng thái khóa
        return user.locked || user.status === 'LOCKED' || user.status === false || user.isActive === false;
    };

    const loadPermissions = async () => {
        try {
            const response = await roleService.getAllPermissions();
            if (response?.data) {
                setPermissions(response.data);
            }
        } catch (err) {
            console.error('Error loading permissions:', err);
            setError('Không thể tải danh sách quyền');
        }
    };

    const handleShowRoleModal = (user) => {
        setRoleFormData({
            id: user.role.id,
            name: user.role.name,
            description: user.role.description || '',
            active: true,
            permissions: user.role.permissions || []
        });
        setSelectedPermissions(user.role.permissions?.map(p => p.id) || []);
        setShowRoleModal(true);
        loadPermissions();
    };

    const handleRoleModalClose = () => {
        setShowRoleModal(false);
        setSelectedPermissions([]);
        setRoleFormData({
            id: null,
            name: '',
            description: '',
            active: true,
            permissions: []
        });
    };

    const handlePermissionChange = (permissionId) => {
        setSelectedPermissions(prev => {
            if (prev.includes(permissionId)) {
                return prev.filter(id => id !== permissionId);
            } else {
                return [...prev, permissionId];
            }
        });
    };

    const handleRoleSubmit = async (e) => {
        e.preventDefault();
        try {
            const updateData = {
                ...roleFormData,
                permissions: selectedPermissions.map(id => ({ id }))
            };
            await roleService.updateRole(updateData);
            handleRoleModalClose();
            await loadUsers(currentPage);
            setError('');
        } catch (err) {
            console.error('Error updating role:', err);
            setError('Không thể cập nhật vai trò: ' + (err.message || 'Đã có lỗi xảy ra'));
        }
    };

    const handleShowHistory = (user) => {
        setHistoryUser(user);
        setShowHistoryModal(true);
    };

    return (
        <Container fluid className="admin-page-container mt-4">
            {error && <Alert variant="danger">{error}</Alert>}
            <div className="user-card">
                <div className="admin-header user-header mb-3 text-start">
                    <div>
                        <h2 className="admin-title mb-0 text-start">Quản lý người dùng</h2>
                        <div className="admin-subtitle text-start">Danh sách người dùng hệ thống</div>
                    </div>
                    {/* Có thể thêm nút/thành phần bên phải nếu cần */}
                </div>
                <div className="search-bar-wrapper">
                    <input
                        type="text"
                        className="search-bar-input"
                        placeholder="Tìm kiếm theo họ tên, email, số điện thoại"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                    <button className="search-bar-btn" type="button" disabled>
                        <FaSearch />
                    </button>
                </div>

                {loading ? (
                    <div className="text-center my-5">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Đang tải...</span>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="user-list">
                            {users.filter(user => {
                                const s = searchTerm.toLowerCase();
                                return (
                                    (user.fullName && user.fullName.toLowerCase().includes(s)) ||
                                    (user.email && user.email.toLowerCase().includes(s)) ||
                                    (user.phone && user.phone.toLowerCase().includes(s)) ||
                                    (user.address && user.address.toLowerCase().includes(s)) ||
                                    (user.role && user.role.name && user.role.name.toLowerCase().includes(s))
                                );
                            }).map(user => (
                                <div className="user-card-item" key={user.id}>
                                    <div className="user-card-header d-flex justify-content-between align-items-center mb-2">
                                        <span className="user-id fw-bold">#{user.id}</span>
                                        <Badge bg={user.role.id === 2 ? "danger" : "primary"} className="ms-2">{user.role.name}</Badge>
                                    </div>
                                    <div className="user-card-body mb-2">
                                        <div><strong>Họ tên:</strong> {user.fullName}</div>
                                        <div><strong>Email:</strong> {user.email}</div>
                                        <div><strong>Số điện thoại:</strong> {user.phone}</div>
                                        <div><strong>Địa chỉ:</strong> {user.address}</div>
                                    </div>
                                    <div className="user-card-status mb-2">
                                        <Badge bg={user.blocked ? "danger" : "success"} className="me-1">
                                            {user.blocked ? "Đã khóa" : "Hoạt động"}
                                        </Badge>
                                        <Badge bg={user.deleted ? "secondary" : "success"}>
                                            {user.deleted ? "Đã xóa" : "Chưa xóa"}
                                        </Badge>
                                    </div>
                                    <div className="user-card-actions d-flex flex-wrap gap-2">
                                        <Button 
                                            variant="info" 
                                            size="sm"
                                            onClick={() => handleShowDetail(user.id)}
                                            title="Xem chi tiết"
                                        >
                                            <i className="fas fa-eye"></i>
                                        </Button>
                                        <Button 
                                            variant="primary" 
                                            size="sm"
                                            onClick={() => handleShow(user)}
                                            title="Chỉnh sửa"
                                        >
                                            <i className="fas fa-edit"></i>
                                        </Button>
                                        <Button 
                                            variant="warning" 
                                            size="sm"
                                            onClick={() => handleBlockUser(user.id)}
                                            title="Khóa tài khoản"
                                        >
                                            <i className="fas fa-lock"></i>
                                        </Button>
                                        <Button 
                                            variant="success" 
                                            size="sm"
                                            onClick={() => handleUnblockUser(user.id)}
                                            title="Mở khóa tài khoản"
                                        >
                                            <i className="fas fa-lock-open"></i>
                                        </Button>
                                        <Button 
                                            variant="danger" 
                                            size="sm"
                                            onClick={() => handleDelete(user.id)}
                                            title="Xóa tài khoản"
                                        >
                                            <i className="fas fa-trash"></i>
                                        </Button>
                                        <Button 
                                            variant="secondary" 
                                            size="sm"
                                            onClick={() => handleShowHistory(user)}
                                            title="Xem lịch sử đặt tour"
                                        >
                                            <i className="fas fa-history"></i>
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="pagination mt-3">
                            <button onClick={() => handlePageChange(1)} disabled={currentPage === 1}>Đầu</button>
                            <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>Trước</button>
                            <span>Trang {currentPage} / {totalPages} (Tổng: {totalItems} người dùng)</span>
                            <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage >= totalPages}>Sau</button>
                            <button onClick={() => handlePageChange(totalPages)} disabled={currentPage >= totalPages}>Cuối</button>
                        </div>
                    </>
                )}
            </div>

            {/* Modal chỉnh sửa thông tin */}
            <Modal show={showModal} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Cập nhật thông tin người dùng</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Họ tên</Form.Label>
                            <Form.Control
                                type="text"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                isInvalid={validationError && validationError.includes('Email')}
                            />
                            {validationError && validationError.includes('Email') && (
                                <Form.Control.Feedback type="invalid">{validationError}</Form.Control.Feedback>
                            )}
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Số điện thoại</Form.Label>
                            <Form.Control
                                type="text"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                required
                                isInvalid={validationError && validationError.includes('Số điện thoại')}
                            />
                            {validationError && validationError.includes('Số điện thoại') && (
                                <Form.Control.Feedback type="invalid">{validationError}</Form.Control.Feedback>
                            )}
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Địa chỉ</Form.Label>
                            <Form.Control
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Ngày sinh</Form.Label>
                            <Form.Control
                                type="date"
                                name="birthDate"
                                value={formData.birthDate}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Giới tính</Form.Label>
                            <Form.Select
                                name="gender"
                                value={formData.gender}
                                onChange={handleChange}
                                required
                            >
                                <option value="MALE">Nam</option>
                                <option value="FEMALE">Nữ</option>
                            </Form.Select>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Mật khẩu {formData.id ? '(để trống nếu không muốn thay đổi)' : '*'}</Form.Label>
                            <Form.Control
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required={!formData.id}
                                placeholder={formData.id ? 'Nhập mật khẩu mới nếu muốn thay đổi' : 'Nhập mật khẩu'}
                                autoComplete="new-password"
                            />
                        </Form.Group>

                        <div className="d-flex justify-content-end gap-2">
                            <Button variant="secondary" onClick={handleClose}>
                                Hủy
                            </Button>
                            <Button variant="primary" type="submit">
                                Cập nhật
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>

            {/* Modal xem chi tiết */}
            <Modal show={showDetailModal} onHide={handleDetailClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Chi tiết người dùng</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedUser && (
                        <div>
                            <p><strong>ID:</strong> {selectedUser.id}</p>
                            <p><strong>Họ tên:</strong> {selectedUser.fullName}</p>
                            <p><strong>Email:</strong> {selectedUser.email}</p>
                            <p><strong>Số điện thoại:</strong> {selectedUser.phone}</p>
                            <p><strong>Địa chỉ:</strong> {selectedUser.address}</p>
                            <p><strong>Ngày sinh:</strong> {formatDate(selectedUser.birthDate)}</p>
                            <p><strong>Giới tính:</strong> {selectedUser.gender === 'MALE' ? 'Nam' : 'Nữ'}</p>
                            <p>
                                <strong>Vai trò:</strong>{' '}
                                <Badge bg={selectedUser.role.id === 2 ? "danger" : "primary"}>
                                    {selectedUser.role.name}
                                </Badge>
                            </p>
                            <p>
                                <strong>Trạng thái:</strong>{' '}
                                <Badge bg={selectedUser.blocked ? "danger" : "success"}>
                                    {selectedUser.blocked ? "Đã khóa" : "Đang hoạt động"}
                                </Badge>
                            </p>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleDetailClose}>
                        Đóng
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Role Update Modal */}
            <Modal show={showRoleModal} onHide={handleRoleModalClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Cập nhật vai trò</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleRoleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Tên vai trò</Form.Label>
                            <Form.Control
                                type="text"
                                value={roleFormData.name}
                                onChange={(e) => setRoleFormData(prev => ({...prev, name: e.target.value}))}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Mô tả</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={roleFormData.description}
                                onChange={(e) => setRoleFormData(prev => ({...prev, description: e.target.value}))}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Quyền hạn</Form.Label>
                            <div style={{ maxHeight: '200px', overflowY: 'auto' }} className="border rounded p-2">
                                {permissions.map(permission => (
                                    <Form.Check
                                        key={permission.id}
                                        type="checkbox"
                                        id={`permission-${permission.id}`}
                                        label={`${permission.name} (${permission.module})`}
                                        checked={selectedPermissions.includes(permission.id)}
                                        onChange={() => handlePermissionChange(permission.id)}
                                    />
                                ))}
                            </div>
                        </Form.Group>

                        <div className="d-flex justify-content-end gap-2">
                            <Button variant="secondary" onClick={handleRoleModalClose}>
                                Hủy
                            </Button>
                            <Button variant="primary" type="submit">
                                Lưu thay đổi
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>

            {/* History Modal */}
            <Modal show={showHistoryModal} onHide={() => setShowHistoryModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Lịch sử đặt tour: {historyUser?.fullName}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {historyUser && <UserBookingHistory userId={historyUser.id} />}
                </Modal.Body>
            </Modal>
        </Container>
    );
};

export default Users; 