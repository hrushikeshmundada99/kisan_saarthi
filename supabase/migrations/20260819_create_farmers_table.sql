-- ====================================================================
-- Migration: Create Farmers Table for Kisan Saarthi Authentication
-- Database: PostgreSQL / Supabase / Neon
-- ====================================================================

-- 1. Enable pgcrypto extension for UUID generation if not already active
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Create the farmers table
CREATE TABLE IF NOT EXISTS farmers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mobile VARCHAR(10) NOT NULL UNIQUE,   -- Enforces exactly 1 account per 10-digit mobile number
  password_hash TEXT NOT NULL,          -- Securely hashed with bcryptjs (salt rounds 10)
  name TEXT NOT NULL,
  location TEXT DEFAULT 'कोपरगाव, अहिल्यानगर',
  land_size TEXT DEFAULT '5 एकर',
  primary_crop TEXT DEFAULT 'Onion',
  preferred_mandis TEXT[] DEFAULT ARRAY['Kopargaon', 'Rahata', 'Yeola']::TEXT[],
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Create index on mobile column for sub-millisecond login lookup
CREATE INDEX IF NOT EXISTS idx_farmers_mobile ON farmers (mobile);

-- 4. Automatically update updated_at timestamp on row modification
CREATE OR REPLACE FUNCTION update_farmers_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now();
   RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

DROP TRIGGER IF EXISTS trg_farmers_updated_at ON farmers;

CREATE TRIGGER trg_farmers_updated_at
BEFORE UPDATE ON farmers
FOR EACH ROW
EXECUTE FUNCTION update_farmers_updated_at_column();
