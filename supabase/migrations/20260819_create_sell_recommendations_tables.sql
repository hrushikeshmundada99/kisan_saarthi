-- Migration: Create sell_recommendations and recommendation_feedback tables
-- For tracking "When to Sell" predictions and collecting farmer real-world feedback

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Table 1: Log of recommendations presented to farmers
CREATE TABLE IF NOT EXISTS sell_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID REFERENCES farmers(id) ON DELETE SET NULL, -- nullable for anonymous users
  crop TEXT NOT NULL,
  mandi TEXT NOT NULL,
  action TEXT NOT NULL,               -- 'SELL_NOW' | 'WAIT'
  wait_days INT,                      -- 7 | 14 | 30 | null
  expected_gain_pct NUMERIC,
  confidence TEXT,                    -- 'High' | 'Moderate' | 'Low'
  predicted_price NUMERIC,
  current_price NUMERIC,
  shown_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sell_rec_crop_mandi ON sell_recommendations(crop, mandi);
CREATE INDEX IF NOT EXISTS idx_sell_rec_farmer_id ON sell_recommendations(farmer_id);
CREATE INDEX IF NOT EXISTS idx_sell_rec_shown_at ON sell_recommendations(shown_at);

-- Table 2: Farmer feedback on recommendations
CREATE TABLE IF NOT EXISTS recommendation_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recommendation_id UUID NOT NULL REFERENCES sell_recommendations(id) ON DELETE CASCADE,
  farmer_id UUID REFERENCES farmers(id) ON DELETE SET NULL,
  was_helpful BOOLEAN,                -- immediate thumbs up (true) / down (false)
  followed_advice BOOLEAN,            -- did they follow the suggested action
  actual_sell_price NUMERIC,          -- delayed follow-up: real price achieved
  actual_sell_date DATE,
  feedback_note TEXT,
  submitted_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT uq_rec_farmer_feedback UNIQUE (recommendation_id, farmer_id)
);

CREATE INDEX IF NOT EXISTS idx_rec_feedback_rec_id ON recommendation_feedback(recommendation_id);
CREATE INDEX IF NOT EXISTS idx_rec_feedback_farmer_id ON recommendation_feedback(farmer_id);
