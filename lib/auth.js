// ============================================================
//  lib/auth.js — JWT Verification Middleware & Cookie Helpers
// ============================================================
const jwt = require('jsonwebtoken');

const JWT_COOKIE_NAME = 'sx_auth_token';
const JWT_EXPIRES_IN = '7d';

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET must be defined in production environment variables.');
    }
    return 'saarthix-dev-jwt-secret-key-change-in-production';
  }
  return secret;
}

function generateToken(user) {
  const payload = {
    id: user._id ? user._id.toString() : user.id,
    phone: user.phone,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName
  };
  return jwt.sign(payload, getJwtSecret(), { expiresIn: JWT_EXPIRES_IN });
}

function setAuthCookie(res, token) {
  const isProduction = process.env.NODE_ENV === 'production';
  res.cookie(JWT_COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in ms
  });
}

function clearAuthCookie(res) {
  const isProduction = process.env.NODE_ENV === 'production';
  res.cookie(JWT_COOKIE_NAME, '', {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    expires: new Date(0)
  });
}

function parseToken(req) {
  if (req.cookies && req.cookies[JWT_COOKIE_NAME]) {
    return req.cookies[JWT_COOKIE_NAME];
  }
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7).trim();
  }
  return null;
}

function verifyToken(token) {
  try {
    return jwt.verify(token, getJwtSecret());
  } catch (err) {
    return null;
  }
}

function requireAuth(req, res, next) {
  const token = parseToken(req);
  if (!token) {
    return res.status(401).json({
      status: 'UNAUTHORIZED',
      error: 'Authentication required. Please log in.'
    });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    clearAuthCookie(res);
    return res.status(401).json({
      status: 'UNAUTHORIZED',
      error: 'Invalid or expired session. Please log in again.'
    });
  }

  req.user = decoded;
  next();
}

module.exports = {
  JWT_COOKIE_NAME,
  generateToken,
  setAuthCookie,
  clearAuthCookie,
  parseToken,
  verifyToken,
  requireAuth
};
