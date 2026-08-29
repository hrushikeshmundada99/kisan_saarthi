// Database connection manager targeting SUPABASE ONLY
// Eliminates local database file writing and routes all queries to Supabase.

import pg from 'pg';
import { createClient } from '@supabase/supabase-js';

const { Pool } = pg;

// Supabase URL & Public Key
const SUPABASE_URL =
  process.env.VITE_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  'https://mlthjtespbgnfxxtyfpl.supabase.co';

const SUPABASE_KEY =
  process.env.VITE_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1sdGhqdGVzcGJnbmZ4eHR5ZnBsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgwMDY2MjcsImV4cCI6MjEwMzU4MjYyN30.cXAFfj4cGbMat-ZXHo8vDfs2SwO90NgMDbW1mPrub0g';

// Official Supabase JS SDK Client
export const supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);

function getConnectionString() {
  return (
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    ''
  );
}

let pool = null;
let isPostgresAvailable = null;
let isTableInitialized = false;

/**
 * Main query function.
 * Attempts PostgreSQL pool connection first.
 * If direct pool connection is absent or restricted, executes directly against Supabase PostgREST API.
 */
export async function query(text, params = []) {
  const connectionString = getConnectionString();

  // 1. Try Direct PostgreSQL Connection if DATABASE_URL is available
  if (connectionString && connectionString.startsWith('postgres') && isPostgresAvailable !== false) {
    try {
      if (!pool) {
        const isHosted =
          connectionString.includes('supabase.co') ||
          connectionString.includes('neon.tech') ||
          connectionString.includes('vercel-storage.com') ||
          connectionString.includes('amazonaws.com') ||
          process.env.NODE_ENV === 'production';

        pool = new Pool({
          connectionString,
          ssl: isHosted ? { rejectUnauthorized: false } : false,
          max: 10,
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 5000
        });

        pool.on('error', (err) => {
          console.warn('[PostgreSQL Pool Note]:', err.message);
        });
      }

      if (!isTableInitialized) {
        await pool.query(`
          CREATE EXTENSION IF NOT EXISTS "pgcrypto";

          -- 1. Farmers table
          CREATE TABLE IF NOT EXISTS farmers (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            mobile VARCHAR(10) NOT NULL UNIQUE,
            password_hash TEXT NOT NULL,
            name TEXT NOT NULL,
            location TEXT DEFAULT 'कोपरगाव, अहिल्यानगर',
            land_size TEXT DEFAULT '5 एकर',
            primary_crop TEXT DEFAULT 'Onion',
            preferred_mandis TEXT[] DEFAULT ARRAY['Kopargaon', 'Rahata', 'Yeola']::TEXT[],
            created_at TIMESTAMPTZ DEFAULT now(),
            updated_at TIMESTAMPTZ DEFAULT now()
          );

          CREATE INDEX IF NOT EXISTS idx_farmers_mobile ON farmers (mobile);

          -- 2. Sell recommendations table
          CREATE TABLE IF NOT EXISTS sell_recommendations (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            farmer_id UUID REFERENCES farmers(id) ON DELETE SET NULL,
            crop TEXT NOT NULL,
            mandi TEXT NOT NULL,
            action TEXT NOT NULL,
            wait_days INT,
            expected_gain_pct NUMERIC,
            confidence TEXT,
            predicted_price NUMERIC,
            current_price NUMERIC,
            shown_at TIMESTAMPTZ DEFAULT now()
          );

          CREATE INDEX IF NOT EXISTS idx_sell_rec_crop_mandi ON sell_recommendations(crop, mandi);
          CREATE INDEX IF NOT EXISTS idx_sell_rec_shown_at ON sell_recommendations(shown_at);

          -- 3. Recommendation feedback table
          CREATE TABLE IF NOT EXISTS recommendation_feedback (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            recommendation_id UUID NOT NULL REFERENCES sell_recommendations(id) ON DELETE CASCADE,
            farmer_id UUID REFERENCES farmers(id) ON DELETE SET NULL,
            was_helpful BOOLEAN,
            followed_advice BOOLEAN,
            actual_sell_price NUMERIC,
            actual_sell_date DATE,
            feedback_note TEXT,
            submitted_at TIMESTAMPTZ DEFAULT now()
          );

          CREATE INDEX IF NOT EXISTS idx_rec_feedback_rec_id ON recommendation_feedback(recommendation_id);

          -- 4. Crop prices table
          CREATE TABLE IF NOT EXISTS crop_prices (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            crop TEXT NOT NULL,
            price NUMERIC NOT NULL,
            unit TEXT NOT NULL DEFAULT '₹/Quintal',
            region TEXT NOT NULL,
            source TEXT NOT NULL DEFAULT 'live',
            source_name TEXT DEFAULT 'Agmarknet',
            confidence TEXT DEFAULT 'high',
            last_updated TIMESTAMPTZ DEFAULT now(),
            UNIQUE (crop, region)
          );

          CREATE INDEX IF NOT EXISTS idx_crop_prices_crop_region ON crop_prices (crop, region);

          -- 5. Price Alerts Table
          CREATE TABLE IF NOT EXISTS price_alerts (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            farmer_id UUID REFERENCES farmers(id) ON DELETE CASCADE,
            farmer_email TEXT NOT NULL,
            crop TEXT NOT NULL,
            mandi TEXT NOT NULL,
            condition TEXT NOT NULL DEFAULT 'ABOVE',
            target_price NUMERIC NOT NULL,
            status TEXT NOT NULL DEFAULT 'ACTIVE',
            notification_methods TEXT[] DEFAULT ARRAY['Email', 'In-App']::TEXT[],
            created_at TIMESTAMPTZ DEFAULT now(),
            last_email_sent_at TIMESTAMPTZ
          );

          CREATE INDEX IF NOT EXISTS idx_price_alerts_email ON price_alerts(farmer_email);
          CREATE INDEX IF NOT EXISTS idx_price_alerts_status ON price_alerts(status);
        `);
        isTableInitialized = true;
      }

      const result = await pool.query(text, params);
      isPostgresAvailable = true;
      return result;
    } catch (pgErr) {
      console.warn('[PostgreSQL Connection Note - Routing to Supabase API]:', pgErr.message);
      isPostgresAvailable = false;
    }
  }

  // 2. Direct Supabase PostgREST API Query Engine (SUPABASE ONLY - NO LOCAL FILES)
  return executeSupabaseRestQuery(text, params);
}

/**
 * Execute query directly against Supabase PostgREST API using official Supabase client
 */
async function executeSupabaseRestQuery(sql, params = []) {
  const normalizedSql = sql.trim().toLowerCase();

  // ----------------------------------------------------
  // A. FARMERS TABLE (Supabase ONLY)
  // ----------------------------------------------------
  if (normalizedSql.includes('farmers')) {
    // 1. SELECT WHERE mobile = $1
    if (normalizedSql.includes('where mobile =') || normalizedSql.includes('where mobile=')) {
      const mobileParam = String(params[0]);
      const { data, error } = await supabaseClient
        .from('farmers')
        .select('*')
        .eq('mobile', mobileParam);

      if (error) {
        console.error('[Supabase Farmers Query Error]:', error);
        return { rows: [], rowCount: 0 };
      }
      return { rows: data || [], rowCount: data ? data.length : 0 };
    }

    // 2. SELECT WHERE id = $1
    if (normalizedSql.includes('where id =') || normalizedSql.includes('where id=')) {
      const idParam = String(params[0]);
      const { data, error } = await supabaseClient
        .from('farmers')
        .select('*')
        .eq('id', idParam);

      if (error) {
        console.error('[Supabase Farmers Query Error]:', error);
        return { rows: [], rowCount: 0 };
      }
      return { rows: data || [], rowCount: data ? data.length : 0 };
    }

    // 3. INSERT INTO farmers
    if (normalizedSql.startsWith('insert into farmers')) {
      const [mobile, passwordHash, name, location, landSize, primaryCrop, preferredMandis] = params;

      const newFarmerRecord = {
        mobile: String(mobile),
        password_hash: String(passwordHash),
        name: String(name),
        location: String(location || 'कोपरगाव, अहिल्यानगर'),
        land_size: String(landSize || '5 एकर'),
        primary_crop: String(primaryCrop || 'Onion'),
        preferred_mandis: Array.isArray(preferredMandis) ? preferredMandis : ['Kopargaon', 'Rahata', 'Yeola']
      };

      const { data, error } = await supabaseClient
        .from('farmers')
        .insert([newFarmerRecord])
        .select('*');

      if (error) {
        console.error('[Supabase Farmers Insert Error]:', error);
        if (error.code === '23505' || error.message?.includes('duplicate')) {
          const err = new Error(`duplicate key value violates unique constraint "farmers_mobile_key"`);
          err.code = '23505';
          throw err;
        }
        throw new Error(error.message || 'Supabase account creation failed.');
      }

      return { rows: data || [], rowCount: data ? data.length : 0 };
    }

    // 4. UPDATE farmers (password or profile)
    if (normalizedSql.startsWith('update farmers')) {
      const idParam = params[params.length - 1];
      let updates = { updated_at: new Date().toISOString() };

      if (normalizedSql.includes('password_hash = $1')) {
        updates.password_hash = params[0];
      }

      const { data, error } = await supabaseClient
        .from('farmers')
        .update(updates)
        .eq('id', idParam)
        .select('*');

      if (error) {
        console.error('[Supabase Farmers Update Error]:', error);
        return { rows: [], rowCount: 0 };
      }
      return { rows: data || [], rowCount: data ? data.length : 0 };
    }

    // Generic SELECT
    const { data } = await supabaseClient.from('farmers').select('*');
    return { rows: data || [], rowCount: data ? data.length : 0 };
  }

  // ----------------------------------------------------
  // B. PRICE ALERTS TABLE (Supabase ONLY)
  // ----------------------------------------------------
  if (normalizedSql.includes('price_alerts')) {
    // 1. SELECT WHERE farmer_email = $1
    if (normalizedSql.includes('where farmer_email =') || normalizedSql.includes('where farmer_email=')) {
      const emailParam = String(params[0]);
      const { data, error } = await supabaseClient
        .from('price_alerts')
        .select('*')
        .eq('farmer_email', emailParam)
        .order('created_at', { ascending: false });

      if (error) return { rows: [], rowCount: 0 };
      const formatted = (data || []).map((row) => ({
        id: row.id,
        crop: row.crop,
        mandi: row.mandi,
        condition: row.condition,
        targetPrice: row.target_price,
        status: row.status,
        farmerEmail: row.farmer_email,
        notificationMethods: row.notification_methods,
        createdAt: row.created_at
      }));
      return { rows: formatted, rowCount: formatted.length };
    }

    // 2. INSERT INTO price_alerts
    if (normalizedSql.startsWith('insert into price_alerts')) {
      const [crop, mandi, condition, targetPrice, farmerEmail, notificationMethods] = params;
      const { data, error } = await supabaseClient
        .from('price_alerts')
        .insert([
          {
            crop: String(crop),
            mandi: String(mandi),
            condition: String(condition),
            target_price: Number(targetPrice),
            farmer_email: String(farmerEmail),
            notification_methods: Array.isArray(notificationMethods) ? notificationMethods : ['Email', 'In-App'],
            status: 'ACTIVE'
          }
        ])
        .select('*');

      if (error) {
        console.error('[Supabase Price Alert Insert Error]:', error);
        throw error;
      }
      const row = data?.[0];
      const formatted = row
        ? {
            id: row.id,
            crop: row.crop,
            mandi: row.mandi,
            condition: row.condition,
            targetPrice: row.target_price,
            status: row.status,
            farmerEmail: row.farmer_email,
            notificationMethods: row.notification_methods,
            createdAt: row.created_at
          }
        : null;
      return { rows: formatted ? [formatted] : [], rowCount: formatted ? 1 : 0 };
    }

    // 3. UPDATE price_alerts SET status = $1 WHERE id = $2
    if (normalizedSql.startsWith('update price_alerts')) {
      const [status, id] = params;
      const { data } = await supabaseClient
        .from('price_alerts')
        .update({ status })
        .eq('id', id)
        .select('*');

      return { rows: data || [], rowCount: data ? data.length : 0 };
    }

    // 4. DELETE FROM price_alerts WHERE id = $1
    if (normalizedSql.startsWith('delete from price_alerts')) {
      const id = params[0];
      await supabaseClient.from('price_alerts').delete().eq('id', id);
      return { rows: [], rowCount: 1 };
    }

    const { data } = await supabaseClient.from('price_alerts').select('*');
    return { rows: data || [], rowCount: data ? data.length : 0 };
  }

  // ----------------------------------------------------
  // C. CROP PRICES TABLE (Supabase ONLY)
  // ----------------------------------------------------
  if (normalizedSql.includes('crop_prices')) {
    const { data } = await supabaseClient.from('crop_prices').select('*');
    return { rows: data || [], rowCount: data ? data.length : 0 };
  }

  // ----------------------------------------------------
  // D. SELL RECOMMENDATIONS TABLE (Supabase ONLY)
  // ----------------------------------------------------
  if (normalizedSql.includes('sell_recommendations')) {
    const { data } = await supabaseClient.from('sell_recommendations').select('*');
    return { rows: data || [], rowCount: data ? data.length : 0 };
  }

  return { rows: [], rowCount: 0 };
}
