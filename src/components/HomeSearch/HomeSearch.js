import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './HomeSearch.css';
import axios from "axios";

const HomeSearch = ({ alwaysCompact }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [destination, setDestination] = useState('');
  const [dates, setDates] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSearchClick = () => {
    if (!alwaysCompact && !isExpanded) {
      setIsExpanded(true);
    }
  };
  
  const handleFormSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.append('keyword', searchQuery);
    if (destination) params.append('location', destination);
    // Note: This simple date string might need parsing on the tours page
    if (dates) params.append('dates', dates); 

    navigate(`/tours?${params.toString()}`);
  };

  const handleChange = async (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (value.length > 0) {
      setLoading(true);
      try {
        const res = await axios.post("http://localhost:8080/api/v1/tours/search", {
          keyword: value
        });
        console.log("Suggestions:", res.data.data || res.data || []);
        setSuggestions((res.data.data || res.data || []).slice(0, 5));
      } catch (error) {
        setSuggestions([]);
      }
      setLoading(false);
    } else {
      setSuggestions([]);
    }
  };

  // Nếu alwaysCompact, luôn hiển thị form nhỏ gọn
  if (alwaysCompact) {
    return (
      <div style={{ position: "relative" }}>
        <form onSubmit={handleFormSubmit} className="search-form-container" style={{margin: 0}}>
          <div className="main-search-input-wrapper">
            <input
              type="text"
              placeholder="Bạn muốn đi đâu?"
              className="main-search-input"
              value={searchQuery}
              onChange={handleChange}
            />
            <button type="submit" className="search-btn-simple">
              Tìm kiếm <i className="fas fa-search"></i>
            </button>
          </div>
        </form>
        {loading && <div>Đang tải...</div>}
        {suggestions.length > 0 && (
          <ul
            style={{
              position: "absolute",
              top: "100px", // Đẩy dropdown xuống dưới input
              left: 0,
              width: "100%",
              background: "#fff",
              border: "1px solid #ccc",
              zIndex: 99999,
              listStyle: "none",
              margin: 0,
              padding: 0
            }}
          >
            {suggestions.map((tour, idx) => (
              <li
                key={tour.id || idx}
                style={{ display: "flex", alignItems: "center", padding: "10px", cursor: "pointer", color: "#333" }}
                onClick={() => {
                  console.log('Đi tới chi tiết tour:', tour.id);
                  navigate(`/tours/${tour.id}`);
                }}
              >
                {tour.images && tour.images.length > 0 && (
                  <img
                    src={tour.images[0].url}
                    alt={tour.title}
                    style={{ width: 40, height: 40, marginRight: 10, borderRadius: 4, objectFit: "cover" }}
                  />
                )}
                <div>
                  <div style={{ fontWeight: "bold" }}>{tour.title}</div>
                  <div style={{ fontSize: 12, color: "#888" }}>{tour.description?.slice(0, 40)}...</div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  return (
    <div className={`hero-section ${isExpanded ? 'expanded' : ''}`} onClick={handleSearchClick}>
      <div className="hero-content">
        <h1>Khám phá những điểm đến tuyệt vời</h1>
        <p>Tìm kiếm và đặt tour du lịch dễ dàng</p>
        
        <form onSubmit={handleFormSubmit} className="search-form-container">
          <div className="main-search-input-wrapper" style={{position: "relative", zIndex: 20}}>
            <i className="fas fa-search search-icon"></i>
            <input
              type="text"
              placeholder="Bạn muốn đi đâu?"
              className="main-search-input"
              value={searchQuery}
              onChange={handleChange}
              onFocus={() => setIsExpanded(true)}
            />
            {!isExpanded && <button type="submit" className="search-btn-simple">Tìm kiếm</button>}
            {loading && <div style={{color: "#333", background: "#fff"}}>Đang tải...</div>}
            <ul className="suggestions-dropdown">
              {suggestions.map((tour, idx) => (
                <li key={tour.id || idx} style={{ padding: "10px", cursor: "pointer" }}>
                  <div style={{fontWeight: "bold"}}>{tour.title}</div>
                  <div style={{fontSize: 13, color: "#888"}}>- {tour.description?.slice(0, 40)}...</div>
                </li>
              ))}
            </ul>
          </div>

          {isExpanded && (
            <div className="expanded-search-options">
              <div className="options-tabs">
                <button type="button" className="tab-btn active">
                  <i className="fas fa-box-open"></i> Tour trọn gói
                </button>
                <button type="button" className="tab-btn">
                  <i className="fas fa-ticket-alt"></i> Combo
                </button>
              </div>
              <div className="options-fields">
                <div className="field-group">
                  <label>Bạn muốn đi đâu (*)</label>
                  <select value={destination} onChange={(e) => setDestination(e.target.value)}>
                    <option value="">Chọn điểm đến</option>
                    <option value="DOMESTIC">Trong nước</option>
                    <option value="INTERNATIONAL">Quốc tế</option>
                    <option value="Hội An">Hội An</option>
                    <option value="Đà Nẵng">Đà Nẵng</option>
                  </select>
                </div>
                <div className="field-group">
                  <label>Ngày khởi hành</label>
                  <input 
                    type="text" 
                    placeholder="Chọn ngày" 
                    value={dates}
                    onChange={(e) => setDates(e.target.value)}
                  />
                </div>
                <button type="submit" className="search-btn-expanded">
                  <i className="fas fa-search"></i> Tìm kiếm
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default HomeSearch; 