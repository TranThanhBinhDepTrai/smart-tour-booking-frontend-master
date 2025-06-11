import React, { useState, useEffect } from 'react';
import { Container, Card, Row, Col, Button, Form, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import axios from 'axios';
import './Profile.css';

const Profile = () => {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/account');
        console.log('Profile API Response:', response.data);
        
        // Response data is already unwrapped by axios interceptor
        if (response.data) {
          const profileData = response.data;
          setUserProfile(profileData);
          setFormData({
            fullName: profileData.fullName || '',
            email: profileData.email || '',
            phone: profileData.phone || '',
            address: profileData.address || '',
            birthDate: profileData.birthDate || '',
            gender: profileData.gender || ''
          });
          setLoading(false);
        } else {
          throw new Error('Không thể tải thông tin tài khoản');
        }
      } catch (err) {
        console.error('Profile fetch error:', err);
        setError('Không thể tải thông tin tài khoản');
        if (err.response?.status === 401) {
          navigate('/login');
        }
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Kiểm tra các trường bắt buộc
      if (!formData.password) {
        setError('Vui lòng nhập mật khẩu để xác thực');
        return;
      }

      // Kiểm tra định dạng số điện thoại
      if (formData.phone && !/^\d{10,12}$/.test(formData.phone)) {
        setError('Số điện thoại không hợp lệ');
        return;
      }

      // Kiểm tra ngày sinh
      if (formData.birthDate) {
        const birthDate = new Date(formData.birthDate);
        const today = new Date();
        if (birthDate > today) {
          setError('Ngày sinh không thể là ngày trong tương lai');
          return;
        }
      }

      // Tạo request body giống hệt như trong Postman
      const requestBody = {
        id: userProfile.id,
        fullName: formData.fullName || userProfile.fullName,
        password: formData.password,
        address: formData.address || userProfile.address,
        phone: formData.phone || userProfile.phone,
        birthDate: formData.birthDate || userProfile.birthDate,
        gender: formData.gender || userProfile.gender
      };
      
      console.log('Sending request with body:', requestBody);

      // Sử dụng axios trực tiếp với full URL để debug
      const response = await axios.put('http://localhost:8080/api/v1/users', requestBody, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      console.log('Update Profile Response:', response);

      if (response.data) {
        // Cập nhật state với dữ liệu mới
        const { password, ...updatedProfile } = response.data.data || response.data;
        setUserProfile(prev => ({
          ...prev,
          ...updatedProfile
        }));
        setIsEditing(false);
        alert('Cập nhật thông tin thành công!');
        
        // Reset form data
        setFormData({
          ...formData,
          password: ''
        });
      } else {
        throw new Error('Không thể cập nhật thông tin tài khoản');
      }
    } catch (err) {
      console.error('Update profile error:', err);
      if (err.response) {
        console.error('Error response:', {
          status: err.response.status,
          data: err.response.data,
          headers: err.response.headers
        });
      }
      const errorMessage = err.response?.data?.message || err.message || 'Không thể cập nhật thông tin tài khoản';
      setError(errorMessage);
      alert('Lỗi: ' + errorMessage);
      
      if (err.response?.status === 401 || err.response?.status === 403) {
        navigate('/login');
      }
    }
  };

  if (loading) {
    return <div className="text-center mt-5">Đang tải...</div>;
  }

  if (error) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  if (!userProfile) {
    return (
      <Container className="mt-4">
        <Alert variant="warning">Không tìm thấy thông tin tài khoản</Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <Card>
        <Card.Header className="bg-primary text-white">
          <h4 className="mb-0">Thông tin tài khoản</h4>
        </Card.Header>
        <Card.Body>
          {isEditing ? (
            <Form onSubmit={handleSubmit}>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Họ và tên</Form.Label>
                    <Form.Control
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      value={formData.email}
                      disabled
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Số điện thoại</Form.Label>
                    <Form.Control
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Địa chỉ</Form.Label>
                    <Form.Control
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Ngày sinh</Form.Label>
                    <Form.Control
                      type="date"
                      name="birthDate"
                      value={formData.birthDate}
                      onChange={handleChange}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Giới tính</Form.Label>
                    <Form.Select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                    >
                      <option value="">Chọn giới tính</option>
                      <option value="MALE">Nam</option>
                      <option value="FEMALE">Nữ</option>
                      <option value="OTHER">Khác</option>
                    </Form.Select>
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Mật khẩu hiện tại (để xác thực)</Form.Label>
                    <Form.Control
                      type="password"
                      name="password"
                      onChange={handleChange}
                      required
                      placeholder="Nhập mật khẩu hiện tại để xác thực"
                    />
                  </Form.Group>
                </Col>
              </Row>
              <div className="d-flex justify-content-end gap-2">
                <Button variant="secondary" onClick={() => setIsEditing(false)}>
                  Hủy
                </Button>
                <Button variant="primary" type="submit">
                  Lưu thay đổi
                </Button>
              </div>
            </Form>
          ) : (
            <>
              <Row>
                <Col md={6}>
                  <div className="mb-3">
                    <strong>Họ và tên:</strong>
                    <p>{userProfile.fullName || 'Chưa cập nhật'}</p>
                  </div>
                  <div className="mb-3">
                    <strong>Email:</strong>
                    <p>{userProfile.email}</p>
                  </div>
                  <div className="mb-3">
                    <strong>Số điện thoại:</strong>
                    <p>{userProfile.phone || 'Chưa cập nhật'}</p>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="mb-3">
                    <strong>Địa chỉ:</strong>
                    <p>{userProfile.address || 'Chưa cập nhật'}</p>
                  </div>
                  <div className="mb-3">
                    <strong>Ngày sinh:</strong>
                    <p>{userProfile.birthDate ? new Date(userProfile.birthDate).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}</p>
                  </div>
                  <div className="mb-3">
                    <strong>Giới tính:</strong>
                    <p>
                      {userProfile.gender === 'MALE' ? 'Nam' :
                       userProfile.gender === 'FEMALE' ? 'Nữ' :
                       userProfile.gender === 'OTHER' ? 'Khác' : 'Chưa cập nhật'}
                    </p>
                  </div>
                  <div className="mb-3">
                    <strong>Vai trò:</strong>
                    <p>{userProfile.role?.name === 'admin' ? 'Quản trị viên' : 'Người dùng'}</p>
                  </div>
                </Col>
              </Row>
              <div className="d-flex justify-content-end">
                <Button variant="primary" onClick={() => setIsEditing(true)}>
                  Chỉnh sửa thông tin
                </Button>
              </div>
            </>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Profile; 