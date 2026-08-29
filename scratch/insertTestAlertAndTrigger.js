import { createClient } from '@supabase/supabase-js';
import handler from '../api/cron/check-alerts.js';

const supabaseUrl = 'https://mlthjtespbgnfxxtyfpl.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1sdGhqdGVzcGJnbmZ4eHR5ZnBsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgwMDY2MjcsImV4cCI6MjEwMzU4MjYyN30.cXAFfj4cGbMat-ZXHo8vDfs2SwO90NgMDbW1mPrub0g';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testWithAlert() {
  console.log('--- Step 1: Inserting Test Price Alert into Supabase ---');

  const testAlert = {
    farmer_email: 'khushalchaudhari190506@gmail.com',
    crop: 'Wheat',
    mandi: 'Rahata',
    condition: 'ABOVE',
    target_price: 1550,
    status: 'ACTIVE',
    notification_methods: ['Email', 'In-App']
  };

  const { data, error } = await supabase
    .from('price_alerts')
    .insert([testAlert])
    .select();

  if (error) {
    console.error('❌ Insert Error:', error.message);
    return;
  }

  console.log('🎉 Successfully created test alert in Supabase:', data[0]);

  console.log('\n--- Step 2: Triggering Vercel Cron Auto-Trigger Engine ---');

  const req = { method: 'POST', body: {} };
  const res = {
    statusCode: 200,
    headers: {},
    setHeader(k, v) { this.headers[k] = v; },
    status(code) { this.statusCode = code; return this; },
    json(responseData) {
      console.log('Response Status:', this.statusCode);
      console.log('Response Data:', JSON.stringify(responseData, null, 2));
      return this;
    }
  };

  await handler(req, res);
}

testWithAlert();
