// Serverless API Endpoint: Record Farmer Feedback on a Recommendation
// Method: POST /api/recommendations/feedback

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
    const recommendationId = body.recommendation_id || body.recommendationId || req.query?.id;

    if (!recommendationId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required recommendation_id'
      });
    }

    const {
      was_helpful,
      wasHelpful,
      followed_advice,
      followedAdvice,
      actual_sell_price,
      actualSellPrice,
      actual_sell_date,
      actualSellDate,
      feedback_note,
      feedbackNote
    } = body;

    const isHelpful = was_helpful !== undefined ? was_helpful : wasHelpful;
    const didFollow = followed_advice !== undefined ? followed_advice : followedAdvice;
    const price = actual_sell_price !== undefined ? actual_sell_price : actualSellPrice;
    const date = actual_sell_date || actualSellDate || null;
    const note = feedback_note || feedbackNote || null;

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
      INSERT INTO recommendation_feedback (
        recommendation_id, farmer_id, was_helpful, followed_advice, actual_sell_price, actual_sell_date, feedback_note
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, submitted_at;
    `;

    const params = [
      recommendationId,
      farmerId,
      isHelpful !== undefined ? isHelpful : null,
      didFollow !== undefined ? didFollow : null,
      price !== undefined && price !== null ? Number(price) : null,
      date,
      note
    ];

    const result = await query(insertSql, params);
    const row = result.rows[0];

    return res.status(200).json({
      success: true,
      message: 'शेतकरी प्रतिक्रिया यशस्वीरित्या नोंदवली गेली! (Feedback recorded successfully)',
      id: row.id,
      submittedAt: row.submitted_at
    });
  } catch (error) {
    console.error('[Feedback Submission Error]:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal Server Error while saving feedback'
    });
  }
}
