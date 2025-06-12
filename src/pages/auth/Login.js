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
  const { login, currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Kiểm tra nếu đã đăng nhập thì chuyển hướng
  useEffect(() => {
    if (currentUser) {
      console.log('Current user in effect:', currentUser);
      // Chuyển hướng dựa vào role.id
      const redirectTo = currentUser.role?.id === 2 ? '/admin/dashboard' : '/';
      console.log('Redirecting to:', redirectTo);
      navigate(redirectTo, { replace: true });
    }
  }, [currentUser, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!username.trim() || !password.trim()) {
      setError('Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const user = await login(username, password);
      console.log('Login successful, user:', user);
      
      // Navigation will be handled by the useEffect above when currentUser is set
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
              autoComplete="username"
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
              autoComplete="current-password"
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