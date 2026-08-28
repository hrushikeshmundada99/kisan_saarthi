// Vercel Serverless Function Proxy for Agmarknet (data.gov.in)
// Bypasses browser CORS restrictions on mobile and desktop

import { applyCors } from './lib/cors.js';
export default async function handler(req, res) {
  // Enable CORS
  applyCors(req, res, { allowAnyOrigin: true, methods: 'GET,OPTIONS' });

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Key resolution order: the farmer's own key (entered in the API Key modal),
  // then the server's key. There is deliberately no hardcoded fallback - a key
  // committed to the repository is public the moment the repo is cloned.
  const callerKey = typeof req.query['api-key'] === 'string' ? req.query['api-key'].trim() : '';
  const apiKey = callerKey || (process.env.DATA_GOV_IN_API_KEY || '').trim();
  const resourceId = '9ef84268-d588-465a-a308-a864a43d0070';
  const state = req.query['filters[state]'] || 'Maharashtra';
  const limit = req.query['limit'] || '1000';

  if (!apiKey) {
    // Degrade gracefully: the client falls back to its own dataset when records
    // are empty, so an unconfigured deployment still renders instead of erroring.
    return res.status(200).json({
      records: [],
      configured: false,
      error:
        'No data.gov.in API key available. Set DATA_GOV_IN_API_KEY on the server, or add your own key in the app.'
    });
  }

  const targetUrl = `https://api.data.gov.in/resource/${resourceId}?api-key=${encodeURIComponent(apiKey)}&format=json&limit=${limit}&filters[state]=${encodeURIComponent(state)}`;

  try {
    const response = await fetch(targetUrl);
    const text = await response.text();

    try {
      const data = JSON.parse(text);
      return res.status(response.status).json(data);
    } catch {
      // If response is XML or HTML, return a structured fallback response
      console.warn('Agmarknet returned non-JSON format:', text.substring(0, 100));
      return res.status(200).json({ records: [], format: 'xml_fallback' });
    }
  } catch (error) {
    return res.status(200).json({ records: [], error: error.message || 'Failed to fetch Agmarknet data' });
  }
}
