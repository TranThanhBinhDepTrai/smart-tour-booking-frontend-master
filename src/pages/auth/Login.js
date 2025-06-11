import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Auth.css';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, currentUser, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Kiểm tra nếu đã đăng nhập thì chuyển hướng
  useEffect(() => {
    if (currentUser) {
      const redirectTo = isAdmin() ? '/admin/dashboard' : '/';
      navigate(redirectTo, { replace: true });
    }
  }, [currentUser, isAdmin, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!username.trim() || !password.trim()) {
      setError('Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const userData = await login(username, password);
      
      // Chuyển hướng dựa vào role ID
      if (userData.role?.id === 2) { // Admin
        navigate('/admin/dashboard', { replace: true });
      } else { // User hoặc role khác
        // Nếu có intended path thì chuyển đến đó, không thì về trang chủ
        const intendedPath = location.state?.from || '/';
        navigate(intendedPath, { replace: true });
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Đăng nhập</h2>
        {error && <div className="error-message">{error}</div>}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="form-group">
            <Form.Label>Tên đăng nhập</Form.Label>
            <Form.Control
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="Nhập tên đăng nhập"
            />
          </Form.Group>

          <Form.Group className="form-group">
            <Form.Label>Mật khẩu</Form.Label>
            <Form.Control
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Nhập mật khẩu"
            />
          </Form.Group>

          <Button
            type="submit"
            className="auth-button"
            disabled={loading}
          >
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </Button>
        </Form>

        <div className="auth-link">
          Chưa có tài khoản? <a href="/register">Đăng ký</a>
        </div>
      </div>
    </div>
  );
}

export default Login; 