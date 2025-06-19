import React, { useState } from 'react';
import { Card, Row, Col, Table, Form, Button } from 'react-bootstrap';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';

// Dữ liệu mẫu
const ordersMock = [
  { id: 1, customer: 'Nguyễn Văn A', date: '2024-06-01', amount: 2000000 },
  { id: 2, customer: 'Trần Thị B', date: '2024-06-02', amount: 3500000 },
  { id: 3, customer: 'Lê Văn C', date: '2024-06-02', amount: 1500000 },
  { id: 4, customer: 'Phạm Thị D', date: '2024-06-03', amount: 4000000 },
  { id: 5, customer: 'Vũ Văn E', date: '2024-06-03', amount: 2500000 },
];

function getRevenueByDate(orders) {
  const result = {};
  orders.forEach(order => {
    if (!result[order.date]) result[order.date] = 0;
    result[order.date] += order.amount;
  });
  return result;
}

function Revenue() {
  const [filter, setFilter] = useState({ year: '', month: '', day: '' });

  // Lọc đơn hàng theo ngày/tháng/năm
  const filteredOrders = ordersMock.filter(order => {
    const d = new Date(order.date);
    const year = d.getFullYear().toString();
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    return (
      (!filter.year || filter.year === year) &&
      (!filter.month || filter.month === month) &&
      (!filter.day || filter.day === day)
    );
  });

  const totalRevenue = filteredOrders.reduce((sum, o) => sum + o.amount, 0);
  const revenueByDate = getRevenueByDate(filteredOrders);

  const chartData = {
    labels: Object.keys(revenueByDate),
    datasets: [
      {
        label: 'Doanh thu',
        data: Object.values(revenueByDate),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
      },
    ],
  };

  // Lấy danh sách năm, tháng, ngày từ dữ liệu mẫu
  const years = [...new Set(ordersMock.map(o => new Date(o.date).getFullYear().toString()))];
  const months = [...new Set(ordersMock.map(o => (new Date(o.date).getMonth() + 1).toString().padStart(2, '0')))]
  const days = [...new Set(ordersMock.map(o => new Date(o.date).getDate().toString().padStart(2, '0')))]

  return (
    <div>
      <h2 className="mb-4">Thống kê doanh thu</h2>
      <Row className="mb-4">
        <Col md={3}>
          <Card>
            <Card.Body>
              <Card.Title>Tổng doanh thu</Card.Title>
              <Card.Text className="fs-3 text-success fw-bold">
                {totalRevenue.toLocaleString('vi-VN')} đ
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={9}>
          <Bar data={chartData} height={80} />
        </Col>
      </Row>
      <Form className="mb-3">
        <Row>
          <Col md={3}>
            <Form.Select value={filter.year} onChange={e => setFilter(f => ({ ...f, year: e.target.value }))}>
              <option value="">Năm</option>
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </Form.Select>
          </Col>
          <Col md={3}>
            <Form.Select value={filter.month} onChange={e => setFilter(f => ({ ...f, month: e.target.value }))}>
              <option value="">Tháng</option>
              {months.map(m => <option key={m} value={m}>{m}</option>)}
            </Form.Select>
          </Col>
          <Col md={3}>
            <Form.Select value={filter.day} onChange={e => setFilter(f => ({ ...f, day: e.target.value }))}>
              <option value="">Ngày</option>
              {days.map(d => <option key={d} value={d}>{d}</option>)}
            </Form.Select>
          </Col>
          <Col md={3}>
            <Button variant="secondary" onClick={() => setFilter({ year: '', month: '', day: '' })}>Xóa lọc</Button>
          </Col>
        </Row>
      </Form>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Mã đơn</th>
            <th>Khách hàng</th>
            <th>Ngày đặt</th>
            <th>Số tiền</th>
          </tr>
        </thead>
        <tbody>
          {filteredOrders.map(order => (
            <tr key={order.id}>
              <td>{order.id}</td>
              <td>{order.customer}</td>
              <td>{order.date}</td>
              <td>{order.amount.toLocaleString('vi-VN')} đ</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}

export default Revenue; 