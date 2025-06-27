import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { promotionService } from '../../services/promotionService';
import { Container, Card, Form, Button, Row, Col, Alert } from 'react-bootstrap';
import './CreatePromotion.css';

const CreatePromotion = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        code: '',
        description: '',
        discountPercent: 0,
        startAt: '',
        endAt: '',
        usageLimit: 100,
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const today = new Date();
    const minDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0);
    const minDateISOString = minDate.toISOString().slice(0, 16); // yyyy-MM-ddTHH:mm

    const handleChange = (e) => {
        const { name, value } = e.target;
        const newValue = e.target.type === 'number' ? parseInt(value, 10) : value;
        setFormData(prev => ({ ...prev, [name]: newValue }));

        if (name === 'startAt' || name === 'endAt') {
            const start = new Date(name === 'startAt' ? newValue : formData.startAt);
            const end = new Date(name === 'endAt' ? newValue : formData.endAt);
            const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate());
            const endDay = new Date(end.getFullYear(), end.getMonth(), end.getDate());
            if ((name === 'startAt' && startDay < minDate) || (name === 'endAt' && endDay < minDate)) {
                setError('Không được chọn ngày trong quá khứ.');
            } else if (formData.startAt && formData.endAt && start >= end) {
                setError('Ngày kết thúc phải sau ngày bắt đầu.');
            } else {
                setError('');
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (new Date(formData.startAt) >= new Date(formData.endAt)) {
            setError('Ngày kết thúc phải sau ngày bắt đầu.');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const promotionData = {
                ...formData,
                discountPercent: Number(formData.discountPercent),
                usageLimit: Number(formData.usageLimit),
                startAt: new Date(formData.startAt).toISOString(),
                endAt: new Date(formData.endAt).toISOString(),
            };
            await promotionService.createPromotion(promotionData);
            setSuccess('Tạo khuyến mãi thành công!');
            setTimeout(() => navigate('/admin/promotions'), 1500);
        } catch (err) {
            setError(err.message || 'Có lỗi xảy ra khi tạo khuyến mãi.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="create-promotion-container mt-4">
            <Card>
                <Card.Header as="h4">Tạo Khuyến Mãi Mới</Card.Header>
                <Card.Body>
                    {error && <Alert variant="danger">{error}</Alert>}
                    {success && <Alert variant="success">{success}</Alert>}
                    <Form onSubmit={handleSubmit}>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Mã khuyến mãi</Form.Label>
                                    <Form.Control type="text" name="code" value={formData.code} onChange={handleChange} required />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Phần trăm giảm giá (%)</Form.Label>
                                    <Form.Control type="number" name="discountPercent" value={formData.discountPercent} onChange={handleChange} required min="0" max="100" />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Form.Group className="mb-3">
                            <Form.Label>Mô tả</Form.Label>
                            <Form.Control as="textarea" rows={3} name="description" value={formData.description} onChange={handleChange} required />
                        </Form.Group>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Ngày bắt đầu</Form.Label>
                                    <Form.Control type="datetime-local" name="startAt" value={formData.startAt} onChange={handleChange} required min={minDateISOString} />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Ngày kết thúc</Form.Label>
                                    <Form.Control type="datetime-local" name="endAt" value={formData.endAt} onChange={handleChange} required min={minDateISOString} />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Form.Group className="mb-3">
                            <Form.Label>Giới hạn sử dụng</Form.Label>
                            <Form.Control type="number" name="usageLimit" value={formData.usageLimit} onChange={handleChange} required min="1" />
                        </Form.Group>
                        <Button type="submit" variant="primary" disabled={loading}>
                            {loading ? 'Đang tạo...' : 'Tạo Khuyến Mãi'}
                        </Button>
                    </Form>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default CreatePromotion; 