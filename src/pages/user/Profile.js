import React, { useState } from 'react';
import './Profile.css';

const Profile = () => {
  const [userData, setUserData] = useState({
    fullName: 'Nguyễn Văn A',
    email: 'nguyenvana@example.com',
    phone: '0123456789',
    address: 'Hà Nội, Việt Nam'
  });

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(userData);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setUserData(formData);
    setIsEditing(false);
  };

  return (
    <div className="profile-container">
      <div className="profile-box">
        <h2>Thông tin cá nhân</h2>
        {isEditing ? (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="fullName">Họ và tên</label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="phone">Số điện thoại</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="address">Địa chỉ</label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
              />
            </div>
            <div className="button-group">
              <button type="submit" className="save-button">Lưu thay đổi</button>
              <button
                type="button"
                className="cancel-button"
                onClick={() => {
                  setFormData(userData);
                  setIsEditing(false);
                }}
              >
                Hủy
              </button>
            </div>
          </form>
        ) : (
          <div className="profile-info">
            <div className="info-group">
              <label>Họ và tên:</label>
              <p>{userData.fullName}</p>
            </div>
            <div className="info-group">
              <label>Email:</label>
              <p>{userData.email}</p>
            </div>
            <div className="info-group">
              <label>Số điện thoại:</label>
              <p>{userData.phone}</p>
            </div>
            <div className="info-group">
              <label>Địa chỉ:</label>
              <p>{userData.address}</p>
            </div>
            <button
              className="edit-button"
              onClick={() => setIsEditing(true)}
            >
              Chỉnh sửa thông tin
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile; 