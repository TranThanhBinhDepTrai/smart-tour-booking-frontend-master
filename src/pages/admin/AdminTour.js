import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import './AdminTour.css';

const AdminTour = () => {
  const navigate = useNavigate();
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 10;

  useEffect(() => {
    fetchTours();
  }, [currentPage]);

  const fetchTours = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/tours?page=${currentPage}&size=${pageSize}`);
      console.log('API Response:', response);

      let toursData = [];
      let total = 0;
      let totalPages = 0;

      if (response.data) {
        if (Array.isArray(response.data)) {
          toursData = response.data;
          total = response.data.length;
          totalPages = Math.ceil(total / pageSize);
        } else if (response.data.content && Array.isArray(response.data.content)) {
          toursData = response.data.content;
          total = response.data.totalElements || toursData.length;
          totalPages = response.data.totalPages || Math.ceil(total / pageSize);
        }
      }

      setTours(toursData);
      setTotalElements(total);
      setTotalPages(totalPages);
      setError(null);
    } catch (err) {
      console.error('Error fetching tours:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      setError('Không thể tải danh sách tour');
      setTours([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa tour này không? Hành động này không thể hoàn tác.')) {
      try {
        setLoading(true);
        console.log('Deleting tour with ID:', id);
        
        const response = await api.delete(`/tours/${id}`);
        console.log('Delete response:', response);
        
        setSuccess('Xóa tour thành công!');
        
        // Đợi 1 giây trước khi refresh để đảm bảo server đã xử lý xong
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Refresh danh sách tour
        await fetchTours();
      } catch (err) {
        console.error('Error deleting tour:', err);
        console.error('Error response:', {
          status: err.response?.status,
          statusText: err.response?.statusText,
          data: err.response?.data,
          message: err.message
        });
        
        let errorMessage = 'Không thể xóa tour. Vui lòng thử lại sau.';
        
        if (err.response?.status === 403) {
          errorMessage = 'Bạn không có quyền xóa tour này';
        } else if (err.response?.status === 404) {
          errorMessage = 'Không tìm thấy tour này';
        } else if (err.response?.data?.message) {
          errorMessage = err.response.data.message;
        }
        
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="admin-tour-container p-6">
      <div className="admin-tour-card p-6">
        <div className="admin-tour-header">
          <div>
            <h1 className="admin-tour-title">Quản Lý Tour</h1>
            <p className="admin-tour-subtitle">Danh sách các tour du lịch</p>
          </div>
          <button
            onClick={() => navigate('/admin/tours/create')}
            className="add-tour-button"
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Thêm Tour Mới
          </button>
        </div>

        {error && (
          <div className="error-alert mb-4">
            <p className="error-alert-title">Lỗi</p>
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div className="success-alert mb-4">
            <p className="success-alert-title">Thành công</p>
            <p>{success}</p>
          </div>
        )}

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Đang tải dữ liệu...</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="tour-table">
                <thead>
                  <tr>
                    <th>Mã Tour</th>
                    <th>Tên Tour</th>
                    <th>Điểm đến</th>
                    <th>Thời gian</th>
                    <th>Giá (VNĐ)</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {tours.map((tour) => (
                    <tr key={tour.id}>
                      <td>
                        <span className="tour-code">{tour.code}</span>
                      </td>
                      <td>
                        <div className="tour-info-cell">
                          <img 
                            src={Array.isArray(tour.images) && tour.images.length > 0 
                              ? (typeof tour.images[0] === 'string' 
                                ? tour.images[0] 
                                : tour.images[0]?.url || 'https://via.placeholder.com/80x60?text=Tour')
                              : 'https://via.placeholder.com/80x60?text=Tour'} 
                            alt={tour.title}
                            className="tour-thumbnail"
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/80x60?text=Tour';
                            }}
                          />
                          <div>
                            <div className="tour-info-primary">{tour.title}</div>
                            <div className="tour-info-secondary">{tour.airline}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="tour-info-primary">{tour.destination}</div>
                        <div className="tour-info-secondary">
                          {tour.region === 'DOMESTIC' ? 'Trong nước' : 'Quốc tế'}
                        </div>
                      </td>
                      <td>
                        <div className="tour-info-primary">
                          {format(new Date(tour.startDate), 'dd/MM/yyyy')}
                        </div>
                        <div className="tour-info-secondary">
                          {format(new Date(tour.endDate), 'dd/MM/yyyy')}
                        </div>
                      </td>
                      <td>
                        <div className="tour-info-primary">
                          {tour.priceAdults.toLocaleString('vi-VN')} (Người lớn)
                        </div>
                        <div className="tour-info-secondary">
                          {tour.priceChildren.toLocaleString('vi-VN')} (Trẻ em)
                        </div>
                      </td>
                      <td>
                        <span className={`tour-status ${tour.available ? 'tour-status-active' : 'tour-status-inactive'}`}>
                          {tour.available ? 'Đang hoạt động' : 'Ngừng hoạt động'}
                        </span>
                      </td>
                      <td>
                        <div className="tour-actions">
                          <button
                            onClick={() => navigate(`/admin/tours/edit/${tour.id}`)}
                            className="action-button edit-button"
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Sửa
                          </button>
                          <button
                            onClick={() => handleDelete(tour.id)}
                            className="action-button delete-button"
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pagination">
              <button
                className="pagination-button"
                onClick={() => handlePageChange(0)}
                disabled={currentPage === 0}
              >
                Đầu
              </button>
              <button
                className="pagination-button"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 0}
              >
                Trước
              </button>
              
              <span className="pagination-info">
                Trang {currentPage + 1} / {totalPages} (Tổng: {totalElements} tour)
              </span>

              <button
                className="pagination-button"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages - 1}
              >
                Sau
              </button>
              <button
                className="pagination-button"
                onClick={() => handlePageChange(totalPages - 1)}
                disabled={currentPage >= totalPages - 1}
              >
                Cuối
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminTour; 