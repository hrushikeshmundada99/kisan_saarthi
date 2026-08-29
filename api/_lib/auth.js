// Authentication & Security Utilities for Kisan Saarthi
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { stringifySetCookie, parseCookie } from 'cookie';

const JWT_SECRET = process.env.JWT_SECRET || 'kisan_saarthi_jwt_default_secret_dev_2026_smart_kopargaon';
export const AUTH_COOKIE_NAME = 'kisan_auth_token';

/**
 * Normalizes and strictly validates an Indian 10-digit mobile number.
 * Accepts formats: "+91 9822154321", "09822154321", "919822154321", "9822154321"
 * Returns exactly 10 digits (e.g. "9822154321") or null if invalid.
 */
export function normalizeMobile(input) {
  if (!input || typeof input !== 'string') return null;

  // Remove all non-numeric characters
  let digits = input.replace(/\D/g, '');

  // Strip leading international country code (91) or trunk prefix (0) if present
  if (digits.length === 12 && digits.startsWith('91')) {
    digits = digits.slice(2);
  } else if (digits.length === 11 && digits.startsWith('0')) {
    digits = digits.slice(1);
  }

  // Validate: exactly 10 digits, starting with 6, 7, 8, or 9
  if (/^[6-9]\d{9}$/.test(digits)) {
    return digits;
  }

  return null;
}

/**
 * Hashes password using bcrypt with 10 salt rounds
 */
export async function hashPassword(plainPassword) {
  if (!plainPassword || typeof plainPassword !== 'string' || plainPassword.length < 6) {
    throw new Error('Password must be at least 6 characters long');
  }
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plainPassword, salt);
}

/**
 * Compares plain-text password with bcrypt hash
 */
export async function verifyPassword(plainPassword, passwordHash) {
  if (!plainPassword || !passwordHash) return false;
  return bcrypt.compare(plainPassword, passwordHash);
}

/**
 * Generates signed JWT token valid for 30 days
 */
export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '30d',
    issuer: 'kisan-saarthi-auth'
  });
}

/**
 * Verifies and decodes JWT token
 */
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET, { issuer: 'kisan-saarthi-auth' });
  } catch (err) {
    return null;
  }
}

/**
 * Serializes and sets secure httpOnly cookie
 */
export function setAuthCookie(res, token) {
  const isProduction = process.env.NODE_ENV === 'production' || !!process.env.VERCEL;

  try {
    const cookieHeader = stringifySetCookie({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/'
    });
    res.setHeader('Set-Cookie', cookieHeader);
  } catch (err) {
    console.warn('[Set-Cookie Note]:', err.message);
  }
}

/**
 * Clears the auth cookie
 */
export function clearAuthCookie(res) {
  const isProduction = process.env.NODE_ENV === 'production' || !!process.env.VERCEL;

  try {
    const cookieHeader = stringifySetCookie({
      name: AUTH_COOKIE_NAME,
      value: '',
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 0,
      path: '/'
    });
    res.setHeader('Set-Cookie', cookieHeader);
  } catch (err) {
    console.warn('[Clear-Cookie Note]:', err.message);
  }
}

/**
 * Extracts JWT token from request cookies or Authorization Bearer header
 */
export function getAuthTokenFromReq(req) {
  // 1. Try Cookie header
  if (req.headers && req.headers.cookie) {
    try {
      const parsedCookies = parseCookie(req.headers.cookie);
      if (parsedCookies[AUTH_COOKIE_NAME]) {
        return parsedCookies[AUTH_COOKIE_NAME];
      }
    } catch (err) {
      console.warn('[Parse Cookie Note]:', err.message);
    }
  }

  // 2. Try Authorization: Bearer <token>
  const authHeader = req.headers?.authorization || req.headers?.Authorization;
  if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7).trim();
  }

  return null;
}

/**
 * Sanitizes DB farmer record by stripping password_hash and formatting camelCase profile
 */
export function sanitizeFarmer(row) {
  if (!row) return null;

  return {
    id: row.id,
    mobile: row.mobile,
    phone: row.mobile, // compatibility alias
    email: row.email || row.farmer_email || null,
    name: row.name,
    location: row.location || 'कोपरगाव, अहिल्यानगर',
    landSize: row.land_size || '5 एकर',
    primaryCrop: row.primary_crop || 'Onion',
    preferredMandis: Array.isArray(row.preferred_mandis) ? row.preferred_mandis : ['Kopargaon', 'Rahata', 'Yeola'],
    createdAt: row.created_at
  };
}

/**
 * Helper to set CORS and security headers for API responses
 */
export function applyCorsHeaders(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );
}
