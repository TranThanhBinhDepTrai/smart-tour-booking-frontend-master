import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Modal, Form, Alert } from 'react-bootstrap';
import { roleService } from '../../services/roleService';
import './RoleManagement.css';
import { FaPlus } from 'react-icons/fa';

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
        <div className="admin-tour-container p-6">
            <div className="admin-tour-card p-6">
                <div className="admin-tour-header">
                    <div>
                        <h1 className="admin-tour-title">Quản Lý Vai Trò</h1>
                        <p className="admin-tour-subtitle">Danh sách vai trò hệ thống</p>
                    </div>
                    <button
                        onClick={() => handleShow()}
                        className="add-tour-button d-flex align-items-center gap-2"
                        style={{padding: '0.5rem 1.5rem', fontSize: '1rem', borderRadius: '2rem', boxShadow: '0 2px 8px rgba(59,130,246,0.10)', fontWeight: 700}}
                    >
                        <FaPlus style={{marginRight: 8}} /> Tạo mới vai trò
                    </button>
                </div>
                {error && <Alert variant="danger">{error}</Alert>}
                {loading ? (
                    <div className="text-center my-5">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Đang tải...</span>
                        </div>
                    </div>
                ) : (
                    <div className="user-list">
                        {roles.map(role => (
                            <div className="user-card-item" key={role.id}>
                                <div className="user-card-header d-flex justify-content-between align-items-center mb-2">
                                    <span className="user-id fw-bold">#{role.id}</span>
                                    <span className="badge bg-primary">{role.name}</span>
                                </div>
                                <div className="user-card-body mb-2">
                                    <div><strong>Mô tả:</strong> {role.description}</div>
                                    <div><strong>Số quyền:</strong> {role.permissions?.length || 0}</div>
                                </div>
                                <div className="user-card-actions d-flex flex-wrap gap-2">
                                    <Button className="tour-action-btn view-button" 
                                        size="sm"
                                        onClick={() => handleShowPermissionModal(role)}
                                        title="Xem quyền"
                                    >
                                        <i className="fas fa-eye"></i>
                                    </Button>
                                    <Button className="tour-action-btn edit-button" 
                                        size="sm"
                                        onClick={() => handleShow(role)}
                                        title="Sửa"
                                    >
                                        <i className="fas fa-edit"></i>
                                    </Button>
                                    <Button className="tour-action-btn delete-button" 
                                        size="sm"
                                        onClick={() => handleDelete(role.id)}
                                        title="Xóa"
                                    >
                                        <i className="fas fa-trash"></i>
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                {/* Modal giữ nguyên */}
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
            </div>
        </div>
    );
};

export default RoleManagement; 