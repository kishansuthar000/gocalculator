import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../api/apiClient';
import '../styles/LoginLogsModal.css';

const LoginLogsModal = ({ user, onClose }) => {
  const { user: currentUser } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    if (user && currentUser?.role === 'superadmin') {
      fetchActiveSessions();
    }
  }, [user, currentUser?.role]);

  const fetchActiveSessions = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await userAPI.getActiveSessions(user._id);
      setSessions(response.data.sessions || []);
    } catch (err) {
      console.error(err);
      setError('Failed to load active sessions');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSession = async (sessionId, sessionInfo) => {
    if (!window.confirm(`Delete session from ${sessionInfo.deviceType} (${sessionInfo.ipAddress})? This will allow the user to login from this device again.`)) {
      return;
    }

    try {
      setDeleting(sessionId);
      await userAPI.deleteSession(sessionId);
      setSessions(sessions.filter(s => s.sessionId !== sessionId));
      setSuccessMessage(`Session deleted! User can now login from ${sessionInfo.deviceType}.`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error(err);
      setError('Failed to delete session');
    } finally {
      setDeleting(null);
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  // Check if current user is superadmin
  if (currentUser?.role !== 'superadmin') {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content login-logs-modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>Access Denied</h2>
            <button className="modal-close-btn" onClick={onClose}>✕</button>
          </div>
          <div className="modal-body">
            <div className="error-message" style={{ textAlign: 'center', padding: '40px 20px' }}>
              ⛔ Only superadmin users can view login details
            </div>
          </div>
          <div className="modal-footer">
            <button onClick={onClose} className="close-modal-btn">Close</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content login-logs-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Active Sessions - {user.username}</h2>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {successMessage && <div className="success-message" style={{backgroundColor: '#c8e6c9', color: '#2e7d32', padding: '12px', borderRadius: '4px', marginBottom: '16px'}}>{successMessage}</div>}
          {loading ? (
            <div className="loading">Loading active sessions...</div>
          ) : error ? (
            <div className="error-message">{error}</div>
          ) : sessions.length === 0 ? (
            <div className="no-data">No active sessions found for this user.</div>
          ) : (
            <div className="logs-container">
              {sessions.map((session, index) => (
                <div key={session.sessionId} className="log-card">
                  <div className="log-header">
                    <span className="log-time">
                      🕐 {formatTime(session.loginTime)}
                    </span>
                    <span className="log-number">Active #{sessions.length - index}</span>
                  </div>
                  <div className="log-details">
                    <div className="detail-row">
                      <span className="detail-label">Device Type:</span>
                      <span className="detail-value">{session.deviceType || 'Unknown'}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">IP Address:</span>
                      <span className="detail-value">{session.ipAddress || 'Unknown'}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Last Activity:</span>
                      <span className="detail-value">{formatTime(session.lastActivityTime)}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">User Agent:</span>
                      <span className="detail-value user-agent">{session.userAgent || 'Unknown'}</span>
                    </div>
                  </div>
                  <div className="log-actions">
                    <button
                      className="delete-session-btn"
                      onClick={() => handleDeleteSession(session.sessionId, session)}
                      disabled={deleting === session.sessionId}
                    >
                      {deleting === session.sessionId ? 'Deleting...' : '🗑️ Delete Session'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="close-modal-btn">Close</button>
        </div>
      </div>
    </div>
  );
};

export default LoginLogsModal;
