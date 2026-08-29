import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mlthjtespbgnfxxtyfpl.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1sdGhqdGVzcGJnbmZ4eHR5ZnBsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgwMDY2MjcsImV4cCI6MjEwMzU4MjYyN30.cXAFfj4cGbMat-ZXHo8vDfs2SwO90NgMDbW1mPrub0g';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function purgeSampleAlerts() {
  console.log('🧹 Purging sample default alerts from Supabase price_alerts table...');

  // 1. Delete alerts for sushantsondkar2@gmail.com
  const { data: d1, error: e1 } = await supabase
    .from('price_alerts')
    .delete()
    .ilike('farmer_email', '%sushantsondkar2%')
    .select();

  console.log(`Deleted ${d1?.length || 0} alerts for sushantsondkar2.`);
  if (e1) console.error('Error d1:', e1.message);

  // 2. Delete alerts with target_price = 2100 and crop = Onion and mandi = Lasalgaon
  const { data: d2, error: e2 } = await supabase
    .from('price_alerts')
    .delete()
    .eq('crop', 'Onion')
    .eq('mandi', 'Lasalgaon')
    .eq('target_price', 2100)
    .select();

  console.log(`Deleted ${d2?.length || 0} sample Onion Lasalgaon 2100 alerts.`);
  if (e2) console.error('Error d2:', e2.message);

  // 3. Delete all remaining alerts if any
  const { data: d3, error: e3 } = await supabase
    .from('price_alerts')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000')
    .select();

  console.log(`Deleted all remaining ${d3?.length || 0} alerts from price_alerts table.`);
  if (e3) console.error('Error d3:', e3.message);

  console.log('✅ Supabase price_alerts table is now 100% empty!');
}

purgeSampleAlerts();
