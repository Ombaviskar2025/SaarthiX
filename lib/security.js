// ============================================================
//  lib/security.js — Rate Limiting & Input Sanitization
// ============================================================

// Simple memory store rate limiter (IP based)
const rateLimitMap = new Map();

function createRateLimiter({ windowMs = 15 * 60 * 1000, max = 20, message = 'Too many requests. Please try again later.' } = {}) {
  return function rateLimiter(req, res, next) {
    const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || req.ip || 'unknown';
    const key = `${req.path}:${ip}`;
    const now = Date.now();

    const record = rateLimitMap.get(key) || { count: 0, resetAt: now + windowMs };

    if (now > record.resetAt) {
      record.count = 1;
      record.resetAt = now + windowMs;
    } else {
      record.count += 1;
    }

    rateLimitMap.set(key, record);

    // Periodic cleanup
    if (rateLimitMap.size > 2000) {
      for (const [k, v] of rateLimitMap.entries()) {
        if (now > v.resetAt) rateLimitMap.delete(k);
      }
    }

    if (record.count > max) {
      const waitSeconds = Math.ceil((record.resetAt - now) / 1000);
      return res.status(429).json({
        status: 'RATE_LIMITED',
        error: `${message} Retry after ${waitSeconds} seconds.`
      });
    }

    next();
  };
}

// Input sanitizer
function sanitizeString(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/[<>]/g, '') // strip < and >
    .trim();
}

function normalizePhone(rawPhone) {
  if (typeof rawPhone !== 'string') return '';
  // Keep leading + if present, strip all other non-digits
  const trimmed = rawPhone.trim();
  const hasPlus = trimmed.startsWith('+');
  const digits = trimmed.replace(/\D/g, '');
  return hasPlus ? `+${digits}` : `+${digits}`;
}

function normalizeEmail(rawEmail) {
  if (typeof rawEmail !== 'string') return '';
  return rawEmail.trim().toLowerCase();
}

module.exports = {
  createRateLimiter,
  sanitizeString,
  normalizePhone,
  normalizeEmail
};
