// Vercel Serverless Function to proxy the Fast2SMS gateway.
//
// The gateway API key lives ONLY on the server, in process.env.FAST2SMS_API_KEY.
// It is never sent to, stored in, or accepted from the browser: a key shipped in
// the client bundle can be extracted by any visitor and used to drain the SMS
// credits on this account.

const ALLOWED_ROUTES = ['q', 'v3', 'dlt'];
const MAX_MESSAGE_LENGTH = 918; // Fast2SMS caps unicode messages at 6 segments

function applyCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );
}

function getGatewayApiKey() {
  const key = (process.env.FAST2SMS_API_KEY || '').trim();
  return key || null;
}

/**
 * Accepts a single 10-digit Indian mobile number or a comma-separated list.
 * Returns the normalized "9822154321,9822154322" form, or null if any entry is invalid.
 */
function normalizeNumbers(raw) {
  if (!raw || typeof raw !== 'string') return null;

  const entries = raw
    .split(',')
    .map((n) => n.replace(/\D/g, ''))
    .map((n) => (n.length > 10 ? n.slice(-10) : n))
    .filter(Boolean);

  if (entries.length === 0 || entries.length > 10) return null;
  if (!entries.every((n) => /^[6-9]\d{9}$/.test(n))) return null;

  return entries.join(',');
}

export default async function handler(req, res) {
  applyCors(res);

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // GET is a configuration probe so the UI can tell the farmer whether the cloud
  // gateway is usable, without ever exposing the key itself.
  if (req.method === 'GET') {
    return res.status(200).json({ configured: !!getGatewayApiKey() });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      return: false,
      message: 'Method not allowed. Use POST to send an SMS.'
    });
  }

  const apiKey = getGatewayApiKey();
  if (!apiKey) {
    return res.status(503).json({
      return: false,
      configured: false,
      message:
        'SMS gateway is not configured on the server. Set FAST2SMS_API_KEY in the environment to enable cloud SMS delivery.'
    });
  }

  const body = req.body && typeof req.body === 'object' ? req.body : {};
  const { message, numbers, language = 'unicode', route = 'q' } = body;

  const normalizedNumbers = normalizeNumbers(numbers);
  if (!normalizedNumbers) {
    return res.status(400).json({
      return: false,
      message: 'A valid 10-digit Indian mobile number (or comma-separated list of up to 10) is required.'
    });
  }

  if (!message || typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({
      return: false,
      message: 'Message body is required.'
    });
  }

  if (message.length > MAX_MESSAGE_LENGTH) {
    return res.status(400).json({
      return: false,
      message: `Message exceeds the ${MAX_MESSAGE_LENGTH} character gateway limit.`
    });
  }

  const safeRoute = ALLOWED_ROUTES.includes(route) ? route : 'q';
  const safeLanguage = language === 'english' ? 'english' : 'unicode';

  try {
    const fast2smsUrl =
      'https://www.fast2sms.com/dev/bulkV2' +
      `?authorization=${encodeURIComponent(apiKey)}` +
      `&route=${encodeURIComponent(safeRoute)}` +
      `&message=${encodeURIComponent(message.trim())}` +
      `&language=${encodeURIComponent(safeLanguage)}` +
      '&flash=0' +
      `&numbers=${encodeURIComponent(normalizedNumbers)}`;

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
    return res.status(502).json({
      return: false,
      message: error?.message || 'Failed to dispatch SMS through Fast2SMS gateway'
    });
  }
}
