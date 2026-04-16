import React from 'react';
import '../styles/UserTable.css';

function UserTable({
  users, onEdit, onDelete, onToggleStatus, onRowClick, currentUserRole,
}) {
  return (
    <div className="table-container">
      <table className="user-table">
        <thead>
          <tr>
            <th>Username</th>
            <th>Email</th>
            <th>Role</th>
            <th>Password</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr
              key={user._id}
              className={`user-row ${currentUserRole === 'superadmin' && onRowClick ? 'clickable-row' : ''}`}
              onClick={() => currentUserRole === 'superadmin' && onRowClick && onRowClick(user)}
            >
              <td>{user.username}</td>
              <td>{user.email}</td>
              <td>
                <span className={`role-badge ${user.role}`}>
                  {user.role}
                </span>
              </td>
              <td>
                <span className="password-display">
                  {user.plainPassword || 'N/A'}
                </span>
              </td>
              <td>
                <span className={`status-badge ${user.isActive ? 'active' : 'inactive'}`}>
                  {user.isActive ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => onEdit(user)}
                  className="action-btn edit-btn"
                >
                  Edit
                </button>
                <button
                  onClick={() => onToggleStatus(user._id, !user.isActive)}
                  className={`action-btn toggle-btn ${user.isActive ? 'deactivate' : 'activate'}`}
                >
                  {user.isActive ? 'Deactivate' : 'Activate'}
                </button>
                <button
                  onClick={() => onDelete(user._id)}
                  className="action-btn delete-btn"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {users.length === 0 && (
        <p className="no-users">No users found</p>
      )}
    </div>
  );
}

export default UserTable;
