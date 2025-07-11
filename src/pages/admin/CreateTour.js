import React, { useState } from 'react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import './CreateTour.css';

const CreateTour = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    capacity: 25,
    priceAdults: 5500000,
    priceChildren: 2500000,
    startDate: '',
    endDate: '',
    destination: '',
    region: 'DOMESTIC',
    category: 'ADVENTURE',
    airline: '',
    code: '',
    available: true,
    itinerary: [],
    images: []
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'itinerary') {
      setFormData(prev => ({ ...prev, itinerary: value.split('\n') }));
    } else {
      const newValue = type === 'checkbox' ? checked : (type === 'number' ? Number(value) : value);
      setFormData(prev => ({
        ...prev,
        [name]: newValue
      }));

      // Date validation
      if (name === 'startDate' || name === 'endDate') {
        const startDate = name === 'startDate' ? newValue : formData.startDate;
        const endDate = name === 'endDate' ? newValue : formData.endDate;
        const now = new Date();
        let errorMsg = '';
        if (startDate && new Date(startDate) < now.setSeconds(0,0)) {
          errorMsg = 'Không được chọn ngày bắt đầu trong quá khứ.';
        } else if (endDate && new Date(endDate) < now.setSeconds(0,0)) {
          errorMsg = 'Không được chọn ngày kết thúc trong quá khứ.';
        } else if (startDate && endDate && new Date(startDate) >= new Date(endDate)) {
          errorMsg = 'Ngày bắt đầu phải trước ngày kết thúc.';
        }
        setError(errorMsg);
      }
    }
  };

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    setError('');

    try {
      // Upload từng ảnh một
      const uploadedUrls = [];
      
      for (const file of files) {
        const formData = new FormData();
        formData.append('images', file);
        
        const response = await api.post('/files/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        console.log('Image upload response:', response);

        // Xử lý response để lấy URL
        if (response.data) {
          if (typeof response.data === 'string') {
            // Nếu response trả về trực tiếp URL dạng string
            uploadedUrls.push(response.data);
          } else if (Array.isArray(response.data)) {
            // Nếu response trả về array
            response.data.forEach(item => {
              if (typeof item === 'string') {
                uploadedUrls.push(item);
              } else if (item && typeof item === 'object') {
                // Nếu item là object, thử lấy các trường phổ biến chứa URL
                const url = item.url || item.path || item.location || item.imageUrl;
                if (url && typeof url === 'string') {
                  uploadedUrls.push(url);
                }
              }
            });
          } else if (typeof response.data === 'object') {
            // Nếu response.data là object
            if (Array.isArray(response.data.data)) {
              // Nếu có mảng trong data
              response.data.data.forEach(item => {
                if (typeof item === 'string') {
                  uploadedUrls.push(item);
                } else if (item && typeof item === 'object') {
                  const url = item.url || item.path || item.location || item.imageUrl;
                  if (url && typeof url === 'string') {
                    uploadedUrls.push(url);
                  }
                }
              });
            } else {
              // Thử lấy URL từ các trường phổ biến của object
              const url = response.data.url || response.data.path || response.data.location || response.data.imageUrl;
              if (url && typeof url === 'string') {
                uploadedUrls.push(url);
              }
            }
          }
        }
      }

      console.log('Extracted image URLs:', uploadedUrls);

      // Cập nhật state với URLs mới
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls]
      }));

      setSuccess(`Đã tải lên ${uploadedUrls.length} ảnh thành công!`);
    } catch (err) {
      console.error('Error uploading images:', err);
      console.error('Error response:', err.response?.data);
      const errorMessage = err.response?.data?.message || 'Lỗi khi tải ảnh lên. Vui lòng thử lại.';
      setError(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Validate dữ liệu
      if (!formData.title?.trim()) throw new Error('Vui lòng nhập tên tour');
      if (!formData.description?.trim()) throw new Error('Vui lòng nhập mô tả tour');
      if (!formData.code?.trim()) throw new Error('Vui lòng nhập mã tour');
      if (!formData.destination?.trim()) throw new Error('Vui lòng nhập điểm đến');
      if (!formData.startDate) throw new Error('Vui lòng chọn ngày bắt đầu');
      if (!formData.endDate) throw new Error('Vui lòng chọn ngày kết thúc');
      const now = new Date();
      if (new Date(formData.startDate) < now.setSeconds(0,0)) {
        throw new Error('Không được chọn ngày bắt đầu trong quá khứ.');
      }
      if (new Date(formData.endDate) < now.setSeconds(0,0)) {
        throw new Error('Không được chọn ngày kết thúc trong quá khứ.');
      }
      if (new Date(formData.startDate) >= new Date(formData.endDate)) {
        throw new Error('Ngày bắt đầu phải trước ngày kết thúc');
      }

      // Chuẩn bị dữ liệu tour
      const tourData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        capacity: Number(formData.capacity),
        priceAdults: Number(formData.priceAdults),
        priceChildren: Number(formData.priceChildren),
        startDate: formData.startDate,
        endDate: formData.endDate,
        destination: formData.destination.trim(),
        region: formData.region || 'DOMESTIC',
        category: formData.category || 'ADVENTURE',
        airline: (formData.airline || '').trim(),
        code: formData.code.trim(),
        available: true,
        itinerary: Array.isArray(formData.itinerary) 
          ? formData.itinerary.filter(item => item && typeof item === 'string' && item.trim())
          : [],
        images: Array.isArray(formData.images) 
          ? formData.images.filter(url => typeof url === 'string' && url.trim())
          : []
      };

      console.log('Creating tour with data:', tourData);

      // Gửi request tạo tour
      const response = await api.post('/tours', tourData);
      console.log('Tour creation response:', response);

      setSuccess('Tour đã được tạo thành công!');
      setTimeout(() => {
        navigate('/admin/tours');
      }, 1500);
    } catch (err) {
      console.error('Error creating tour:', err);
      
      // Xử lý thông báo lỗi
      let errorMessage = err.message;
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.status === 403) {
        errorMessage = 'Bạn không có quyền thực hiện thao tác này';
      } else if (!err.message) {
        errorMessage = 'Có lỗi xảy ra khi tạo tour';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-tour-container">
      <div className="create-tour-card">
        <div className="create-tour-header">
          <div>
            <h1 className="create-tour-title">Tạo Tour Mới</h1>
            <p className="create-tour-subtitle">Điền thông tin chi tiết về tour du lịch mới</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className={loading || uploading ? 'loading' : ''}>
          <div className="form-section">
            <h2 className="section-title">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Thông tin cơ bản
            </h2>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label" htmlFor="code">Mã Tour *</label>
                <input
                  type="text"
                  id="code"
                  name="code"
                  className="form-input"
                  value={formData.code}
                  onChange={handleInputChange}
                  required
                  placeholder="VD: DNHA-2025-003-936"
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="title">Tên Tour *</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  className="form-input"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  placeholder="VD: Tour Đà Nẵng - Hội An"
                />
              </div>
            </div>

            <div className="form-group full-width">
              <label className="form-label" htmlFor="description">Mô tả *</label>
              <textarea
                id="description"
                name="description"
                className="form-textarea"
                rows="3"
                value={formData.description}
                onChange={handleInputChange}
                required
                placeholder="VD: Hành trình 4 ngày khám phá vẻ đẹp của Đà Nẵng và Hội An..."
              ></textarea>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label" htmlFor="destination">Điểm đến *</label>
                <input
                  type="text"
                  id="destination"
                  name="destination"
                  className="form-input"
                  value={formData.destination}
                  onChange={handleInputChange}
                  required
                  placeholder="VD: Đà Nẵng, Hội An"
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="airline">Hãng hàng không</label>
                <input
                  type="text"
                  id="airline"
                  name="airline"
                  className="form-input"
                  value={formData.airline}
                  onChange={handleInputChange}
                  placeholder="VD: Bamboo Airways"
                />
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label" htmlFor="region">Khu vực</label>
                <select
                  id="region"
                  name="region"
                  className="form-input"
                  value={formData.region}
                  onChange={handleInputChange}
                >
                  <option value="DOMESTIC">Trong nước</option>
                  <option value="INTERNATIONAL">Quốc tế</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="category">Loại hình *</label>
                <select
                  id="category"
                  name="category"
                  className="form-input"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                >
                  <option value="ADVENTURE">Phiêu lưu mạo hiểm</option>
                  <option value="CULTURAL">Văn hóa</option>
                  <option value="RELAX">Nghỉ dưỡng</option>
                  <option value="HOLIDAY">Nghỉ hè</option>
                </select>
              </div>
            </div>

            <div className="form-group full-width">
              <label className="form-label" htmlFor="itinerary">Lịch trình</label>
              <textarea
                id="itinerary"
                name="itinerary"
                className="form-textarea"
                rows="4"
                value={formData.itinerary.join('\n')}
                onChange={handleInputChange}
                placeholder="Mỗi ngày một dòng. VD:\nNgày 1: Tắm biển Mỹ Khê...\nNgày 2: Bà Nà Hills..."
              ></textarea>
            </div>
          </div>

          <div className="form-section">
            <h2 className="section-title">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Thời gian và Sức chứa
            </h2>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label" htmlFor="startDate">Ngày bắt đầu *</label>
                <input
                  type="datetime-local"
                  id="startDate"
                  name="startDate"
                  className="form-input"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  required
                  min={new Date().toISOString().slice(0, 16)}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="endDate">Ngày kết thúc *</label>
                <input
                  type="datetime-local"
                  id="endDate"
                  name="endDate"
                  className="form-input"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  required
                  min={formData.startDate ? formData.startDate : new Date().toISOString().slice(0, 16)}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="capacity">Sức chứa *</label>
                <input
                  type="number"
                  id="capacity"
                  name="capacity"
                  className="form-input"
                  value={formData.capacity}
                  onChange={handleInputChange}
                  required
                  min="1"
                  placeholder="VD: 25"
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h2 className="section-title">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Giá vé
            </h2>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label" htmlFor="priceAdults">Giá người lớn *</label>
                <input
                  type="number"
                  id="priceAdults"
                  name="priceAdults"
                  className="form-input"
                  value={formData.priceAdults}
                  onChange={handleInputChange}
                  required
                  min="0"
                  placeholder="VD: 5500000"
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="priceChildren">Giá trẻ em</label>
                <input
                  type="number"
                  id="priceChildren"
                  name="priceChildren"
                  className="form-input"
                  value={formData.priceChildren}
                  onChange={handleInputChange}
                  min="0"
                  placeholder="VD: 2500000"
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h2 className="section-title">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Hình ảnh
            </h2>
            <div className="image-upload-container" onClick={() => !uploading && document.getElementById('images').click()}>
              {uploading ? (
                <div className="image-upload-text">Đang tải lên...</div>
              ) : (
                <>
                  <svg className="image-upload-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                  </svg>
                  <div>
                    <p className="image-upload-text">Click để tải lên hình ảnh</p>
                    <p className="image-upload-subtext">PNG, JPG, JPEG</p>
                  </div>
                </>
              )}
              <input
                type="file"
                id="images"
                name="images"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="hidden"
                style={{ display: 'none' }}
                disabled={uploading}
              />
            </div>

            {formData.images.length > 0 && (
              <div className="image-preview">
                {formData.images.map((imageUrl, index) => (
                  <div key={index} className="image-preview-item">
                    <img src={imageUrl} alt={`Preview ${index + 1}`} />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="remove-image"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {error && <p className="error-message">{error}</p>}
          {success && <p className="success-message">{success}</p>}

          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate('/admin/tours')}
              className="cancel-button"
              disabled={loading || uploading}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="submit-button"
              disabled={loading || uploading}
            >
              {loading ? 'Đang tạo...' : (uploading ? 'Đang tải ảnh...' : 'Tạo Tour')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTour; 