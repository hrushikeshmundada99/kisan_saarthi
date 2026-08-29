import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabaseUrl = 'https://mlthjtespbgnfxxtyfpl.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1sdGhqdGVzcGJnbmZ4eHR5ZnBsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgwMDY2MjcsImV4cCI6MjEwMzU4MjYyN30.cXAFfj4cGbMat-ZXHo8vDfs2SwO90NgMDbW1mPrub0g';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function wipeAllStorage() {
  console.log('🧹 [Cleanup Task]: Deleting all credentials & records from Supabase...');

  // 1. Delete all price alerts from Supabase
  const { error: alertErr } = await supabase.from('price_alerts').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (alertErr) {
    console.warn('[Supabase Alerts Wipe Note]:', alertErr.message);
  } else {
    console.log('✅ Cleared all rows from Supabase `price_alerts` table.');
  }

  // 2. Delete all recommendation feedback from Supabase
  const { error: feedErr } = await supabase.from('recommendation_feedback').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (feedErr) {
    console.warn('[Supabase Feedback Wipe Note]:', feedErr.message);
  } else {
    console.log('✅ Cleared all rows from Supabase `recommendation_feedback` table.');
  }

  // 3. Delete all sell recommendations from Supabase
  const { error: recErr } = await supabase.from('sell_recommendations').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (recErr) {
    console.warn('[Supabase Recommendations Wipe Note]:', recErr.message);
  } else {
    console.log('✅ Cleared all rows from Supabase `sell_recommendations` table.');
  }

  // 4. Delete all farmers from Supabase
  const { error: farmerErr } = await supabase.from('farmers').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (farmerErr) {
    console.warn('[Supabase Farmers Wipe Note]:', farmerErr.message);
  } else {
    console.log('✅ Cleared all rows from Supabase `farmers` table.');
  }

  // 5. Clear local data/farmers.json file
  try {
    const farmersPath = path.resolve('data/farmers.json');
    if (fs.existsSync(farmersPath)) {
      fs.writeFileSync(farmersPath, '[]', 'utf8');
      console.log('✅ Cleared `data/farmers.json` local file.');
    }
  } catch (err) {
    console.warn('[Local Farmers File Clean Note]:', err.message);
  }

  console.log('🎉 ALL STORAGE WIPED CLEAN!');
}

wipeAllStorage();
