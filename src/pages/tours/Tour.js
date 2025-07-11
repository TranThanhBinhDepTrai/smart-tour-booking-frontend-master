import React, { useEffect, useState, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import "./Tour.css";
import api from "../../services/api";

const SearchForm = ({ onSearch, initialValues }) => {
  const [searchParams, setSearchParams] = useState({
    keyword: "",
    startDate: "",
    endDate: "",
    location: "",
    minPrice: 0,
    maxPrice: 100000000,
    minRating: 0,
    maxRating: 5
  });
  const [priceRange, setPriceRange] = useState([0, 100000000]);
  const [ratingRange, setRatingRange] = useState([0, 5]);
  const [enablePrice, setEnablePrice] = useState(true);

  // Sync form state with initial values from URL
  useEffect(() => {
    if (initialValues) {
      setSearchParams(prev => ({
        ...prev,
        keyword: initialValues.keyword || "",
        location: initialValues.location || ""
      }));
    }
  }, [initialValues]);

  // Hàm buildSearchParams để chỉ gửi filter thực sự được chọn
  const buildSearchParams = () => {
    let params = { keyword: searchParams.keyword };
    if (searchParams.location) params.location = searchParams.location;
    if (searchParams.startDate) params.startDate = searchParams.startDate;
    if (searchParams.endDate) params.endDate = searchParams.endDate;
    if (enablePrice && (priceRange[0] !== 0 || priceRange[1] !== 100000000)) {
      params.minPrice = priceRange[0];
      params.maxPrice = priceRange[1];
    }
    if (!(ratingRange[0] === 0 && ratingRange[1] === 5)) {
      params.minRating = ratingRange[0];
      params.maxRating = ratingRange[1];
    }
    return params;
  };

  // Debounced auto-search on keyword change
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchParams.keyword) {
        onSearch(buildSearchParams());
      }
    }, 500); // 500ms delay

    return () => {
      clearTimeout(handler);
    };
  }, [searchParams.keyword, onSearch]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    if (name === 'minPrice' || name === 'maxPrice') {
      const newRange = name === 'minPrice' ? [Number(value), priceRange[1]] : [priceRange[0], Number(value)];
      setPriceRange(newRange);
      setSearchParams(prev => ({ ...prev, minPrice: newRange[0], maxPrice: newRange[1] }));
    } else if (name === 'rating') {
      // value dạng "1-2", "2-3"...
      const [min, max] = value.split('-').map(Number);
      setRatingRange([min, max]);
      setSearchParams(prev => ({ ...prev, minRating: min, maxRating: max }));
      if (min === 0 && max === 5) {
        // Nếu chọn Tất cả, reset lại filter giá
        setPriceRange([0, 100000000]);
        setSearchParams(prev => ({ ...prev, minPrice: 0, maxPrice: 100000000 }));
      }
    } else {
      setSearchParams(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSliderChange = (e) => {
    const [min, max] = e.target.value.split(',').map(Number);
    setPriceRange([min, max]);
    setSearchParams(prev => ({ ...prev, minPrice: min, maxPrice: max }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(buildSearchParams());
  };

  return (
    <form onSubmit={handleSubmit} className="search-form-redesigned">
      <div className="main-search-bar">
        <input
          type="text"
          name="keyword"
          placeholder="Tìm kiếm theo tên tour, điểm đến, hoặc bất cứ thứ gì bạn muốn..."
          value={searchParams.keyword}
          onChange={handleChange}
          className="main-search-input"
        />
      </div>
      
      <div className="filter-bar">
        <div className="search-group">
          <label>Khu vực</label>
          <select 
            name="location" 
            value={searchParams.location}
            onChange={handleChange}
          >
            <option value="">Tất cả</option>
            <option value="DOMESTIC">Trong nước</option>
            <option value="INTERNATIONAL">Quốc tế</option>
          </select>
        </div>

        <div className="search-group">
          <label>Từ ngày</label>
          <input
            type="date"
            name="startDate"
            value={searchParams.startDate}
            onChange={handleChange}
          />
        </div>
        
        <div className="search-group">
          <label>Đến ngày</label>
          <input
            type="date"
            name="endDate"
            value={searchParams.endDate}
            onChange={handleChange}
          />
        </div>

        <div className="search-group" style={{width: '100%'}}>
          <label>Khoảng giá (VNĐ)
            <button type="button" style={{marginLeft: 10, fontSize: 13, padding: '2px 10px', borderRadius: 8, border: '1px solid #0074bc', background: enablePrice ? '#0074bc' : '#eee', color: enablePrice ? '#fff' : '#333', cursor: 'pointer'}} onClick={() => setEnablePrice(v => !v)}>
              {enablePrice ? 'Tắt' : 'Bật'}
            </button>
          </label>
          <div style={{display: enablePrice ? 'flex' : 'none', alignItems: 'center', gap: 8}}>
            <input
              type="number"
              name="minPrice"
              min={0}
              max={priceRange[1]}
              value={priceRange[0]}
              onChange={handleChange}
              style={{width: 90}}
              disabled={!enablePrice}
            />
            <span>-</span>
            <input
              type="number"
              name="maxPrice"
              min={priceRange[0]}
              max={100000000}
              value={priceRange[1]}
              onChange={handleChange}
              style={{width: 90}}
              disabled={!enablePrice}
            />
          </div>
          <input
            type="range"
            min={0}
            max={100000000}
            step={100000}
            value={priceRange[0]}
            onChange={e => handleChange({ target: { name: 'minPrice', value: e.target.value } })}
            style={{width: '100%', marginTop: 8, display: enablePrice ? 'block' : 'none'}}
            disabled={!enablePrice}
          />
          <input
            type="range"
            min={0}
            max={100000000}
            step={100000}
            value={priceRange[1]}
            onChange={e => handleChange({ target: { name: 'maxPrice', value: e.target.value } })}
            style={{width: '100%', marginTop: 2, display: enablePrice ? 'block' : 'none'}}
            disabled={!enablePrice}
          />
          <div style={{fontSize: 13, color: '#888', marginTop: 2, display: enablePrice ? 'block' : 'none'}}>
            {priceRange[0].toLocaleString()} VNĐ - {priceRange[1].toLocaleString()} VNĐ
          </div>
        </div>

        <div className="search-group">
          <label>Đánh giá</label>
          <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
            <div className="radio-row">
              <input type="radio" name="rating" value="1-2" checked={ratingRange[0] === 1 && ratingRange[1] === 2} onChange={handleChange} />
              <span style={{color: '#1976d2', fontWeight: 500}}>1-2 sao</span>
            </div>
            <div className="radio-row">
              <input type="radio" name="rating" value="2-3" checked={ratingRange[0] === 2 && ratingRange[1] === 3} onChange={handleChange} />
              <span style={{color: '#1976d2', fontWeight: 500}}>2-3 sao</span>
            </div>
            <div className="radio-row">
              <input type="radio" name="rating" value="3-4" checked={ratingRange[0] === 3 && ratingRange[1] === 4} onChange={handleChange} />
              <span style={{color: '#1976d2', fontWeight: 500}}>3-4 sao</span>
            </div>
            <div className="radio-row">
              <input type="radio" name="rating" value="4-5" checked={ratingRange[0] === 4 && ratingRange[1] === 5} onChange={handleChange} />
              <span style={{color: '#1976d2', fontWeight: 500}}>4-5 sao</span>
            </div>
            <div className="radio-row">
              <input type="radio" name="rating" value="0-5" checked={ratingRange[0] === 0 && ratingRange[1] === 5} onChange={handleChange} />
              <span style={{color: '#1976d2', fontWeight: 500}}>Tất cả</span>
            </div>
          </div>
        </div>

        <button type="submit" className="search-button">
          <i className="fas fa-search"></i>
          Tìm kiếm
        </button>
      </div>
    </form>
  );
};

const ImageCarousel = ({ images }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const nextImage = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const goToImage = (index) => {
    setCurrentImageIndex(index);
  };

  return (
    <div className="carousel">
      <div className="carousel-container">
        {images.map((image, index) => (
          <img
            key={image.id}
            src={image.url}
            alt={`Tour image ${index + 1}`}
            className={`carousel-image ${index === currentImageIndex ? 'active' : ''}`}
          />
        ))}
        <button className="carousel-button prev" onClick={prevImage}>❮</button>
        <button className="carousel-button next" onClick={nextImage}>❯</button>
      </div>
      <div className="carousel-dots">
        {images.map((_, index) => (
          <span
            key={index}
            className={`dot ${index === currentImageIndex ? 'active' : ''}`}
            onClick={() => goToImage(index)}
          />
        ))}
      </div>
    </div>
  );
};

const Tour = () => {
  const [tours, setTours] = useState([]);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState(null);
  const [searchParamsFromUrl, setSearchParams] = useSearchParams();

  useEffect(() => {
    // Check for search params from URL on initial load
    const keyword = searchParamsFromUrl.get('keyword');
    const location = searchParamsFromUrl.get('location');
    const region = searchParamsFromUrl.get('region');
    // Nếu có region trên URL, ưu tiên lọc theo khu vực
    let effectiveLocation = location;
    if (region === 'DOMESTIC') effectiveLocation = 'DOMESTIC';
    if (region === 'INTERNATIONAL') effectiveLocation = 'INTERNATIONAL';

    if (keyword || effectiveLocation) {
      const paramsFromUrl = {
        keyword: keyword || "",
        location: effectiveLocation || "",
        startDate: "", // You can add logic for dates if passed
        endDate: "",
        minPrice: "",
        maxPrice: "",
        minRating: "",
        maxRating: ""
      };
      handleSearch(paramsFromUrl);
    } else {
      fetchTours();
    }
  }, [page, size]); // Depend on page and size for pagination

  const fetchTours = async (searchParams = null) => {
    try {
      let response;
      if (searchParams && Object.values(searchParams).some(v => v !== "")) {
        setIsSearching(true);
        // Format params to match backend expectations
        const formattedParams = {
          ...searchParams,
          page: page,
          size: size
        };
        // Xóa các trường undefined
        Object.keys(formattedParams).forEach(key => (formattedParams[key] === undefined) && delete formattedParams[key]);
        response = await api.post('/tours/search', formattedParams);
        // Xử lý kết quả phân trang
        if (response.data && response.data.content) {
          setTours(response.data.content);
          setTotalElements(response.data.totalElements);
        } else if (Array.isArray(response.data)) {
          setTours(response.data);
          setTotalElements(response.data.length);
        } else {
          setTours([]);
          setTotalElements(0);
        }
        setError(null);
      } else {
        setIsSearching(false);
        // Call get all tours API with proper endpoint and parameters
        const params = new URLSearchParams({
          page: page.toString(),
          size: size.toString()
        });
        response = await api.get(`/tours?${params.toString()}`);
        if (response.data && response.data.content) {
          setTours(response.data.content);
          setTotalElements(response.data.totalElements);
        } else {
          setTours([]);
          setTotalElements(0);
        }
        setError(null);
      }
    } catch (err) {
      setError(err.message || 'Không thể tải danh sách tour');
      setTours([]);
      setTotalElements(0);
    }
  };

  const handleSearch = useCallback((params) => {
    setPage(0);
    // Update URL search params for bookmarking/sharing
    const newSearchParams = new URLSearchParams();
    if (params.keyword) newSearchParams.set('keyword', params.keyword);
    if (params.location) newSearchParams.set('location', params.location);
    if (params.startDate) newSearchParams.set('startDate', params.startDate);
    if (params.endDate) newSearchParams.set('endDate', params.endDate);
    if (params.minPrice !== undefined && params.minPrice !== 0) newSearchParams.set('minPrice', params.minPrice.toString());
    if (params.maxPrice !== undefined && params.maxPrice !== 100000000) newSearchParams.set('maxPrice', params.maxPrice.toString());
    if (params.minRating !== undefined && params.minRating !== 0) newSearchParams.set('minRating', params.minRating.toString());
    if (params.maxRating !== undefined && params.maxRating !== 5) newSearchParams.set('maxRating', params.maxRating.toString());
    setSearchParams(newSearchParams);
    fetchTours(params);
  }, [setSearchParams]);

  const handleClearSearch = () => {
    setIsSearching(false);
    setPage(0); // Reset page to 0
    setSearchParams({}); // Clear URL params
    fetchTours(); // Gọi lại API lấy tất cả tour
  };

  const initialValues = {
    keyword: searchParamsFromUrl.get('keyword') || '',
    location: searchParamsFromUrl.get('location') || '',
  };

  return (
    <div className="tour-list-container">
      <div className="tour-header">
        <h1>Danh sách tour ({totalElements} tour)</h1>
        {isSearching && (
          <button onClick={handleClearSearch} className="clear-search-button">
            ← Quay lại danh sách
          </button>
        )}
      </div>
      <div className="tour-main-layout">
        <aside className="tour-sidebar">
          <SearchForm onSearch={handleSearch} initialValues={initialValues} />
        </aside>
        <section className="tour-list-section">
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          <div className="tour-list">
            {Array.isArray(tours) && tours.length > 0 ? (
              tours.map(tour => (
                <div className="tour-card" key={tour.id}>
                  <div className="tour-images">
                    {tour.images && tour.images.length > 0 && (
                      <ImageCarousel images={tour.images} />
                    )}
                  </div>
                  <div className="tour-info">
                    <div className="tour-info-content">
                      <h2>{tour.title}</h2>
                      <p className="description">{tour.description}</p>
                      <p><strong>Điểm đến:</strong> {tour.destination}</p>
                      <p><strong>Giá người lớn:</strong> <span className="price">{tour.priceAdults ? tour.priceAdults.toLocaleString() : 'N/A'} VNĐ</span></p>
                      <p><strong>Giá trẻ em:</strong> {tour.priceChildren ? tour.priceChildren.toLocaleString() : 'N/A'} VNĐ</p>
                      <p><strong>Ngày đi:</strong> {tour.startDate ? new Date(tour.startDate).toLocaleDateString("vi-VN") : 'N/A'}</p>
                      <p><strong>Ngày về:</strong> {tour.endDate ? new Date(tour.endDate).toLocaleDateString("vi-VN") : 'N/A'}</p>
                      <p><strong>Hãng bay:</strong> {tour.airline || 'N/A'}</p>
                      <p><strong>Mã tour:</strong> {tour.code}</p>
                    </div>
                    <div className="tour-actions">
                      <Link to={`/tours/${tour.id}`} className="view-details-button">
                        Xem chi tiết
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-tours-message">
                {isSearching ? "Không tìm thấy tour nào phù hợp" : "Không có tour nào"}
              </div>
            )}
          </div>
          {!isSearching && totalElements > size && (
            <div className="pagination">
              <button 
                onClick={() => setPage(prev => Math.max(0, prev - 1))}
                disabled={page === 0}
              >
                Trang trước
              </button>
              <span>Trang {page + 1}</span>
              <button 
                onClick={() => setPage(prev => prev + 1)}
                disabled={page >= Math.ceil(totalElements / size) - 1}
              >
                Trang sau
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Tour;