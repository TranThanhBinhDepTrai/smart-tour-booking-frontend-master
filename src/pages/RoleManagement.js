import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Modal, Form, Alert } from 'react-bootstrap';
import { roleService } from '../services/roleService';
import './RoleManagement.css';

const RoleManagement = () => {
    const [roles, setRoles] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [showPermissionModal, setShowPermissionModal] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [permissions, setPermissions] = useState([]);
    const [selectedPermissions, setSelectedPermissions] = useState([]);
    const [selectedRole, setSelectedRole] = useState(null);
    const [formData, setFormData] = useState({
        id: null,
        name: '',
        description: '',
        active: true,
        permissions: []
    });

    const loadRoles = async () => {
        try {
            setLoading(true);
            const response = await roleService.getAllRoles(currentPage, pageSize);
            if (response?.data) {
                setRoles(response.data.result || []);
                setTotalItems(response.data.meta.total);
            }
        } catch (err) {
            console.error('Error loading roles:', err);
            setError('Không thể tải danh sách vai trò');
        } finally {
            setLoading(false);
        }
    };

    const loadPermissions = async () => {
        try {
            const response = await roleService.getAllPermissions();
            if (response?.data?.result) {
                setPermissions(response.data.result);
            } else {
                setPermissions([]);
            }
        } catch (err) {
            console.error('Error loading permissions:', err);
            setError('Không thể tải danh sách quyền');
        }
    };

    useEffect(() => {
        loadRoles();
    }, [currentPage]);

    const handleShowPermissionModal = (role) => {
        setSelectedRole(role);
        setSelectedPermissions(role.permissions?.map(p => p.id) || []);
        setShowPermissionModal(true);
        loadPermissions();
    };

    const handlePermissionModalClose = () => {
        setShowPermissionModal(false);
        setSelectedRole(null);
        setSelectedPermissions([]);
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

    const handleUpdatePermissions = async () => {
        try {
            const updateData = {
                id: selectedRole.id,
                name: selectedRole.name,
                description: selectedRole.description,
                active: selectedRole.active,
                permissions: selectedPermissions.map(id => ({ id }))
            };
            await roleService.updateRole(updateData);
            handlePermissionModalClose();
            loadRoles();
            setError('');
        } catch (err) {
            console.error('Error updating role permissions:', err);
            setError('Không thể cập nhật quyền: ' + (err.message || 'Đã có lỗi xảy ra'));
        }
    };

    const handleClose = () => {
        setShowModal(false);
        setFormData({
            id: null,
            name: '',
            description: '',
            active: true,
            permissions: []
        });
    };

    const handleShow = (role = null) => {
        if (role) {
            setFormData({
                id: role.id,
                name: role.name,
                description: role.description || '',
                active: role.active,
                permissions: role.permissions || []
            });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (formData.id) {
                await roleService.updateRole(formData);
            } else {
                await roleService.createRole(formData);
            }
            handleClose();
            loadRoles();
            setError('');
        } catch (err) {
            console.error('Error saving role:', err);
            setError('Không thể lưu vai trò: ' + (err.message || 'Đã có lỗi xảy ra'));
        }
    };

    const handleDelete = async (roleId) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa vai trò này?')) {
            try {
                await roleService.deleteRole(roleId);
                loadRoles();
                setError('');
            } catch (err) {
                console.error('Error deleting role:', err);
                setError('Không thể xóa vai trò: ' + (err.message || 'Đã có lỗi xảy ra'));
            }
        }
    };

    if (loading) {
        return (
            <Container className="mt-4">
                <div className="text-center">
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">Đang tải...</span>
                    </div>
                </div>
            </Container>
        );
    }

    return (
        <Container fluid className="mt-4">
            {error && <Alert variant="danger">{error}</Alert>}
            
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2>Quản lý vai trò</h2>
                <Button variant="primary" onClick={() => handleShow()}>
                    Tạo mới vai trò
                </Button>
            </div>

            {loading ? (
                <div className="text-center my-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Đang tải...</span>
                    </div>
                </div>
            ) : (
                <Table striped bordered hover>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Tên vai trò</th>
                            <th>Mô tả</th>
                            <th>Số quyền</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {roles.map(role => (
                            <tr key={role.id}>
                                <td>{role.id}</td>
                                <td>{role.name}</td>
                                <td>{role.description}</td>
                                <td>{role.permissions?.length || 0}</td>
                                <td>
                                    <div className="d-flex gap-2">
                                        <Button 
                                            variant="info" 
                                            size="sm"
                                            onClick={() => handleShowPermissionModal(role)}
                                        >
                                            Cập nhật quyền
                                        </Button>
                                        <Button 
                                            variant="primary" 
                                            size="sm"
                                            onClick={() => handleShow(role)}
                                        >
                                            Sửa
                                        </Button>
                                        <Button 
                                            variant="danger" 
                                            size="sm"
                                            onClick={() => handleDelete(role.id)}
                                        >
                                            Xóa
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            )}

            {roles.length > 0 && (
                <div className="d-flex justify-content-center mt-3">
                    <Button 
                        variant="outline-primary" 
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                    >
                        Trước
                    </Button>
                    <span className="mx-3">
                        Trang {currentPage} / {Math.ceil(totalItems / pageSize)}
                    </span>
                    <Button 
                        variant="outline-primary"
                        onClick={() => setCurrentPage(prev => prev + 1)}
                        disabled={currentPage >= Math.ceil(totalItems / pageSize)}
                    >
                        Sau
                    </Button>
                </div>
            )}

            <Modal show={showModal} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>
                        {formData.id ? 'Cập nhật vai trò' : 'Tạo mới vai trò'}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Tên vai trò</Form.Label>
                            <Form.Control
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Mô tả</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={formData.description}
                                onChange={(e) => setFormData(prev => ({...prev, description: e.target.value}))}
                            />
                        </Form.Group>

                        <div className="d-flex justify-content-end gap-2">
                            <Button variant="secondary" onClick={handleClose}>
                                Hủy
                            </Button>
                            <Button variant="primary" type="submit">
                                {formData.id ? 'Cập nhật' : 'Tạo mới'}
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>

            {/* Modal cập nhật quyền */}
            <Modal show={showPermissionModal} onHide={handlePermissionModalClose} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>
                        Cập nhật quyền cho vai trò: {selectedRole?.name}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="mb-3">
                        <strong>Chọn quyền:</strong>
                        <div style={{ maxHeight: '400px', overflowY: 'auto' }} className="border rounded p-3 mt-2">
                            {Array.isArray(permissions) && permissions.map(permission => (
                                <Form.Check
                                    key={permission.id}
                                    type="checkbox"
                                    id={`permission-${permission.id}`}
                                    label={`${permission.name} (${permission.module} - ${permission.method})`}
                                    checked={selectedPermissions.includes(permission.id)}
                                    onChange={() => handlePermissionChange(permission.id)}
                                    className="mb-2"
                                />
                            ))}
                        </div>
                        <div className="mt-2 text-muted">
                            Đã chọn {selectedPermissions.length} quyền
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handlePermissionModalClose}>
                        Hủy
                    </Button>
                    <Button variant="primary" onClick={handleUpdatePermissions}>
                        Lưu thay đổi
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default RoleManagement; 