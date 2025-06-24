import React, { useState, useEffect } from 'react';
import { tourService } from '../../services/tourService';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { Modal, Button, Dropdown, ButtonGroup } from 'react-bootstrap';
import './AdminTour.css';

const AdminTour = () => {
  const navigate = useNavigate();
  const [tours, setTours] = useState([]);
  const [filteredTours, setFilteredTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 10;

  // Modal state
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedTourDetails, setSelectedTourDetails] = useState(null);

  useEffect(() => {
    fetchTours();
  }, [currentPage]);

  // Filter tours when search term changes
  useEffect(() => {
    if (!tours || tours.length === 0) {
      setFilteredTours([]);
      return;
    }

    if (!searchTerm.trim()) {
      setFilteredTours(tours);
      return;
    }

    const term = searchTerm.trim().toLowerCase();
    const results = tours.filter(tour => 
        (tour.code && tour.code.toLowerCase().includes(term)) ||
        (tour.title && tour.title.toLowerCase().includes(term)) ||
        (tour.destination && tour.destination.toLowerCase().includes(term))
      );
    setFilteredTours(results);
  }, [searchTerm, tours]);

  const fetchTours = async () => {
    try {
      setLoading(true);
      const response = await tourService.getTours({ page: currentPage, size: pageSize });

      if (response && response.data && response.data.content) {
        setTours(response.data.content);
        setFilteredTours(response.data.content);
        setTotalPages(response.data.totalPages);
        setTotalElements(response.data.totalElements);
      }
      setError(null);
    } catch (err) {
      console.error('Error fetching tours:', err);
      setError('Không thể tải danh sách tour');
      setTours([]);
      setFilteredTours([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
    setCurrentPage(newPage);
    }
  };
  
  const handleShowDetails = async (tourId) => {
    try {
      const response = await tourService.getTourById(tourId);
      if (response && response.data) {
        setSelectedTourDetails(response.data);
        setShowDetailModal(true);
      }
    } catch (error) {
      setError('Không thể tải chi tiết tour.');
    }
  };

  const handleCloseDetails = () => {
    setShowDetailModal(false);
    setSelectedTourDetails(null);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa tour này không?')) {
      try {
        await tourService.deleteTour(id);
        setSuccess('Xóa tour thành công!');
        fetchTours(); // Refresh tour list
      } catch (err) {
        setError('Không thể xóa tour. Vui lòng thử lại.');
      }
    }
  };
  
  const handleResetSearch = () => {
    setSearchTerm('');
  };

  // Thêm hàm cập nhật trạng thái
  const handleUpdateStatus = async (tourId, value) => {
    setError(null);
    setSuccess(null);
    try {
      const response = await tourService.updateTourAvailable(tourId, value);
      console.log('Update status response:', response); // Log response để debug
      // Kiểm tra nhiều trường hợp thành công
      if (
        (response && response.statusCode === 200) ||
        (typeof response === 'string' && response.toLowerCase().includes('thành công')) ||
        (response && response.message && response.message.toLowerCase().includes('thành công'))
      ) {
        setSuccess((response && response.message) || (typeof response === 'string' ? response : 'Cập nhật trạng thái thành công!'));
        // Cập nhật lại trạng thái tour trên UI ngay lập tức
        setTours(prevTours => prevTours.map(t => t.id === tourId ? { ...t, available: value } : t));
        setFilteredTours(prevTours => prevTours.map(t => t.id === tourId ? { ...t, available: value } : t));
        setTimeout(() => setSuccess(null), 2000);
      } else {
        setError((response && response.message) || 'Không thể cập nhật trạng thái.');
        setTimeout(() => setError(null), 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Không thể cập nhật trạng thái.');
      setTimeout(() => setError(null), 2000);
    }
  };

  return (
    <div className="admin-tour-container p-6">
      <div className="admin-tour-card p-6">
        {/* Header */}
        <div className="admin-tour-header">
          <div>
            <h1 className="admin-tour-title">Quản Lý Tour</h1>
            <p className="admin-tour-subtitle">Danh sách các tour du lịch</p>
          </div>
          <button
            onClick={() => navigate('/admin/tours/create')}
            className="add-tour-button"
          >
            Thêm Tour Mới
          </button>
        </div>

        {/* Search Bar */}
        <div className="search-filter-section">
          <input
            type="text"
            className="search-input"
            placeholder="Tìm kiếm tour du lịch..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="search-button" onClick={handleResetSearch}>
            X
          </button>
        </div>

        <div className="search-results-info">
            Hiển thị <strong>{filteredTours.length}</strong> trên tổng số <strong>{totalElements}</strong> tour
        </div>

        {loading && <div className="text-center my-4">Đang tải...</div>}
        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        {!loading && !error && (
          <>
            <div className="tour-table-container">
              <table className="tour-table">
                <thead>
                  <tr>
                    <th>Ảnh</th>
                    <th>Mã tour</th>
                    <th>Tên tour</th>
                    <th>Điểm đến</th>
                    <th>Giá người lớn</th>
                    <th>Trạng thái</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTours.map(tour => (
                      <tr key={tour.id}>
                        <td>
                            <img 
                          src={tour.images && tour.images[0] ? tour.images[0].url : 'https://via.placeholder.com/80x60?text=No+Image'} 
                              alt={tour.title}
                              className="tour-thumbnail"
                            />
                        </td>
                      <td>{tour.code}</td>
                      <td>{tour.title}</td>
                      <td>{tour.destination}</td>
                      <td>{new Intl.NumberFormat('vi-VN').format(tour.priceAdults)} VNĐ</td>
                        <td>
                        <Dropdown as={ButtonGroup}>
                          <span className={`status-badge ${tour.available ? 'status-active' : 'status-inactive'}`}
                                style={{marginRight: 8}}>
                            {tour.available ? 'Hoạt động' : 'Ngừng'}
                          </span>
                          <Dropdown.Toggle split variant="light" id={`dropdown-status-${tour.id}`}/>
                          <Dropdown.Menu>
                            <Dropdown.Item onClick={() => handleUpdateStatus(tour.id, true)} style={{color: 'green'}}>
                              Hoạt động
                            </Dropdown.Item>
                            <Dropdown.Item onClick={() => handleUpdateStatus(tour.id, false)} style={{color: 'red'}}>
                              Ngừng
                            </Dropdown.Item>
                          </Dropdown.Menu>
                        </Dropdown>
                        </td>
                        <td>
                        <div className="action-buttons">
                          <button 
                            className="action-button view-button"
                            onClick={() => handleShowDetails(tour.id)}
                          >
                            Xem
                          </button>
                            <button
                            className="action-button edit-button"
                              onClick={() => navigate(`/admin/tours/edit/${tour.id}`)}
                            >
                              Sửa
                            </button>
                            <button
                            className="action-button delete-button"
                              onClick={() => handleDelete(tour.id)}
                            >
                              Xóa
                            </button>
                          </div>
                        </td>
                      </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button onClick={() => handlePageChange(0)} disabled={currentPage === 0}>
                  Đầu
                </button>
                <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 0}>
                  Trước
                </button>
                <span>Trang {currentPage + 1} / {totalPages}</span>
                <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage >= totalPages - 1}>
                  Sau
                </button>
                <button onClick={() => handlePageChange(totalPages - 1)} disabled={currentPage >= totalPages - 1}>
                  Cuối
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Tour Detail Modal */}
      <Modal show={showDetailModal} onHide={handleCloseDetails} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Chi tiết Tour</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedTourDetails ? (
            <div>
              {/* Hiển thị tất cả ảnh */}
              <div style={{display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16}}>
                {selectedTourDetails.images && selectedTourDetails.images.length > 0 ? (
                  selectedTourDetails.images.map((img, idx) => (
                    <img
                      key={img.id || idx}
                      src={img.url}
                      alt={selectedTourDetails.title}
                      style={{width: 120, height: 80, objectFit: 'cover', borderRadius: 6, border: '1px solid #eee'}}
                    />
                  ))
                ) : (
                  <img src="https://via.placeholder.com/120x80?text=No+Image" alt="No" />
                )}
              </div>
              <h4>{selectedTourDetails.title}</h4>
              <p><strong>Mã tour:</strong> {selectedTourDetails.code}</p>
              <p><strong>Điểm đến:</strong> {selectedTourDetails.destination}</p>
              <p><strong>Mô tả:</strong> {selectedTourDetails.description}</p>
              <p><strong>Ngày khởi hành:</strong> {format(new Date(selectedTourDetails.startDate), 'dd/MM/yyyy')}</p>
              <p><strong>Ngày kết thúc:</strong> {format(new Date(selectedTourDetails.endDate), 'dd/MM/yyyy')}</p>
              <p><strong>Giá người lớn:</strong> {new Intl.NumberFormat('vi-VN').format(selectedTourDetails.priceAdults)} VNĐ</p>
              <p><strong>Giá trẻ em:</strong> {new Intl.NumberFormat('vi-VN').format(selectedTourDetails.priceChildren)} VNĐ</p>
              <p><strong>Sức chứa:</strong> {selectedTourDetails.capacity}</p>
              <p><strong>Khu vực:</strong> {selectedTourDetails.region}</p>
              <p><strong>Loại hình:</strong> {selectedTourDetails.category}</p>
              <p><strong>Hãng hàng không:</strong> {selectedTourDetails.airline}</p>
              <p><strong>Trạng thái:</strong> {selectedTourDetails.available ? 'Hoạt động' : 'Ngừng'}</p>
              <p><strong>Số ngày/đêm:</strong> {selectedTourDetails.durationDays} ngày {selectedTourDetails.durationNights} đêm</p>
              <p><strong>Lịch trình:</strong></p>
              <ul>
                {selectedTourDetails.itinerary.map((item, index) => <li key={index}>{item}</li>)}
              </ul>
            </div>
          ) : (
            <p>Đang tải chi tiết tour...</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseDetails}>
            Đóng
          </Button>
          {selectedTourDetails && (
            <Button 
              variant="primary" 
              onClick={() => {
                const link = document.createElement('a');
                link.href = `http://localhost:8080/api/v1/tours/${selectedTourDetails.id}/export/pdf`;
                link.target = '_blank';
                link.rel = 'noopener noreferrer';
                link.click();
              }}
            >
              Tải PDF
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AdminTour; 