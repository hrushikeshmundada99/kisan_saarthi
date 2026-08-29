import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mlthjtespbgnfxxtyfpl.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1sdGhqdGVzcGJnbmZ4eHR5ZnBsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgwMDY2MjcsImV4cCI6MjEwMzU4MjYyN30.cXAFfj4cGbMat-ZXHo8vDfs2SwO90NgMDbW1mPrub0g';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSupabase() {
  console.log('--- Testing Supabase Connection & Tables ---');
  
  // 1. Test price_alerts table
  const { data: alerts, error: alertsErr } = await supabase
    .from('price_alerts')
    .select('*')
    .limit(5);

  if (alertsErr) {
    console.log('❌ price_alerts query error:', alertsErr.message);
  } else {
    console.log('✅ price_alerts table exists! Row count:', alerts.length);
  }

  // 2. Test farmers table
  const { data: farmers, error: farmersErr } = await supabase
    .from('farmers')
    .select('*')
    .limit(5);

  if (farmersErr) {
    console.log('❌ farmers query error:', farmersErr.message);
  } else {
    console.log('✅ farmers table exists! Row count:', farmers.length);
  }

  // 3. Test insert into price_alerts
  const testAlert = {
    crop: 'Onion',
    mandi: 'Kopargaon',
    condition: 'ABOVE',
    target_price: 4500,
    farmer_email: 'test.farmer@gmail.com',
    status: 'ACTIVE'
  };

  const { data: inserted, error: insertErr } = await supabase
    .from('price_alerts')
    .insert([testAlert])
    .select();

  if (insertErr) {
    console.log('❌ Insert test alert failed:', insertErr.message);
  } else {
    console.log('🎉 Successfully inserted test alert into Supabase!', inserted);
  }
}

testSupabase();
