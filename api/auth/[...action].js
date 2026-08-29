// Unified Auth Serverless Function Handler for Vercel Hobby Plan
// Handles /api/auth/login, /api/auth/signup, /api/auth/me, /api/auth/logout, /api/auth/profile, /api/auth/change-password

import { query } from '../_lib/db.js';
import {
  normalizeMobile,
  verifyPassword,
  hashPassword,
  signToken,
  setAuthCookie,
  clearAuthCookie,
  getAuthTokenFromReq,
  verifyToken,
  sanitizeFarmer,
  applyCorsHeaders
} from '../_lib/auth.js';

const failedAttemptsMap = new Map();
const MAX_ATTEMPTS = 10;
const LOCKOUT_WINDOW_MS = 15 * 60 * 1000;

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

function getActionFromReq(req) {
  if (req.query && req.query.action) {
    const act = Array.isArray(req.query.action) ? req.query.action[req.query.action.length - 1] : req.query.action;
    if (act) return act;
  }
  if (req.url) {
    const cleanUrl = req.url.split('?')[0].replace(/\/$/, '');
    const parts = cleanUrl.split('/');
    const lastPart = parts[parts.length - 1];
    if (lastPart && lastPart !== 'auth' && lastPart !== 'api') {
      return lastPart;
    }
  }
  return '';
}

export default async function handler(req, res) {
  applyCorsHeaders(req, res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  // Extract action parameter from Vercel dynamic route req.query.action or req.url path
  const action = getActionFromReq(req);

  switch (action) {
    case 'login':
      return handleLogin(req, res);
    case 'signup':
      return handleSignup(req, res);
    case 'me':
      return handleMe(req, res);
    case 'logout':
      return handleLogout(req, res);
    case 'profile':
      return handleProfile(req, res);
    case 'change-password':
      return handleChangePassword(req, res);
    default:
      return res.status(404).json({ success: false, error: `Auth action '${action}' not found` });
  }
}

// 1. POST /api/auth/login
async function handleLogin(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' });
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    const rawMobile = body.mobile || body.phone;
    const { password } = body;
    const normalizedPhone = normalizeMobile(rawMobile);
    if (!normalizedPhone) {
      return res.status(400).json({ success: false, error: 'कृपया वैध १० अंकी मोबाईल नंबर टाका' });
    }
    if (!password || typeof password !== 'string') {
      return res.status(400).json({ success: false, error: 'कृपया पासवर्ड टाका' });
    }

    const clientIp = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';
    const rateLimitKey = `${clientIp}_${normalizedPhone}`;
    if (!checkRateLimit(rateLimitKey)) {
      return res.status(429).json({ success: false, error: 'अनेक चुकीचे प्रयत्न झाले आहेत. कृपया १५ मिनिटांनी पुन्हा प्रयत्न करा.' });
    }

    let result = await query('SELECT * FROM farmers WHERE mobile = $1 LIMIT 1', [normalizedPhone]);

    // Server-Side Self-Healing: If user row was deleted from Supabase SQL Editor
    if (!result.rows || result.rows.length === 0) {
      console.warn(`[Server Self-Healing Login]: Mobile ${normalizedPhone} missing from Supabase! Auto-recreating account...`);
      const newHash = await hashPassword(password);
      const name = (body.name && typeof body.name === 'string' && body.name.trim()) ? body.name.trim() : 'बळीराजा शेतकरी';
      const email = (body.email && typeof body.email === 'string' && body.email.trim()) ? body.email.trim() : null;
      const location = (body.location && typeof body.location === 'string') ? body.location : 'कोपरगाव, अहिल्यानगर';
      const landSize = (body.landSize && typeof body.landSize === 'string') ? body.landSize : '5 एकर';
      const primaryCrop = (body.primaryCrop && typeof body.primaryCrop === 'string') ? body.primaryCrop : 'Onion';
      const preferredMandis = Array.isArray(body.preferredMandis) ? body.preferredMandis : ['Kopargaon', 'Rahata', 'Yeola'];

      const insertResult = await query(
        `INSERT INTO farmers (mobile, password_hash, name, location, land_size, primary_crop, preferred_mandis, email)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
        [normalizedPhone, newHash, name, location, landSize, primaryCrop, preferredMandis, email]
      );

      if (insertResult.rows && insertResult.rows.length > 0) {
        result = insertResult;
      } else {
        recordFailedAttempt(rateLimitKey);
        return res.status(401).json({ success: false, error: 'हा मोबाईल नंबर नोंदणीकृत नाही. कृपया प्रथम नवीन नोंदणी करा.' });
      }
    }

    const farmer = result.rows[0];
    const isPasswordValid = await verifyPassword(password, farmer.password_hash);
    if (!isPasswordValid) {
      recordFailedAttempt(rateLimitKey);
      return res.status(401).json({ success: false, error: 'मोबाईल नंबर किंवा पासवर्ड चुकीचा आहे.' });
    }

    failedAttemptsMap.delete(rateLimitKey);
    const sanitized = sanitizeFarmer(farmer);
    const token = signToken(sanitized);
    setAuthCookie(res, token);

    return res.status(200).json({
      success: true,
      message: `नमस्कार ${farmer.name}! लॉगिन यशस्वी झाले.`,
      user: sanitized,
      token
    });
  } catch (error) {
    console.error('[Auth /login Error]:', error);
    return res.status(500).json({ success: false, error: error.message || 'लॉगिन करताना त्रुटी आली.' });
  }
}

// 2. POST /api/auth/signup
async function handleSignup(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' });
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    const rawMobile = body.mobile || body.phone;
    const { password, name, location, landSize, primaryCrop, preferredMandis, email } = body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ success: false, error: 'कृपया आपले नाव प्रविष्ट करा' });
    }
    const normalizedPhone = normalizeMobile(rawMobile);
    if (!normalizedPhone) {
      return res.status(400).json({ success: false, error: 'कृपया वैध १० अंकी मोबाईल नंबर टाका' });
    }
    if (!password || typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ success: false, error: 'पासवर्ड किमान ६ अक्षरांचा असावा' });
    }

    const existingCheck = await query('SELECT id FROM farmers WHERE mobile = $1 LIMIT 1', [normalizedPhone]);
    if (existingCheck.rows && existingCheck.rows.length > 0) {
      return res.status(409).json({ success: false, error: 'हा मोबाईल नंबर आधीच नोंदणीकृत आहे.' });
    }

    const passwordHash = await hashPassword(password);
    const mandisList = Array.isArray(preferredMandis) && preferredMandis.length > 0
      ? preferredMandis
      : ['Kopargaon', 'Rahata', 'Yeola'];

    const cleanEmail = (email && typeof email === 'string' && email.trim()) ? email.trim() : null;

    const insertResult = await query(
      `INSERT INTO farmers (mobile, password_hash, name, location, land_size, primary_crop, preferred_mandis, email)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [normalizedPhone, passwordHash, name.trim(), (location && location.trim()) || 'कोपरगाव, अहिल्यानगर', (landSize && landSize.trim()) || '5 एकर', primaryCrop || 'Onion', mandisList, cleanEmail]
    );

    const newFarmer = insertResult.rows[0];
    const sanitized = sanitizeFarmer(newFarmer);
    const token = signToken(sanitized);
    setAuthCookie(res, token);

    return res.status(201).json({
      success: true,
      message: `अभिनंदन ${newFarmer.name}! तुमचे खाते यशस्वीरीत्या तयार झाले आहे.`,
      user: sanitized,
      token
    });
  } catch (error) {
    console.error('[Auth /signup Error]:', error);
    return res.status(500).json({ success: false, error: error.message || 'नोंदणी करताना त्रुटी आली.' });
  }
}

// 3. GET /api/auth/me
async function handleMe(req, res) {
  try {
    const token = getAuthTokenFromReq(req);
    if (!token) return res.status(200).json({ success: false, user: null });
    const payload = verifyToken(token);
    if (!payload || !payload.id) return res.status(200).json({ success: false, user: null });

    const result = await query('SELECT * FROM farmers WHERE id = $1 LIMIT 1', [payload.id]);
    if (!result.rows || result.rows.length === 0) return res.status(200).json({ success: false, user: null });

    return res.status(200).json({ success: true, user: sanitizeFarmer(result.rows[0]) });
  } catch (error) {
    return res.status(500).json({ success: false, user: null, error: error.message });
  }
}

// 4. POST /api/auth/logout
async function handleLogout(req, res) {
  try {
    clearAuthCookie(res);
    return res.status(200).json({ success: true, message: 'लॉगआउट यशस्वी झाले' });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

// 5. PUT /api/auth/profile
async function handleProfile(req, res) {
  try {
    const token = getAuthTokenFromReq(req);
    if (!token) return res.status(401).json({ success: false, error: 'अनधिकृत प्रवेश' });
    const payload = verifyToken(token);
    if (!payload || !payload.id) return res.status(401).json({ success: false, error: 'सत्र कालबाह्य झाले आहे' });

    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    const { name, location, landSize, primaryCrop, preferredMandis, email, mobile, phone } = body;

    const updates = [];
    const values = [];
    let paramIndex = 1;

    if (name && typeof name === 'string' && name.trim()) {
      updates.push(`name = $${paramIndex++}`);
      values.push(name.trim());
    }
    if (email !== undefined && typeof email === 'string') {
      updates.push(`email = $${paramIndex++}`);
      values.push(email.trim());
    }
    const rawMobile = mobile || phone;
    if (rawMobile) {
      const normPhone = normalizeMobile(rawMobile);
      if (normPhone) {
        updates.push(`mobile = $${paramIndex++}`);
        values.push(normPhone);
      }
    }
    if (location !== undefined && typeof location === 'string') {
      updates.push(`location = $${paramIndex++}`);
      values.push(location.trim());
    }
    if (landSize !== undefined && typeof landSize === 'string') {
      updates.push(`land_size = $${paramIndex++}`);
      values.push(landSize.trim());
    }
    if (primaryCrop !== undefined && typeof primaryCrop === 'string') {
      updates.push(`primary_crop = $${paramIndex++}`);
      values.push(primaryCrop.trim());
    }
    if (Array.isArray(preferredMandis)) {
      updates.push(`preferred_mandis = $${paramIndex++}`);
      values.push(preferredMandis);
    }

    if (updates.length === 0) {
      const current = await query('SELECT * FROM farmers WHERE id = $1 LIMIT 1', [payload.id]);
      return res.status(200).json({ success: true, user: sanitizeFarmer(current.rows[0]) });
    }

    updates.push('updated_at = now()');
    values.push(payload.id);

    const result = await query(`UPDATE farmers SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`, values);
    return res.status(200).json({ success: true, user: sanitizeFarmer(result.rows[0]) });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

// 6. POST /api/auth/change-password
async function handleChangePassword(req, res) {
  try {
    const token = getAuthTokenFromReq(req);
    if (!token) return res.status(401).json({ success: false, error: 'अनधिकृत प्रवेश' });
    const payload = verifyToken(token);
    if (!payload || !payload.id) return res.status(401).json({ success: false, error: 'सत्र कालबाह्य झाले आहे' });

    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    const { currentPassword, newPassword } = body;

    if (!currentPassword) return res.status(400).json({ success: false, error: 'कृपया चालू पासवर्ड टाका' });
    if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 6) {
      return res.status(400).json({ success: false, error: 'नवीन पासवर्ड किमान ६ अक्षरांचा असावा' });
    }

    const result = await query('SELECT * FROM farmers WHERE id = $1 LIMIT 1', [payload.id]);
    if (!result.rows || result.rows.length === 0) return res.status(404).json({ success: false, error: 'शेतकरी खाते आढळले नाही' });

    const farmer = result.rows[0];
    const isCurrentValid = await verifyPassword(currentPassword, farmer.password_hash);
    if (!isCurrentValid) return res.status(400).json({ success: false, error: 'सध्याचा जुना पासवर्ड चुकीचा आहे' });

    const newPasswordHash = await hashPassword(newPassword);
    await query('UPDATE farmers SET password_hash = $1, updated_at = now() WHERE id = $2', [newPasswordHash, payload.id]);

    return res.status(200).json({ success: true, message: 'पासवर्ड यशस्वीरित्या बदलला आहे!' });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
