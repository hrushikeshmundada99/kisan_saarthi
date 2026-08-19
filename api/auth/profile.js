// PUT /api/auth/profile - Update authenticated farmer's profile information
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

  if (req.method !== 'PUT' && req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed. Use PUT.'
    });
  }

  try {
    // 1. Verify authentication
    const token = getAuthTokenFromReq(req);
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'अनधिकृत प्रवेश. कृपया लॉगिन करा. (Unauthorized. Please log in first.)'
      });
    }

    const payload = verifyToken(token);
    if (!payload || !payload.id) {
      return res.status(401).json({
        success: false,
        error: 'सत्र कालबाह्य झाले आहे. कृपया पुन्हा लॉगिन करा. (Session expired or invalid)'
      });
    }

    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    const { name, location, landSize, primaryCrop, preferredMandis } = body;

    // 2. Build dynamic update query safely
    const updates = [];
    const values = [];
    let paramIndex = 1;

    if (name && typeof name === 'string' && name.trim()) {
      updates.push(`name = $${paramIndex++}`);
      values.push(name.trim());
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
      // Nothing to update, return current profile
      const current = await query('SELECT * FROM farmers WHERE id = $1 LIMIT 1', [payload.id]);
      return res.status(200).json({
        success: true,
        user: sanitizeFarmer(current.rows[0])
      });
    }

    updates.push('updated_at = now()');
    values.push(payload.id);

    const updateQuery = `
      UPDATE farmers
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await query(updateQuery, values);

    if (!result.rows || result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'शेतकरी खाते आढळले नाही. (Farmer record not found)'
      });
    }

    const updatedFarmer = result.rows[0];

    return res.status(200).json({
      success: true,
      message: 'प्रोफाईल यशस्वीरित्या अपडेट केली! (Profile updated successfully)',
      user: sanitizeFarmer(updatedFarmer)
    });
  } catch (error) {
    console.error('[Profile API Error]:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'प्रोफाईल अपडेट करताना त्रुटी आली. (Internal server error updating profile)'
    });
  }
}
