import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mlthjtespbgnfxxtyfpl.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1sdGhqdGVzcGJnbmZ4eHR5ZnBsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgwMDY2MjcsImV4cCI6MjEwMzU4MjYyN30.cXAFfj4cGbMat-ZXHo8vDfs2SwO90NgMDbW1mPrub0g';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function verifyRows() {
  const { data, error } = await supabase
    .from('price_alerts')
    .select('*')
    .eq('farmer_email', 'test.farmer@gmail.com');

  if (error) {
    console.error('Error:', error);
  } else {
    console.log('✅ Retrieved stored alerts from Supabase:', data);
  }
}

verifyRows();
