// Serverless API Proxy for CEDA Agmarknet API (Centre for Economic Data and Analysis - Ashoka University)
// Base URL: https://api.ceda.ashoka.edu.in/v1

import { applyCors } from './lib/cors.js';

const CEDA_BASE_URL = 'https://api.ceda.ashoka.edu.in/v1';

// Known CEDA Commodity IDs for Maharashtra Agri Markets
export const CEDA_COMMODITY_MAP = {
  Onion: 1,       // कांदा
  Soybean: 2,     // सोयाबीन
  Cotton: 3,      // कापूस
  Wheat: 4,       // गहू
  Tomato: 5,      // टोमॅटो
  Maize: 6,       // मका
  Gram: 7,        // हरभरा
  Sugarcane: 8,   // ऊस
  Pomegranate: 9, // डाळिंब
  Bajra: 10       // बाजरी
};

// Known CEDA Geography IDs for Kopargaon & neighboring region
export const CEDA_GEOGRAPHY_MAP = {
  MAHARASHTRA_STATE_ID: 8,
  AHMEDNAGAR_DISTRICT_ID: 104, // अहिल्यानगर / कोपरगाव, राहाता, श्रीरामपूर, संगमनेर
  NASHIK_DISTRICT_ID: 105      // नाशिक / येवला, लासलगाव, निफाड, सिन्नर
};

export default async function handler(req, res) {
  // CORS Headers
  applyCors(req, res, { allowAnyOrigin: true, methods: 'GET,POST,OPTIONS' });

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const action = req.query?.action || (typeof req.body === 'object' ? req.body?.action : null) || 'markets';
  const cedaApiKey = process.env.CEDA_API_KEY || '';

  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(cedaApiKey ? { Authorization: `Bearer ${cedaApiKey}` } : {})
  };

  try {
    // 1. Fetch Commodities: GET /agmarknet/commodities
    if (action === 'commodities') {
      const response = await fetch(`${CEDA_BASE_URL}/agmarknet/commodities`, {
        method: 'GET',
        headers
      });

      if (!response.ok) {
        throw new Error(`CEDA API responded with status ${response.status}`);
      }

      const data = await response.json();
      return res.status(200).json({ success: true, data });
    }

    // 2. Fetch Geographies: GET /agmarknet/geographies
    if (action === 'geographies') {
      const response = await fetch(`${CEDA_BASE_URL}/agmarknet/geographies`, {
        method: 'GET',
        headers
      });

      if (!response.ok) {
        throw new Error(`CEDA API responded with status ${response.status}`);
      }

      const data = await response.json();
      return res.status(200).json({ success: true, data });
    }

    // 3. Fetch Markets: POST /agmarknet/markets
    if (action === 'markets') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
      const commodityId = Number(body.commodity_id || req.query?.commodity_id || 1);
      const stateId = Number(body.state_id || req.query?.state_id || 8);
      const districtId = Number(body.district_id || req.query?.district_id || 104);
      const indicator = body.indicator || req.query?.indicator || 'price';

      const response = await fetch(`${CEDA_BASE_URL}/agmarknet/markets`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          commodity_id: commodityId,
          state_id: stateId,
          district_id: districtId,
          indicator
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.warn('[CEDA Markets Warning]:', response.status, errorText);
        return res.status(response.status).json({
          success: false,
          error: `CEDA API Error (${response.status}): ${errorText}`,
          fallback: true
        });
      }

      const data = await response.json();
      return res.status(200).json({ success: true, data });
    }

    // 4. Fetch Prices: POST /agmarknet/prices
    if (action === 'prices') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
      const commodityId = Number(body.commodity_id || 1);
      const stateId = Number(body.state_id || 8);
      const districtIds = Array.isArray(body.district_id) ? body.district_id : [104, 105];
      const fromDate = body.from_date || new Date(Date.now() - 14 * 86400000).toISOString().split('T')[0];
      const toDate = body.to_date || new Date().toISOString().split('T')[0];

      const payload = {
        commodity_id: commodityId,
        state_id: stateId,
        district_id: districtIds,
        from_date: fromDate,
        to_date: toDate,
        ...(Array.isArray(body.market_id) && body.market_id.length > 0 ? { market_id: body.market_id } : {})
      };

      const response = await fetch(`${CEDA_BASE_URL}/agmarknet/prices`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.warn('[CEDA Prices Warning]:', response.status, errorText);
        return res.status(response.status).json({
          success: false,
          error: `CEDA API Error (${response.status}): ${errorText}`,
          fallback: true
        });
      }

      const data = await response.json();
      return res.status(200).json({ success: true, data });
    }

    // 5. Fetch Quantities: POST /agmarknet/quantities
    if (action === 'quantities') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
      const commodityId = Number(body.commodity_id || 1);
      const stateId = Number(body.state_id || 8);
      const districtIds = Array.isArray(body.district_id) ? body.district_id : [104, 105];
      const fromDate = body.from_date || new Date(Date.now() - 14 * 86400000).toISOString().split('T')[0];
      const toDate = body.to_date || new Date().toISOString().split('T')[0];

      const payload = {
        commodity_id: commodityId,
        state_id: stateId,
        district_id: districtIds,
        from_date: fromDate,
        to_date: toDate
      };

      const response = await fetch(`${CEDA_BASE_URL}/agmarknet/quantities`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        return res.status(response.status).json({
          success: false,
          error: `CEDA API Error (${response.status}): ${errorText}`,
          fallback: true
        });
      }

      const data = await response.json();
      return res.status(200).json({ success: true, data });
    }

    return res.status(400).json({
      success: false,
      error: 'Invalid action. Supported: commodities, geographies, markets, prices, quantities'
    });
  } catch (error) {
    console.error('[CEDA API Handler Error]:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error while fetching CEDA Agmarknet data'
    });
  }
}
