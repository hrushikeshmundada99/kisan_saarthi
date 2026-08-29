-- ====================================================================
-- Kisan Saarthi (किसान सारथी) - Supabase Database Schema Migration
-- Table: price_alerts (Used for storing farmer price alerts & email triggers)
-- ====================================================================

-- 1. Create price_alerts table
CREATE TABLE IF NOT EXISTS public.price_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farmer_id UUID REFERENCES public.farmers(id) ON DELETE CASCADE,
    farmer_email TEXT NOT NULL,
    crop VARCHAR(50) NOT NULL,
    mandi VARCHAR(100) NOT NULL,
    condition VARCHAR(10) NOT NULL DEFAULT 'ABOVE',
    target_price NUMERIC(10, 2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    notification_methods TEXT[] DEFAULT ARRAY['Email', 'In-App']::TEXT[],
    created_at TIMESTAMPTZ DEFAULT now(),
    last_email_sent_at TIMESTAMPTZ
);

-- 2. Indexes for fast lookup by email and active status
CREATE INDEX IF NOT EXISTS idx_price_alerts_email ON public.price_alerts (farmer_email);
CREATE INDEX IF NOT EXISTS idx_price_alerts_status ON public.price_alerts (status);
CREATE INDEX IF NOT EXISTS idx_price_alerts_crop_mandi ON public.price_alerts (crop, mandi);

-- 3. Row Level Security (RLS) Policy for Supabase
ALTER TABLE public.price_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read and write access for price alerts" 
ON public.price_alerts 
FOR ALL 
USING (true) 
WITH CHECK (true);
