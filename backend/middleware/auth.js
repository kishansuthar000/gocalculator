import jwt from 'jsonwebtoken';
import Session from '../models/Session.js';

export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, async (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }

    // Check if session is still active
    if (user.sessionId) {
      const session = await Session.findOne({ sessionId: user.sessionId, isActive: true });
      if (!session) {
        return res.status(403).json({ message: 'Session has expired or logged in from another device' });
      }

      // Update last activity time
      await Session.updateOne(
        { sessionId: user.sessionId },
        { lastActivityTime: new Date() }
      );
    }

    req.user = user;
    next();
  });
};

export const authorizeRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    next();
  };
};
