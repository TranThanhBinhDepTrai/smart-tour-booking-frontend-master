import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './HomeSearch.css';

const HomeSearch = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [destination, setDestination] = useState('');
  const [dates, setDates] = useState('');
  const navigate = useNavigate();

  const handleSearchClick = () => {
    if (!isExpanded) {
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

  return (
    <div className={`hero-section ${isExpanded ? 'expanded' : ''}`} onClick={handleSearchClick}>
      <div className="hero-content">
        <h1>Khám phá những điểm đến tuyệt vời</h1>
        <p>Tìm kiếm và đặt tour du lịch dễ dàng</p>
        
        <form onSubmit={handleFormSubmit} className="search-form-container">
          <div className="main-search-input-wrapper">
            <i className="fas fa-search search-icon"></i>
            <input
              type="text"
              placeholder="Bạn muốn đi đâu?"
              className="main-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsExpanded(true)}
            />
            {!isExpanded && <button type="submit" className="search-btn-simple">Tìm kiếm</button>}
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