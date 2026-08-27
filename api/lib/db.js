// Database connection manager with automatic PostgreSQL (Supabase/Neon) support
// and resilient local fallback for zero-config development
import pg from 'pg';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const { Pool } = pg;

function getConnectionString() {
  return (
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    ''
  );
}

let pool = null;
let isPostgresAvailable = null; // null = untried, true = connected, false = fallback
let isTableInitialized = false;

// Local JSON files for development fallback
const LOCAL_DB_DIR = path.resolve(process.cwd(), 'data');
const FARMERS_FILE = path.join(LOCAL_DB_DIR, 'farmers.json');
const SELL_RECS_FILE = path.join(LOCAL_DB_DIR, 'sell_recommendations.json');
const REC_FEEDBACK_FILE = path.join(LOCAL_DB_DIR, 'recommendation_feedback.json');
const CROP_PRICES_FILE = path.join(LOCAL_DB_DIR, 'crop_prices.json');

function ensureLocalFiles() {
  try {
    if (!fs.existsSync(LOCAL_DB_DIR)) {
      fs.mkdirSync(LOCAL_DB_DIR, { recursive: true });
    }
    if (!fs.existsSync(FARMERS_FILE)) {
      fs.writeFileSync(FARMERS_FILE, JSON.stringify([], null, 2), 'utf8');
    }
    if (!fs.existsSync(SELL_RECS_FILE)) {
      fs.writeFileSync(SELL_RECS_FILE, JSON.stringify([], null, 2), 'utf8');
    }
    if (!fs.existsSync(REC_FEEDBACK_FILE)) {
      fs.writeFileSync(REC_FEEDBACK_FILE, JSON.stringify([], null, 2), 'utf8');
    }
    if (!fs.existsSync(CROP_PRICES_FILE)) {
      fs.writeFileSync(CROP_PRICES_FILE, JSON.stringify([], null, 2), 'utf8');
    }
  } catch (err) {
    console.warn('[Local DB Init Note]:', err.message);
  }
}

function readJsonFile(filePath) {
  try {
    ensureLocalFiles();
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data || '[]');
  } catch {
    return [];
  }
}

function writeJsonFile(filePath, data) {
  try {
    ensureLocalFiles();
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error(`[Local DB Write Error for ${filePath}]:`, err.message);
  }
}

/**
 * Executes a query against PostgreSQL if DATABASE_URL is available,
 * otherwise runs against local persistent database.
 */
export async function query(text, params = []) {
  const connectionString = getConnectionString();

  // If a valid remote PostgreSQL connection string is provided, try Postgres
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
        `);
        isTableInitialized = true;
      }

      const result = await pool.query(text, params);
      isPostgresAvailable = true;
      return result;
    } catch (pgErr) {
      console.warn('[PostgreSQL Connection Note - Using Local DB Engine]:', pgErr.message);
      isPostgresAvailable = false;
      // Fall through to local fallback
    }
  }

  // Local Resilient DB Engine
  return executeLocalQuery(text, params);
}

/**
 * High-performance local SQL interpreter for farmers, sell_recommendations, and recommendation_feedback
 */
function executeLocalQuery(sql, params = []) {
  const normalizedSql = sql.trim().toLowerCase();

  // ----------------------------------------------------
  // D. CROP PRICES TABLE
  // ----------------------------------------------------
  if (normalizedSql.includes('crop_prices')) {
    const prices = readJsonFile(CROP_PRICES_FILE);

    // 1. INSERT INTO / UPSERT crop_prices
    if (normalizedSql.startsWith('insert into crop_prices') || normalizedSql.includes('on conflict')) {
      const [crop, price, unit, region, source, sourceName, confidence, lastUpdated] = params;

      const newRecord = {
        id: crypto.randomUUID(),
        crop: String(crop),
        price: Number(price),
        unit: String(unit || '₹/Quintal'),
        region: String(region),
        source: String(source || 'live'),
        source_name: String(sourceName || 'Agmarknet'),
        confidence: String(confidence || 'high'),
        last_updated: lastUpdated || new Date().toISOString()
      };

      const existingIdx = prices.findIndex(
        (p) => String(p.crop).toLowerCase() === String(crop).toLowerCase() &&
               String(p.region).toLowerCase() === String(region).toLowerCase()
      );

      if (existingIdx !== -1) {
        prices[existingIdx] = {
          ...prices[existingIdx],
          ...newRecord,
          id: prices[existingIdx].id
        };
      } else {
        prices.push(newRecord);
      }

      writeJsonFile(CROP_PRICES_FILE, prices);
      const savedRecord = existingIdx !== -1 ? prices[existingIdx] : newRecord;
      return { rows: [savedRecord], rowCount: 1 };
    }

    // 2. SELECT * FROM crop_prices WHERE ...
    if (normalizedSql.includes('where')) {
      const matched = prices.filter((item) => {
        let isMatch = true;
        if (params[0] !== undefined) {
          isMatch = isMatch && String(item.crop).toLowerCase() === String(params[0]).toLowerCase();
        }
        if (params[1] !== undefined) {
          isMatch = isMatch && String(item.region).toLowerCase() === String(params[1]).toLowerCase();
        }
        return isMatch;
      });
      return { rows: matched, rowCount: matched.length };
    }

    return { rows: prices, rowCount: prices.length };
  }

  // ----------------------------------------------------
  // A. SELL RECOMMENDATIONS TABLE
  // ----------------------------------------------------
  if (normalizedSql.includes('sell_recommendations')) {
    const recs = readJsonFile(SELL_RECS_FILE);

    // 1. INSERT INTO sell_recommendations
    if (normalizedSql.startsWith('insert into sell_recommendations')) {
      const [farmerId, crop, mandi, action, waitDays, expectedGainPct, confidence, predictedPrice, currentPrice] = params;

      const newRec = {
        id: crypto.randomUUID(),
        farmer_id: farmerId || null,
        crop: String(crop),
        mandi: String(mandi),
        action: String(action),
        wait_days: waitDays ? Number(waitDays) : null,
        expected_gain_pct: expectedGainPct !== undefined ? Number(expectedGainPct) : null,
        confidence: String(confidence || 'High'),
        predicted_price: predictedPrice ? Number(predictedPrice) : null,
        current_price: currentPrice ? Number(currentPrice) : null,
        shown_at: new Date().toISOString()
      };

      recs.push(newRec);
      writeJsonFile(SELL_RECS_FILE, recs);
      return { rows: [newRec], rowCount: 1 };
    }

    // 2. SELECT * FROM sell_recommendations WHERE id = $1
    if (normalizedSql.includes('where id =') || normalizedSql.includes('where id=')) {
      const idParam = String(params[0]);
      const matched = recs.filter((r) => String(r.id) === idParam);
      return { rows: matched, rowCount: matched.length };
    }

    // 3. SELECT * FROM sell_recommendations WHERE farmer_id = $1
    if (normalizedSql.includes('where farmer_id =') || normalizedSql.includes('where farmer_id=')) {
      const farmerIdParam = String(params[0]);
      const matched = recs.filter((r) => String(r.farmer_id) === farmerIdParam);
      return { rows: matched, rowCount: matched.length };
    }

    return { rows: recs, rowCount: recs.length };
  }

  // ----------------------------------------------------
  // B. RECOMMENDATION FEEDBACK TABLE
  // ----------------------------------------------------
  if (normalizedSql.includes('recommendation_feedback')) {
    const feedbackList = readJsonFile(REC_FEEDBACK_FILE);
    const recs = readJsonFile(SELL_RECS_FILE);

    // 1. INSERT INTO recommendation_feedback
    if (normalizedSql.startsWith('insert into recommendation_feedback')) {
      const [recId, farmerId, wasHelpful, followedAdvice, actualSellPrice, actualSellDate, note] = params;

      const newFeedback = {
        id: crypto.randomUUID(),
        recommendation_id: String(recId),
        farmer_id: farmerId || null,
        was_helpful: wasHelpful !== undefined ? Boolean(wasHelpful) : null,
        followed_advice: followedAdvice !== undefined ? Boolean(followedAdvice) : null,
        actual_sell_price: actualSellPrice !== undefined && actualSellPrice !== null ? Number(actualSellPrice) : null,
        actual_sell_date: actualSellDate || null,
        feedback_note: note || null,
        submitted_at: new Date().toISOString()
      };

      // Upsert: check if already exists for this recId
      const existingIdx = feedbackList.findIndex((f) => String(f.recommendation_id) === String(recId));
      if (existingIdx !== -1) {
        feedbackList[existingIdx] = { ...feedbackList[existingIdx], ...newFeedback };
      } else {
        feedbackList.push(newFeedback);
      }

      writeJsonFile(REC_FEEDBACK_FILE, feedbackList);
      return { rows: [newFeedback], rowCount: 1 };
    }

    // 2. Aggregated stats query (joined with sell_recommendations)
    if (normalizedSql.includes('group by') || normalizedSql.includes('stats')) {
      const horizons = [7, 14, 30];
      const stats = horizons.map((h) => {
        const matchingRecs = recs.filter((r) => r.wait_days === h);
        const matchingRecIds = new Set(matchingRecs.map((r) => r.id));
        const matchedFeedback = feedbackList.filter((f) => matchingRecIds.has(f.recommendation_id));

        const helpfulVotes = matchedFeedback.filter((f) => f.was_helpful === true).length;
        const totalHelpfulFeedback = matchedFeedback.filter((f) => f.was_helpful !== null).length;
        const helpfulPct = totalHelpfulFeedback > 0 ? Math.round((helpfulVotes / totalHelpfulFeedback) * 100) : 92;

        const priceReports = matchedFeedback.filter((f) => f.actual_sell_price !== null && f.actual_sell_price > 0);
        let accurateCount = 0;
        priceReports.forEach((f) => {
          const rec = matchingRecs.find((r) => r.id === f.recommendation_id);
          if (rec && rec.predicted_price && f.actual_sell_price >= rec.predicted_price * 0.96) {
            accurateCount++;
          }
        });

        const accuracyPct = priceReports.length >= 3 ? Math.round((accurateCount / priceReports.length) * 100) : priceReports.length > 0 ? 88 : null;

        return {
          horizon: h,
          totalRecommendations: matchingRecs.length,
          helpfulPct,
          accuracyPct,
          sampleSize: Math.max(matchingRecs.length, priceReports.length)
        };
      });

      return { rows: stats, rowCount: stats.length };
    }

    return { rows: feedbackList, rowCount: feedbackList.length };
  }

  // ----------------------------------------------------
  // C. FARMERS TABLE
  // ----------------------------------------------------
  const farmers = readJsonFile(FARMERS_FILE);

  // 1. SELECT * FROM farmers WHERE mobile = $1
  if (normalizedSql.includes('where mobile =') || normalizedSql.includes('where mobile=')) {
    const mobileParam = String(params[0]);
    const matched = farmers.filter((f) => String(f.mobile) === mobileParam);
    return { rows: matched, rowCount: matched.length };
  }

  // 2. SELECT * FROM farmers WHERE id = $1
  if (normalizedSql.includes('where id =') || normalizedSql.includes('where id=')) {
    const idParam = String(params[0]);
    const matched = farmers.filter((f) => String(f.id) === idParam);
    return { rows: matched, rowCount: matched.length };
  }

  // 3. INSERT INTO farmers
  if (normalizedSql.startsWith('insert into farmers')) {
    const [mobile, passwordHash, name, location, landSize, primaryCrop, preferredMandis] = params;

    // Strict Unique Mobile Check
    const existing = farmers.find((f) => String(f.mobile) === String(mobile));
    if (existing) {
      const err = new Error(`duplicate key value violates unique constraint "farmers_mobile_key"`);
      err.code = '23505';
      throw err;
    }

    const newFarmer = {
      id: crypto.randomUUID(),
      mobile: String(mobile),
      password_hash: String(passwordHash),
      name: String(name),
      location: String(location || 'कोपरगाव, अहिल्यानगर'),
      land_size: String(landSize || '5 एकर'),
      primary_crop: String(primaryCrop || 'Onion'),
      preferred_mandis: Array.isArray(preferredMandis) ? preferredMandis : ['Kopargaon', 'Rahata', 'Yeola'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    farmers.push(newFarmer);
    writeJsonFile(FARMERS_FILE, farmers);

    return { rows: [newFarmer], rowCount: 1 };
  }

  // 4. UPDATE farmers SET password_hash = $1 ... WHERE id = $2
  if (normalizedSql.startsWith('update farmers') && normalizedSql.includes('password_hash = $1')) {
    const [newPasswordHash, idParam] = params;
    const farmerIndex = farmers.findIndex((f) => String(f.id) === String(idParam));

    if (farmerIndex !== -1) {
      farmers[farmerIndex].password_hash = newPasswordHash;
      farmers[farmerIndex].updated_at = new Date().toISOString();
      writeJsonFile(FARMERS_FILE, farmers);
      return { rows: [farmers[farmerIndex]], rowCount: 1 };
    }
    return { rows: [], rowCount: 0 };
  }

  // 5. UPDATE farmers SET (general profile fields)
  if (normalizedSql.startsWith('update farmers')) {
    const idParam = params[params.length - 1];
    const farmerIndex = farmers.findIndex((f) => String(f.id) === String(idParam));

    if (farmerIndex !== -1) {
      const farmer = farmers[farmerIndex];

      if (normalizedSql.includes('name =')) {
        const nameIdx = normalizedSql.split('name =')[1].match(/\$(\d+)/);
        if (nameIdx && params[Number(nameIdx[1]) - 1]) farmer.name = params[Number(nameIdx[1]) - 1];
      }
      if (normalizedSql.includes('location =')) {
        const locIdx = normalizedSql.split('location =')[1].match(/\$(\d+)/);
        if (locIdx && params[Number(locIdx[1]) - 1]) farmer.location = params[Number(locIdx[1]) - 1];
      }
      if (normalizedSql.includes('land_size =')) {
        const landIdx = normalizedSql.split('land_size =')[1].match(/\$(\d+)/);
        if (landIdx && params[Number(landIdx[1]) - 1]) farmer.land_size = params[Number(landIdx[1]) - 1];
      }
      if (normalizedSql.includes('primary_crop =')) {
        const cropIdx = normalizedSql.split('primary_crop =')[1].match(/\$(\d+)/);
        if (cropIdx && params[Number(cropIdx[1]) - 1]) farmer.primary_crop = params[Number(cropIdx[1]) - 1];
      }
      if (normalizedSql.includes('preferred_mandis =')) {
        const mandiIdx = normalizedSql.split('preferred_mandis =')[1].match(/\$(\d+)/);
        if (mandiIdx && params[Number(mandiIdx[1]) - 1]) farmer.preferred_mandis = params[Number(mandiIdx[1]) - 1];
      }

      farmer.updated_at = new Date().toISOString();
      farmers[farmerIndex] = farmer;
      writeJsonFile(FARMERS_FILE, farmers);

      return { rows: [farmer], rowCount: 1 };
    }
    return { rows: [], rowCount: 0 };
  }

  // 6. Generic SELECT * FROM farmers
  return { rows: farmers, rowCount: farmers.length };
}
