import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Modal, Form, Alert, Badge, InputGroup } from 'react-bootstrap';
import { userService } from '../../services/userService';
import { roleService } from '../../services/roleService';
import './AdminTour.css';
import UserBookingHistory from '../../components/UserBookingHistory';

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
        if (window.confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
            try {
                await userService.deleteUser(userId);
                setUsers(prevUsers =>
                    prevUsers.map(u =>
                        u.id === userId ? { ...u, deleted: true } : u
                    )
                );
            } catch (err) {
                setError('Không thể xóa người dùng');
            }
        }
    };

    const handleBlockUser = async (userId) => {
        try {
            const response = await userService.blockUser(userId);
            if (response?.message?.includes('thành công')) {
                setUsers(prevUsers =>
                    prevUsers.map(u =>
                        u.id === userId ? { ...u, blocked: true } : u
                    )
                );
                setError('');
            }
        } catch (err) {
            setError('Không thể khóa người dùng: ' + (err.message || 'Đã có lỗi xảy ra'));
        }
    };

    const handleUnblockUser = async (userId) => {
        try {
            const response = await userService.unblockUser(userId);
            if (response?.message?.includes('thành công')) {
                setUsers(prevUsers =>
                    prevUsers.map(u =>
                        u.id === userId ? { ...u, blocked: false } : u
                    )
                );
                setError('');
            }
        } catch (err) {
            setError('Không thể mở khóa người dùng: ' + (err.message || 'Đã có lỗi xảy ra'));
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
            <div className="admin-header mb-3">
                <h2 className="admin-title">Quản lý người dùng</h2>
                <div className="admin-subtitle">Danh sách người dùng hệ thống</div>
            </div>
            <div className="search-filter-section mb-3">
                <input
                    type="text"
                    className="search-input"
                    placeholder="Tìm kiếm theo tên, email, SĐT, địa chỉ, vai trò..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
                <button className="search-button" type="button">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="search-icon">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
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
                    <Table striped bordered hover responsive className="admin-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Họ tên</th>
                                <th>Email</th>
                                <th>Số điện thoại</th>
                                <th>Địa chỉ</th>
                                <th>Vai trò</th>
                                <th>Trạng thái</th>
                                <th style={{width: "200px"}}>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
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
                                <tr key={user.id}>
                                    <td>{user.id}</td>
                                    <td>{user.fullName}</td>
                                    <td>{user.email}</td>
                                    <td>{user.phone}</td>
                                    <td>{user.address}</td>
                                    <td>
                                        <Badge bg={user.role.id === 2 ? "danger" : "primary"} className="d-block">
                                            {user.role.name}
                                        </Badge>
                                    </td>
                                    <td>
                                        <Badge bg={user.blocked ? "danger" : "success"} className="d-block mb-1">
                                            {user.blocked ? "Đã khóa" : "Hoạt động"}
                                        </Badge>
                                        <Badge bg={user.deleted ? "secondary" : "success"} className="d-block">
                                            {user.deleted ? "Đã xóa" : "Chưa xóa"}
                                        </Badge>
                                    </td>
                                    <td>
                                        <div className="d-flex gap-2 justify-content-center">
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
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>

                    <div className="pagination">
                        <button onClick={() => handlePageChange(1)} disabled={currentPage === 1}>Đầu</button>
                        <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>Trước</button>
                        <span>Trang {currentPage} / {totalPages} (Tổng: {totalItems} người dùng)</span>
                        <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage >= totalPages}>Sau</button>
                        <button onClick={() => handlePageChange(totalPages)} disabled={currentPage >= totalPages}>Cuối</button>
                    </div>
                </>
            )}

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
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Số điện thoại</Form.Label>
                            <Form.Control
                                type="text"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                required
                            />
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