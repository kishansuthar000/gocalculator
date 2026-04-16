import React from 'react';
import { useAuth } from '../context/AuthContext';
import Calculator from './Calculator';
import '../styles/UserDashboard.css';

const UserDashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div className="user-dashboard">
      <nav className="navbar">
        <div className="navbar-content">
          <div className="navbar-left">
            <h2 className="logo">🧮 KiCalc</h2>
          </div>
          
          <div className="navbar-right">
            <span className="welcome-text">Welcome, {user?.username}!</span>
            <button onClick={logout} className="logout-btn">Logout</button>
          </div>
        </div>
      </nav>

      <div className="dashboard-content">
        <Calculator />
      </div>
    </div>
  );
};

export default UserDashboard;
