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

// Local JSON file path for development fallback
const LOCAL_DB_DIR = path.resolve(process.cwd(), 'data');
const LOCAL_DB_FILE = path.join(LOCAL_DB_DIR, 'farmers.json');

function ensureLocalDbFile() {
  try {
    if (!fs.existsSync(LOCAL_DB_DIR)) {
      fs.mkdirSync(LOCAL_DB_DIR, { recursive: true });
    }
    if (!fs.existsSync(LOCAL_DB_FILE)) {
      fs.writeFileSync(LOCAL_DB_FILE, JSON.stringify([], null, 2), 'utf8');
    }
  } catch (err) {
    console.warn('[Local DB Init Note]:', err.message);
  }
}

function readLocalFarmers() {
  try {
    ensureLocalDbFile();
    const data = fs.readFileSync(LOCAL_DB_FILE, 'utf8');
    return JSON.parse(data || '[]');
  } catch {
    return [];
  }
}

function writeLocalFarmers(farmers) {
  try {
    ensureLocalDbFile();
    fs.writeFileSync(LOCAL_DB_FILE, JSON.stringify(farmers, null, 2), 'utf8');
  } catch (err) {
    console.error('[Local DB Write Error]:', err.message);
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
 * High-performance local SQL interpreter for farmers table
 */
function executeLocalQuery(sql, params = []) {
  const normalizedSql = sql.trim().toLowerCase();
  const farmers = readLocalFarmers();

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
    writeLocalFarmers(farmers);

    return { rows: [newFarmer], rowCount: 1 };
  }

  // 4. UPDATE farmers SET password_hash = $1 ... WHERE id = $2
  if (normalizedSql.startsWith('update farmers') && normalizedSql.includes('password_hash = $1')) {
    const [newPasswordHash, idParam] = params;
    const farmerIndex = farmers.findIndex((f) => String(f.id) === String(idParam));

    if (farmerIndex !== -1) {
      farmers[farmerIndex].password_hash = newPasswordHash;
      farmers[farmerIndex].updated_at = new Date().toISOString();
      writeLocalFarmers(farmers);
      return { rows: [farmers[farmerIndex]], rowCount: 1 };
    }
    return { rows: [], rowCount: 0 };
  }

  // 5. UPDATE farmers SET (general profile fields)
  if (normalizedSql.startsWith('update farmers')) {
    const idParam = params[params.length - 1]; // ID is always last param
    const farmerIndex = farmers.findIndex((f) => String(f.id) === String(idParam));

    if (farmerIndex !== -1) {
      const farmer = farmers[farmerIndex];

      // Parse update values from params
      if (normalizedSql.includes('name =')) {
        const nameIdx = normalizedSql.split('name =')[1].match(/\$(\d+)/);
        if (nameIdx && params[Number(nameIdx[1]) - 1]) {
          farmer.name = params[Number(nameIdx[1]) - 1];
        }
      }
      if (normalizedSql.includes('location =')) {
        const locIdx = normalizedSql.split('location =')[1].match(/\$(\d+)/);
        if (locIdx && params[Number(locIdx[1]) - 1]) {
          farmer.location = params[Number(locIdx[1]) - 1];
        }
      }
      if (normalizedSql.includes('land_size =')) {
        const landIdx = normalizedSql.split('land_size =')[1].match(/\$(\d+)/);
        if (landIdx && params[Number(landIdx[1]) - 1]) {
          farmer.land_size = params[Number(landIdx[1]) - 1];
        }
      }
      if (normalizedSql.includes('primary_crop =')) {
        const cropIdx = normalizedSql.split('primary_crop =')[1].match(/\$(\d+)/);
        if (cropIdx && params[Number(cropIdx[1]) - 1]) {
          farmer.primary_crop = params[Number(cropIdx[1]) - 1];
        }
      }
      if (normalizedSql.includes('preferred_mandis =')) {
        const mandiIdx = normalizedSql.split('preferred_mandis =')[1].match(/\$(\d+)/);
        if (mandiIdx && params[Number(mandiIdx[1]) - 1]) {
          farmer.preferred_mandis = params[Number(mandiIdx[1]) - 1];
        }
      }

      farmer.updated_at = new Date().toISOString();
      farmers[farmerIndex] = farmer;
      writeLocalFarmers(farmers);

      return { rows: [farmer], rowCount: 1 };
    }
    return { rows: [], rowCount: 0 };
  }

  // 6. Generic SELECT * FROM farmers
  return { rows: farmers, rowCount: farmers.length };
}
