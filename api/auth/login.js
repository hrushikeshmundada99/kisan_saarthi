// POST /api/auth/login - Authenticate Farmer with mobile number + password
import { query } from '../lib/db.js';
import {
  normalizeMobile,
  verifyPassword,
  signToken,
  setAuthCookie,
  sanitizeFarmer,
  applyCorsHeaders
} from '../lib/auth.js';

// Basic in-memory rate-limiter for failed login attempts (resets on serverless cold start)
const failedAttemptsMap = new Map();
const MAX_ATTEMPTS = 10;
const LOCKOUT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

function checkRateLimit(identifier) {
  const now = Date.now();
  const record = failedAttemptsMap.get(identifier);

  if (!record) return true;

  if (now - record.firstAttemptTime > LOCKOUT_WINDOW_MS) {
    failedAttemptsMap.delete(identifier);
    return true;
  }

  return record.count < MAX_ATTEMPTS;
}

function recordFailedAttempt(identifier) {
  const now = Date.now();
  const record = failedAttemptsMap.get(identifier) || { count: 0, firstAttemptTime: now };
  record.count += 1;
  failedAttemptsMap.set(identifier, record);
}

function clearFailedAttempts(identifier) {
  failedAttemptsMap.delete(identifier);
}

export default async function handler(req, res) {
  applyCorsHeaders(req, res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed. Use POST.'
    });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    const rawMobile = body.mobile || body.phone;
    const { password } = body;

    // 1. Normalize and validate 10-digit mobile number
    const normalizedPhone = normalizeMobile(rawMobile);
    if (!normalizedPhone) {
      return res.status(400).json({
        success: false,
        error: 'कृपया वैध १० अंकी मोबाईल नंबर टाका (Please enter a valid 10-digit Indian mobile number)'
      });
    }

    // 2. Validate password presence
    if (!password || typeof password !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'कृपया पासवर्ड टाका (Password is required)'
      });
    }

    // 3. Rate limiting check
    const clientIp = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';
    const rateLimitKey = `${clientIp}_${normalizedPhone}`;

    if (!checkRateLimit(rateLimitKey)) {
      return res.status(429).json({
        success: false,
        error: 'अनेक चुकीचे प्रयत्न झाले आहेत. कृपया १५ मिनिटांनी पुन्हा प्रयत्न करा. (Too many failed login attempts. Please try again after 15 minutes.)'
      });
    }

    // 4. Look up farmer record by mobile
    const result = await query(
      'SELECT * FROM farmers WHERE mobile = $1 LIMIT 1',
      [normalizedPhone]
    );

    if (!result.rows || result.rows.length === 0) {
      recordFailedAttempt(rateLimitKey);
      return res.status(401).json({
        success: false,
        error: 'हा मोबाईल नंबर नोंदणीकृत नाही. कृपया प्रथम नवीन नोंदणी करा. (Mobile number is not registered. Please sign up first.)'
      });
    }

    const farmer = result.rows[0];

    // 5. Verify password against bcrypt password_hash
    const isPasswordValid = await verifyPassword(password, farmer.password_hash);
    if (!isPasswordValid) {
      recordFailedAttempt(rateLimitKey);
      return res.status(401).json({
        success: false,
        error: 'चुकीचा पासवर्ड. कृपया पुन्हा प्रयत्न करा. (Incorrect password. Please check your password and try again.)'
      });
    }

    // 6. Login successful: clear rate-limiting counter
    clearFailedAttempts(rateLimitKey);

    // 7. Generate JWT token and set httpOnly cookie
    const token = signToken({
      id: farmer.id,
      mobile: farmer.mobile
    });

    setAuthCookie(res, token);

    const sanitized = sanitizeFarmer(farmer);

    return res.status(200).json({
      success: true,
      message: 'लॉगिन यशस्वी झाले! (Login successful)',
      user: sanitized,
      token
    });
  } catch (error) {
    console.error('[Login API Error]:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'लॉगिन करताना त्रुटी आली. कृपया पुन्हा प्रयत्न करा. (Internal server error during login)'
    });
  }
}
