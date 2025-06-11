import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import './AdminTour.css';

const Roles = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 10;

  useEffect(() => {
    fetchRoles();
  }, [currentPage]);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/roles?page=${currentPage}&size=${pageSize}`);
      console.log('API Response:', response);

      let rolesData = [];
      let total = 0;
      let totalPages = 0;

      if (response.data) {
        if (Array.isArray(response.data)) {
          rolesData = response.data;
          total = response.data.length;
          totalPages = Math.ceil(total / pageSize);
        } else if (response.data.content && Array.isArray(response.data.content)) {
          rolesData = response.data.content;
          total = response.data.totalElements || rolesData.length;
          totalPages = response.data.totalPages || Math.ceil(total / pageSize);
        }
      }

      setRoles(rolesData);
      setTotalElements(total);
      setTotalPages(totalPages);
      setError(null);
    } catch (err) {
      console.error('Error fetching roles:', err);
      setError('Không thể tải danh sách vai trò');
      setRoles([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  return (
    <div className="admin-tour-container p-6">
      <div className="admin-tour-card p-6">
        <div className="admin-tour-header">
          <div>
            <h1 className="admin-tour-title">Quản Lý Vai Trò</h1>
            <p className="admin-tour-subtitle">Danh sách các vai trò trong hệ thống</p>
          </div>
          <button className="add-tour-button">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Thêm Vai Trò Mới
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
                    <th>ID</th>
                    <th>Tên vai trò</th>
                    <th>Mô tả</th>
                    <th>Số quyền</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {roles.map((role) => (
                    <tr key={role.id}>
                      <td>{role.id}</td>
                      <td>{role.name}</td>
                      <td>{role.description}</td>
                      <td>{role.permissions?.length || 0}</td>
                      <td>
                        <div className="tour-actions">
                          <button className="action-button edit-button">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Sửa
                          </button>
                          <button className="action-button delete-button">
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
                Trang {currentPage + 1} / {totalPages} (Tổng: {totalElements} vai trò)
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

export default Roles; 