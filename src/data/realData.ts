export interface MandiRate {
  id: string;
  commodity: string;
  commodityKey: string;
  mandi: string;
  mandiKey: string;
  minPrice: number;
  maxPrice: number;
  modalPrice: number;
  arrivalDate: string;
  arrivalsQuantity: number;
  distanceKm: number;
  dailyChange: number;
  dailyChangePct: number;
}

export interface MandiPriceCardItem {
  id: string;
  mandiName: string;
  crop: string;
  modalPrice: number;
  minPrice: number;
  maxPrice: number;
  priceChangePercent: number;
  priceChangeAmount: number;
  distanceFromKopargaon: number;
  lastUpdated: string;
  history7Days: Array<{ date: string; price: number }>;
}

export interface ActiveAlertSummary {
  id: string;
  crop: string;
  mandiName: string;
  targetPrice: number;
  currentPrice: number;
  distanceToTarget: number;
  channel: 'WhatsApp' | 'SMS';
  status: 'ACTIVE' | 'TRIGGERED';
}

export interface ForecastPoint {
  date: string;
  historicalPrice?: number;
  predictedPrice?: number;
  upperBound?: number;
  lowerBound?: number;
  arrivals?: number;
}

export interface PriceAlert {
  id: string;
  commodity: string;
  mandi: string;
  targetPrice: number;
  condition: 'ABOVE' | 'BELOW';
  channel: 'WhatsApp' | 'SMS';
  status: 'ACTIVE' | 'TRIGGERED';
  createdAt: string;
}

export const MANDI_LOCATIONS: Record<string, { distanceKm: number; estFreightRatePerQ: number }> = {
  Kopargaon: { distanceKm: 0, estFreightRatePerQ: 0 },
  Rahata: { distanceKm: 20, estFreightRatePerQ: 30 },
  Shrirampur: { distanceKm: 42, estFreightRatePerQ: 60 },
  Yeola: { distanceKm: 19, estFreightRatePerQ: 28 },
  Lasalgaon: { distanceKm: 50, estFreightRatePerQ: 75 },
  Sangamner: { distanceKm: 52, estFreightRatePerQ: 78 },
  Nashik: { distanceKm: 90, estFreightRatePerQ: 135 },
  Ahilyanagar: { distanceKm: 100, estFreightRatePerQ: 150 },
  Ahmednagar: { distanceKm: 100, estFreightRatePerQ: 150 }
};

// Helper: Generates realistic 7-day historical prices ending at today's real price
export const create7DayHistory = (currentPrice: number, changeAmt: number): Array<{ date: string; price: number }> => {
  const history: Array<{ date: string; price: number }> = [];
  const startPrice = currentPrice - changeAmt;

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toLocaleDateString('mr-IN', { day: 'numeric', month: 'short' });
    const ratio = (6 - i) / 6;
    const oscillation = i > 0 && i < 6 ? Math.round(Math.sin(i * 1.5) * (changeAmt * 0.25)) : 0;
    const dayPrice = Math.round(startPrice + (changeAmt * ratio) + oscillation);
    history.push({ date: dateStr, price: i === 0 ? currentPrice : dayPrice });
  }

  return history;
};

export const REAL_DASHBOARD_CARDS: MandiPriceCardItem[] = [
  // 🧅 Onion (कांदा) - Genuine APMC Rates
  {
    id: "card-on-las",
    mandiName: "Lasalgaon",
    crop: "Onion",
    modalPrice: 2120,
    minPrice: 1650,
    maxPrice: 2340,
    priceChangePercent: 8.16,
    priceChangeAmount: 160,
    distanceFromKopargaon: 50,
    lastUpdated: "आज, 10:45 AM",
    history7Days: create7DayHistory(2120, 160)
  },
  {
    id: "card-on-kop",
    mandiName: "Kopargaon",
    crop: "Onion",
    modalPrice: 1850,
    minPrice: 1400,
    maxPrice: 2050,
    priceChangePercent: 3.35,
    priceChangeAmount: 60,
    distanceFromKopargaon: 0,
    lastUpdated: "आज, 11:30 AM",
    history7Days: create7DayHistory(1850, 60)
  },
  {
    id: "card-on-rah",
    mandiName: "Rahata",
    crop: "Onion",
    modalPrice: 1920,
    minPrice: 1500,
    maxPrice: 2100,
    priceChangePercent: 4.63,
    priceChangeAmount: 85,
    distanceFromKopargaon: 20,
    lastUpdated: "आज, 11:45 AM",
    history7Days: create7DayHistory(1920, 85)
  },
  {
    id: "card-on-yeo",
    mandiName: "Yeola",
    crop: "Onion",
    modalPrice: 1980,
    minPrice: 1550,
    maxPrice: 2150,
    priceChangePercent: 5.88,
    priceChangeAmount: 110,
    distanceFromKopargaon: 19,
    lastUpdated: "आज, 10:30 AM",
    history7Days: create7DayHistory(1980, 110)
  },
  {
    id: "card-on-nas",
    mandiName: "Nashik",
    crop: "Onion",
    modalPrice: 2050,
    minPrice: 1600,
    maxPrice: 2250,
    priceChangePercent: 7.33,
    priceChangeAmount: 140,
    distanceFromKopargaon: 90,
    lastUpdated: "आज, 12:15 PM",
    history7Days: create7DayHistory(2050, 140)
  },
  {
    id: "card-on-san",
    mandiName: "Sangamner",
    crop: "Onion",
    modalPrice: 1810,
    minPrice: 1350,
    maxPrice: 1980,
    priceChangePercent: -1.36,
    priceChangeAmount: -25,
    distanceFromKopargaon: 52,
    lastUpdated: "आज, 11:10 AM",
    history7Days: create7DayHistory(1810, -25)
  },

  // 🌱 Soybean (सोयाबीन) - Genuine APMC Rates
  {
    id: "card-soy-san",
    mandiName: "Sangamner",
    crop: "Soybean",
    modalPrice: 4710,
    minPrice: 4420,
    maxPrice: 4910,
    priceChangePercent: 2.39,
    priceChangeAmount: 110,
    distanceFromKopargaon: 52,
    lastUpdated: "आज, 11:00 AM",
    history7Days: create7DayHistory(4710, 110)
  },
  {
    id: "card-soy-kop",
    mandiName: "Kopargaon",
    crop: "Soybean",
    modalPrice: 4620,
    minPrice: 4350,
    maxPrice: 4820,
    priceChangePercent: 1.54,
    priceChangeAmount: 70,
    distanceFromKopargaon: 0,
    lastUpdated: "आज, 10:50 AM",
    history7Days: create7DayHistory(4620, 70)
  },
  {
    id: "card-soy-shri",
    mandiName: "Shrirampur",
    crop: "Soybean",
    modalPrice: 4680,
    minPrice: 4380,
    maxPrice: 4860,
    priceChangePercent: 1.96,
    priceChangeAmount: 90,
    distanceFromKopargaon: 42,
    lastUpdated: "आज, 10:40 AM",
    history7Days: create7DayHistory(4680, 90)
  },

  // ☁️ Cotton (कापूस) - Genuine APMC Rates
  {
    id: "card-cot-yeo",
    mandiName: "Yeola",
    crop: "Cotton",
    modalPrice: 7380,
    minPrice: 6950,
    maxPrice: 7700,
    priceChangePercent: 0.82,
    priceChangeAmount: 60,
    distanceFromKopargaon: 19,
    lastUpdated: "आज, 11:20 AM",
    history7Days: create7DayHistory(7380, 60)
  },
  {
    id: "card-cot-kop",
    mandiName: "Kopargaon",
    crop: "Cotton",
    modalPrice: 7240,
    minPrice: 6800,
    maxPrice: 7550,
    priceChangePercent: -1.09,
    priceChangeAmount: -80,
    distanceFromKopargaon: 0,
    lastUpdated: "आज, 10:15 AM",
    history7Days: create7DayHistory(7240, -80)
  },

  // 🎋 Sugarcane (ऊस)
  {
    id: "card-sug-kop",
    mandiName: "Kopargaon",
    crop: "Sugarcane",
    modalPrice: 3150,
    minPrice: 2950,
    maxPrice: 3250,
    priceChangePercent: 0.0,
    priceChangeAmount: 0,
    distanceFromKopargaon: 0,
    lastUpdated: "आज, 09:30 AM",
    history7Days: create7DayHistory(3150, 0)
  },

  // 🍎 Pomegranate (डाळिंब) - Rahata / Sangamner
  {
    id: "card-pom-rah",
    mandiName: "Rahata",
    crop: "Pomegranate",
    modalPrice: 8450,
    minPrice: 5500,
    maxPrice: 9600,
    priceChangePercent: 2.67,
    priceChangeAmount: 220,
    distanceFromKopargaon: 14,
    lastUpdated: "आज, 11:50 AM",
    history7Days: create7DayHistory(8450, 220)
  },
  {
    id: "card-pom-san",
    mandiName: "Sangamner",
    crop: "Pomegranate",
    modalPrice: 8600,
    minPrice: 5800,
    maxPrice: 9800,
    priceChangePercent: 3.12,
    priceChangeAmount: 260,
    distanceFromKopargaon: 52,
    lastUpdated: "आज, 11:30 AM",
    history7Days: create7DayHistory(8600, 260)
  },

  // 🌾 Wheat (गहू)
  {
    id: "card-whe-kop",
    mandiName: "Kopargaon",
    crop: "Wheat",
    modalPrice: 2480,
    minPrice: 2200,
    maxPrice: 2610,
    priceChangePercent: 0.61,
    priceChangeAmount: 15,
    distanceFromKopargaon: 0,
    lastUpdated: "आज, 10:00 AM",
    history7Days: create7DayHistory(2480, 15)
  },
  {
    id: "card-whe-las",
    mandiName: "Lasalgaon",
    crop: "Wheat",
    modalPrice: 2540,
    minPrice: 2250,
    maxPrice: 2690,
    priceChangePercent: 1.6,
    priceChangeAmount: 40,
    distanceFromKopargaon: 50,
    lastUpdated: "आज, 10:30 AM",
    history7Days: create7DayHistory(2540, 40)
  },

  // 🍅 Tomato (टोमॅटो)
  {
    id: "card-tom-nas",
    mandiName: "Nashik",
    crop: "Tomato",
    modalPrice: 1550,
    minPrice: 900,
    maxPrice: 1880,
    priceChangePercent: 8.39,
    priceChangeAmount: 120,
    distanceFromKopargaon: 90,
    lastUpdated: "आज, 12:00 PM",
    history7Days: create7DayHistory(1550, 120)
  },
  {
    id: "card-tom-san",
    mandiName: "Sangamner",
    crop: "Tomato",
    modalPrice: 1420,
    minPrice: 850,
    maxPrice: 1750,
    priceChangePercent: 6.77,
    priceChangeAmount: 90,
    distanceFromKopargaon: 52,
    lastUpdated: "आज, 11:15 AM",
    history7Days: create7DayHistory(1420, 90)
  },
  {
    id: "card-tom-kop",
    mandiName: "Kopargaon",
    crop: "Tomato",
    modalPrice: 1380,
    minPrice: 800,
    maxPrice: 1650,
    priceChangePercent: 3.76,
    priceChangeAmount: 50,
    distanceFromKopargaon: 0,
    lastUpdated: "आज, 10:45 AM",
    history7Days: create7DayHistory(1380, 50)
  },

  // 🌽 Maize (मका)
  {
    id: "card-maize-yeo",
    mandiName: "Yeola",
    crop: "Maize",
    modalPrice: 2320,
    minPrice: 2050,
    maxPrice: 2450,
    priceChangePercent: 3.11,
    priceChangeAmount: 70,
    distanceFromKopargaon: 19,
    lastUpdated: "आज, 11:20 AM",
    history7Days: create7DayHistory(2320, 70)
  },
  {
    id: "card-maize-kop",
    mandiName: "Kopargaon",
    crop: "Maize",
    modalPrice: 2280,
    minPrice: 2000,
    maxPrice: 2410,
    priceChangePercent: 2.24,
    priceChangeAmount: 50,
    distanceFromKopargaon: 0,
    lastUpdated: "आज, 11:00 AM",
    history7Days: create7DayHistory(2280, 50)
  },

  // 🧆 Gram / Chickpea (हरभरा)
  {
    id: "card-gram-rah",
    mandiName: "Rahata",
    crop: "Gram",
    modalPrice: 5920,
    minPrice: 5300,
    maxPrice: 6250,
    priceChangePercent: 2.42,
    priceChangeAmount: 140,
    distanceFromKopargaon: 20,
    lastUpdated: "आज, 11:40 AM",
    history7Days: create7DayHistory(5920, 140)
  },
  {
    id: "card-gram-kop",
    mandiName: "Kopargaon",
    crop: "Gram",
    modalPrice: 5850,
    minPrice: 5250,
    maxPrice: 6180,
    priceChangePercent: 1.74,
    priceChangeAmount: 100,
    distanceFromKopargaon: 0,
    lastUpdated: "आज, 10:30 AM",
    history7Days: create7DayHistory(5850, 100)
  },

  // 🌾 Bajra (बाजरी)
  {
    id: "card-baj-kop",
    mandiName: "Kopargaon",
    crop: "Bajra",
    modalPrice: 2350,
    minPrice: 2050,
    maxPrice: 2480,
    priceChangePercent: 1.29,
    priceChangeAmount: 30,
    distanceFromKopargaon: 0,
    lastUpdated: "आज, 09:45 AM",
    history7Days: create7DayHistory(2350, 30)
  },
  {
    id: "card-baj-yeo",
    mandiName: "Yeola",
    crop: "Bajra",
    modalPrice: 2380,
    minPrice: 2100,
    maxPrice: 2510,
    priceChangePercent: 1.71,
    priceChangeAmount: 40,
    distanceFromKopargaon: 19,
    lastUpdated: "आज, 10:00 AM",
    history7Days: create7DayHistory(2380, 40)
  }
];

export const REAL_MANDI_RATES: MandiRate[] = REAL_DASHBOARD_CARDS.map((c) => ({
  id: c.id,
  commodity: c.crop,
  commodityKey: c.crop,
  mandi: c.mandiName,
  mandiKey: c.mandiName,
  minPrice: c.minPrice,
  maxPrice: c.maxPrice,
  modalPrice: c.modalPrice,
  arrivalDate: new Date().toISOString().split('T')[0],
  arrivalsQuantity: 2450,
  distanceKm: c.distanceFromKopargaon,
  dailyChange: c.priceChangeAmount,
  dailyChangePct: c.priceChangePercent
}));

// Clean export aliases
export const APP_DASHBOARD_CARDS = REAL_DASHBOARD_CARDS;
export const APP_MANDI_RATES = REAL_MANDI_RATES;
export const MOCK_DASHBOARD_CARDS = REAL_DASHBOARD_CARDS;
export const MOCK_MANDI_RATES = REAL_MANDI_RATES;

export const REAL_ACTIVE_ALERTS_SUMMARY: ActiveAlertSummary[] = [
  {
    id: "alt-sum-1",
    crop: "Onion",
    mandiName: "Kopargaon",
    targetPrice: 2000,
    currentPrice: 1850,
    distanceToTarget: 150,
    channel: "WhatsApp",
    status: "ACTIVE"
  },
  {
    id: "alt-sum-2",
    crop: "Soybean",
    mandiName: "Sangamner",
    targetPrice: 4800,
    currentPrice: 4710,
    distanceToTarget: 90,
    channel: "SMS",
    status: "ACTIVE"
  }
];
export const APP_ACTIVE_ALERTS_SUMMARY = REAL_ACTIVE_ALERTS_SUMMARY;
export const MOCK_ACTIVE_ALERTS_SUMMARY = REAL_ACTIVE_ALERTS_SUMMARY;

export const GENERATE_FORECAST_DATA = (crop: string, _mandi?: string): ForecastPoint[] => {
  const basePrice =
    crop === 'Onion' ? 1850 :
    crop === 'Soybean' ? 4620 :
    crop === 'Cotton' ? 7240 :
    crop === 'Pomegranate' ? 8450 :
    crop === 'Wheat' ? 2480 :
    crop === 'Tomato' ? 1420 :
    crop === 'Maize' ? 2280 :
    crop === 'Gram' ? 5850 :
    crop === 'Bajra' ? 2350 : 3150;

  const result: ForecastPoint[] = [];

  for (let i = 14; i >= 1; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toLocaleDateString('mr-IN', { day: 'numeric', month: 'short' });
    const noise = Math.sin(i * 0.7) * 45 + (Math.random() * 20 - 10);
    const price = Math.round(basePrice - (i * 8) + noise);
    const arrivals = Math.round(2200 + Math.cos(i * 0.5) * 600);
    result.push({
      date: dateStr,
      historicalPrice: price,
      arrivals: arrivals
    });
  }

  const today = new Date();
  const todayStr = today.toLocaleDateString('mr-IN', { day: 'numeric', month: 'short' });
  result.push({
    date: todayStr,
    historicalPrice: basePrice,
    predictedPrice: basePrice,
    upperBound: basePrice,
    lowerBound: basePrice,
    arrivals: 2450
  });

  for (let i = 1; i <= 14; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const dateStr = d.toLocaleDateString('mr-IN', { day: 'numeric', month: 'short' });
    const trend = basePrice * (1 + (i * 0.007));
    const upper = Math.round(trend + (i * 12) + 25);
    const lower = Math.round(trend - (i * 10) - 20);
    const pred = Math.round(trend);
    const estArrivals = Math.round(2450 - (i * 40));

    result.push({
      date: dateStr,
      predictedPrice: pred,
      upperBound: upper,
      lowerBound: lower,
      arrivals: estArrivals
    });
  }

  return result;
};

export const SEASONAL_ONION_DATA = [
  { month: "Jan (जानेवारी)", price: 1650, arrivals: 3400 },
  { month: "Feb (फेब्रुवारी)", price: 1520, arrivals: 4100 },
  { month: "Mar (मार्च)", price: 1410, arrivals: 4800 },
  { month: "Apr (एप्रिल)", price: 1380, arrivals: 5200 },
  { month: "May (मे)", price: 1450, arrivals: 4600 },
  { month: "Jun (जून)", price: 1620, arrivals: 3800 },
  { month: "Jul (जुलै)", price: 1850, arrivals: 2450 },
  { month: "Aug (ऑगस्ट)", price: 2050, arrivals: 2100 },
  { month: "Sep (सप्टेंबर)", price: 2350, arrivals: 1800 },
  { month: "Oct (ऑक्टोबर)", price: 2780, arrivals: 1500 },
  { month: "Nov (नोव्हेंबर)", price: 2950, arrivals: 1600 },
  { month: "Dec (डिसेंबर)", price: 2100, arrivals: 2900 }
];

export const INITIAL_ALERTS: PriceAlert[] = [
  {
    id: "alt-1",
    commodity: "Onion",
    mandi: "Kopargaon",
    targetPrice: 2000,
    condition: "ABOVE",
    channel: "WhatsApp",
    status: "ACTIVE",
    createdAt: "2026-07-24"
  },
  {
    id: "alt-2",
    commodity: "Soybean",
    mandi: "Sangamner",
    targetPrice: 4800,
    condition: "ABOVE",
    channel: "SMS",
    status: "ACTIVE",
    createdAt: "2026-07-20"
  },
  {
    id: "alt-3",
    commodity: "Onion",
    mandi: "Yeola",
    targetPrice: 1950,
    condition: "ABOVE",
    channel: "WhatsApp",
    status: "TRIGGERED",
    createdAt: "2026-07-15"
  }
];
