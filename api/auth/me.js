// GET /api/auth/me - Restore authenticated farmer session from JWT cookie
import { query } from '../lib/db.js';
import {
  getAuthTokenFromReq,
  verifyToken,
  sanitizeFarmer,
  applyCorsHeaders
} from '../lib/auth.js';

export default async function handler(req, res) {
  applyCorsHeaders(req, res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed. Use GET.'
    });
  }

  try {
    const token = getAuthTokenFromReq(req);

    if (!token) {
      return res.status(200).json({
        success: false,
        user: null,
        message: 'No active session found'
      });
    }

    const payload = verifyToken(token);
    if (!payload || !payload.id) {
      return res.status(200).json({
        success: false,
        user: null,
        error: 'सत्र कालबाह्य झाले आहे. कृपया पुन्हा लॉगिन करा. (Session expired or invalid)'
      });
    }

    // Fetch latest profile from database
    const result = await query(
      'SELECT * FROM farmers WHERE id = $1 LIMIT 1',
      [payload.id]
    );

    if (!result.rows || result.rows.length === 0) {
      return res.status(200).json({
        success: false,
        user: null,
        error: 'शेतकरी खाते आढळले नाही. (Farmer record not found)'
      });
    }

    const farmer = result.rows[0];
    const sanitized = sanitizeFarmer(farmer);

    return res.status(200).json({
      success: true,
      user: sanitized
    });
  } catch (error) {
    console.error('[Auth /me Error]:', error);
    return res.status(500).json({
      success: false,
      user: null,
      error: error.message || 'सत्र तपासताना त्रुटी आली. (Internal server error checking session)'
    });
  }
}
