import handler from '../api/cron/check-alerts.js';

async function testCron() {
  console.log('--- Triggering Vercel Cron Auto-Trigger Engine ---');

  const req = { method: 'POST', body: {} };
  const res = {
    statusCode: 200,
    headers: {},
    setHeader(k, v) { this.headers[k] = v; },
    status(code) { this.statusCode = code; return this; },
    json(data) {
      console.log('Response Status:', this.statusCode);
      console.log('Response Data:', JSON.stringify(data, null, 2));
      return this;
    }
  };

  await handler(req, res);
}

testCron();
