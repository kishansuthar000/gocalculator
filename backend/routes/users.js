import express from 'express';
import User from '../models/User.js';
import Session from '../models/Session.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';

const router = express.Router();

// Get all users (admin and superadmin only)
router.get('/', authenticateToken, authorizeRole(['admin', 'superadmin']), async (req, res) => {
  try {
    let users;
    
    // If admin: only show user role users
    if (req.user.role === 'admin') {
      users = await User.find({ role: 'user' });
    } else if (req.user.role === 'superadmin') {
      // Superadmin can see all users except themselves
      users = await User.find({ _id: { $ne: req.user.id } });
    }
    
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single user by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create user (admin and superadmin only)
router.post('/', authenticateToken, authorizeRole(['admin', 'superadmin']), async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Admin cannot create admin or superadmin users, only user role
    if (req.user.role === 'admin' && (role === 'admin' || role === 'superadmin')) {
      return res.status(403).json({ message: 'Admin can only create users with "user" role' });
    }

    // Superadmin cannot create superadmin, only admin and user roles
    if (req.user.role === 'superadmin' && role === 'superadmin') {
      return res.status(403).json({ message: 'To create superadmin users, use the dedicated superadmin creation endpoint' });
    }

    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({ message: 'Username or email already exists' });
    }

    const user = new User({
      username,
      email,
      password,
      role: role || 'user',
    });

    await user.save();

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update user (admin and superadmin only)
router.put('/:id', authenticateToken, authorizeRole(['admin', 'superadmin']), async (req, res) => {
  try {
    const { username, email, role, isActive, password } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (username) user.username = username;
    if (email) user.email = email;
    if (role) user.role = role;
    if (isActive !== undefined) user.isActive = isActive;
    if (password) user.password = password;

    await user.save();

    res.json({
      message: 'User updated successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete user (admin and superadmin only)
router.delete('/:id', authenticateToken, authorizeRole(['admin', 'superadmin']), async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get login logs for a user (admin and superadmin only)
router.get('/:id/login-logs', authenticateToken, authorizeRole(['admin', 'superadmin']), async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('username loginLogs');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({
      username: user.username,
      loginLogs: user.loginLogs || [],
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all active sessions (superadmin only)
router.get('/admin/all-sessions', authenticateToken, authorizeRole(['superadmin']), async (req, res) => {
  try {
    const sessions = await Session.find({ isActive: true }).sort({ lastActivityTime: -1 });
    res.json({
      totalActiveSessions: sessions.length,
      sessions: sessions.map(s => ({
        sessionId: s.sessionId,
        username: s.username,
        userId: s.userId,
        deviceType: s.deviceType,
        ipAddress: s.ipAddress,
        userAgent: s.userAgent,
        loginTime: s.loginTime,
        lastActivityTime: s.lastActivityTime,
      })),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all login logs for all users (superadmin only)
router.get('/admin/all-login-logs', authenticateToken, authorizeRole(['superadmin']), async (req, res) => {
  try {
    const users = await User.find().select('username email role loginLogs');
    const allLogs = users.map(user => ({
      username: user.username,
      email: user.email,
      role: user.role,
      loginLogs: user.loginLogs || [],
    }));
    res.json({
      totalUsers: users.length,
      logs: allLogs,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Toggle user active status (superadmin only)
router.patch('/:id/toggle-status', authenticateToken, authorizeRole(['superadmin']), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      user: {
        id: user._id,
        username: user.username,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get active sessions for a specific user (superadmin only)
router.get('/:id/active-sessions', authenticateToken, authorizeRole(['superadmin']), async (req, res) => {
  try {
    const sessions = await Session.find({ userId: req.params.id, isActive: true }).sort({ loginTime: -1 });
    res.json({
      totalSessions: sessions.length,
      sessions: sessions.map(s => ({
        sessionId: s.sessionId,
        deviceType: s.deviceType,
        ipAddress: s.ipAddress,
        userAgent: s.userAgent,
        loginTime: s.loginTime,
        lastActivityTime: s.lastActivityTime,
      })),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete a specific session (superadmin only) - allows user to login again
router.delete('/sessions/:sessionId', authenticateToken, authorizeRole(['superadmin']), async (req, res) => {
  try {
    const session = await Session.findOneAndDelete({ sessionId: req.params.sessionId });
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }
    res.json({
      message: 'Session deleted successfully. User can now login from this device.',
      deletedSession: {
        username: session.username,
        deviceType: session.deviceType,
        ipAddress: session.ipAddress,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
