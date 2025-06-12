import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Modal, Form, Alert } from 'react-bootstrap';
import { roleService } from '../services/roleService';
import './RoleManagement.css';

const RoleManagement = () => {
    const [roles, setRoles] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(2); // Đặt pageSize = 2 theo API
    const [totalItems, setTotalItems] = useState(0);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        id: null,
        name: '',
        description: '',
        active: true,
        permissions: []
    });

    const loadRoles = async (page = currentPage) => {
        try {
            setLoading(true);
            const response = await roleService.getAllRoles(page, pageSize);
            console.log('API Response in component:', response);
            
            if (response?.data) {
                const { result, meta } = response.data;
                
                if (Array.isArray(result)) {
                    // Nếu trang hiện tại không có dữ liệu và không phải trang đầu,
                    // load lại trang trước đó
                    if (result.length === 0 && page > 1) {
                        setCurrentPage(page - 1);
                        await loadRoles(page - 1);
                        return;
                    }
                    
                    setRoles(result);
                    setTotalItems(meta?.total || result.length);
                    setError('');
                } else {
                    console.error('Result is not an array:', result);
                    setRoles([]);
                    setTotalItems(0);
                }
            } else {
                console.error('Invalid response structure');
                setRoles([]);
                setTotalItems(0);
            }
        } catch (err) {
            console.error('Error loading roles:', err);
            setError('Không thể tải danh sách vai trò');
            setRoles([]);
            setTotalItems(0);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadRoles();
    }, [currentPage]);

    const handleClose = () => {
        setShowModal(false);
        setIsEditing(false);
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
            setIsEditing(true);
            setFormData({
                id: role.id,
                name: role.name,
                description: role.description,
                active: role.active,
                permissions: role.permissions || []
            });
        } else {
            setIsEditing(false);
            setFormData({
                id: null,
                name: '',
                description: '',
                active: true,
                permissions: []
            });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setError('');
            if (isEditing) {
                await roleService.updateRole(formData.id, formData);
            } else {
                await roleService.createRole(formData);
            }
            handleClose();
            await loadRoles();
        } catch (err) {
            console.error('Error saving role:', err);
            setError(isEditing ? 'Không thể cập nhật vai trò' : 'Không thể tạo vai trò mới');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa vai trò này?')) {
            try {
                setError('');
                await roleService.deleteRole(id);
                
                // Nếu đây là item cuối cùng trong trang và không phải trang đầu,
                // chuyển về trang trước
                if (roles.length === 1 && currentPage > 1) {
                    setCurrentPage(prev => prev - 1);
                } else {
                    // Nếu không, load lại trang hiện tại
                    await loadRoles();
                }
            } catch (err) {
                console.error('Error deleting role:', err);
                setError('Không thể xóa vai trò');
            }
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
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
        <Container className="mt-4">
            {error && <Alert variant="danger">{error}</Alert>}
            
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2>Quản lý vai trò</h2>
                <Button variant="primary" onClick={() => handleShow()}>
                    Tạo mới vai trò
                </Button>
            </div>

            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Tên vai trò</th>
                        <th>Mô tả</th>
                        <th>Số quyền</th>
                        <th>Trạng thái</th>
                        <th>Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    {roles.length > 0 ? (
                        roles.map(role => (
                            <tr key={role.id}>
                                <td>{role.id}</td>
                                <td>{role.name}</td>
                                <td>{role.description}</td>
                                <td>{role.permissions?.length || 0}</td>
                                <td>
                                    <span className={`status-badge ${role.active ? 'active' : 'inactive'}`}>
                                        {role.active ? 'Hoạt động' : 'Không hoạt động'}
                                    </span>
                                </td>
                                <td>
                                    <div className="d-flex gap-2">
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
                        ))
                    ) : (
                        <tr>
                            <td colSpan="6" className="text-center">
                                Không có vai trò nào
                            </td>
                        </tr>
                    )}
                </tbody>
            </Table>

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
                    <Modal.Title>{isEditing ? 'Cập nhật vai trò' : 'Tạo mới vai trò'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Tên vai trò</Form.Label>
                            <Form.Control
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Mô tả</Form.Label>
                            <Form.Control
                                as="textarea"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={3}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Check
                                type="switch"
                                id="active-switch"
                                label="Trạng thái"
                                name="active"
                                checked={formData.active}
                                onChange={handleChange}
                            />
                        </Form.Group>

                        <div className="d-flex justify-content-end gap-2">
                            <Button variant="secondary" onClick={handleClose}>
                                Hủy
                            </Button>
                            <Button variant="primary" type="submit">
                                {isEditing ? 'Cập nhật' : 'Tạo mới'}
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>
        </Container>
    );
};

export default RoleManagement; 