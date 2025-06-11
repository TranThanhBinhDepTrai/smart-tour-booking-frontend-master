import React from 'react';
import { Card } from 'react-bootstrap';

function StatCard({ count, label, color, onViewDetails }) {
  return (
    <Card className="h-100" style={{ backgroundColor: color }}>
      <Card.Body className="d-flex flex-column">
        <div className="mb-3">
          <div className="display-4 fw-bold text-white">{count}</div>
        </div>
        <div className="text-white">{label}</div>
        <button 
          className="btn btn-link text-white mt-auto text-decoration-none" 
          onClick={onViewDetails}
          style={{ textAlign: 'left', padding: 0 }}
        >
          Xem chi tiết →
        </button>
      </Card.Body>
    </Card>
  );
}

export default StatCard; 