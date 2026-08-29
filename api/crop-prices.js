// Vercel Serverless Function / HTTP API Route for Crop Prices
// Invokes AI-Powered Google Search Grounded Fallback when DB data is missing or stale.

import { getCropPrice } from './_services/cropPriceFallbackService.js';

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const crop = req.query.crop || req.query.commodity || 'Onion';
  const region = req.query.region || req.query.mandi || 'Kopargaon';
  const forceRefresh = req.query.refresh === 'true' || req.query.refresh === '1';

  try {
    const result = await getCropPrice({ crop, region, forceRefresh });

    if (result.error && !result.price) {
      return res.status(200).json({
        success: false,
        crop,
        region,
        error: result.error,
        message: result.message || 'Price data currently unavailable.'
      });
    }

    return res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error(`[api/crop-prices] Request handler error for ${crop}/${region}:`, error);
    return res.status(200).json({
      success: false,
      crop,
      region,
      error: 'server_error',
      message: error.message || 'An unexpected error occurred while fetching crop price.'
    });
  }
}
