import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Modal, Form, Alert } from 'react-bootstrap';
import { permissionService } from '../../services/permissionService';
import './AdminTour.css';

const Permissions = () => {
    const [permissions, setPermissions] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        id: null,
        name: '',
        apiPath: '',
        method: 'GET',
        module: ''
    });

    const loadPermissions = async (page = currentPage) => {
        try {
            setLoading(true);
            const response = await permissionService.getAllPermissions(page, pageSize);
            console.log('API Response:', response);

            if (response?.meta && response?.result && Array.isArray(response.result)) {
                setPermissions(response.result);
                setTotalItems(response.meta.total);
                setTotalPages(response.meta.pages);
                setCurrentPage(page);
                setError('');
            } else {
                throw new Error('Invalid response structure');
            }
        } catch (err) {
            console.error('Error loading permissions:', err);
            setError(err.message || 'Không thể tải danh sách quyền');
            setPermissions([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPermissions(1);
    }, []);

    const handleClose = () => {
        setShowModal(false);
        setIsEditing(false);
        setFormData({
            id: null,
            name: '',
            apiPath: '',
            method: 'GET',
            module: ''
        });
    };

    const handleShow = (permission = null) => {
        if (permission) {
            setIsEditing(true);
            setFormData({
                id: permission.id,
                name: permission.name,
                apiPath: permission.apiPath,
                method: permission.method,
                module: permission.module
            });
        } else {
            setIsEditing(false);
            setFormData({
                id: null,
                name: '',
                apiPath: '',
                method: 'GET',
                module: ''
            });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setError('');
            let response;
            if (isEditing) {
                // Make sure we have an ID when updating
                if (!formData.id) {
                    throw new Error('Thiếu ID quyền để cập nhật');
                }
                response = await permissionService.updatePermission(formData);
                // response now contains the updated permission directly
                if (response) {
                    setPermissions(permissions.map(p => 
                        p.id === response.id ? response : p
                    ));
                    handleClose();
                }
            } else {
                response = await permissionService.createPermission(formData);
                if (response?.data) {
                    setPermissions([response.data, ...permissions].slice(0, pageSize));
                    handleClose();
                }
            }
            // Reload to ensure consistency
            await loadPermissions(currentPage);
        } catch (err) {
            console.error('Error saving permission:', err);
            setError(err.message || (isEditing ? 'Không thể cập nhật quyền' : 'Không thể tạo quyền mới'));
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa quyền này?')) {
            try {
                setError('');
                const response = await permissionService.deletePermission(id);
                
                // Xóa quyền khỏi state ngay lập tức
                setPermissions(permissions.filter(p => p.id !== id));
                
                // Nếu đây là item cuối cùng trong trang và không phải trang đầu,
                // chuyển về trang trước
                if (permissions.length === 1 && currentPage > 1) {
                    await loadPermissions(currentPage - 1);
                } else if (permissions.length > 1) {
                    // Nếu còn items khác trong trang hiện tại
                    await loadPermissions(currentPage);
                }
            } catch (err) {
                console.error('Error deleting permission:', err);
                setError(err.message || 'Không thể xóa quyền');
                // Reload lại trang để đồng bộ dữ liệu
                await loadPermissions(currentPage);
            }
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
        await loadPermissions(newPage);
    };

    return (
        <Container fluid className="mt-4">
            {error && <Alert variant="danger">{error}</Alert>}
            
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2>Quản lý phân quyền</h2>
                <Button variant="primary" onClick={() => handleShow()}>
                    Thêm mới quyền
                </Button>
            </div>

            {loading ? (
                <div className="text-center my-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Đang tải...</span>
                    </div>
                </div>
            ) : (
                <>
                    <Table striped bordered hover responsive>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Tên quyền</th>
                                <th>API Path</th>
                                <th>Method</th>
                                <th>Module</th>
                                <th style={{width: "150px"}}>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {permissions && permissions.length > 0 ? (
                                permissions.map(permission => (
                                    <tr key={permission.id}>
                                        <td>{permission.id}</td>
                                        <td>{permission.name}</td>
                                        <td>{permission.apiPath}</td>
                                        <td>
                                            <span className={`method-badge ${permission.method.toLowerCase()}`}>
                                                {permission.method}
                                            </span>
                                        </td>
                                        <td>{permission.module}</td>
                                        <td>
                                            <div className="d-flex gap-2 justify-content-center">
                                                <Button 
                                                    variant="primary" 
                                                    size="sm"
                                                    onClick={() => handleShow(permission)}
                                                >
                                                    Sửa
                                                </Button>
                                                <Button 
                                                    variant="danger" 
                                                    size="sm"
                                                    onClick={() => handleDelete(permission.id)}
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
                                        Không có quyền nào
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </Table>

                    {permissions && permissions.length > 0 && (
                        <div className="d-flex justify-content-center mt-3">
                            <Button 
                                variant="outline-primary" 
                                onClick={() => handlePageChange(1)}
                                disabled={currentPage === 1}
                            >
                                Đầu
                            </Button>
                            <Button 
                                variant="outline-primary" 
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="mx-2"
                            >
                                Trước
                            </Button>
                            <span className="mx-3 mt-2">
                                Trang {currentPage} / {totalPages} (Tổng: {totalItems} quyền)
                            </span>
                            <Button 
                                variant="outline-primary"
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage >= totalPages}
                                className="mx-2"
                            >
                                Sau
                            </Button>
                            <Button 
                                variant="outline-primary"
                                onClick={() => handlePageChange(totalPages)}
                                disabled={currentPage >= totalPages}
                            >
                                Cuối
                            </Button>
                        </div>
                    )}
                </>
            )}

            <Modal show={showModal} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>{isEditing ? 'Cập nhật quyền' : 'Thêm mới quyền'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Tên quyền</Form.Label>
                            <Form.Control
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>API Path</Form.Label>
                            <Form.Control
                                type="text"
                                name="apiPath"
                                value={formData.apiPath}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Method</Form.Label>
                            <Form.Select
                                name="method"
                                value={formData.method}
                                onChange={handleChange}
                                required
                            >
                                <option value="GET">GET</option>
                                <option value="POST">POST</option>
                                <option value="PUT">PUT</option>
                                <option value="DELETE">DELETE</option>
                            </Form.Select>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Module</Form.Label>
                            <Form.Control
                                type="text"
                                name="module"
                                value={formData.module}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>

                        <div className="d-flex justify-content-end gap-2">
                            <Button variant="secondary" onClick={handleClose}>
                                Hủy
                            </Button>
                            <Button variant="primary" type="submit">
                                {isEditing ? 'Cập nhật' : 'Thêm mới'}
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>
        </Container>
    );
};

export default Permissions; 