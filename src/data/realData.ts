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

export const REAL_DASHBOARD_CARDS: MandiPriceCardItem[] = [
  // Onion (कांदा)
  {
    id: "card-on-kop",
    mandiName: "Kopargaon",
    crop: "Onion",
    modalPrice: 1850,
    minPrice: 1650,
    maxPrice: 2020,
    priceChangePercent: 3.35,
    priceChangeAmount: 60,
    distanceFromKopargaon: 0,
    lastUpdated: "आज, 11:30 AM",
    history7Days: [
      { date: "20 Jul", price: 1720 },
      { date: "21 Jul", price: 1740 },
      { date: "22 Jul", price: 1710 },
      { date: "23 Jul", price: 1780 },
      { date: "24 Jul", price: 1810 },
      { date: "25 Jul", price: 1840 },
      { date: "26 Jul", price: 1850 }
    ]
  },
  {
    id: "card-on-rah",
    mandiName: "Rahata",
    crop: "Onion",
    modalPrice: 1920,
    minPrice: 1720,
    maxPrice: 2080,
    priceChangePercent: 4.63,
    priceChangeAmount: 85,
    distanceFromKopargaon: 20,
    lastUpdated: "आज, 11:45 AM",
    history7Days: [
      { date: "20 Jul", price: 1790 },
      { date: "21 Jul", price: 1810 },
      { date: "22 Jul", price: 1800 },
      { date: "23 Jul", price: 1850 },
      { date: "24 Jul", price: 1880 },
      { date: "25 Jul", price: 1900 },
      { date: "26 Jul", price: 1920 }
    ]
  },
  {
    id: "card-on-yeo",
    mandiName: "Yeola",
    crop: "Onion",
    modalPrice: 1980,
    minPrice: 1780,
    maxPrice: 2150,
    priceChangePercent: 5.88,
    priceChangeAmount: 110,
    distanceFromKopargaon: 19,
    lastUpdated: "आज, 10:30 AM",
    history7Days: [
      { date: "20 Jul", price: 1820 },
      { date: "21 Jul", price: 1850 },
      { date: "22 Jul", price: 1840 },
      { date: "23 Jul", price: 1890 },
      { date: "24 Jul", price: 1920 },
      { date: "25 Jul", price: 1950 },
      { date: "26 Jul", price: 1980 }
    ]
  },
  {
    id: "card-on-las",
    mandiName: "Lasalgaon",
    crop: "Onion",
    modalPrice: 2120,
    minPrice: 1920,
    maxPrice: 2340,
    priceChangePercent: 8.16,
    priceChangeAmount: 160,
    distanceFromKopargaon: 50,
    lastUpdated: "आज, 10:45 AM",
    history7Days: [
      { date: "20 Jul", price: 1880 },
      { date: "21 Jul", price: 1910 },
      { date: "22 Jul", price: 1950 },
      { date: "23 Jul", price: 2000 },
      { date: "24 Jul", price: 2050 },
      { date: "25 Jul", price: 2090 },
      { date: "26 Jul", price: 2120 }
    ]
  },
  {
    id: "card-on-nas",
    mandiName: "Nashik",
    crop: "Onion",
    modalPrice: 2050,
    minPrice: 1850,
    maxPrice: 2280,
    priceChangePercent: 7.33,
    priceChangeAmount: 140,
    distanceFromKopargaon: 90,
    lastUpdated: "आज, 12:15 PM",
    history7Days: [
      { date: "20 Jul", price: 1880 },
      { date: "21 Jul", price: 1910 },
      { date: "22 Jul", price: 1900 },
      { date: "23 Jul", price: 1960 },
      { date: "24 Jul", price: 1990 },
      { date: "25 Jul", price: 2020 },
      { date: "26 Jul", price: 2050 }
    ]
  },
  {
    id: "card-on-san",
    mandiName: "Sangamner",
    crop: "Onion",
    modalPrice: 1810,
    minPrice: 1620,
    maxPrice: 1980,
    priceChangePercent: -1.36,
    priceChangeAmount: -25,
    distanceFromKopargaon: 52,
    lastUpdated: "आज, 11:10 AM",
    history7Days: [
      { date: "20 Jul", price: 1850 },
      { date: "21 Jul", price: 1860 },
      { date: "22 Jul", price: 1840 },
      { date: "23 Jul", price: 1830 },
      { date: "24 Jul", price: 1820 },
      { date: "25 Jul", price: 1825 },
      { date: "26 Jul", price: 1810 }
    ]
  },

  // Soybean (सोयाबीन)
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
    history7Days: [
      { date: "20 Jul", price: 4500 },
      { date: "21 Jul", price: 4520 },
      { date: "22 Jul", price: 4550 },
      { date: "23 Jul", price: 4580 },
      { date: "24 Jul", price: 4590 },
      { date: "25 Jul", price: 4600 },
      { date: "26 Jul", price: 4620 }
    ]
  },
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
    history7Days: [
      { date: "20 Jul", price: 4560 },
      { date: "21 Jul", price: 4590 },
      { date: "22 Jul", price: 4620 },
      { date: "23 Jul", price: 4650 },
      { date: "24 Jul", price: 4680 },
      { date: "25 Jul", price: 4700 },
      { date: "26 Jul", price: 4710 }
    ]
  },

  // Cotton (कापूस)
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
    history7Days: [
      { date: "20 Jul", price: 7280 },
      { date: "21 Jul", price: 7300 },
      { date: "22 Jul", price: 7320 },
      { date: "23 Jul", price: 7340 },
      { date: "24 Jul", price: 7350 },
      { date: "25 Jul", price: 7360 },
      { date: "26 Jul", price: 7380 }
    ]
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
    history7Days: [
      { date: "20 Jul", price: 7350 },
      { date: "21 Jul", price: 7340 },
      { date: "22 Jul", price: 7300 },
      { date: "23 Jul", price: 7280 },
      { date: "24 Jul", price: 7260 },
      { date: "25 Jul", price: 7250 },
      { date: "26 Jul", price: 7240 }
    ]
  },

  // Sugarcane (ऊस)
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
    history7Days: [
      { date: "20 Jul", price: 3150 },
      { date: "21 Jul", price: 3150 },
      { date: "22 Jul", price: 3150 },
      { date: "23 Jul", price: 3150 },
      { date: "24 Jul", price: 3150 },
      { date: "25 Jul", price: 3150 },
      { date: "26 Jul", price: 3150 }
    ]
  },

  // Pomegranate (डाळिंब)
  {
    id: "card-pom-rah",
    mandiName: "Rahata",
    crop: "Pomegranate",
    modalPrice: 8450,
    minPrice: 7500,
    maxPrice: 9600,
    priceChangePercent: 2.67,
    priceChangeAmount: 220,
    distanceFromKopargaon: 14,
    lastUpdated: "आज, 11:50 AM",
    history7Days: [
      { date: "20 Jul", price: 8100 },
      { date: "21 Jul", price: 8150 },
      { date: "22 Jul", price: 8200 },
      { date: "23 Jul", price: 8280 },
      { date: "24 Jul", price: 8350 },
      { date: "25 Jul", price: 8400 },
      { date: "26 Jul", price: 8450 }
    ]
  },

  // Wheat (गहू)
  {
    id: "card-whe-kop",
    mandiName: "Kopargaon",
    crop: "Wheat",
    modalPrice: 2480,
    minPrice: 2320,
    maxPrice: 2610,
    priceChangePercent: 0.61,
    priceChangeAmount: 15,
    distanceFromKopargaon: 0,
    lastUpdated: "आज, 10:00 AM",
    history7Days: [
      { date: "20 Jul", price: 2450 },
      { date: "21 Jul", price: 2455 },
      { date: "22 Jul", price: 2460 },
      { date: "23 Jul", price: 2465 },
      { date: "24 Jul", price: 2470 },
      { date: "25 Jul", price: 2475 },
      { date: "26 Jul", price: 2480 }
    ]
  },
  {
    id: "card-whe-las",
    mandiName: "Lasalgaon",
    crop: "Wheat",
    modalPrice: 2540,
    minPrice: 2380,
    maxPrice: 2690,
    priceChangePercent: 1.6,
    priceChangeAmount: 40,
    distanceFromKopargaon: 50,
    lastUpdated: "आज, 10:30 AM",
    history7Days: [
      { date: "20 Jul", price: 2480 },
      { date: "21 Jul", price: 2490 },
      { date: "22 Jul", price: 2500 },
      { date: "23 Jul", price: 2510 },
      { date: "24 Jul", price: 2520 },
      { date: "25 Jul", price: 2530 },
      { date: "26 Jul", price: 2540 }
    ]
  },

  // Tomato (टोमॅटो)
  {
    id: "card-tom-san",
    mandiName: "Sangamner",
    crop: "Tomato",
    modalPrice: 1420,
    minPrice: 1100,
    maxPrice: 1750,
    priceChangePercent: 6.77,
    priceChangeAmount: 90,
    distanceFromKopargaon: 52,
    lastUpdated: "आज, 11:15 AM",
    history7Days: [
      { date: "20 Jul", price: 1250 },
      { date: "21 Jul", price: 1280 },
      { date: "22 Jul", price: 1300 },
      { date: "23 Jul", price: 1340 },
      { date: "24 Jul", price: 1370 },
      { date: "25 Jul", price: 1390 },
      { date: "26 Jul", price: 1420 }
    ]
  },
  {
    id: "card-tom-nas",
    mandiName: "Nashik",
    crop: "Tomato",
    modalPrice: 1550,
    minPrice: 1200,
    maxPrice: 1880,
    priceChangePercent: 8.39,
    priceChangeAmount: 120,
    distanceFromKopargaon: 90,
    lastUpdated: "आज, 12:00 PM",
    history7Days: [
      { date: "20 Jul", price: 1350 },
      { date: "21 Jul", price: 1380 },
      { date: "22 Jul", price: 1420 },
      { date: "23 Jul", price: 1460 },
      { date: "24 Jul", price: 1490 },
      { date: "25 Jul", price: 1520 },
      { date: "26 Jul", price: 1550 }
    ]
  },
  {
    id: "card-tom-kop",
    mandiName: "Kopargaon",
    crop: "Tomato",
    modalPrice: 1380,
    minPrice: 1050,
    maxPrice: 1650,
    priceChangePercent: 3.76,
    priceChangeAmount: 50,
    distanceFromKopargaon: 0,
    lastUpdated: "आज, 10:45 AM",
    history7Days: [
      { date: "20 Jul", price: 1280 },
      { date: "21 Jul", price: 1300 },
      { date: "22 Jul", price: 1310 },
      { date: "23 Jul", price: 1330 },
      { date: "24 Jul", price: 1350 },
      { date: "25 Jul", price: 1360 },
      { date: "26 Jul", price: 1380 }
    ]
  },

  // Maize (मका)
  {
    id: "card-maize-kop",
    mandiName: "Kopargaon",
    crop: "Maize",
    modalPrice: 2280,
    minPrice: 2120,
    maxPrice: 2410,
    priceChangePercent: 2.24,
    priceChangeAmount: 50,
    distanceFromKopargaon: 0,
    lastUpdated: "आज, 11:00 AM",
    history7Days: [
      { date: "20 Jul", price: 2200 },
      { date: "21 Jul", price: 2210 },
      { date: "22 Jul", price: 2230 },
      { date: "23 Jul", price: 2240 },
      { date: "24 Jul", price: 2250 },
      { date: "25 Jul", price: 2260 },
      { date: "26 Jul", price: 2280 }
    ]
  },
  {
    id: "card-maize-yeo",
    mandiName: "Yeola",
    crop: "Maize",
    modalPrice: 2320,
    minPrice: 2150,
    maxPrice: 2450,
    priceChangePercent: 3.11,
    priceChangeAmount: 70,
    distanceFromKopargaon: 19,
    lastUpdated: "आज, 11:20 AM",
    history7Days: [
      { date: "20 Jul", price: 2220 },
      { date: "21 Jul", price: 2240 },
      { date: "22 Jul", price: 2260 },
      { date: "23 Jul", price: 2280 },
      { date: "24 Jul", price: 2290 },
      { date: "25 Jul", price: 2300 },
      { date: "26 Jul", price: 2320 }
    ]
  },

  // Gram / Chickpea (हरभरा)
  {
    id: "card-gram-kop",
    mandiName: "Kopargaon",
    crop: "Gram",
    modalPrice: 5850,
    minPrice: 5450,
    maxPrice: 6180,
    priceChangePercent: 1.74,
    priceChangeAmount: 100,
    distanceFromKopargaon: 0,
    lastUpdated: "आज, 10:30 AM",
    history7Days: [
      { date: "20 Jul", price: 5700 },
      { date: "21 Jul", price: 5720 },
      { date: "22 Jul", price: 5750 },
      { date: "23 Jul", price: 5780 },
      { date: "24 Jul", price: 5800 },
      { date: "25 Jul", price: 5820 },
      { date: "26 Jul", price: 5850 }
    ]
  },
  {
    id: "card-gram-rah",
    mandiName: "Rahata",
    crop: "Gram",
    modalPrice: 5920,
    minPrice: 5500,
    maxPrice: 6250,
    priceChangePercent: 2.42,
    priceChangeAmount: 140,
    distanceFromKopargaon: 20,
    lastUpdated: "आज, 11:40 AM",
    history7Days: [
      { date: "20 Jul", price: 5750 },
      { date: "21 Jul", price: 5770 },
      { date: "22 Jul", price: 5800 },
      { date: "23 Jul", price: 5840 },
      { date: "24 Jul", price: 5880 },
      { date: "25 Jul", price: 5900 },
      { date: "26 Jul", price: 5920 }
    ]
  },

  // Bajra (बाजरी)
  {
    id: "card-baj-kop",
    mandiName: "Kopargaon",
    crop: "Bajra",
    modalPrice: 2350,
    minPrice: 2180,
    maxPrice: 2480,
    priceChangePercent: 1.29,
    priceChangeAmount: 30,
    distanceFromKopargaon: 0,
    lastUpdated: "आज, 09:45 AM",
    history7Days: [
      { date: "20 Jul", price: 2300 },
      { date: "21 Jul", price: 2310 },
      { date: "22 Jul", price: 2320 },
      { date: "23 Jul", price: 2330 },
      { date: "24 Jul", price: 2340 },
      { date: "25 Jul", price: 2345 },
      { date: "26 Jul", price: 2350 }
    ]
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
  arrivalDate: "2026-07-26",
  arrivalsQuantity: 2450,
  distanceKm: c.distanceFromKopargaon,
  dailyChange: c.priceChangeAmount,
  dailyChangePct: c.priceChangePercent
}));

// Backwards compatibility aliases
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
export const MOCK_ACTIVE_ALERTS_SUMMARY = REAL_ACTIVE_ALERTS_SUMMARY;

export const GENERATE_FORECAST_DATA = (crop: string, _mandi?: string): ForecastPoint[] => {
  const basePrice = crop === 'Onion' ? 1850 : crop === 'Soybean' ? 4620 : crop === 'Cotton' ? 7240 : 2480;
  const result: ForecastPoint[] = [];

  for (let i = 14; i >= 1; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
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
  const todayStr = today.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
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
    const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
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
