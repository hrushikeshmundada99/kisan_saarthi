import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mlthjtespbgnfxxtyfpl.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1sdGhqdGVzcGJnbmZ4eHR5ZnBsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgwMDY2MjcsImV4cCI6MjEwMzU4MjYyN30.cXAFfj4cGbMat-ZXHo8vDfs2SwO90NgMDbW1mPrub0g';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function clearSupabaseDb() {
  console.log('--- Clearing Farmers and Price Alerts in Supabase ---');

  // Delete all rows from price_alerts
  const { error: alertsErr } = await supabase
    .from('price_alerts')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');

  if (alertsErr) {
    console.log('Note on price_alerts clear:', alertsErr.message);
  } else {
    console.log('✅ Cleared all rows from price_alerts in Supabase!');
  }

  // Delete all rows from farmers
  const { error: farmersErr } = await supabase
    .from('farmers')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');

  if (farmersErr) {
    console.log('Note on farmers clear:', farmersErr.message);
  } else {
    console.log('✅ Cleared all previous farmer account credentials in Supabase!');
  }
}

clearSupabaseDb();
