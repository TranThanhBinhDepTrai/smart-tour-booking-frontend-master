import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Card, Row, Col, Alert } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { tourService } from '../../services/tourService';
import { promotionService } from '../../services/promotionService';
import { useAuth } from '../../contexts/AuthContext';
import './BookTour.css';

const BookTour = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [tour, setTour] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [promotions, setPromotions] = useState([]);
    const [promotionError, setPromotionError] = useState('');
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        numAdults: 1,
        numChildren: 0,
        paymentMethod: 'CASH',
        promotionCode: '',
        participants: [{ fullName: '', phone: '', gender: 'MALE' }]
    });

    useEffect(() => {
        loadTourDetails();
        if (currentUser) {
            console.log('Current user in BookTour:', currentUser); // Debug
            console.log('Phone number:', currentUser.phone); // Debug specific field
            setFormData(prev => ({
                ...prev,
                fullName: currentUser.fullName || '',
                email: currentUser.email || '',
                phone: currentUser.phone || '',
                participants: [{
                    fullName: currentUser.fullName || '',
                    phone: currentUser.phone || '',
                    gender: currentUser.gender || 'MALE'
                }]
            }));
            loadPromotions();
        }
    }, [id, currentUser]);

    const loadTourDetails = async () => {
        try {
            setLoading(true);
            const response = await tourService.getTourById(id);
            if (response?.data) {
                setTour(response.data);
            }
        } catch (err) {
            console.error('Error loading tour:', err);
            setError('Không thể tải thông tin tour');
        } finally {
            setLoading(false);
        }
    };

    const loadPromotions = async () => {
        try {
            console.log('Loading promotions...'); // Debug
            const response = await promotionService.getAllPromotions();
            console.log('Promotions response:', response); // Debug
            if (response?.data) {
                // Chỉ lấy các khuyến mãi đang active
                const activePromotions = response.data.filter(p => p.active === true);
                setPromotions(activePromotions);
            }
        } catch (err) {
            console.error('Error loading promotions:', err);
            setPromotionError('Không thể tải danh sách mã giảm giá');
        }
    };

    const handleParticipantChange = (index, field, value) => {
        const newParticipants = [...formData.participants];
        newParticipants[index] = {
            ...newParticipants[index],
            [field]: value
        };
        setFormData({ ...formData, participants: newParticipants });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === 'numAdults') {
            const numAdults = parseInt(value) || 0;
            const newParticipants = [...formData.participants];
            
            // Adjust participants array size
            if (numAdults > newParticipants.length) {
                // Add more participants
                for (let i = newParticipants.length; i < numAdults; i++) {
                    newParticipants.push({ fullName: '', phone: '', gender: 'MALE' });
                }
            } else {
                // Remove excess participants
                newParticipants.splice(numAdults);
            }
            
            setFormData({
                ...formData,
                [name]: value,
                participants: newParticipants
            });
        } else {
            setFormData({
                ...formData,
                [name]: value
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Validate số lượng người tham gia
            const totalParticipants = parseInt(formData.numAdults) + parseInt(formData.numChildren || 0);
            if (formData.participants.length !== totalParticipants) {
                setError('Số lượng người tham gia không khớp với thông tin đã nhập');
                return;
            }

            const bookingData = {
                tourId: parseInt(id),
                adults: parseInt(formData.numAdults),
                children: parseInt(formData.numChildren || 0),
                promotionCode: formData.promotionCode || null,
                participants: formData.participants.map(p => ({
                    name: p.fullName,
                    phone: p.phone,
                    gender: p.gender
                }))
            };

            // Nếu user đã đăng nhập, thêm userId
            if (currentUser) {
                bookingData.userId = currentUser.id;
            } else {
                // Nếu chưa đăng nhập, thêm thông tin khách
                bookingData.guestName = formData.fullName;
                bookingData.guestEmail = formData.email;
                bookingData.guestPhone = formData.phone;
            }

            // Chỉ thêm isCashPayment khi thanh toán tiền mặt
            if (formData.paymentMethod === 'CASH') {
                bookingData.isCashPayment = true;
            }

            console.log('Submitting booking data:', bookingData);
            const response = await tourService.bookTour(bookingData);
            console.log('Booking response:', response);
            
            if (response.statusCode === 200) {
                if (response.data.vnPayUrl) {
                    // Nếu có URL VNPay, chuyển hướng đến trang thanh toán
                    window.location.href = response.data.vnPayUrl;
                } else {
                    // Nếu thanh toán tiền mặt, chuyển đến trang lịch sử
                    alert('Đặt tour thành công!');
                    navigate('/history');
                }
            } else {
                setError(response.message || 'Có lỗi xảy ra khi đặt tour');
            }
        } catch (err) {
            console.error('Error booking tour:', err);
            setError('Không thể đặt tour: ' + (err.response?.data?.message || 'Đã có lỗi xảy ra'));
        }
    };

    const handleAddParticipant = () => {
        setFormData(prev => ({
            ...prev,
            participants: [
                ...prev.participants,
                { fullName: '', phone: '', gender: 'MALE' }
            ]
        }));
    };

    const handleRemoveParticipant = (index) => {
        setFormData(prev => ({
            ...prev,
            participants: prev.participants.filter((_, i) => i !== index)
        }));
    };

    if (loading) {
        return (
            <Container className="mt-4 text-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Đang tải...</span>
                </div>
            </Container>
        );
    }

    return (
        <div className="book-tour-container">
            <h2>Đặt Tour</h2>
            
            {error && <Alert variant="danger">{error}</Alert>}

            {tour && (
                <Row>
                    <Col md={8}>
                        <Card className="mb-4">
                            <Card.Body>
                                <Form onSubmit={handleSubmit}>
                                    <section className="booking-section">
                                        <h3>Thông tin người đặt</h3>
                                        <Row>
                                            <Col md={6}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>Họ tên</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        name="fullName"
                                                        value={formData.fullName}
                                                        onChange={handleInputChange}
                                                        required
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={6}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>Email</Form.Label>
                                                    <Form.Control
                                                        type="email"
                                                        name="email"
                                                        value={formData.email}
                                                        onChange={handleInputChange}
                                                        required
                                                    />
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                        <Row>
                                            <Col md={6}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>Số điện thoại</Form.Label>
                                                    <Form.Control
                                                        type="tel"
                                                        name="phone"
                                                        value={formData.phone}
                                                        onChange={handleInputChange}
                                                        required
                                                    />
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                    </section>

                                    <section className="booking-section">
                                        <h3>Số lượng người tham gia</h3>
                                        <Row>
                                            <Col md={6}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>Số người lớn</Form.Label>
                                                    <Form.Control
                                                        type="number"
                                                        name="numAdults"
                                                        value={formData.numAdults}
                                                        onChange={handleInputChange}
                                                        min="1"
                                                        required
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={6}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>Số trẻ em</Form.Label>
                                                    <Form.Control
                                                        type="number"
                                                        name="numChildren"
                                                        value={formData.numChildren}
                                                        onChange={handleInputChange}
                                                        min="0"
                                                    />
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                    </section>

                                    <section className="booking-section">
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <h3>Thông tin người tham gia</h3>
                                            <Button 
                                                variant="outline-primary" 
                                                onClick={handleAddParticipant}
                                                className="d-flex align-items-center"
                                            >
                                                <i className="fas fa-plus me-1"></i> Thêm người
                                            </Button>
                                        </div>
                                        {formData.participants.map((participant, index) => (
                                            <div key={index} className="participant-section">
                                                <div className="d-flex justify-content-between align-items-center mb-3">
                                                    <h4>Người thứ {index + 1}</h4>
                                                    {index > 0 && (
                                                        <Button 
                                                            variant="outline-danger" 
                                                            size="sm"
                                                            onClick={() => handleRemoveParticipant(index)}
                                                        >
                                                            <i className="fas fa-times"></i>
                                                        </Button>
                                                    )}
                                                </div>
                                                <Row>
                                                    <Col md={6}>
                                                        <Form.Group className="mb-3">
                                                            <Form.Label>Họ tên</Form.Label>
                                                            <Form.Control
                                                                type="text"
                                                                value={participant.fullName}
                                                                onChange={(e) => handleParticipantChange(index, 'fullName', e.target.value)}
                                                                required
                                                            />
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={6}>
                                                        <Form.Group className="mb-3">
                                                            <Form.Label>Số điện thoại</Form.Label>
                                                            <Form.Control
                                                                type="tel"
                                                                value={participant.phone}
                                                                onChange={(e) => handleParticipantChange(index, 'phone', e.target.value)}
                                                                required
                                                            />
                                                        </Form.Group>
                                                    </Col>
                                                </Row>
                                                <Row>
                                                    <Col md={6}>
                                                        <Form.Group className="mb-3">
                                                            <Form.Label>Giới tính</Form.Label>
                                                            <div>
                                                                <Form.Check
                                                                    inline
                                                                    type="radio"
                                                                    label="Nam"
                                                                    name={`gender-${index}`}
                                                                    checked={participant.gender === 'MALE'}
                                                                    onChange={() => handleParticipantChange(index, 'gender', 'MALE')}
                                                                />
                                                                <Form.Check
                                                                    inline
                                                                    type="radio"
                                                                    label="Nữ"
                                                                    name={`gender-${index}`}
                                                                    checked={participant.gender === 'FEMALE'}
                                                                    onChange={() => handleParticipantChange(index, 'gender', 'FEMALE')}
                                                                />
                                                            </div>
                                                        </Form.Group>
                                                    </Col>
                                                </Row>
                                            </div>
                                        ))}
                                    </section>

                                    <section className="booking-section">
                                        <h3>Phương thức thanh toán</h3>
                                        <Form.Group className="mb-3">
                                            <div>
                                                <Form.Check
                                                    type="radio"
                                                    label="Thanh toán tiền mặt"
                                                    name="paymentMethod"
                                                    checked={formData.paymentMethod === 'CASH'}
                                                    onChange={() => setFormData({ ...formData, paymentMethod: 'CASH' })}
                                                />
                                                <Form.Check
                                                    type="radio"
                                                    label="Thanh toán chuyển khoản"
                                                    name="paymentMethod"
                                                    checked={formData.paymentMethod === 'BANK_TRANSFER'}
                                                    onChange={() => setFormData({ ...formData, paymentMethod: 'BANK_TRANSFER' })}
                                                />
                                            </div>
                                        </Form.Group>
                                    </section>

                                    <section className="booking-section">
                                        <h3>Mã giảm giá</h3>
                                        <Form.Group className="mb-3">
                                            <Form.Select
                                                name="promotionCode"
                                                value={formData.promotionCode}
                                                onChange={handleInputChange}
                                            >
                                                <option value="">Chọn mã giảm giá</option>
                                                {promotions.map((promotion) => (
                                                    <option key={promotion.id} value={promotion.code}>
                                                        {promotion.code} - Giảm {promotion.discountPercent}% - {promotion.description}
                                                    </option>
                                                ))}
                                            </Form.Select>
                                            {promotionError && (
                                                <Form.Text className="text-danger">
                                                    {promotionError}
                                                </Form.Text>
                                            )}
                                        </Form.Group>
                                    </section>

                                    <div className="d-grid gap-2">
                                        <Button variant="primary" type="submit" size="lg">
                                            Đặt Tour
                                        </Button>
                                    </div>
                                </Form>
                            </Card.Body>
                        </Card>
                    </Col>

                    <Col md={4}>
                        <Card className="sticky-top" style={{ top: '20px' }}>
                            <Card.Body>
                                <h5 className="mb-3">Thông tin tour</h5>
                                <p><strong>Tên tour:</strong> {tour.title}</p>
                                <p><strong>Mã tour:</strong> {tour.code}</p>
                                <p><strong>Điểm đến:</strong> {tour.destination}</p>
                                <p><strong>Thời gian:</strong> {tour.durationDays} ngày {tour.durationNights} đêm</p>
                                <p><strong>Ngày khởi hành:</strong> {new Date(tour.startDate).toLocaleDateString('vi-VN')}</p>
                                <p><strong>Ngày kết thúc:</strong> {new Date(tour.endDate).toLocaleDateString('vi-VN')}</p>
                                <hr />
                                <p><strong>Giá người lớn:</strong> {tour.priceAdults?.toLocaleString('vi-VN')} VNĐ</p>
                                <p><strong>Giá trẻ em:</strong> {tour.priceChildren?.toLocaleString('vi-VN')} VNĐ</p>
                                <hr />
                                <p><strong>Tổng tiền:</strong> {((formData.numAdults * tour.priceAdults) + (formData.numChildren * tour.priceChildren))?.toLocaleString('vi-VN')} VNĐ</p>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            )}
        </div>
    );
};

export default BookTour; 