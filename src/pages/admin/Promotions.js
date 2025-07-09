import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Modal, Form, Alert, Nav, InputGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { promotionService } from '../../services/promotionService';
import { userService } from '../../services/userService';
import './AdminTour.css';
import { FaSearch } from 'react-icons/fa';

const Promotions = () => {
    const [promotions, setPromotions] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [showEmailModal, setShowEmailModal] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedPromotion, setSelectedPromotion] = useState(null);
    const [users, setUsers] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [emailFormData, setEmailFormData] = useState({
        emails: '',
        promotionCode: ''
    });
    const [formData, setFormData] = useState({
        id: null,
        code: '',
        description: '',
        discountPercent: 0,
        startAt: '',
        endAt: '',
        usageLimit: 0
    });
    const [searchTerm, setSearchTerm] = useState("");
    const navigate = useNavigate();

    const today = new Date();
    const minToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0);
    const minTodayISOString = minToday.toISOString().slice(0, 16);

    const loadUsers = async () => {
        try {
            const response = await userService.getAllUsers();
            if (response?.data?.result) {
                // Chỉ lấy users có role là user (không phải admin)
                const filteredUsers = response.data.result.filter(user => user.role.id === 1);
                setUsers(filteredUsers);
            }
        } catch (err) {
            console.error('Error loading users:', err);
            setError('Không thể tải danh sách người dùng');
        }
    };

    const loadPromotions = async (page = currentPage) => {
        try {
            setLoading(true);
            const response = await promotionService.getAllPromotions();
            console.log('API Response:', response);

            if (Array.isArray(response?.data)) {
                setPromotions(response.data.slice(page * pageSize, (page + 1) * pageSize));
                setTotalItems(response.data.length);
                setTotalPages(Math.ceil(response.data.length / pageSize));
                setCurrentPage(page);
                setError('');
            } else {
                setPromotions([]);
                setTotalItems(0);
                setTotalPages(0);
                setError('Không có dữ liệu khuyến mãi');
            }
        } catch (err) {
            setError(err.message || 'Không thể tải danh sách khuyến mãi');
            setPromotions([]);
            setTotalItems(0);
            setTotalPages(0);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPromotions(0);
    }, []); // Chỉ load khi component mount

    const handleClose = () => {
        setShowModal(false);
        setIsEditing(false);
        setFormData({
            id: null,
            code: '',
            description: '',
            discountPercent: 0,
            startAt: '',
            endAt: '',
            usageLimit: 0
        });
    };

    const handleEmailModalClose = () => {
        setShowEmailModal(false);
        setEmailFormData({
            emails: '',
            promotionCode: ''
        });
        setSelectedPromotion(null);
        setSelectedUsers([]);
    };

    const handleEmailModalShow = async (promotion) => {
        setSelectedPromotion(promotion);
        setEmailFormData({
            emails: '',
            promotionCode: promotion.code
        });
        await loadUsers(); // Load users when opening the modal
        setShowEmailModal(true);
    };

    const handleUserSelect = (userId) => {
        setSelectedUsers(prev => {
            if (prev.includes(userId)) {
                return prev.filter(id => id !== userId);
            } else {
                return [...prev, userId];
            }
        });
    };

    const handleSelectAllUsers = (e) => {
        if (e.target.checked) {
            setSelectedUsers(users.map(user => user.id));
        } else {
            setSelectedUsers([]);
        }
    };

    const handleEmailSubmit = async (e) => {
        e.preventDefault();
        try {
            setError('');
            const selectedEmails = users
                .filter(user => selectedUsers.includes(user.id))
                .map(user => user.email);

            if (selectedEmails.length === 0) {
                throw new Error('Vui lòng chọn ít nhất một người dùng');
            }

            await promotionService.sendPromotionEmails(emailFormData.promotionCode, selectedEmails);
            handleEmailModalClose();
            alert('Gửi email thành công!');
        } catch (err) {
            console.error('Error sending emails:', err);
            setError(err.message || 'Không thể gửi email. Vui lòng thử lại.');
        }
    };

    const handleShow = (promotion = null) => {
        if (promotion) {
            setIsEditing(true);
            // Format dates for input fields
            const formattedStartAt = new Date(promotion.startAt).toISOString().slice(0, 16);
            const formattedEndAt = new Date(promotion.endAt).toISOString().slice(0, 16);
            
            setFormData({
                id: promotion.id,
                code: promotion.code,
                description: promotion.description,
                discountPercent: promotion.discountPercent,
                startAt: formattedStartAt,
                endAt: formattedEndAt,
                usageLimit: promotion.usageLimit
            });
        } else {
            setIsEditing(false);
            setFormData({
                id: null,
                code: '',
                description: '',
                discountPercent: 0,
                startAt: '',
                endAt: '',
                usageLimit: 0
            });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setError('');
            const submissionData = {
                ...formData,
                startAt: new Date(formData.startAt).toISOString(),
                endAt: new Date(formData.endAt).toISOString(),
                discountPercent: Number(formData.discountPercent),
                usageLimit: Number(formData.usageLimit)
            };

            let response;
            if (isEditing) {
                if (!formData.id) {
                    throw new Error('Thiếu ID khuyến mãi để cập nhật');
                }
                response = await promotionService.updatePromotion(formData.id, submissionData);
            } else {
                response = await promotionService.createPromotion(submissionData);
            }

            handleClose();
            await loadPromotions(currentPage);
        } catch (err) {
            console.error('Error saving promotion:', err);
            setError(err.message || (isEditing ? 'Không thể cập nhật khuyến mãi' : 'Không thể tạo khuyến mãi mới'));
        }
    };

    const handleDelete = async (promotion) => {
        if (window.confirm('Bạn có chắc chắn muốn vô hiệu hóa khuyến mãi này?')) {
            try {
                setError('');
                const response = await promotionService.togglePromotionStatus(promotion.id);
                console.log('Deactivate response:', response);
                
                // Nếu không có lỗi, reload danh sách
                await loadPromotions(0);
            } catch (err) {
                console.error('Error deactivating promotion:', err);
                setError(err.message || 'Không thể vô hiệu hóa khuyến mãi');
                await loadPromotions(currentPage);
            }
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        const newValue = value;
        if (name === 'startAt' || name === 'endAt') {
            const start = new Date(name === 'startAt' ? newValue : formData.startAt);
            const end = new Date(name === 'endAt' ? newValue : formData.endAt);
            const today = new Date();
            const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0);
            const startOnly = new Date(start.getFullYear(), start.getMonth(), start.getDate(), 0, 0, 0, 0);
            const endOnly = new Date(end.getFullYear(), end.getMonth(), end.getDate(), 0, 0, 0, 0);
            if ((name === 'startAt' && startOnly < todayOnly) || (name === 'endAt' && endOnly < todayOnly)) {
                setError('Không được chọn ngày trong quá khứ.');
            } else if (formData.startAt && formData.endAt && start >= end) {
                setError('Ngày kết thúc phải sau ngày bắt đầu.');
            } else {
                setError('');
            }
        }
        setFormData(prev => ({
            ...prev,
            [name]: newValue
        }));
    };

    const handleEmailFormChange = (e) => {
        const { name, value } = e.target;
        setEmailFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handlePageChange = async (newPage) => {
        await loadPromotions(newPage);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('vi-VN');
    };

    return (
        <Container fluid className="admin-page-container mt-4">
            {error && <Alert variant="danger">{error}</Alert>}
            <div className="admin-tour-header mb-3">
                <div>
                    <h1 className="admin-tour-title">Quản lý khuyến mãi</h1>
                    <p className="admin-tour-subtitle">Danh sách các chương trình khuyến mãi</p>
                </div>
                <button
                    onClick={() => navigate('/admin/promotions/create')}
                    className="add-tour-button"
                >
                    + Thêm khuyến mãi
                </button>
            </div>
            <div className="search-bar-wrapper">
                <input
                    type="text"
                    className="search-bar-input"
                    placeholder="Tìm theo mã hoặc mô tả"
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
                    <Table striped bordered hover responsive className="admin-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Mã khuyến mãi</th>
                                <th>Mô tả</th>
                                <th>Giảm giá (%)</th>
                                <th>Ngày bắt đầu</th>
                                <th>Ngày kết thúc</th>
                                <th>Giới hạn sử dụng</th>
                                <th>Trạng thái</th>
                                <th style={{width: "200px"}}>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {promotions && promotions.filter(promotion => {
                                const s = searchTerm.toLowerCase();
                                return (
                                    promotion.code.toLowerCase().includes(s) ||
                                    promotion.description.toLowerCase().includes(s) ||
                                    promotion.discountPercent.toString().includes(s) ||
                                    (promotion.startAt && promotion.startAt.toLowerCase().includes(s)) ||
                                    (promotion.endAt && promotion.endAt.toLowerCase().includes(s))
                                );
                            })
                            .map((promotion) => (
                                <tr key={promotion.id}>
                                    <td>{promotion.id}</td>
                                    <td>{promotion.code}</td>
                                    <td>{promotion.description}</td>
                                    <td>{promotion.discountPercent}%</td>
                                    <td>{formatDate(promotion.startAt)}</td>
                                    <td>{formatDate(promotion.endAt)}</td>
                                    <td>{promotion.usageLimit}</td>
                                    <td>
                                        {promotion.active ? (
                                            <span style={{ color: 'green', fontWeight: 'bold' }}>Còn hiệu lực</span>
                                        ) : (
                                            <span style={{ color: 'red', fontWeight: 'bold' }}>Hết hiệu lực</span>
                                        )}
                                    </td>
                                    <td>
                                        <div className="d-flex gap-2 justify-content-center">
                                            <button className="action-button edit-button" onClick={() => handleShow(promotion)} title="Sửa">Sửa</button>
                                            <button className="action-button delete-btn" onClick={() => handleDelete(promotion)} title="Xóa">Xóa</button>
                                            <Button
                                                variant="success"
                                                size="sm"
                                                onClick={() => handleEmailModalShow(promotion)}
                                            >
                                                Gửi Email
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>

                    {promotions && promotions.length > 0 && (
                        <div className="pagination">
                            <button onClick={() => handlePageChange(0)} disabled={currentPage === 0}>Đầu</button>
                            <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 0}>Trước</button>
                            <span>Trang {currentPage + 1} / {totalPages} (Tổng: {totalItems} khuyến mãi)</span>
                            <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage >= totalPages - 1}>Sau</button>
                            <button onClick={() => handlePageChange(totalPages - 1)} disabled={currentPage >= totalPages - 1}>Cuối</button>
                        </div>
                    )}
                </>
            )}

            <Modal show={showModal} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>{isEditing ? 'Cập nhật khuyến mãi' : 'Thêm mới khuyến mãi'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Mã khuyến mãi</Form.Label>
                            <Form.Control
                                type="text"
                                name="code"
                                value={formData.code}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Mô tả</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Phần trăm giảm giá (%)</Form.Label>
                            <Form.Control
                                type="number"
                                name="discountPercent"
                                value={formData.discountPercent}
                                onChange={handleChange}
                                min="0"
                                max="100"
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Ngày bắt đầu</Form.Label>
                            <Form.Control
                                type="datetime-local"
                                name="startAt"
                                value={formData.startAt}
                                onChange={handleChange}
                                required
                                min={minTodayISOString}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Ngày kết thúc</Form.Label>
                            <Form.Control
                                type="datetime-local"
                                name="endAt"
                                value={formData.endAt}
                                onChange={handleChange}
                                required
                                min={formData.startAt || minTodayISOString}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Giới hạn sử dụng</Form.Label>
                            <Form.Control
                                type="number"
                                name="usageLimit"
                                value={formData.usageLimit}
                                onChange={handleChange}
                                min="0"
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

            <Modal show={showEmailModal} onHide={handleEmailModalClose} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Gửi mã khuyến mãi qua email</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleEmailSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Mã khuyến mãi</Form.Label>
                            <Form.Control
                                type="text"
                                value={emailFormData.promotionCode}
                                disabled
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Chọn người dùng</Form.Label>
                            <div className="mb-2">
                                <Form.Check
                                    type="checkbox"
                                    label="Chọn tất cả"
                                    onChange={handleSelectAllUsers}
                                    checked={selectedUsers.length === users.length && users.length > 0}
                                />
                            </div>
                            <div style={{ maxHeight: '300px', overflowY: 'auto' }} className="border rounded p-2">
                                {users.map(user => (
                                    <Form.Check
                                        key={user.id}
                                        type="checkbox"
                                        id={`user-${user.id}`}
                                        label={`${user.fullName} (${user.email})`}
                                        checked={selectedUsers.includes(user.id)}
                                        onChange={() => handleUserSelect(user.id)}
                                        className="mb-2"
                                    />
                                ))}
                            </div>
                            <Form.Text className="text-muted">
                                Đã chọn {selectedUsers.length} người dùng
                            </Form.Text>
                        </Form.Group>

                        {error && (
                            <Alert variant="danger" className="mb-3">
                                {error}
                            </Alert>
                        )}

                        <div className="d-flex justify-content-end gap-2">
                            <Button variant="secondary" onClick={handleEmailModalClose}>
                                Hủy
                            </Button>
                            <Button 
                                variant="primary" 
                                type="submit"
                                disabled={selectedUsers.length === 0}
                            >
                                Gửi
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>
        </Container>
    );
};

export default Promotions; 