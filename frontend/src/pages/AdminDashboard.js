import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../api/apiClient';
import UserForm from '../components/UserForm';
import UserTable from '../components/UserTable';
import LoginLogsModal from '../components/LoginLogsModal';
import CategoryManagement from './CategoryManagement';
import Calculator from './Calculator';
import '../styles/AdminDashboard.css';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('users'); // 'users' or 'categories'
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showLogsModal, setShowLogsModal] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getAllUsers();
      setUsers(response.data);
      setError('');
    } catch (err) {
      setError('Failed to load users');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = () => {
    setEditingUser(null);
    setShowForm(true);
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingUser(null);
  };

  const handleFormSubmit = async () => {
    await fetchUsers();
    handleFormClose();
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await userAPI.deleteUser(userId);
        setUsers(users.filter(u => u._id !== userId));
        setError('');
      } catch (err) {
        setError('Failed to delete user');
        console.error(err);
      }
    }
  };

  const handleToggleStatus = async (userId, newStatus) => {
    try {
      await userAPI.updateUser(userId, { isActive: newStatus });
      setUsers(users.map(u => 
        u._id === userId ? { ...u, isActive: newStatus } : u
      ));
      setError('');
    } catch (err) {
      setError('Failed to update user status');
      console.error(err);
    }
  };

  const handleRowClick = (user) => {
    setSelectedUser(user);
    setShowLogsModal(true);
  };

  const handleCloseLogsModal = () => {
    setShowLogsModal(false);
    setSelectedUser(null);
  };

  return (
    <div className="admin-dashboard">
      <nav className="navbar">
        <div className="navbar-content">
          <div className="navbar-left">
            <h2 className="logo">🧮 KiCalc</h2>
            <span className="welcome-text desktop-only">Welcome, {user?.username}!</span>
          </div>
          
          <div className="navbar-right">
            <div className="navbar-tabs desktop-only">
              <button
                className={`navbar-tab-btn ${activeTab === 'users' ? 'active' : ''}`}
                onClick={() => setActiveTab('users')}
              >
                👥 Users
              </button>
              <button
                className={`navbar-tab-btn ${activeTab === 'categories' ? 'active' : ''}`}
                onClick={() => setActiveTab('categories')}
              >
                📋 Categories
              </button>
              <button
                className={`navbar-tab-btn ${activeTab === 'calculator' ? 'active' : ''}`}
                onClick={() => setActiveTab('calculator')}
              >
                🧮 Calculator
              </button>
            </div>
            <button onClick={logout} className="logout-btn desktop-only">Logout</button>
            <button className="hamburger-btn mobile-only" onClick={() => setSidebarOpen(!sidebarOpen)}>
              ☰
            </button>
          </div>
        </div>
      </nav>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar Navigation */}
      <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <span className="sidebar-username">👤 {user?.username}</span>
          <button className="sidebar-close-btn" onClick={() => setSidebarOpen(false)}>✕</button>
        </div>
        <div className="sidebar-tabs">
          <button
            className={`sidebar-tab ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('users');
              setSidebarOpen(false);
            }}
          >
            👥 Users
          </button>
          <button
            className={`sidebar-tab ${activeTab === 'categories' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('categories');
              setSidebarOpen(false);
            }}
          >
            📋 Categories
          </button>
          <button
            className={`sidebar-tab ${activeTab === 'calculator' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('calculator');
              setSidebarOpen(false);
            }}
          >
            🧮 Calculator
          </button>
           <button onClick={logout} className="sidebar-logout-btn">🚪 Logout</button>
        </div>
       
      </div>

      <div className="dashboard-content">
        {activeTab === 'users' && (
          <div className="tab-content">
            <div className="dashboard-header">
              <h3>User Management</h3>
              <button onClick={handleAddUser} className="add-btn">+ Add New User</button>
            </div>

            {error && <div className="error-message">{error}</div>}

            {loading ? (
              <div className="loading">Loading users...</div>
            ) : (
              <UserTable
                users={users}
                onEdit={handleEditUser}
                onDelete={handleDeleteUser}
                onToggleStatus={handleToggleStatus}
                onRowClick={handleRowClick}
                currentUserRole={user?.role}
              />
            )}
          </div>
        )}

        {activeTab === 'categories' && (
          <div className="tab-content">
            <CategoryManagement />
          </div>
        )}

        {activeTab === 'calculator' && (
          <div className="tab-content">
            <Calculator />
          </div>
        )}
      </div>

      {showForm && (
        <UserForm
          user={editingUser}
          onClose={handleFormClose}
          onSubmit={handleFormSubmit}
        />
      )}

      {showLogsModal && selectedUser && (
        <LoginLogsModal user={selectedUser} onClose={handleCloseLogsModal} />
      )}
    </div>
  );
};

export default AdminDashboard;
