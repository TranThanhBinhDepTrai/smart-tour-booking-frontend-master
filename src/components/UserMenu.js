import React, { useState } from 'react';
import { Dropdown } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import './UserMenu.css';

const UserMenu = ({ user, onLogout }) => {
    return (
        <Dropdown>
            <Dropdown.Toggle variant="link" id="user-menu-dropdown">
                {user.fullName || user.username}
            </Dropdown.Toggle>

            <Dropdown.Menu>
                <div className="user-info-header p-3">
                    <div className="user-name">{user.fullName || user.username}</div>
                    <div className="user-email">{user.email}</div>
                </div>
                <Dropdown.Divider />
                <Dropdown.Item as={Link} to="/profile">Thông tin tài khoản</Dropdown.Item>
                <Dropdown.Item as={Link} to="/my-bookings">Đơn đặt tour</Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item onClick={onLogout}>Đăng xuất</Dropdown.Item>
            </Dropdown.Menu>
        </Dropdown>
    );
};

export default UserMenu; 