// POST /api/auth/change-password - Change password for authenticated farmer
import { query } from '../lib/db.js';
import {
  getAuthTokenFromReq,
  verifyToken,
  verifyPassword,
  hashPassword,
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
    // 1. Verify user authentication
    const token = getAuthTokenFromReq(req);
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'अनधिकृत प्रवेश. कृपया प्रथम लॉगिन करा. (Unauthorized. Please log in.)'
      });
    }

    const payload = verifyToken(token);
    if (!payload || !payload.id) {
      return res.status(401).json({
        success: false,
        error: 'सत्र कालबाह्य झाले आहे. कृपया पुन्हा लॉगिन करा. (Session expired.)'
      });
    }

    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    const { currentPassword, newPassword } = body;

    // 2. Validate inputs
    if (!currentPassword) {
      return res.status(400).json({
        success: false,
        error: 'कृपया सध्याचा चालू पासवर्ड प्रविष्ट करा (Current password is required)'
      });
    }

    if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'नवीन पासवर्ड किमान ६ अक्षरांचा असावा (New password must be at least 6 characters long)'
      });
    }

    // 3. Fetch current farmer record
    const result = await query('SELECT * FROM farmers WHERE id = $1 LIMIT 1', [payload.id]);
    if (!result.rows || result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'शेतकरी खाते आढळले नाही. (Farmer record not found)'
      });
    }

    const farmer = result.rows[0];

    // 4. Verify old password
    const isCurrentValid = await verifyPassword(currentPassword, farmer.password_hash);
    if (!isCurrentValid) {
      return res.status(400).json({
        success: false,
        error: 'सध्याचा जुना पासवर्ड चुकीचा आहे. कृपया तपासा. (Current password is incorrect.)'
      });
    }

    // 5. Hash new password & update in database
    const newPasswordHash = await hashPassword(newPassword);

    await query(
      'UPDATE farmers SET password_hash = $1, updated_at = now() WHERE id = $2',
      [newPasswordHash, payload.id]
    );

    return res.status(200).json({
      success: true,
      message: 'पासवर्ड यशस्वीरित्या बदलला आहे! (Password updated successfully)'
    });
  } catch (error) {
    console.error('[Change Password Error]:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'पासवर्ड बदलताना त्रुटी आली. (Internal server error changing password)'
    });
  }
}
