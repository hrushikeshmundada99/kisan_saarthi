// POST /api/auth/signup - Register a new Farmer with unique mobile number + password
import { query } from '../lib/db.js';
import {
  normalizeMobile,
  hashPassword,
  signToken,
  setAuthCookie,
  sanitizeFarmer,
  applyCorsHeaders
} from '../lib/auth.js';

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
    const { password, name, location, landSize, primaryCrop, preferredMandis } = body;

    // 1. Validate Farmer Name
    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({
        success: false,
        error: 'कृपया आपले नाव प्रविष्ट करा (Farmer name is required)'
      });
    }

    // 2. Normalize and validate 10-digit Indian mobile number
    const normalizedPhone = normalizeMobile(rawMobile);
    if (!normalizedPhone) {
      return res.status(400).json({
        success: false,
        error: 'कृपया वैध १० अंकी मोबाईल नंबर टाका (Please enter a valid 10-digit Indian mobile number)'
      });
    }

    // 3. Validate password strength
    if (!password || typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'पासवर्ड किमान ६ अक्षरांचा असावा (Password must be at least 6 characters long)'
      });
    }

    // 4. Pre-check if mobile number is already registered
    const existingCheck = await query('SELECT id FROM farmers WHERE mobile = $1 LIMIT 1', [normalizedPhone]);
    if (existingCheck.rows && existingCheck.rows.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'हा मोबाईल नंबर आधीच नोंदणीकृत आहे. कृपया लॉगिन करा. (This mobile number is already registered. Please log in instead.)'
      });
    }

    // 5. Hash password with bcrypt
    const passwordHash = await hashPassword(password);

    // 6. Insert new farmer into database
    const mandisList = Array.isArray(preferredMandis) && preferredMandis.length > 0
      ? preferredMandis
      : ['Kopargaon', 'Rahata', 'Yeola'];

    let insertResult;
    try {
      insertResult = await query(
        `INSERT INTO farmers (
          mobile,
          password_hash,
          name,
          location,
          land_size,
          primary_crop,
          preferred_mandis
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *`,
        [
          normalizedPhone,
          passwordHash,
          name.trim(),
          (location && location.trim()) || 'कोपरगाव, अहिल्यानगर',
          (landSize && landSize.trim()) || '5 एकर',
          primaryCrop || 'Onion',
          mandisList
        ]
      );
    } catch (dbErr) {
      // Catch duplicate key race condition (PostgreSQL error code 23505)
      if (dbErr.code === '23505' || (dbErr.message && dbErr.message.includes('unique constraint'))) {
        return res.status(409).json({
          success: false,
          error: 'हा मोबाईल नंबर आधीच नोंदणीकृत आहे. कृपया लॉगिन करा. (This mobile number is already registered. Please log in instead.)'
        });
      }
      throw dbErr;
    }

    const createdFarmer = insertResult.rows[0];
    const sanitized = sanitizeFarmer(createdFarmer);

    // 7. Generate JWT token and set httpOnly cookie
    const token = signToken({
      id: createdFarmer.id,
      mobile: createdFarmer.mobile
    });

    setAuthCookie(res, token);

    return res.status(201).json({
      success: true,
      message: 'नोंदणी यशस्वी झाली! (Registration successful)',
      user: sanitized,
      token
    });
  } catch (error) {
    console.error('[Signup API Error]:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'नोंदणी करताना त्रुटी आली. कृपया पुन्हा प्रयत्न करा. (Internal server error during signup)'
    });
  }
}
