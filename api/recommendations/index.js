// Serverless API Endpoint: Log a Sell Timing Recommendation
// Method: POST /api/recommendations

import { query } from '../lib/db.js';
import { getAuthTokenFromReq, verifyToken, applyCorsHeaders } from '../lib/auth.js';

export default async function handler(req, res) {
  applyCorsHeaders(req, res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    const { crop, mandi, action, waitDays, expectedGainPct, confidence, predictedPrice, currentPrice } = body;

    if (!crop || !mandi || !action) {
      return res.status(400).json({
        success: false,
        error: 'Missing required recommendation fields (crop, mandi, action)'
      });
    }

    // Optional authenticated farmer ID from JWT
    let farmerId = null;
    const token = getAuthTokenFromReq(req);
    if (token) {
      const decoded = verifyToken(token);
      if (decoded && decoded.id) {
        farmerId = decoded.id;
      }
    }

    const insertSql = `
      INSERT INTO sell_recommendations (
        farmer_id, crop, mandi, action, wait_days, expected_gain_pct, confidence, predicted_price, current_price
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id, shown_at;
    `;

    const params = [
      farmerId,
      crop,
      mandi,
      action,
      waitDays !== undefined ? waitDays : null,
      expectedGainPct !== undefined ? expectedGainPct : null,
      confidence || 'High',
      predictedPrice !== undefined ? predictedPrice : null,
      currentPrice !== undefined ? currentPrice : null
    ];

    const result = await query(insertSql, params);
    const row = result.rows[0];

    return res.status(201).json({
      success: true,
      id: row.id,
      shownAt: row.shown_at
    });
  } catch (error) {
    console.error('[Create Recommendation Log Error]:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal Server Error while recording recommendation'
    });
  }
}
