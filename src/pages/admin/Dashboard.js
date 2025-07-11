import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Table, Alert } from 'react-bootstrap';
import axios from 'axios';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
ChartJS.register(ArcElement, Tooltip, Legend);

const Revenue = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:8080/api/v1/admin/dashboard', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      setData(res.data.data);
    } catch (err) {
      setError('Không thể tải dữ liệu dashboard');
    } finally {
      setLoading(false);
    }
  };

  // Dữ liệu mẫu cho Pie chart nếu chưa có dữ liệu thực tế
  const paymentPieData = {
    labels: ['Thanh toán bằng Momo', 'Thanh toán tại văn phòng', 'Thanh toán bằng Paypal'],
    datasets: [
      {
        data: [5, 3, 7], // Số lượng từng phương thức (giả lập)
        backgroundColor: [
          '#ff6384',
          '#ffcd56',
          '#36a2eb',
        ],
        hoverOffset: 4,
      },
    ],
  };

  return (
    <div>
      <h2 className="mb-4">Tổng quan doanh thu</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      {loading ? (
        <div>Đang tải...</div>
      ) : data ? (
        <>
          <Row className="mb-4 g-4 justify-content-center dashboard-stats-row">
            <Col xs={12} sm={6} md={3} className="d-flex">
              <Card className="text-center flex-fill dashboard-stat-card">
                <Card.Body>
                  <div className="fs-3 fw-bold text-success">{data.activeTours}</div>
                  <div>Tổng số tours đang hoạt động</div>
                </Card.Body>
              </Card>
            </Col>
            <Col xs={12} sm={6} md={3} className="d-flex">
              <Card className="text-center flex-fill dashboard-stat-card">
                <Card.Body>
                  <div className="fs-3 fw-bold text-primary">{data.totalBookings}</div>
                  <div>Tổng số lượt booking</div>
                </Card.Body>
              </Card>
            </Col>
            <Col xs={12} sm={6} md={3} className="d-flex">
              <Card className="text-center flex-fill dashboard-stat-card">
                <Card.Body>
                  <div className="fs-3 fw-bold text-info">{data.totalUsers}</div>
                  <div>Số người dùng đăng ký</div>
                </Card.Body>
              </Card>
            </Col>
            <Col xs={12} sm={6} md={3} className="d-flex">
              <Card className="text-center flex-fill dashboard-stat-card">
                <Card.Body>
                  <div className="fs-3 fw-bold text-danger">{data.totalRevenue?.toLocaleString('vi-VN')} VNĐ</div>
                  <div>Tổng doanh thu</div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Biểu đồ hình tròn phương thức thanh toán */}
      <Row className="mb-4">
            <Col md={6}>
          <Card>
            <Card.Body>
                  <h5>Doanh thu theo ngày</h5>
                  <Table size="sm" bordered>
                    <thead>
                      <tr>
                        <th>Ngày</th>
                        <th>Doanh thu</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.revenueByDate?.map((r, idx) => (
                        <tr key={idx}>
                          <td>{r.date}</td>
                          <td>{r.revenue?.toLocaleString('vi-VN')} VNĐ</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
            </Card.Body>
          </Card>
        </Col>
            <Col md={6}>
              <Card>
                <Card.Body>
                  <h5>Doanh thu theo tháng</h5>
                  <Table size="sm" bordered>
                    <thead>
                      <tr>
                        <th>Tháng</th>
                        <th>Năm</th>
                        <th>Doanh thu</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.revenueByMonth?.map((r, idx) => (
                        <tr key={idx}>
                          <td>{r.month}</td>
                          <td>{r.year}</td>
                          <td>{r.revenue?.toLocaleString('vi-VN')} VNĐ</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
        </Col>
      </Row>

          <Row className="mb-4">
            <Col md={6}>
              <Card>
                <Card.Body>
                  <h5>Doanh thu theo năm</h5>
                  <Table size="sm" bordered>
                    <thead>
                      <tr>
                        <th>Năm</th>
                        <th>Doanh thu</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.revenueByYear?.map((r, idx) => (
                        <tr key={idx}>
                          <td>{r.year}</td>
                          <td>{r.revenue?.toLocaleString('vi-VN')} VNĐ</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
          </Col>
            <Col md={6}>
              <Card>
                <Card.Body>
                  <h5>Top tour đặt nhiều nhất</h5>
                  <Table size="sm" bordered>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Tên tour</th>
                        <th>Số lượt đặt</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.topBookedTours?.map((t, idx) => (
                        <tr key={idx}>
                          <td>{t.tourId}</td>
                          <td>{t.tourTitle}</td>
                          <td>{t.count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
          </Col>
        </Row>

          <Row className="mb-4">
            <Col md={6}>
              <Card>
                <Card.Body>
                  <h5>Top tour bị hủy nhiều nhất</h5>
                  <Table size="sm" bordered>
        <thead>
          <tr>
                        <th>ID</th>
                        <th>Tên tour</th>
                        <th>Số lượt hủy</th>
          </tr>
        </thead>
        <tbody>
                      {data.topCancelledTours?.map((t, idx) => (
                        <tr key={idx}>
                          <td>{t.tourId}</td>
                          <td>{t.tourTitle}</td>
                          <td>{t.count}</td>
            </tr>
          ))}
        </tbody>
      </Table>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </>
      ) : null}
    </div>
  );
};

export default Revenue; 