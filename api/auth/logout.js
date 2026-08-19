// POST /api/auth/logout - Clear auth cookie and terminate session
import { clearAuthCookie, applyCorsHeaders } from '../lib/auth.js';

export default async function handler(req, res) {
  applyCorsHeaders(req, res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    clearAuthCookie(res);

    return res.status(200).json({
      success: true,
      message: 'लॉगआउट यशस्वी झाले (Logged out successfully)'
    });
  } catch (error) {
    console.error('[Logout API Error]:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to logout'
    });
  }
}
