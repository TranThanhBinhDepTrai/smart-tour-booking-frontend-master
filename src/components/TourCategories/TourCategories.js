import React from 'react';
import { useNavigate } from 'react-router-dom';
import './TourCategories.css';

const TourCategories = () => {
    const navigate = useNavigate();

    const categories = [
        { id: 'ADVENTURE', name: 'Phiêu Lưu Mạo Hiểm', icon: 'fas fa-hiking' },
        { id: 'CULTURAL', name: 'Văn Hóa', icon: 'fas fa-landmark' },
        { id: 'HOLIDAY', name: 'Nghỉ Dưỡng', icon: 'fas fa-umbrella-beach' },
        { id: 'SEASONAL', name: 'Mùa hè', icon: 'fas fa-leaf' }
    ];

    const handleCategoryClick = (categoryId) => {
        navigate(`/tours/category/${categoryId}`);
    };

    return (
        <div className="tour-categories-container">
            <div className="category-buttons">
                {categories.map((category) => (
                    <div
                        key={category.id}
                        className="category-card"
                        onClick={() => handleCategoryClick(category.id)}
                    >
                        <div className="category-icon">
                            <i className={category.icon}></i>
                        </div>
                        <h4>{category.name}</h4>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TourCategories; 