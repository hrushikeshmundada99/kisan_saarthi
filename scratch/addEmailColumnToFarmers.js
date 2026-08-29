import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mlthjtespbgnfxxtyfpl.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1sdGhqdGVzcGJnbmZ4eHR5ZnBsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgwMDY2MjcsImV4cCI6MjEwMzU4MjYyN30.cXAFfj4cGbMat-ZXHo8vDfs2SwO90NgMDbW1mPrub0g';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSignupEmail() {
  console.log('--- Testing Farmer Signup with Email in Supabase ---');

  const testFarmer = {
    mobile: '9876543210',
    password_hash: 'hashedpassword123',
    name: 'Test Farmer',
    email: 'farmer.test.123@gmail.com',
    location: 'कोपरगाव',
    land_size: '5 एकर',
    primary_crop: 'Onion',
    preferred_mandis: ['Kopargaon', 'Rahata']
  };

  const { data, error } = await supabase
    .from('farmers')
    .insert([testFarmer])
    .select();

  if (error) {
    console.error('❌ Insert error:', error.message);
  } else {
    console.log('🎉 Successfully created farmer with email in Supabase!', data[0]);
  }
}

testSignupEmail();
