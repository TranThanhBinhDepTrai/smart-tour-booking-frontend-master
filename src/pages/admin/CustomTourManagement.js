import React, { useState, useEffect } from 'react';
import { 
  Container, Row, Col, Table, Button, Badge, 
  Card, Form, InputGroup, Modal, Spinner
} from 'react-bootstrap';
import { FaSearch, FaEye, FaEnvelope, FaTrash } from 'react-icons/fa';
import axios from 'axios';

const CustomTourManagement = () => {
  const [customTours, setCustomTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedTour, setSelectedTour] = useState(null);
  const [emailResponse, setEmailResponse] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const itemsPerPage = 10;

  // Helper để lấy config headers kèm token xác thực
  const getAuthConfig = () => {
    const token = localStorage.getItem('token');
    return {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };
  };

  // Fetch custom tours data
  useEffect(() => {
    const fetchCustomTours = async () => {
      try {
        setLoading(true);
        // Lấy config headers chứa token
        const config = getAuthConfig();
        console.log('Sending request with auth config:', config);

        const response = await axios.get('http://localhost:8080/api/v1/tour/custom', config);
        if (response.data && response.data.data) {
          setCustomTours(response.data.data);
        }
        setLoading(false);
      } catch (err) {
        console.error('Error details:', err.response || err);
        if (err.response && err.response.status === 401) {
          setError('Lỗi xác thực: Vui lòng đăng nhập lại');
        } else {
          setError('Đã xảy ra lỗi khi lấy dữ liệu tour theo yêu cầu');
        }
        setLoading(false);
      }
    };

    fetchCustomTours();
  }, []);

  // Handle search
  const filteredTours = customTours.filter(tour => {
    const searchLower = searchTerm.toLowerCase();
    return (
      tour.name.toLowerCase().includes(searchLower) ||
      tour.email.toLowerCase().includes(searchLower) ||
      tour.phone.toLowerCase().includes(searchLower) ||
      tour.destination.toLowerCase().includes(searchLower)
    );
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTours = filteredTours.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(filteredTours.length / itemsPerPage);
  const pageNumbers = [];

  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  // View tour detail
  const viewDetail = async (id) => {
    try {
      setLoadingDetail(true);
      console.log(`Fetching detail for tour ID: ${id}`);
      
      // Lấy config headers chứa token
      const config = getAuthConfig();
      console.log('Sending detail request with auth config:', config);

      const response = await axios.get(`http://localhost:8080/api/v1/tour/custom/${id}`, config);
      console.log('API response:', response);
      
      if (response.data && response.data.data) {
        setSelectedTour(response.data.data);
        setShowDetailModal(true);
      } else {
        console.error('Invalid response format:', response.data);
        alert('Không thể tải thông tin chi tiết tour');
      }
      setLoadingDetail(false);
    } catch (error) {
      console.error('Error fetching tour detail:', error);
      if (error.response && error.response.status === 401) {
        alert('Lỗi xác thực: Vui lòng đăng nhập lại');
      } else {
        alert('Đã xảy ra lỗi khi tải thông tin chi tiết');
      }
      setLoadingDetail(false);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('vi-VN', options);
  };
  
  // Send email response
  const sendEmailResponse = async () => {
    if (!emailResponse || !selectedTour) return;
    
    try {
      setSending(true);
      console.log(`Sending email response to: ${selectedTour.email}`);
      console.log('Response content:', emailResponse);
      
      // Lấy config headers chứa token
      const config = getAuthConfig();
      
      // API call to send email would go here
      // Example:
      // await axios.post('http://localhost:8080/api/v1/email/send', {
      //   to: selectedTour.email,
      //   subject: `Phản hồi về yêu cầu tour ${selectedTour.destination}`,
      //   content: emailResponse
      // }, config);
      
      // For now, we'll just simulate it with a timeout
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert(`Đã gửi phản hồi thành công tới ${selectedTour.email}!`);
      setEmailResponse('');
      setSending(false);
      setShowDetailModal(false);
    } catch (error) {
      console.error('Error sending email:', error);
      if (error.response && error.response.status === 401) {
        alert('Lỗi xác thực: Vui lòng đăng nhập lại');
      } else {
        alert('Đã xảy ra lỗi khi gửi phản hồi.');
      }
      setSending(false);
    }
  };

  // Delete custom tour request
  const deleteCustomTour = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa yêu cầu tour này?')) {
      try {
        // Lấy config headers chứa token
        const config = getAuthConfig();
        
        // API call to delete would go here
        // await axios.delete(`http://localhost:8080/api/v1/tour/custom/${id}`, config);
        
        // For now, just filter the tour out of the state
        setCustomTours(customTours.filter(tour => tour.id !== id));
        alert('Yêu cầu tour đã được xóa!');
      } catch (error) {
        console.error('Error deleting custom tour:', error);
        if (error.response && error.response.status === 401) {
          alert('Lỗi xác thực: Vui lòng đăng nhập lại');
        } else {
          alert('Đã xảy ra lỗi khi xóa yêu cầu tour.');
        }
      }
    }
  };
  
  // Kiểm tra xem có dữ liệu mẫu để hiển thị khi không có dữ liệu từ API
  const useDemoData = error && error.includes('xác thực') && customTours.length === 0;
  
  // Dữ liệu mẫu để hiển thị khi gặp lỗi xác thực
  const demoTours = [
    {
      id: 1,
      name: "Nguyễn Văn B",
      email: "duyanony03@gmail.com",
      phone: "0912345678",
      destination: "Đà Lạt",
      capacity: 6,
      startDate: "2025-06-20T08:00:00",
      endDate: "2025-06-23T18:00:00",
      durationDays: 4,
      durationNights: 3,
      description: "Gia đình tôi muốn có một tour riêng ở Đà Lạt, bao gồm cả vé tham quan và khách sạn.",
      region: "DOMESTIC",
      adultsCapacity: 4,
      childrenCapacity: 2
    },
    {
      id: 2,
      name: "Nguyễn Văn A",
      email: "nguyenvana@example.com",
      phone: "0912345678",
      destination: "Đà Lạt",
      capacity: 6,
      startDate: "2025-06-20T08:00:00",
      endDate: "2025-06-23T18:00:00",
      durationDays: 4,
      durationNights: 3,
      description: "Gia đình tôi muốn có một tour riêng ở Đà Lạt, bao gồm cả vé tham quan và khách sạn.",
      region: "DOMESTIC",
      adultsCapacity: 4,
      childrenCapacity: 2
    }
  ];
  
  // Sử dụng dữ liệu mẫu nếu cần
  const displayTours = useDemoData ? demoTours : currentTours;

  // Xử lý khi nhấn nút xem chi tiết với dữ liệu mẫu
  const handleDemoViewDetail = (id) => {
    const demoTour = demoTours.find(tour => tour.id === id);
    if (demoTour) {
      setSelectedTour(demoTour);
      setShowDetailModal(true);
    }
  };
  
  return (
    <Container fluid>
      <Card className="mb-4">
        <Card.Header as="h5" className="d-flex justify-content-between align-items-center">
          <span>Quản lý Tour Theo Yêu Cầu</span>
        </Card.Header>
        <Card.Body>
          <Row className="mb-3">
            <Col md={6}>
              <InputGroup>
                <Form.Control 
                  placeholder="Tìm kiếm theo tên, email, SĐT, điểm đến..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Button variant="outline-secondary">
                  <FaSearch />
                </Button>
              </InputGroup>
            </Col>
          </Row>

          {loading ? (
            <div className="text-center my-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2">Đang tải dữ liệu...</p>
            </div>
          ) : error ? (
            <div>
              <div className="alert alert-warning">
                <strong>Lưu ý:</strong> {error}
                {error.includes('xác thực') && (
                  <p className="mt-2 mb-0">
                    Hiển thị dữ liệu mẫu để xem giao diện. Vui lòng đăng nhập để xem dữ liệu thực.
                  </p>
                )}
              </div>
              
              {useDemoData && (
                <Table responsive striped bordered hover>
                  <thead>
                    <tr>
                      <th width="5%">ID</th>
                      <th width="15%">Họ tên</th>
                      <th width="15%">Thông tin liên hệ</th>
                      <th width="15%">Điểm đến</th>
                      <th width="10%">Số người</th>
                      <th width="15%">Thời gian</th>
                      <th width="15%">Trạng thái</th>
                      <th width="10%">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {demoTours.map(tour => (
                      <tr key={tour.id}>
                        <td>{tour.id}</td>
                        <td>{tour.name}</td>
                        <td>
                          <div>{tour.email}</div>
                          <div>{tour.phone}</div>
                        </td>
                        <td>{tour.destination}</td>
                        <td>
                          <div>Tổng: {tour.capacity} người</div>
                          <div>Người lớn: {tour.adultsCapacity}</div>
                          <div>Trẻ em: {tour.childrenCapacity}</div>
                        </td>
                        <td>
                          <div>Từ: {formatDate(tour.startDate)}</div>
                          <div>Đến: {formatDate(tour.endDate)}</div>
                          <div>{tour.durationDays} ngày {tour.durationNights} đêm</div>
                        </td>
                        <td>
                          <Badge bg="warning" text="dark">Chưa xử lý</Badge>
                        </td>
                        <td>
                          <Button 
                            variant="info" 
                            size="sm" 
                            className="me-1"
                            onClick={() => handleDemoViewDetail(tour.id)}
                          >
                            <FaEye /> Xem
                          </Button>
                          <Button 
                            variant="danger" 
                            size="sm"
                            onClick={() => alert('Đây chỉ là dữ liệu mẫu! Vui lòng đăng nhập để thao tác.')}
                          >
                            <FaTrash />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </div>
          ) : (
            <>
              <Table responsive striped bordered hover>
                <thead>
                  <tr>
                    <th width="5%">ID</th>
                    <th width="15%">Họ tên</th>
                    <th width="15%">Thông tin liên hệ</th>
                    <th width="15%">Điểm đến</th>
                    <th width="10%">Số người</th>
                    <th width="15%">Thời gian</th>
                    <th width="15%">Trạng thái</th>
                    <th width="10%">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {currentTours.length > 0 ? (
                    currentTours.map(tour => (
                      <tr key={tour.id}>
                        <td>{tour.id}</td>
                        <td>{tour.name}</td>
                        <td>
                          <div>{tour.email}</div>
                          <div>{tour.phone}</div>
                        </td>
                        <td>{tour.destination}</td>
                        <td>
                          <div>Tổng: {tour.capacity} người</div>
                          <div>Người lớn: {tour.adultsCapacity}</div>
                          <div>Trẻ em: {tour.childrenCapacity}</div>
                        </td>
                        <td>
                          <div>Từ: {formatDate(tour.startDate)}</div>
                          <div>Đến: {formatDate(tour.endDate)}</div>
                          <div>{tour.durationDays} ngày {tour.durationNights} đêm</div>
                        </td>
                        <td>
                          <Badge bg="warning" text="dark">Chưa xử lý</Badge>
                        </td>
                        <td>
                          <Button 
                            variant="info" 
                            size="sm" 
                            className="me-1"
                            onClick={() => viewDetail(tour.id)}
                          >
                            <FaEye /> Xem
                          </Button>
                          <Button 
                            variant="danger" 
                            size="sm"
                            onClick={() => deleteCustomTour(tour.id)}
                          >
                            <FaTrash />
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="text-center">Không có dữ liệu</td>
                    </tr>
                  )}
                </tbody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="d-flex justify-content-center mt-4">
                  <ul className="pagination">
                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                      <Button
                        className="page-link"
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        &laquo;
                      </Button>
                    </li>
                    {pageNumbers.map(number => (
                      <li key={number} className={`page-item ${currentPage === number ? 'active' : ''}`}>
                        <Button
                          className="page-link"
                          onClick={() => setCurrentPage(number)}
                        >
                          {number}
                        </Button>
                      </li>
                    ))}
                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                      <Button
                        className="page-link"
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        &raquo;
                      </Button>
                    </li>
                  </ul>
                </div>
              )}
            </>
          )}
        </Card.Body>
      </Card>

      {/* Tour Detail Modal */}
      <Modal 
        show={showDetailModal} 
        onHide={() => setShowDetailModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Chi tiết tour theo yêu cầu</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {loadingDetail ? (
            <div className="text-center my-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2">Đang tải dữ liệu chi tiết...</p>
            </div>
          ) : selectedTour ? (
            <div>
              <Row className="mb-3">
                <Col md={6}>
                  <h5>Thông tin khách hàng</h5>
                  <p><strong>Họ tên:</strong> {selectedTour.name}</p>
                  <p><strong>Email:</strong> {selectedTour.email}</p>
                  <p><strong>Số điện thoại:</strong> {selectedTour.phone}</p>
                </Col>
                <Col md={6}>
                  <h5>Thông tin chuyến đi</h5>
                  <p><strong>Điểm đến:</strong> {selectedTour.destination}</p>
                  <p><strong>Thời gian:</strong> {formatDate(selectedTour.startDate)} - {formatDate(selectedTour.endDate)}</p>
                  <p><strong>Số ngày/đêm:</strong> {selectedTour.durationDays} ngày {selectedTour.durationNights} đêm</p>
                  <p><strong>Số người:</strong> {selectedTour.capacity} (Người lớn: {selectedTour.adultsCapacity}, Trẻ em: {selectedTour.childrenCapacity})</p>
                </Col>
              </Row>
              
              <h5>Mô tả yêu cầu</h5>
              <Card className="mb-4">
                <Card.Body>
                  <p>{selectedTour.description}</p>
                </Card.Body>
              </Card>

              <h5>Gửi phản hồi qua email</h5>
              <Form.Group className="mb-3">
                <Form.Control
                  as="textarea"
                  rows={5}
                  value={emailResponse}
                  onChange={(e) => setEmailResponse(e.target.value)}
                  placeholder="Nhập nội dung phản hồi..."
                />
                <Form.Text className="text-muted">
                  Email sẽ được gửi tới: {selectedTour.email}
                </Form.Text>
              </Form.Group>
            </div>
          ) : (
            <div className="text-center">
              <p>Không tìm thấy thông tin tour</p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
            Đóng
          </Button>
          <Button 
            variant="primary" 
            onClick={sendEmailResponse} 
            disabled={!emailResponse || sending || !selectedTour}
          >
            {sending ? (
              <>
                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                Đang gửi...
              </>
            ) : (
              <>
                <FaEnvelope className="me-2" /> Gửi phản hồi
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default CustomTourManagement; 