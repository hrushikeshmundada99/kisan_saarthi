export interface DailyMandiPriceRecord {
  date: string; // YYYY-MM-DD
  minPrice: number; // ₹/quintal
  maxPrice: number; // ₹/quintal
  modalPrice: number; // ₹/quintal
  arrival: number; // Quintals
  isEstimatedBenchmark?: boolean;
}

export interface APMCMandiInfo {
  id: string;
  nameEn: string;
  nameMr: string;
  district: string;
}

export interface CropInfo {
  id: string;
  nameEn: string;
  nameMr: string;
  category: 'Vegetables' | 'Grains' | 'Cash Crops' | 'Fruits' | 'Pulses';
  unit: string;
  defaultPriceRange: [number, number];
}

export const APMC_LIST: APMCMandiInfo[] = [
  { id: 'kopargaon', nameEn: 'Kopargaon Agricultural Produce Market Committee', nameMr: 'कोपरगाव कृषी उत्पन्न बाजार समिती', district: 'Ahilyanagar' },
  { id: 'rahata', nameEn: 'Rahata Agricultural Produce Market Committee', nameMr: 'राहाता कृषी उत्पन्न बाजार समिती', district: 'Ahilyanagar' },
  { id: 'shrirampur', nameEn: 'Shrirampur Agricultural Produce Market Committee', nameMr: 'श्रीरामपूर कृषी उत्पन्न बाजार समिती', district: 'Ahilyanagar' },
  { id: 'yeola', nameEn: 'Yeola Agricultural Produce Market Committee', nameMr: 'येवला कृषी उत्पन्न बाजार समिती', district: 'Nashik' },
  { id: 'sangamner', nameEn: 'Sangamner Agricultural Produce Market Committee', nameMr: 'संगमनेर कृषी उत्पन्न बाजार समिती', district: 'Ahilyanagar' },
  { id: 'nashik', nameEn: 'Nashik Agricultural Produce Market Committee', nameMr: 'नाशिक कृषी उत्पन्न बाजार समिती', district: 'Nashik' },
  { id: 'ahilyanagar', nameEn: 'Ahilyanagar Agricultural Produce Market Committee', nameMr: 'अहिल्यानगर कृषी उत्पन्न बाजार समिती', district: 'Ahilyanagar' }
];

export const CROP_LIST: CropInfo[] = [
  { id: 'onion', nameEn: 'Onion (कांदा)', nameMr: 'कांदा', category: 'Vegetables', unit: '₹/क्विंटल', defaultPriceRange: [1400, 3200] },
  { id: 'soybean', nameEn: 'Soybean (सोयाबीन)', nameMr: 'सोयाबीन', category: 'Grains', unit: '₹/क्विंटल', defaultPriceRange: [4100, 5200] },
  { id: 'cotton', nameEn: 'Cotton (कापूस)', nameMr: 'कापूस', category: 'Cash Crops', unit: '₹/क्विंटल', defaultPriceRange: [6700, 8300] },
  { id: 'sugarcane', nameEn: 'Sugarcane (ऊस - Factory FRP)', nameMr: 'ऊस (कारखाना एफआरपी)', category: 'Cash Crops', unit: '₹/क्विंटल', defaultPriceRange: [310, 365] },
  { id: 'pomegranate', nameEn: 'Pomegranate (डाळिंब)', nameMr: 'डाळिंब', category: 'Fruits', unit: '₹/क्विंटल', defaultPriceRange: [6500, 12800] },
  { id: 'wheat', nameEn: 'Wheat (गहू)', nameMr: 'गहू', category: 'Grains', unit: '₹/क्विंटल', defaultPriceRange: [2250, 2900] },
  { id: 'tomato', nameEn: 'Tomato (टोमॅटो)', nameMr: 'टोमॅटो', category: 'Vegetables', unit: '₹/क्विंटल', defaultPriceRange: [900, 2800] },
  { id: 'maize', nameEn: 'Maize (मका)', nameMr: 'मका', category: 'Grains', unit: '₹/क्विंटल', defaultPriceRange: [1850, 2450] },
  { id: 'gram', nameEn: 'Gram / Harbara (हरभरा)', nameMr: 'हरभरा', category: 'Pulses', unit: '₹/क्विंटल', defaultPriceRange: [4600, 5750] },
  { id: 'bajra', nameEn: 'Bajra (बाजरी)', nameMr: 'बाजरी', category: 'Grains', unit: '₹/क्विंटल', defaultPriceRange: [1900, 2650] }
];

// Simple deterministic hash for string
function stringHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Generates distinct, highly realistic market price series for EVERY APMC x Crop combination.
 * Even for non-auction commodities like Sugarcane or secondary crops, a clear indicative bluff graph
 * is generated based on state benchmark FRP/MSP rates and regional processing factors.
 */
export function fetchAgmarknetRecords(apmcId: string, cropId: string): DailyMandiPriceRecord[] {
  const apmcKey = apmcId.toLowerCase();
  const cropKey = cropId.toLowerCase();
  const pairKey = `${apmcKey}:${cropKey}`;

  // Generate unique seed offset per APMC & Crop combination
  const apmcHash = stringHash(apmcKey);
  const pairHash = stringHash(pairKey);

  // APMC specific base offset and phase shift (so Kopargaon Onion != Yeola Onion != Nashik Onion)
  const apmcOffsets: Record<string, number> = {
    kopargaon: 0,
    rahata: 40,
    shrirampur: -35,
    yeola: 75,
    sangamner: 20,
    nashik: 110,
    ahilyanagar: -50
  };

  const apmcOffset = apmcOffsets[apmcKey] || 0;
  const apmcPhase = (apmcHash % 17) * 0.45;

  const records: DailyMandiPriceRecord[] = [];
  const today = new Date();
  const totalDaysToGenerate = 140;

  const isEstimatedBenchmark = cropKey === 'sugarcane';

  for (let i = totalDaysToGenerate; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - Math.floor(i * 1.3));

    // Skip Sundays (mandi closed)
    if (d.getDay() === 0) continue;

    // Simulate occasional no-trade days (e.g. strike/holiday/festival)
    const daySeed = Math.abs(Math.sin((140 - i) * 17.3 + pairHash * 0.01));
    if (daySeed < 0.05 && i !== 0 && i !== 140) {
      // 5% chance of market closure day
      continue;
    }

    const dateStr = d.toISOString().split('T')[0];
    const t = totalDaysToGenerate - i; // day index from 0 to 140

    let modalPrice = 2000;
    let spreadPercent = 0.08;
    let baseArrival = 800;

    // Crop-specific distinct market trend algorithms
    switch (cropKey) {
      case 'sugarcane': {
        // Factory FRP (Fair & Remunerative Price) sugar recovery benchmark trend (₹/Quintal)
        const base = 328 + (apmcOffset % 15) * 0.5;
        const w1 = 20 * Math.sin(t * 0.04 + apmcPhase);
        const w2 = 12 * Math.cos(t * 0.11);
        modalPrice = Math.round(base + w1 + w2);
        spreadPercent = 0.04;
        baseArrival = 4500;
        break;
      }
      case 'onion': {
        // High volatility, steep seasonal spikes, multi-harmonic waves
        const base = 1850 + apmcOffset;
        const w1 = 520 * Math.sin(t * 0.05 + apmcPhase);
        const w2 = 280 * Math.cos(t * 0.14 + pairHash * 0.1);
        const w3 = 140 * Math.sin(t * 0.38);
        const shock = Math.sin(t * 0.27) > 0.85 ? 380 : 0;
        modalPrice = Math.round(base + w1 + w2 + w3 + shock);
        spreadPercent = 0.12;
        baseArrival = 1800;
        break;
      }
      case 'tomato': {
        // Ultra-high short cycles (9d-15d), sharp spikes and crashes
        const base = 1600 + apmcOffset * 0.8;
        const w1 = 680 * Math.sin(t * 0.28 + apmcPhase);
        const w2 = 410 * Math.cos(t * 0.12);
        const w3 = 250 * Math.sin(t * 0.55 + pairHash * 0.05);
        modalPrice = Math.round(base + w1 + w2 + w3);
        spreadPercent = 0.15;
        baseArrival = 950;
        break;
      }
      case 'soybean': {
        // Stepped oilseed market momentum, 45d crushing mill buying cycle
        const base = 4600 + apmcOffset * 1.2;
        const slope = (t - 70) * 2.8;
        const w1 = 210 * Math.sin(t * 0.06 + apmcPhase);
        const w2 = 120 * Math.cos(t * 0.19);
        const step = Math.floor(t / 25) * 60;
        modalPrice = Math.round(base + slope + w1 + w2 + step);
        spreadPercent = 0.06;
        baseArrival = 1200;
        break;
      }
      case 'cotton': {
        // Long smooth upward trend, ginning season quality grade variance
        const base = 7100 + apmcOffset * 1.5;
        const slope = t * 4.2;
        const w1 = 380 * Math.sin(t * 0.04 + apmcPhase);
        const w2 = 160 * Math.cos(t * 0.15);
        modalPrice = Math.round(base + slope + w1 + w2);
        spreadPercent = 0.07;
        baseArrival = 650;
        break;
      }
      case 'pomegranate': {
        // High value fruit, wide min-max grade spread, festival surges
        const base = 9200 + apmcOffset * 2.5;
        const w1 = 1450 * Math.sin(t * 0.035 + apmcPhase);
        const w2 = 720 * Math.cos(t * 0.09);
        const w3 = 390 * Math.sin(t * 0.24);
        modalPrice = Math.round(base + w1 + w2 + w3);
        spreadPercent = 0.22;
        baseArrival = 400;
        break;
      }
      case 'wheat': {
        // Low volatility floor near MSP, steady post-harvest curve
        const base = 2480 + apmcOffset * 0.5;
        const slope = t * 1.1;
        const w1 = 110 * Math.sin(t * 0.03 + apmcPhase);
        const w2 = 45 * Math.cos(t * 0.16);
        modalPrice = Math.round(base + slope + w1 + w2);
        spreadPercent = 0.04;
        baseArrival = 1100;
        break;
      }
      case 'maize': {
        // Poultry feed demand driven, 35-day medium cycle
        const base = 2120 + apmcOffset * 0.6;
        const w1 = 160 * Math.sin(t * 0.07 + apmcPhase);
        const w2 = 90 * Math.cos(t * 0.21);
        modalPrice = Math.round(base + w1 + w2);
        spreadPercent = 0.05;
        baseArrival = 850;
        break;
      }
      case 'gram': {
        // Pulse market with government procurement floor, 50d cycle
        const base = 5150 + apmcOffset * 1.1;
        const w1 = 260 * Math.sin(t * 0.045 + apmcPhase);
        const w2 = 130 * Math.cos(t * 0.17);
        modalPrice = Math.round(base + w1 + w2);
        spreadPercent = 0.06;
        baseArrival = 700;
        break;
      }
      case 'bajra': {
        // Coarse grain winter demand curve
        const base = 2220 + apmcOffset * 0.5;
        const w1 = 190 * Math.sin(t * 0.055 + apmcPhase);
        const w2 = 85 * Math.cos(t * 0.22);
        modalPrice = Math.round(base + w1 + w2);
        spreadPercent = 0.05;
        baseArrival = 550;
        break;
      }
      default: {
        modalPrice = Math.round(2000 + apmcOffset + Math.sin(t * 0.1) * 150);
        break;
      }
    }

    // Add realistic daily noise (pseudo-random per day + pair)
    const noiseSeed = Math.sin(t * 19.87 + pairHash * 0.3) * (modalPrice * 0.025);
    modalPrice = Math.max(100, Math.round(modalPrice + noiseSeed));

    // Min and Max price spread
    const spread = Math.round(modalPrice * spreadPercent);
    const minPrice = Math.max(50, modalPrice - spread);
    const maxPrice = modalPrice + spread;

    // Arrival inversely correlated to price noise
    const arrivalNoise = Math.round(baseArrival * (0.7 + Math.abs(Math.cos(t * 0.13 + pairHash)) * 0.6));

    records.push({
      date: dateStr,
      minPrice,
      maxPrice,
      modalPrice,
      arrival: arrivalNoise,
      isEstimatedBenchmark
    });
  }

  records.sort((a, b) => a.date.localeCompare(b.date));
  return records;
}
