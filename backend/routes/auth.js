import express from 'express';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import User from '../models/User.js';
import Session from '../models/Session.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Register (for now, only admin can create users)
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Please provide all required fields' });
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

    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password required' });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if user account is active
    if (!user.isActive) {
      return res.status(403).json({ message: 'Your account is blocked. Please contact administrator.' });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Get IP address from request
    const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || 'Unknown';

    // Get User-Agent and detect device type
    const userAgent = req.headers['user-agent'] || 'Unknown';
    let deviceType = 'Unknown';

    if (userAgent) {
      if (/mobile|android|iphone|ipad|phone/i.test(userAgent)) {
        deviceType = 'Mobile';
      } else if (/windows|mac|linux/i.test(userAgent)) {
        deviceType = 'Desktop';
      } else {
        deviceType = 'Other';
      }
    }

    // Check if user has an active session (not applicable for superadmin)
    if (user.role !== 'superadmin') {
      const existingSession = await Session.findOne({ userId: user._id, isActive: true });
      if (existingSession) {
        return res.status(409).json({ 
          message: 'Already logged in from another device',
          details: `Last login: ${new Date(existingSession.loginTime).toLocaleString()} from ${existingSession.deviceType} (${existingSession.ipAddress})`
        });
      }

      // Deactivate all previous sessions for non-superadmin users
      await Session.updateMany({ userId: user._id }, { isActive: false });
    }

    // Create new session (superadmin can have multiple concurrent sessions)
    const sessionId = uuidv4();
    const session = new Session({
      userId: user._id,
      username: user.username,
      sessionId,
      ipAddress,
      deviceType,
      userAgent,
      loginTime: new Date(),
      lastActivityTime: new Date(),
      isActive: true,
    });

    await session.save();

    // Create JWT token including sessionId
    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role, sessionId },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Store login log
    user.loginLogs.push({
      loginTime: new Date(),
      ipAddress,
      deviceType,
      userAgent,
    });

    await user.save();

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      token,
      sessionId,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Verify token
router.get('/verify', authenticateToken, (req, res) => {
  res.json({ user: req.user });
});

// Logout - deactivate session
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    const { sessionId } = req.body;

    if (sessionId) {
      await Session.updateOne(
        { sessionId, userId: req.user.id },
        { isActive: false }
      );
    }

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get active users count (admin only)
router.get('/users/active/count', authenticateToken, async (req, res) => {
  try {
    // Only admin can view this
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const activeSessions = await Session.find({ isActive: true });
    const activeUserCount = new Set(activeSessions.map(s => s.userId.toString())).size;

    res.json({
      totalActiveSessions: activeSessions.length,
      activeUsersCount: activeUserCount,
      sessions: activeSessions.map(s => ({
        username: s.username,
        deviceType: s.deviceType,
        ipAddress: s.ipAddress,
        loginTime: s.loginTime,
        lastActivityTime: s.lastActivityTime,
      })),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
