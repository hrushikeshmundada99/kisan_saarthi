import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';

import {
  getCropPrice,
  upsertCropPrice,
  isRecordStale,
  parseAndValidateGeminiResponse,
  resetRateLimiter,
  setCustomGeminiFetcher
} from '../api/services/cropPriceFallbackService.js';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const CROP_PRICES_FILE = path.join(DATA_DIR, 'crop_prices.json');

function clearLocalDb() {
  if (fs.existsSync(CROP_PRICES_FILE)) {
    fs.writeFileSync(CROP_PRICES_FILE, JSON.stringify([], null, 2), 'utf8');
  }
  resetRateLimiter();
}

test('1. DB has fresh data (no AI call made)', async () => {
  clearLocalDb();

  const freshTimestamp = new Date().toISOString();
  await upsertCropPrice({
    crop: 'Onion',
    price: 2400,
    unit: '₹/Quintal',
    region: 'Kopargaon',
    source: 'live',
    source_name: 'Agmarknet',
    confidence: 'high',
    last_updated: freshTimestamp
  });

  const result = await getCropPrice({ crop: 'Onion', region: 'Kopargaon' });

  assert.equal(result.price, 2400);
  assert.equal(result.source, 'live');
  assert.equal(result.stale, false);
});

test('2. DB has stale data (AI call triggered and DB updated)', async () => {
  clearLocalDb();

  // Seed 30-hour old record
  const staleTimestamp = new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString();
  await upsertCropPrice({
    crop: 'Onion',
    price: 2000,
    unit: '₹/Quintal',
    region: 'Kopargaon',
    source: 'live',
    source_name: 'Agmarknet',
    confidence: 'high',
    last_updated: staleTimestamp
  });

  try {
    setCustomGeminiFetcher(async () => ({
      crop: 'Onion',
      price: 2600,
      unit: '₹/Quintal',
      region: 'Kopargaon',
      date: new Date().toISOString(),
      source_name: 'Google Search via Gemini',
      confidence: 'high'
    }));

    const result = await getCropPrice({ crop: 'Onion', region: 'Kopargaon' });

    assert.equal(result.price, 2600);
    assert.equal(result.source, 'ai_fallback');
    assert.equal(result.stale, false);
  } finally {
    resetRateLimiter();
  }
});

test('3. DB has no record (AI call triggered and DB inserted)', async () => {
  clearLocalDb();

  try {
    setCustomGeminiFetcher(async () => ({
      crop: 'Wheat',
      price: 2250,
      unit: '₹/Quintal',
      region: 'Rahata',
      date: new Date().toISOString(),
      source_name: 'Google Search via Gemini',
      confidence: 'high'
    }));

    const result = await getCropPrice({ crop: 'Wheat', region: 'Rahata' });

    assert.equal(result.price, 2250);
    assert.equal(result.region, 'Rahata');
    assert.equal(result.source, 'ai_fallback');
    assert.equal(result.stale, false);
  } finally {
    resetRateLimiter();
  }
});

test('4. AI returns unparseable output (handled gracefully, no bad DB write)', async () => {
  clearLocalDb();

  // Test parser directly with malformed response
  assert.throws(
    () => parseAndValidateGeminiResponse('Malformed {{ text without valid json', 'Onion', 'Kopargaon'),
    /JSON parse error/
  );

  // Seed stale record
  const staleTimestamp = new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString();
  await upsertCropPrice({
    crop: 'Onion',
    price: 1900,
    unit: '₹/Quintal',
    region: 'Kopargaon',
    source: 'live',
    source_name: 'Agmarknet',
    confidence: 'high',
    last_updated: staleTimestamp
  });

  try {
    setCustomGeminiFetcher(async () => {
      throw new Error('JSON parse error: Unexpected token in JSON');
    });

    const result = await getCropPrice({ crop: 'Onion', region: 'Kopargaon' });

    // Should return cached DB record marked stale: true
    assert.equal(result.price, 1900);
    assert.equal(result.stale, true);
  } finally {
    resetRateLimiter();
  }
});

test('5. AI returns {"error": "not_found"} (handled gracefully)', async () => {
  clearLocalDb();

  // Test parser with not_found response
  const parsed = parseAndValidateGeminiResponse('{"error": "not_found"}', 'ExoticCrop', 'Kopargaon');
  assert.equal(parsed.error, 'not_found');

  try {
    setCustomGeminiFetcher(async () => ({ error: 'not_found' }));

    const result = await getCropPrice({ crop: 'ExoticCrop', region: 'Kopargaon' });

    assert.equal(result.error, 'price_unavailable');
    assert.ok(result.message.includes('unavailable'));
  } finally {
    resetRateLimiter();
  }
});

test('6. AI call throws/network fails (falls back to last known DB value if present)', async () => {
  clearLocalDb();

  const staleTimestamp = new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString();
  await upsertCropPrice({
    crop: 'Cotton',
    price: 6800,
    unit: '₹/Quintal',
    region: 'Yeola',
    source: 'live',
    source_name: 'Agmarknet',
    confidence: 'high',
    last_updated: staleTimestamp
  });

  try {
    setCustomGeminiFetcher(async () => {
      throw new Error('ETIMEDOUT: Network timeout connecting to Gemini API');
    });

    const result = await getCropPrice({ crop: 'Cotton', region: 'Yeola' });

    assert.equal(result.price, 6800);
    assert.equal(result.stale, true);
    assert.equal(result.region, 'Yeola');
  } finally {
    resetRateLimiter();
  }
});

test('7. AI call hits a rate limit (backs off, doesn\'t crash)', async () => {
  clearLocalDb();

  const staleTimestamp = new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString();
  await upsertCropPrice({
    crop: 'Soybean',
    price: 4300,
    unit: '₹/Quintal',
    region: 'Kopargaon',
    source: 'live',
    source_name: 'Agmarknet',
    confidence: 'high',
    last_updated: staleTimestamp
  });

  try {
    const error429 = new Error('HTTP 429 Too Many Requests');
    error429.status = 429;
    setCustomGeminiFetcher(async () => {
      throw error429;
    });

    // First call triggers 429 and enters backoff state
    const result1 = await getCropPrice({ crop: 'Soybean', region: 'Kopargaon' });
    assert.equal(result1.price, 4300);
    assert.equal(result1.stale, true);

    // Second call hit during backoff window is throttled by rate limiter immediately
    const result2 = await getCropPrice({ crop: 'Soybean', region: 'Kopargaon' });
    assert.equal(result2.price, 4300);
    assert.equal(result2.stale, true);
    assert.equal(result2.fallback_note, 'Rate limit active, serving cached data');
  } finally {
    resetRateLimiter();
  }
});
