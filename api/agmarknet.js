// Vercel Serverless Function Proxy for Agmarknet (data.gov.in)
// Bypasses browser CORS restrictions on mobile and desktop
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const apiKey = req.query['api-key'] || process.env.DATA_GOV_IN_API_KEY || '579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b';
  const resourceId = '9ef84268-d588-465a-a308-a864a43d0070';
  const state = req.query['filters[state]'] || 'Maharashtra';
  const limit = req.query['limit'] || '1000';

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
