import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Modal, Form, Alert } from 'react-bootstrap';
import { permissionService } from '../../services/permissionService';
import './Permissions.css';
import { FaPlus } from 'react-icons/fa';

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
    <div className="admin-tour-container p-6">
      <div className="admin-tour-card p-6">
        {/* Header */}
        <div className="admin-tour-header">
          <div>
            <h1 className="admin-tour-title">Quản Lý Phân Quyền</h1>
            <p className="admin-tour-subtitle">Danh sách quyền hệ thống</p>
          </div>
          <button
            onClick={() => handleShow()}
            className="add-tour-button d-flex align-items-center gap-2"
            style={{padding: '0.5rem 1.5rem', fontSize: '1rem', borderRadius: '2rem', boxShadow: '0 2px 8px rgba(59,130,246,0.10)', fontWeight: 700}}
          >
            <FaPlus style={{marginRight: 8}} /> Thêm mới quyền
          </button>
        </div>

        <div className="search-results-info">
          Hiển thị <strong>{permissions.length}</strong> trên tổng số <strong>{totalItems}</strong> quyền
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
                    {permissions && permissions.length > 0 ? (
                        permissions.map(permission => (
                            <div className="user-card-item" key={permission.id}>
                                <div className="user-card-header d-flex justify-content-between align-items-center mb-2">
                                    <span className="user-id fw-bold">#{permission.id}</span>
                                    <span className={`method-badge ${permission.method.toLowerCase()}`}>{permission.method}</span>
                                </div>
                                <div className="user-card-body mb-2">
                                    <div><strong>Tên quyền:</strong> {permission.name}</div>
                                    <div><strong>API Path:</strong> {permission.apiPath}</div>
                                    <div><strong>Module:</strong> {permission.module}</div>
                                </div>
                                <div className="user-card-actions d-flex flex-wrap gap-2">
                                    <Button 
                                        variant="primary" 
                                        size="sm"
                                        onClick={() => handleShow(permission)}
                                        title="Sửa"
                                    >
                                        <i className="fas fa-edit"></i>
                                    </Button>
                                    <Button 
                                        variant="danger" 
                                        size="sm"
                                        onClick={() => handleDelete(permission.id)}
                                        title="Xóa"
                                    >
                                        <i className="fas fa-trash"></i>
                                    </Button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center">Không có quyền nào</div>
                    )}
                </div>
            )}
            {permissions && permissions.length > 0 && (
                <div className="pagination mt-3">
                    <button onClick={() => handlePageChange(1)} disabled={currentPage === 1}>Đầu</button>
                    <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>Trước</button>
                    <span>Trang {currentPage} / {totalPages} (Tổng: {totalItems} quyền)</span>
                    <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage >= totalPages}>Sau</button>
                    <button onClick={() => handlePageChange(totalPages)} disabled={currentPage >= totalPages}>Cuối</button>
                </div>
            )}
        </div>
        {/* Modal giữ nguyên */}
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
                                <option value="PATCH">PATCH</option>
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
    </div>
  );
};

export default Permissions; 