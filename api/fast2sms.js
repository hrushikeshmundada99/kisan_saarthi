// Vercel Serverless Function to proxy Fast2SMS API securely without CORS issues

export default async function handler(req, res) {
  // Set CORS headers
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

  const { authorization, message, numbers, language = 'unicode', route = 'q' } = req.body || req.query || {};

  const apiKey =
    authorization ||
    req.headers['authorization'] ||
    process.env.FAST2SMS_API_KEY ||
    'kBe7PjfdGw5si89uMnyWq4LCAcFKlm0pYRX2hSvaOHoUJZVQtbsV8xvhO3o2a6fHizR497PEXBFWbAkU';

  if (!apiKey || !numbers || !message) {
    return res.status(400).json({
      return: false,
      message: 'Missing apiKey, numbers, or message'
    });
  }

  try {
    const fast2smsUrl = `https://www.fast2sms.com/dev/bulkV2?authorization=${encodeURIComponent(
      apiKey
    )}&route=${encodeURIComponent(route)}&message=${encodeURIComponent(
      message
    )}&language=${encodeURIComponent(language)}&flash=0&numbers=${encodeURIComponent(numbers)}`;

    const response = await fetch(fast2smsUrl, {
      method: 'GET',
      headers: {
        'cache-control': 'no-cache'
      }
    });

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('Fast2SMS Proxy Error:', error);
    return res.status(500).json({
      return: false,
      message: error?.message || 'Failed to dispatch SMS through Fast2SMS gateway'
    });
  }
}
