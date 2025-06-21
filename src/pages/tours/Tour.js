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
    minPrice: "",
    maxPrice: ""
  });

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

  // Debounced auto-search on keyword change
  useEffect(() => {
    const handler = setTimeout(() => {
      // We only want to trigger auto-search when the user is typing in the main search box.
      // We check if the keyword is not empty to fire the search.
      if (searchParams.keyword) {
        onSearch(searchParams);
      }
    }, 500); // 500ms delay

    return () => {
      clearTimeout(handler);
    };
  }, [searchParams.keyword, onSearch]); // Rerun when keyword changes

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(searchParams);
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

        <div className="search-group">
          <label>Giá từ</label>
          <input
            type="number"
            name="minPrice"
            placeholder="VNĐ"
            value={searchParams.minPrice}
            onChange={handleChange}
          />
        </div>
        
        <div className="search-group">
          <label>Đến giá</label>
          <input
            type="number"
            name="maxPrice"
            placeholder="VNĐ"
            value={searchParams.maxPrice}
            onChange={handleChange}
          />
        </div>

        <button type="submit" className="search-button">
          Lọc kết quả
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
    // Add other params like dates if needed

    if (keyword || location) {
      const paramsFromUrl = {
        keyword: keyword || "",
        location: location || "",
        startDate: "", // You can add logic for dates if passed
        endDate: "",
        minPrice: "",
        maxPrice: ""
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
        const formattedParams = {};
        if (searchParams.keyword && searchParams.keyword.trim()) {
          formattedParams.keyword = searchParams.keyword.trim();
        }
        if (searchParams.location) {
          formattedParams.location = searchParams.location;
        }
        if (searchParams.startDate) {
          formattedParams.startDate = searchParams.startDate;
        }
        if (searchParams.endDate) {
          formattedParams.endDate = searchParams.endDate;
        }
        if (searchParams.minPrice) {
          formattedParams.minPrice = Number(searchParams.minPrice);
        }
        if (searchParams.maxPrice) {
          formattedParams.maxPrice = Number(searchParams.maxPrice);
        }
        
        console.log('Formatted search params:', formattedParams);
        
        response = await api.post('/tours/search', formattedParams);
        console.log('Search response:', response.data);
        
        // Handle array response from search
        if (Array.isArray(response.data)) {
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
        
        console.log('Fetching tours with params:', params.toString());
        response = await api.get(`/tours?${params.toString()}`);
        
        console.log('Get all tours response:', response.data);
        // Handle paginated response from get all
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
      console.error("API Error:", err);
      if (err.response) {
        console.error("Response data:", err.response.data);
        console.error("Response status:", err.response.status);
        console.error("Response headers:", err.response.headers);
      }
      const errorMessage = err.response?.data?.message || err.message || 'Không thể tải danh sách tour';
      setError(errorMessage);
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
    setSearchParams(newSearchParams);
    
    fetchTours(params);
  }, [setSearchParams]);

  const handleClearSearch = () => {
    setIsSearching(false);
    setPage(0); // Reset page to 0
    setSearchParams({}); // Clear URL params
    // The useEffect listening to `page` will refetch all tours.
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
      <SearchForm onSearch={handleSearch} initialValues={initialValues} />
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
                <h2>{tour.title}</h2>
                <p className="description">{tour.description}</p>
                <p><strong>Điểm đến:</strong> {tour.destination}</p>
                <p><strong>Giá người lớn:</strong> {tour.priceAdults ? tour.priceAdults.toLocaleString() : 'N/A'} VNĐ</p>
                <p><strong>Giá trẻ em:</strong> {tour.priceChildren ? tour.priceChildren.toLocaleString() : 'N/A'} VNĐ</p>
                <p><strong>Ngày đi:</strong> {tour.startDate ? new Date(tour.startDate).toLocaleDateString("vi-VN") : 'N/A'}</p>
                <p><strong>Ngày về:</strong> {tour.endDate ? new Date(tour.endDate).toLocaleDateString("vi-VN") : 'N/A'}</p>
                <p><strong>Hãng bay:</strong> {tour.airline || 'N/A'}</p>
                <p><strong>Mã tour:</strong> {tour.code}</p>
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
    </div>
  );
};

export default Tour;