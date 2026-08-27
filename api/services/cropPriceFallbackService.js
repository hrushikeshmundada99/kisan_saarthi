/**
 * ====================================================================
 * CROP PRICE AI FALLBACK SERVICE
 * ====================================================================
 * Fallback flow for crop market prices:
 * 1. Queries primary database (PostgreSQL / Local JSON) for (crop, region).
 * 2. If record exists and is fresh (< STALENESS_HOURS), returns DB record immediately.
 * 3. If record is missing, stale, or live data fetch fails:
 *    a. Checks rate limiter / backoff window to respect free-tier Gemini API limits.
 *    b. Calls Google Gemini API (Flash model) with Google Search grounding enabled.
 *    c. Enforces strict JSON response containing price, unit, region, date, source_name, confidence.
 *    d. Defensively strips code blocks, parses JSON, and validates that price > 0.
 *    e. On validation success: upserts record into DB with source="ai_fallback" and returns fresh value.
 *    f. On failure, rate limit 429, or "not_found": logs details and degrades gracefully to last known DB record (marked stale: true).
 */

import { GoogleGenAI } from '@google/genai';
import { query } from '../lib/db.js';

// Configuration Defaults
const DEFAULT_STALENESS_HOURS = 24;
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10;
const RATE_LIMIT_BACKOFF_MS = 30 * 1000; // 30 seconds backoff on 429

// In-Memory Rate Limiting State
let requestTimestamps = [];
let backoffUntil = 0;
let customGeminiFetcher = null;

/**
 * Gets staleness threshold in milliseconds.
 */
function getStalenessThresholdMs() {
  const hours = parseFloat(process.env.CROP_PRICE_STALENESS_HOURS) || DEFAULT_STALENESS_HOURS;
  return hours * 60 * 60 * 1000;
}

/**
 * Checks if a timestamp is older than the staleness threshold.
 */
export function isRecordStale(lastUpdated) {
  if (!lastUpdated) return true;
  const updatedMs = new Date(lastUpdated).getTime();
  if (isNaN(updatedMs)) return true;
  return Date.now() - updatedMs > getStalenessThresholdMs();
}

/**
 * Allows overriding Gemini API fetcher for unit testing.
 */
export function setCustomGeminiFetcher(fn) {
  customGeminiFetcher = fn;
}

/**
 * Reset rate limiter and mock state (mainly for unit tests).
 */
export function resetRateLimiter() {
  requestTimestamps = [];
  backoffUntil = 0;
  customGeminiFetcher = null;
}

/**
 * Checks if Gemini API calls can be made based on rate limits and backoff state.
 */
export function checkRateLimit() {
  const now = Date.now();
  if (now < backoffUntil) {
    return { allowed: false, reason: 'rate_limit_backoff', waitMs: backoffUntil - now };
  }

  // Remove timestamps outside window
  requestTimestamps = requestTimestamps.filter((ts) => now - ts < RATE_LIMIT_WINDOW_MS);

  if (requestTimestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    return { allowed: false, reason: 'window_limit_exceeded', waitMs: RATE_LIMIT_WINDOW_MS };
  }

  return { allowed: true };
}

/**
 * Main service method to retrieve crop price with AI search fallback.
 */
export async function getCropPrice({ crop = 'Onion', region = 'Kopargaon', forceRefresh = false } = {}) {
  const normalizedCrop = String(crop).trim();
  const normalizedRegion = String(region).trim();

  let dbRecord = null;
  let triggerReason = null;

  // Step 1: Fetch current record from DB
  try {
    const res = await query(
      `SELECT * FROM crop_prices WHERE LOWER(crop) = LOWER($1) AND LOWER(region) = LOWER($2) LIMIT 1`,
      [normalizedCrop, normalizedRegion]
    );
    if (res && res.rows && res.rows.length > 0) {
      dbRecord = res.rows[0];
    }
  } catch (err) {
    console.warn(`[CropPriceFallbackService] DB read warning for ${normalizedCrop}/${normalizedRegion}:`, err.message);
  }

  // Step 2: Determine if fallback should be triggered
  if (!dbRecord) {
    triggerReason = 'no_db_record';
  } else if (isRecordStale(dbRecord.last_updated)) {
    triggerReason = 'stale_record';
  } else if (forceRefresh) {
    triggerReason = 'force_refresh';
  }

  // If DB record is fresh and refresh is not forced, return fresh DB record directly
  if (!triggerReason && dbRecord) {
    return {
      ...dbRecord,
      stale: false
    };
  }

  console.log(`[CropPriceFallbackService] Fallback triggered for ${normalizedCrop}/${normalizedRegion}. Reason: ${triggerReason}`);

  // Step 3: Check Rate Limiter
  const rateLimitCheck = checkRateLimit();
  if (!rateLimitCheck.allowed) {
    console.warn(`[CropPriceFallbackService] Gemini API rate limit throttled. Reason: ${rateLimitCheck.reason}`);
    if (dbRecord) {
      return {
        ...dbRecord,
        stale: true,
        fallback_note: 'Rate limit active, serving cached data'
      };
    }
    return {
      error: 'rate_limited',
      message: 'Service is temporarily busy. Please try again in a few moments.'
    };
  }

  // Step 4: Execute Gemini AI Fallback Call
  try {
    requestTimestamps.push(Date.now());
    const aiResult = await executeGeminiFallback(normalizedCrop, normalizedRegion);

    if (aiResult && aiResult.error === 'not_found') {
      console.warn(`[CropPriceFallbackService] AI grounding could not find price for ${normalizedCrop}/${normalizedRegion}`);
      if (dbRecord) {
        return {
          ...dbRecord,
          stale: true,
          fallback_note: 'AI grounding found no reliable online price'
        };
      }
      return {
        error: 'price_unavailable',
        message: `Current price data for ${normalizedCrop} in ${normalizedRegion} is unavailable.`
      };
    }

    if (aiResult && typeof aiResult.price === 'number' && aiResult.price > 0) {
      // Step 5: Upsert AI Fallback Result into Database
      const upsertedRecord = await upsertCropPrice({
        crop: aiResult.crop || normalizedCrop,
        price: aiResult.price,
        unit: aiResult.unit || '₹/Quintal',
        region: aiResult.region || normalizedRegion,
        source: 'ai_fallback',
        source_name: aiResult.source_name || 'Google Search via Gemini',
        confidence: aiResult.confidence || 'medium',
        last_updated: aiResult.date || new Date().toISOString()
      });

      console.log(`[CropPriceFallbackService] Successfully updated DB via AI fallback for ${normalizedCrop}/${normalizedRegion}: ₹${aiResult.price}`);

      return {
        ...upsertedRecord,
        stale: false
      };
    }

    throw new Error('AI fallback response failed validation');
  } catch (err) {
    console.error(`[CropPriceFallbackService] AI fallback failed for ${normalizedCrop}/${normalizedRegion}:`, err.message);

    // Handle 429 / Rate Limit error backoff
    if (err.status === 429 || (err.message && err.message.includes('429'))) {
      backoffUntil = Date.now() + RATE_LIMIT_BACKOFF_MS;
      console.warn(`[CropPriceFallbackService] Set 429 backoff until ${new Date(backoffUntil).toISOString()}`);
    }

    if (dbRecord) {
      return {
        ...dbRecord,
        stale: true,
        fallback_note: 'AI fallback failed, serving cached DB record'
      };
    }

    return {
      error: 'price_unavailable',
      message: `Failed to fetch price for ${normalizedCrop} in ${normalizedRegion}`
    };
  }
}

/**
 * Upserts crop price record into the database.
 * Does NOT overwrite a fresh, live-sourced record with an AI fallback.
 */
export async function upsertCropPrice(record) {
  const { crop, price, unit = '₹/Quintal', region, source = 'ai_fallback', source_name = 'Google Search via Gemini', confidence = 'medium', last_updated } = record;

  const isoTimestamp = last_updated ? new Date(last_updated).toISOString() : new Date().toISOString();

  const res = await query(
    `INSERT INTO crop_prices (crop, price, unit, region, source, source_name, confidence, last_updated)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     ON CONFLICT (crop, region)
     DO UPDATE SET
       price = EXCLUDED.price,
       unit = EXCLUDED.unit,
       source = EXCLUDED.source,
       source_name = EXCLUDED.source_name,
       confidence = EXCLUDED.confidence,
       last_updated = EXCLUDED.last_updated
     RETURNING *;`,
    [crop, price, unit, region, source, source_name, confidence, isoTimestamp]
  );

  if (res && res.rows && res.rows.length > 0) {
    return res.rows[0];
  }

  return {
    crop,
    price,
    unit,
    region,
    source,
    source_name,
    confidence,
    last_updated: isoTimestamp
  };
}

/**
 * Invokes the Google Gemini API with Google Search grounding tool enabled.
 */
export async function executeGeminiFallback(crop, region) {
  if (customGeminiFetcher) {
    return await customGeminiFetcher(crop, region);
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is missing');
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `Find the current wholesale market price for ${crop} in ${region}, Maharashtra, India.`;

  const systemInstruction = `You are an expert agricultural market price analyst.
Find the current wholesale market price for the specified crop in the given region in India.
You MUST return ONLY a raw JSON object (no markdown code blocks, no \`\`\`json formatting, no explanation).
JSON format:
{
  "crop": "${crop}",
  "price": number (wholesale price per quintal in INR, e.g. 2450),
  "unit": "₹/Quintal",
  "region": "${region}",
  "date": "ISO date string (e.g. 2026-08-26T12:00:00Z)",
  "source_name": "Name of mandi or source website found via Google Search",
  "confidence": "high" | "medium" | "low"
}
If you cannot find a reliable current market price online, return strictly:
{ "error": "not_found" }`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
      systemInstruction
    }
  });

  const rawText = response.text || '';
  return parseAndValidateGeminiResponse(rawText, crop, region);
}

/**
 * Defensively parses and validates Gemini raw response text.
 */
export function parseAndValidateGeminiResponse(rawText, crop, region) {
  if (!rawText || typeof rawText !== 'string') {
    console.warn('[CropPriceFallbackService] Empty response text received from Gemini');
    throw new Error('Empty Gemini response text');
  }

  // Strip code block wrappers if any were returned
  const cleaned = rawText
    .replace(/```json\s*/gi, '')
    .replace(/```\s*/gi, '')
    .trim();

  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch (err) {
    console.warn('[CropPriceFallbackService] Failed to parse JSON from Gemini output:', rawText.slice(0, 150));
    throw new Error(`JSON parse error: ${err.message}`);
  }

  if (parsed && parsed.error === 'not_found') {
    return { error: 'not_found' };
  }

  // Validate required numeric price and fields
  const numPrice = Number(parsed.price);
  if (isNaN(numPrice) || numPrice <= 0) {
    console.warn('[CropPriceFallbackService] Invalid or non-positive price in Gemini output:', parsed);
    throw new Error('Invalid or non-positive price in Gemini output');
  }

  return {
    crop: parsed.crop || crop,
    price: numPrice,
    unit: parsed.unit || '₹/Quintal',
    region: parsed.region || region,
    date: parsed.date || new Date().toISOString(),
    source_name: parsed.source_name || 'Google Search via Gemini',
    confidence: parsed.confidence && ['high', 'medium', 'low'].includes(parsed.confidence.toLowerCase())
      ? parsed.confidence.toLowerCase()
      : 'medium'
  };
}
