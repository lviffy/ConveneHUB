const jwt = require('jsonwebtoken');
const { env } = require('../config/env');

function normalizeAuthRole(role) {
  const roleMap = {
    admin: 'admin',
    admin_team: 'admin',
    organizer: 'organizer',
    movie_team: 'organizer',
    promoter: 'promoter',
    attendee: 'attendee',
    user: 'attendee',
  };

  return roleMap[role || 'attendee'] || 'attendee';
}

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ success: false, message: 'Missing access token' });
    return;
  }

  const token = authHeader.replace('Bearer ', '');
  try {
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET);

    if (!decoded.sub) {
      res.status(401).json({ success: false, message: 'Invalid access token' });
      return;
    }

    req.user = {
      sub: String(decoded.sub),
      role: normalizeAuthRole(decoded.role),
      tenantId: decoded.tenantId,
    };
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Invalid access token' });
  }
}

function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }
    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({ success: false, message: 'Forbidden' });
      return;
    }
    next();
  };
}

module.exports = { normalizeAuthRole, requireAuth, requireRole };
