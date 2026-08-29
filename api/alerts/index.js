// Vercel Serverless API Endpoint for Price Alerts (Supabase / PostgreSQL)
// GET: Fetch farmer price alerts by email
// POST: Create a new price alert in Supabase
// PATCH: Toggle price alert status (ACTIVE vs DISABLED)
// DELETE: Remove a price alert

import { query } from '../_lib/db.js';

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, authorization'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // ----------------------------------------------------
    // GET: Fetch alerts for a given farmer email
    // ----------------------------------------------------
    if (req.method === 'GET') {
      const email = req.query.email;
      if (!email) {
        const allAlerts = await query(
          `SELECT id, crop, mandi, condition, target_price as "targetPrice", status, farmer_email as "farmerEmail", notification_methods as "notificationMethods", created_at as "createdAt" FROM price_alerts ORDER BY created_at DESC LIMIT 50`
        );
        return res.status(200).json({ success: true, alerts: allAlerts.rows });
      }

      const result = await query(
        `SELECT id, crop, mandi, condition, target_price as "targetPrice", status, farmer_email as "farmerEmail", notification_methods as "notificationMethods", created_at as "createdAt" FROM price_alerts WHERE farmer_email = $1 ORDER BY created_at DESC`,
        [String(email).trim()]
      );

      return res.status(200).json({
        success: true,
        alerts: result.rows
      });
    }

    // ----------------------------------------------------
    // POST: Create new alert in Supabase
    // ----------------------------------------------------
    if (req.method === 'POST') {
      const {
        crop,
        mandi = 'Kopargaon',
        condition = 'ABOVE',
        targetPrice,
        farmerEmail,
        notificationMethods = ['Email', 'In-App']
      } = req.body || {};

      if (!crop || !targetPrice || !farmerEmail) {
        return res.status(400).json({
          success: false,
          error: 'Please provide crop, targetPrice, and farmerEmail.'
        });
      }

      const cleanEmail = String(farmerEmail).trim();
      const numTargetPrice = Number(targetPrice);

      const insertResult = await query(
        `INSERT INTO price_alerts (crop, mandi, condition, target_price, farmer_email, notification_methods, status)
         VALUES ($1, $2, $3, $4, $5, $6, 'ACTIVE')
         RETURNING id, crop, mandi, condition, target_price as "targetPrice", status, farmer_email as "farmerEmail", notification_methods as "notificationMethods", created_at as "createdAt"`,
        [crop, mandi, condition, numTargetPrice, cleanEmail, notificationMethods]
      );

      const createdAlert = insertResult.rows[0] || {
        id: `alt-${Date.now()}`,
        crop,
        mandi,
        condition,
        targetPrice: numTargetPrice,
        farmerEmail: cleanEmail,
        status: 'ACTIVE',
        createdAt: new Date().toISOString()
      };

      return res.status(201).json({
        success: true,
        message: `Alert stored in Supabase for ${cleanEmail}!`,
        alert: createdAlert
      });
    }

    // ----------------------------------------------------
    // PATCH: Toggle alert status (ACTIVE <-> DISABLED)
    // ----------------------------------------------------
    if (req.method === 'PATCH') {
      const { id, status } = req.body || {};
      if (!id || !status) {
        return res.status(400).json({ success: false, error: 'Missing alert id or status.' });
      }

      const updateResult = await query(
        `UPDATE price_alerts SET status = $1 WHERE id = $2 RETURNING id, status`,
        [status, id]
      );

      return res.status(200).json({
        success: true,
        alert: updateResult.rows[0]
      });
    }

    // ----------------------------------------------------
    // DELETE: Delete alert
    // ----------------------------------------------------
    if (req.method === 'DELETE') {
      const id = req.query.id || req.body?.id;
      if (!id) {
        return res.status(400).json({ success: false, error: 'Missing alert id.' });
      }

      await query(`DELETE FROM price_alerts WHERE id = $1`, [id]);

      return res.status(200).json({
        success: true,
        message: 'Alert deleted from Supabase.'
      });
    }

    return res.status(405).json({ success: false, error: 'Method not allowed.' });
  } catch (err) {
    console.error('[Price Alerts API Error]:', err);
    return res.status(500).json({
      success: false,
      error: err?.message || 'Failed to process price alert in Supabase.'
    });
  }
}
