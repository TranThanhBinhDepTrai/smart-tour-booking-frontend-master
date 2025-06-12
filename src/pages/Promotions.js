import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Alert, Spinner, Button, Form, Modal } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { promotionService } from '../services/promotionService';
import { useAuth } from '../contexts/AuthContext';
import './Promotions.css';

const Promotions = () => {
    const [promotions, setPromotions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentPage] = useState(0);
    const [pageSize] = useState(10);
    const { currentUser } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPromotion, setSelectedPromotion] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);

    useEffect(() => {
        loadPromotions();
    }, []);

    const loadPromotions = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await promotionService.getAllPromotions(currentPage, pageSize);
            console.log('API Response:', response);

            if (response?.data) {
                // Chỉ hiển thị các khuyến mãi đang active
                const activePromotions = response.data.filter(p => p.active === true);
                setPromotions(activePromotions);
            } else {
                setPromotions([]); // Đặt mảng rỗng thay vì hiển thị lỗi
            }
        } catch (err) {
            console.error('Error loading promotions:', err);
            setError('Không thể tải danh sách khuyến mãi. Vui lòng thử lại sau.');
            setPromotions([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async () => {
        if (!searchTerm.trim()) {
            loadPromotions();
            return;
        }

        try {
            setLoading(true);
            setError('');
            const response = await promotionService.searchPromotions(searchTerm);
            if (response?.data) {
                const activePromotions = response.data.filter(p => p.active === true);
                setPromotions(activePromotions);
            } else {
                setPromotions([]);
            }
        } catch (err) {
            console.error('Error searching promotions:', err);
            setError('Không thể tìm kiếm khuyến mãi. Vui lòng thử lại sau.');
            setPromotions([]);
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = async (promotionId) => {
        try {
            setError('');
            const response = await promotionService.getPromotionById(promotionId);
            if (response?.data) {
                setSelectedPromotion(response.data);
                setShowDetailsModal(true);
            }
        } catch (err) {
            console.error('Error loading promotion details:', err);
            setError('Không thể tải chi tiết khuyến mãi. Vui lòng thử lại sau.');
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <Container className="text-center my-5">
                <Spinner animation="border" variant="primary" />
                <p className="mt-2">Đang tải danh sách khuyến mãi...</p>
            </Container>
        );
    }

    return (
        <Container className="my-5">
            <h2 className="text-center mb-4">Khuyến Mãi Đang Diễn Ra</h2>
            
            {!currentUser ? (
                <Alert variant="info" className="text-center">
                    <h4>Đăng nhập để xem khuyến mãi</h4>
                    <p>Bạn cần đăng nhập để xem và sử dụng các khuyến mãi hiện có.</p>
                    <div className="mt-3">
                        <Button as={Link} to="/login" variant="primary" className="me-2">
                            Đăng nhập
                        </Button>
                        <Button as={Link} to="/register" variant="outline-primary">
                            Đăng ký
                        </Button>
                    </div>
                </Alert>
            ) : (
                <>
                    {/* Search Bar */}
                    <div className="mb-4">
                        <Form className="d-flex gap-2">
                            <Form.Control
                                type="text"
                                placeholder="Tìm kiếm khuyến mãi..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <Button variant="primary" onClick={handleSearch}>
                                Tìm kiếm
                            </Button>
                            {searchTerm && (
                                <Button variant="secondary" onClick={() => {
                                    setSearchTerm('');
                                    loadPromotions();
                                }}>
                                    Xóa
                                </Button>
                            )}
                        </Form>
                    </div>

                    {error && (
                        <Alert variant="danger" className="mb-4">
                            {error}
                        </Alert>
                    )}

                    {promotions.length > 0 ? (
                        <Row xs={1} md={2} lg={3} className="g-4">
                            {promotions.map((promotion) => (
                                <Col key={promotion.id}>
                                    <Card className="h-100 promotion-card">
                                        <Card.Body>
                                            <Card.Title className="promotion-code">
                                                {promotion.code}
                                            </Card.Title>
                                            <Card.Text className="promotion-description">
                                                {promotion.description}
                                            </Card.Text>
                                            <div className="promotion-details">
                                                <p className="discount">
                                                    <strong>Giảm giá:</strong> {promotion.discountPercent}%
                                                </p>
                                                <p className="dates">
                                                    <strong>Thời gian:</strong><br />
                                                    Từ: {formatDate(promotion.startAt)}<br />
                                                    Đến: {formatDate(promotion.endAt)}
                                                </p>
                                                <p className="usage-limit">
                                                    <strong>Số lượt sử dụng còn lại:</strong> {promotion.usageLimit}
                                                </p>
                                                <Button 
                                                    variant="outline-primary" 
                                                    className="w-100 mt-2"
                                                    onClick={() => handleViewDetails(promotion.id)}
                                                >
                                                    Xem chi tiết
                                                </Button>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    ) : (
                        <Alert variant="info" className="text-center">
                            <h4>Không tìm thấy khuyến mãi</h4>
                            <p className="mb-0">
                                {searchTerm 
                                    ? 'Không tìm thấy khuyến mãi phù hợp với từ khóa tìm kiếm.' 
                                    : 'Hiện tại chưa có chương trình khuyến mãi nào đang diễn ra.'}
                            </p>
                        </Alert>
                    )}
                </>
            )}

            {/* Promotion Details Modal */}
            <Modal show={showDetailsModal} onHide={() => setShowDetailsModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Chi tiết khuyến mãi</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedPromotion && (
                        <div className="promotion-details-modal">
                            <h3 className="promotion-code mb-3">{selectedPromotion.code}</h3>
                            <div className="promotion-info">
                                <p className="description">
                                    <strong>Mô tả:</strong><br />
                                    {selectedPromotion.description}
                                </p>
                                <p className="discount">
                                    <strong>Mức giảm giá:</strong> {selectedPromotion.discountPercent}%
                                </p>
                                <div className="dates mb-3">
                                    <p><strong>Thời gian áp dụng:</strong></p>
                                    <ul>
                                        <li>Bắt đầu: {formatDate(selectedPromotion.startAt)}</li>
                                        <li>Kết thúc: {formatDate(selectedPromotion.endAt)}</li>
                                    </ul>
                                </div>
                                <p className="usage-limit">
                                    <strong>Số lượt sử dụng còn lại:</strong> {selectedPromotion.usageLimit}
                                </p>
                                <Alert variant="info">
                                    <i className="bi bi-info-circle me-2"></i>
                                    Hãy sử dụng mã này khi đặt tour để nhận ưu đãi!
                                </Alert>
                            </div>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>
                        Đóng
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default Promotions;