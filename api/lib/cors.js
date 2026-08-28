// Shared CORS policy for all Kisan Saarthi serverless functions.
//
// The previous per-route headers combined `Access-Control-Allow-Credentials: true`
// with either `Access-Control-Allow-Origin: *` (which browsers reject outright)
// or a reflected `req.headers.origin` (which trusts EVERY site on the internet
// with credentialed access to the auth endpoints). Neither is a policy.
//
// The rules here:
//   - Credentialed routes (anything touching the auth cookie) echo the request
//     origin only when it is same-origin or explicitly allowlisted. Never `*`.
//   - Public read-only data routes may use `*`, but must NOT send credentials.
//   - Money/action routes (SMS, email) are allowlist-only, without credentials,
//     so another site cannot trigger them from a visitor's browser.
//
// Configure extra origins with ALLOWED_ORIGINS (comma-separated, scheme included):
//   ALLOWED_ORIGINS=https://kisansaarthi.com,https://www.kisansaarthi.com

const LOCAL_DEV_ORIGINS = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:4173',
  'http://127.0.0.1:4173',
  'http://localhost:3000',
  'http://127.0.0.1:3000'
];

const DEFAULT_ALLOWED_HEADERS = 'Accept, Content-Type, X-Requested-With, Authorization';

function isProductionRuntime() {
  return process.env.NODE_ENV === 'production' || !!process.env.VERCEL;
}

function normalizeOrigin(value) {
  return String(value || '').trim().replace(/\/+$/, '');
}

/**
 * Origins explicitly trusted for credentialed / action requests.
 * Vercel injects its deployment hosts without a scheme, so they are prefixed here.
 */
export function getAllowedOrigins() {
  const allowed = new Set();

  for (const entry of (process.env.ALLOWED_ORIGINS || '').split(',')) {
    const origin = normalizeOrigin(entry);
    if (origin) allowed.add(origin);
  }

  for (const host of [
    process.env.VERCEL_PROJECT_PRODUCTION_URL,
    process.env.VERCEL_URL,
    process.env.VERCEL_BRANCH_URL
  ]) {
    if (host) allowed.add(`https://${normalizeOrigin(host).replace(/^https?:\/\//, '')}`);
  }

  if (!isProductionRuntime()) {
    for (const origin of LOCAL_DEV_ORIGINS) allowed.add(origin);
  }

  return allowed;
}

/**
 * True when the Origin header points at the same host serving the request.
 * Browsers do not enforce CORS on same-origin requests, but sending correct
 * headers keeps custom domains working without any extra configuration.
 */
function isSameOrigin(req, origin) {
  const host = req.headers?.host;
  if (!host || !origin) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export function isOriginAllowed(req, origin) {
  if (!origin) return false;
  if (isSameOrigin(req, origin)) return true;
  return getAllowedOrigins().has(normalizeOrigin(origin));
}

/**
 * @param {object} req
 * @param {object} res
 * @param {object} [options]
 * @param {boolean} [options.credentials] Route reads or sets the auth cookie.
 * @param {boolean} [options.allowAnyOrigin] Route serves public data with no credentials.
 * @param {string}  [options.methods]
 */
export function applyCors(req, res, options = {}) {
  const { credentials = false, allowAnyOrigin = false, methods = 'GET,POST,OPTIONS' } = options;

  res.setHeader('Access-Control-Allow-Methods', methods);
  res.setHeader('Access-Control-Allow-Headers', DEFAULT_ALLOWED_HEADERS);
  res.setHeader('Access-Control-Max-Age', '600');

  // Public data: a wildcard is safe precisely because no credentials are sent.
  if (allowAnyOrigin && !credentials) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    return;
  }

  // The response now depends on the Origin header, so caches must key on it.
  res.setHeader('Vary', 'Origin');

  const origin = req.headers?.origin;

  // No Origin means a same-origin navigation or a non-browser client; CORS
  // headers are irrelevant and adding them would only widen the surface.
  if (!origin) return;

  if (!isOriginAllowed(req, origin)) {
    // Deliberately no Allow-Origin header: the browser blocks the response.
    return;
  }

  res.setHeader('Access-Control-Allow-Origin', origin);
  if (credentials) {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
}
