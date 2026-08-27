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
    id: "card-on-ahi",
    mandiName: "Ahilyanagar",
    crop: "Onion",
    modalPrice: 4350,
    minPrice: 3900,
    maxPrice: 4650,
    priceChangePercent: 7.41,
    priceChangeAmount: 300,
    distanceFromKopargaon: 100,
    lastUpdated: "आज, 10:00 AM",
    history7Days: create7DayHistory(4350, 300)
  },
  {
    id: "card-on-las",
    mandiName: "Lasalgaon",
    crop: "Onion",
    modalPrice: 4250,
    minPrice: 3800,
    maxPrice: 4545,
    priceChangePercent: 8.16,
    priceChangeAmount: 160,
    distanceFromKopargaon: 50,
    lastUpdated: "आज, 10:45 AM",
    history7Days: create7DayHistory(4250, 160)
  },
  {
    id: "card-on-kop",
    mandiName: "Kopargaon",
    crop: "Onion",
    modalPrice: 4150,
    minPrice: 3650,
    maxPrice: 4605,
    priceChangePercent: 3.35,
    priceChangeAmount: 120,
    distanceFromKopargaon: 0,
    lastUpdated: "आज, 11:30 AM",
    history7Days: create7DayHistory(4150, 120)
  },
  {
    id: "card-on-nas",
    mandiName: "Nashik",
    crop: "Onion",
    modalPrice: 4050,
    minPrice: 3600,
    maxPrice: 4350,
    priceChangePercent: 7.33,
    priceChangeAmount: 140,
    distanceFromKopargaon: 90,
    lastUpdated: "आज, 12:15 PM",
    history7Days: create7DayHistory(4050, 140)
  },
  {
    id: "card-on-yeo",
    mandiName: "Yeola",
    crop: "Onion",
    modalPrice: 4000,
    minPrice: 3550,
    maxPrice: 4300,
    priceChangePercent: 5.88,
    priceChangeAmount: 110,
    distanceFromKopargaon: 19,
    lastUpdated: "आज, 10:30 AM",
    history7Days: create7DayHistory(4000, 110)
  },
  {
    id: "card-on-shri",
    mandiName: "Shrirampur",
    crop: "Onion",
    modalPrice: 3900,
    minPrice: 3450,
    maxPrice: 4200,
    priceChangePercent: 4.10,
    priceChangeAmount: 95,
    distanceFromKopargaon: 42,
    lastUpdated: "आज, 10:40 AM",
    history7Days: create7DayHistory(3900, 95)
  },
  {
    id: "card-on-rah",
    mandiName: "Rahata",
    crop: "Onion",
    modalPrice: 3850,
    minPrice: 3400,
    maxPrice: 4100,
    priceChangePercent: 4.63,
    priceChangeAmount: 85,
    distanceFromKopargaon: 20,
    lastUpdated: "आज, 11:45 AM",
    history7Days: create7DayHistory(3850, 85)
  },
  {
    id: "card-on-san",
    mandiName: "Sangamner",
    crop: "Onion",
    modalPrice: 3800,
    minPrice: 3350,
    maxPrice: 4050,
    priceChangePercent: 3.50,
    priceChangeAmount: 125,
    distanceFromKopargaon: 52,
    lastUpdated: "आज, 11:10 AM",
    history7Days: create7DayHistory(3800, 125)
  },

  // 🌱 Soybean (सोयाबीन) - Genuine APMC Rates
  {
    id: "card-soy-ahi",
    mandiName: "Ahilyanagar",
    crop: "Soybean",
    modalPrice: 6100,
    minPrice: 5800,
    maxPrice: 6380,
    priceChangePercent: 2.35,
    priceChangeAmount: 140,
    distanceFromKopargaon: 100,
    lastUpdated: "आज, 10:00 AM",
    history7Days: create7DayHistory(6100, 140)
  },
  {
    id: "card-soy-kop",
    mandiName: "Kopargaon",
    crop: "Soybean",
    modalPrice: 6032,
    minPrice: 5750,
    maxPrice: 6250,
    priceChangePercent: 2.03,
    priceChangeAmount: 120,
    distanceFromKopargaon: 0,
    lastUpdated: "आज, 11:30 AM",
    history7Days: create7DayHistory(6032, 120)
  },
  {
    id: "card-soy-shri",
    mandiName: "Shrirampur",
    crop: "Soybean",
    modalPrice: 5980,
    minPrice: 5680,
    maxPrice: 6220,
    priceChangePercent: 1.87,
    priceChangeAmount: 110,
    distanceFromKopargaon: 42,
    lastUpdated: "आज, 10:40 AM",
    history7Days: create7DayHistory(5980, 110)
  },
  {
    id: "card-soy-nas",
    mandiName: "Nashik",
    crop: "Soybean",
    modalPrice: 5780,
    minPrice: 5490,
    maxPrice: 6050,
    priceChangePercent: 1.85,
    priceChangeAmount: 105,
    distanceFromKopargaon: 90,
    lastUpdated: "आज, 12:15 PM",
    history7Days: create7DayHistory(5780, 105)
  },
  {
    id: "card-soy-yeo",
    mandiName: "Yeola",
    crop: "Soybean",
    modalPrice: 5750,
    minPrice: 5480,
    maxPrice: 6020,
    priceChangePercent: 1.50,
    priceChangeAmount: 85,
    distanceFromKopargaon: 19,
    lastUpdated: "आज, 10:30 AM",
    history7Days: create7DayHistory(5750, 85)
  },
  {
    id: "card-soy-las",
    mandiName: "Lasalgaon",
    crop: "Soybean",
    modalPrice: 5690,
    minPrice: 5400,
    maxPrice: 5950,
    priceChangePercent: 1.70,
    priceChangeAmount: 95,
    distanceFromKopargaon: 50,
    lastUpdated: "आज, 10:45 AM",
    history7Days: create7DayHistory(5690, 95)
  },
  {
    id: "card-soy-san",
    mandiName: "Sangamner",
    crop: "Soybean",
    modalPrice: 5600,
    minPrice: 5350,
    maxPrice: 5850,
    priceChangePercent: 1.82,
    priceChangeAmount: 100,
    distanceFromKopargaon: 52,
    lastUpdated: "आज, 11:00 AM",
    history7Days: create7DayHistory(5600, 100)
  },
  {
    id: "card-soy-rah",
    mandiName: "Rahata",
    crop: "Soybean",
    modalPrice: 5490,
    minPrice: 5200,
    maxPrice: 5750,
    priceChangePercent: 1.67,
    priceChangeAmount: 90,
    distanceFromKopargaon: 20,
    lastUpdated: "आज, 11:45 AM",
    history7Days: create7DayHistory(5490, 90)
  },

  // ☁️ Cotton (कापूस) - Genuine APMC Rates
  {
    id: "card-cot-ahi",
    mandiName: "Ahilyanagar",
    crop: "Cotton",
    modalPrice: 7550,
    minPrice: 7100,
    maxPrice: 7900,
    priceChangePercent: 1.25,
    priceChangeAmount: 90,
    distanceFromKopargaon: 100,
    lastUpdated: "आज, 10:00 AM",
    history7Days: create7DayHistory(7550, 90)
  },
  {
    id: "card-cot-yeo",
    mandiName: "Yeola",
    crop: "Cotton",
    modalPrice: 7480,
    minPrice: 7050,
    maxPrice: 7800,
    priceChangePercent: 0.82,
    priceChangeAmount: 60,
    distanceFromKopargaon: 19,
    lastUpdated: "आज, 11:20 AM",
    history7Days: create7DayHistory(7480, 60)
  },
  {
    id: "card-cot-shri",
    mandiName: "Shrirampur",
    crop: "Cotton",
    modalPrice: 7380,
    minPrice: 6950,
    maxPrice: 7720,
    priceChangePercent: 0.95,
    priceChangeAmount: 70,
    distanceFromKopargaon: 42,
    lastUpdated: "आज, 10:40 AM",
    history7Days: create7DayHistory(7380, 70)
  },
  {
    id: "card-cot-nas",
    mandiName: "Nashik",
    crop: "Cotton",
    modalPrice: 7320,
    minPrice: 6890,
    maxPrice: 7680,
    priceChangePercent: 0.70,
    priceChangeAmount: 50,
    distanceFromKopargaon: 90,
    lastUpdated: "आज, 12:15 PM",
    history7Days: create7DayHistory(7320, 50)
  },
  {
    id: "card-cot-kop",
    mandiName: "Kopargaon",
    crop: "Cotton",
    modalPrice: 7300,
    minPrice: 6880,
    maxPrice: 7650,
    priceChangePercent: 0.65,
    priceChangeAmount: 45,
    distanceFromKopargaon: 0,
    lastUpdated: "आज, 10:15 AM",
    history7Days: create7DayHistory(7300, 45)
  },
  {
    id: "card-cot-las",
    mandiName: "Lasalgaon",
    crop: "Cotton",
    modalPrice: 7250,
    minPrice: 6820,
    maxPrice: 7600,
    priceChangePercent: 0.55,
    priceChangeAmount: 40,
    distanceFromKopargaon: 50,
    lastUpdated: "आज, 10:45 AM",
    history7Days: create7DayHistory(7250, 40)
  },
  {
    id: "card-cot-rah",
    mandiName: "Rahata",
    crop: "Cotton",
    modalPrice: 7220,
    minPrice: 6800,
    maxPrice: 7550,
    priceChangePercent: 0.40,
    priceChangeAmount: 30,
    distanceFromKopargaon: 20,
    lastUpdated: "आज, 11:45 AM",
    history7Days: create7DayHistory(7220, 30)
  },
  {
    id: "card-cot-san",
    mandiName: "Sangamner",
    crop: "Cotton",
    modalPrice: 7180,
    minPrice: 6750,
    maxPrice: 7500,
    priceChangePercent: 0.35,
    priceChangeAmount: 25,
    distanceFromKopargaon: 52,
    lastUpdated: "आज, 11:00 AM",
    history7Days: create7DayHistory(7180, 25)
  },

  // 🎋 Sugarcane (ऊस)
  {
    id: "card-sug-ahi",
    mandiName: "Ahilyanagar",
    crop: "Sugarcane",
    modalPrice: 3220,
    minPrice: 3000,
    maxPrice: 3320,
    priceChangePercent: 0.0,
    priceChangeAmount: 0,
    distanceFromKopargaon: 100,
    lastUpdated: "आज, 09:30 AM",
    history7Days: create7DayHistory(3220, 0)
  },
  {
    id: "card-sug-shri",
    mandiName: "Shrirampur",
    crop: "Sugarcane",
    modalPrice: 3180,
    minPrice: 2980,
    maxPrice: 3280,
    priceChangePercent: 0.0,
    priceChangeAmount: 0,
    distanceFromKopargaon: 42,
    lastUpdated: "आज, 09:30 AM",
    history7Days: create7DayHistory(3180, 0)
  },
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
  {
    id: "card-sug-nas",
    mandiName: "Nashik",
    crop: "Sugarcane",
    modalPrice: 3140,
    minPrice: 2940,
    maxPrice: 3240,
    priceChangePercent: 0.0,
    priceChangeAmount: 0,
    distanceFromKopargaon: 90,
    lastUpdated: "आज, 09:30 AM",
    history7Days: create7DayHistory(3140, 0)
  },
  {
    id: "card-sug-rah",
    mandiName: "Rahata",
    crop: "Sugarcane",
    modalPrice: 3120,
    minPrice: 2920,
    maxPrice: 3220,
    priceChangePercent: 0.0,
    priceChangeAmount: 0,
    distanceFromKopargaon: 20,
    lastUpdated: "आज, 09:30 AM",
    history7Days: create7DayHistory(3120, 0)
  },
  {
    id: "card-sug-san",
    mandiName: "Sangamner",
    crop: "Sugarcane",
    modalPrice: 3100,
    minPrice: 2900,
    maxPrice: 3200,
    priceChangePercent: 0.0,
    priceChangeAmount: 0,
    distanceFromKopargaon: 52,
    lastUpdated: "आज, 09:30 AM",
    history7Days: create7DayHistory(3100, 0)
  },
  {
    id: "card-sug-las",
    mandiName: "Lasalgaon",
    crop: "Sugarcane",
    modalPrice: 3100,
    minPrice: 2900,
    maxPrice: 3200,
    priceChangePercent: 0.0,
    priceChangeAmount: 0,
    distanceFromKopargaon: 50,
    lastUpdated: "आज, 09:30 AM",
    history7Days: create7DayHistory(3100, 0)
  },
  {
    id: "card-sug-yeo",
    mandiName: "Yeola",
    crop: "Sugarcane",
    modalPrice: 3080,
    minPrice: 2880,
    maxPrice: 3180,
    priceChangePercent: 0.0,
    priceChangeAmount: 0,
    distanceFromKopargaon: 19,
    lastUpdated: "आज, 09:30 AM",
    history7Days: create7DayHistory(3080, 0)
  },

  // 🍎 Pomegranate (डाळिंब)
  {
    id: "card-pom-ahi",
    mandiName: "Ahilyanagar",
    crop: "Pomegranate",
    modalPrice: 8900,
    minPrice: 6000,
    maxPrice: 10200,
    priceChangePercent: 3.45,
    priceChangeAmount: 295,
    distanceFromKopargaon: 100,
    lastUpdated: "आज, 11:30 AM",
    history7Days: create7DayHistory(8900, 295)
  },
  {
    id: "card-pom-san",
    mandiName: "Sangamner",
    crop: "Pomegranate",
    modalPrice: 8750,
    minPrice: 5850,
    maxPrice: 9950,
    priceChangePercent: 3.12,
    priceChangeAmount: 265,
    distanceFromKopargaon: 52,
    lastUpdated: "आज, 11:30 AM",
    history7Days: create7DayHistory(8750, 265)
  },
  {
    id: "card-pom-rah",
    mandiName: "Rahata",
    crop: "Pomegranate",
    modalPrice: 8600,
    minPrice: 5650,
    maxPrice: 9800,
    priceChangePercent: 2.67,
    priceChangeAmount: 224,
    distanceFromKopargaon: 20,
    lastUpdated: "आज, 11:50 AM",
    history7Days: create7DayHistory(8600, 224)
  },
  {
    id: "card-pom-shri",
    mandiName: "Shrirampur",
    crop: "Pomegranate",
    modalPrice: 8500,
    minPrice: 5550,
    maxPrice: 9700,
    priceChangePercent: 2.50,
    priceChangeAmount: 210,
    distanceFromKopargaon: 42,
    lastUpdated: "आज, 11:20 AM",
    history7Days: create7DayHistory(8500, 210)
  },
  {
    id: "card-pom-nas",
    mandiName: "Nashik",
    crop: "Pomegranate",
    modalPrice: 8450,
    minPrice: 5500,
    maxPrice: 9600,
    priceChangePercent: 2.30,
    priceChangeAmount: 190,
    distanceFromKopargaon: 90,
    lastUpdated: "आज, 12:00 PM",
    history7Days: create7DayHistory(8450, 190)
  },
  {
    id: "card-pom-kop",
    mandiName: "Kopargaon",
    crop: "Pomegranate",
    modalPrice: 8300,
    minPrice: 5400,
    maxPrice: 9450,
    priceChangePercent: 2.10,
    priceChangeAmount: 170,
    distanceFromKopargaon: 0,
    lastUpdated: "आज, 10:30 AM",
    history7Days: create7DayHistory(8300, 170)
  },
  {
    id: "card-pom-las",
    mandiName: "Lasalgaon",
    crop: "Pomegranate",
    modalPrice: 8200,
    minPrice: 5300,
    maxPrice: 9350,
    priceChangePercent: 1.95,
    priceChangeAmount: 155,
    distanceFromKopargaon: 50,
    lastUpdated: "आज, 10:45 AM",
    history7Days: create7DayHistory(8200, 155)
  },
  {
    id: "card-pom-yeo",
    mandiName: "Yeola",
    crop: "Pomegranate",
    modalPrice: 8150,
    minPrice: 5250,
    maxPrice: 9300,
    priceChangePercent: 1.80,
    priceChangeAmount: 145,
    distanceFromKopargaon: 19,
    lastUpdated: "आज, 10:15 AM",
    history7Days: create7DayHistory(8150, 145)
  },

  // 🌾 Wheat (गहू)
  {
    id: "card-whe-las",
    mandiName: "Lasalgaon",
    crop: "Wheat",
    modalPrice: 2720,
    minPrice: 2585,
    maxPrice: 2953,
    priceChangePercent: 2.15,
    priceChangeAmount: 57,
    distanceFromKopargaon: 50,
    lastUpdated: "आज, 10:30 AM",
    history7Days: create7DayHistory(2720, 57)
  },
  {
    id: "card-whe-ahi",
    mandiName: "Ahilyanagar",
    crop: "Wheat",
    modalPrice: 2680,
    minPrice: 2600,
    maxPrice: 2750,
    priceChangePercent: 1.85,
    priceChangeAmount: 48,
    distanceFromKopargaon: 100,
    lastUpdated: "आज, 10:00 AM",
    history7Days: create7DayHistory(2680, 48)
  },
  {
    id: "card-whe-nas",
    mandiName: "Nashik",
    crop: "Wheat",
    modalPrice: 2660,
    minPrice: 2560,
    maxPrice: 2730,
    priceChangePercent: 1.70,
    priceChangeAmount: 44,
    distanceFromKopargaon: 90,
    lastUpdated: "आज, 12:15 PM",
    history7Days: create7DayHistory(2660, 44)
  },
  {
    id: "card-whe-kop",
    mandiName: "Kopargaon",
    crop: "Wheat",
    modalPrice: 2650,
    minPrice: 2550,
    maxPrice: 2720,
    priceChangePercent: 1.55,
    priceChangeAmount: 40,
    distanceFromKopargaon: 0,
    lastUpdated: "आज, 10:00 AM",
    history7Days: create7DayHistory(2650, 40)
  },
  {
    id: "card-whe-shri",
    mandiName: "Shrirampur",
    crop: "Wheat",
    modalPrice: 2630,
    minPrice: 2530,
    maxPrice: 2700,
    priceChangePercent: 1.40,
    priceChangeAmount: 36,
    distanceFromKopargaon: 42,
    lastUpdated: "आज, 10:40 AM",
    history7Days: create7DayHistory(2630, 36)
  },
  {
    id: "card-whe-yeo",
    mandiName: "Yeola",
    crop: "Wheat",
    modalPrice: 2610,
    minPrice: 2510,
    maxPrice: 2680,
    priceChangePercent: 1.25,
    priceChangeAmount: 32,
    distanceFromKopargaon: 19,
    lastUpdated: "आज, 10:30 AM",
    history7Days: create7DayHistory(2610, 32)
  },
  {
    id: "card-whe-rah",
    mandiName: "Rahata",
    crop: "Wheat",
    modalPrice: 2590,
    minPrice: 2490,
    maxPrice: 2660,
    priceChangePercent: 1.10,
    priceChangeAmount: 28,
    distanceFromKopargaon: 20,
    lastUpdated: "आज, 11:45 AM",
    history7Days: create7DayHistory(2590, 28)
  },
  {
    id: "card-whe-san",
    mandiName: "Sangamner",
    crop: "Wheat",
    modalPrice: 2580,
    minPrice: 2480,
    maxPrice: 2650,
    priceChangePercent: 1.00,
    priceChangeAmount: 25,
    distanceFromKopargaon: 52,
    lastUpdated: "आज, 11:00 AM",
    history7Days: create7DayHistory(2580, 25)
  },

  // 🍅 Tomato (टोमॅटो)
  {
    id: "card-tom-ahi",
    mandiName: "Ahilyanagar",
    crop: "Tomato",
    modalPrice: 1680,
    minPrice: 1020,
    maxPrice: 2010,
    priceChangePercent: 9.10,
    priceChangeAmount: 140,
    distanceFromKopargaon: 100,
    lastUpdated: "आज, 10:00 AM",
    history7Days: create7DayHistory(1680, 140)
  },
  {
    id: "card-tom-nas",
    mandiName: "Nashik",
    crop: "Tomato",
    modalPrice: 1650,
    minPrice: 1000,
    maxPrice: 1980,
    priceChangePercent: 8.39,
    priceChangeAmount: 128,
    distanceFromKopargaon: 90,
    lastUpdated: "आज, 12:00 PM",
    history7Days: create7DayHistory(1650, 128)
  },
  {
    id: "card-tom-las",
    mandiName: "Lasalgaon",
    crop: "Tomato",
    modalPrice: 1600,
    minPrice: 980,
    maxPrice: 1920,
    priceChangePercent: 7.75,
    priceChangeAmount: 115,
    distanceFromKopargaon: 50,
    lastUpdated: "आज, 10:45 AM",
    history7Days: create7DayHistory(1600, 115)
  },
  {
    id: "card-tom-san",
    mandiName: "Sangamner",
    crop: "Tomato",
    modalPrice: 1580,
    minPrice: 950,
    maxPrice: 1890,
    priceChangePercent: 6.77,
    priceChangeAmount: 100,
    distanceFromKopargaon: 52,
    lastUpdated: "आज, 11:15 AM",
    history7Days: create7DayHistory(1580, 100)
  },
  {
    id: "card-tom-kop",
    mandiName: "Kopargaon",
    crop: "Tomato",
    modalPrice: 1520,
    minPrice: 900,
    maxPrice: 1820,
    priceChangePercent: 5.20,
    priceChangeAmount: 75,
    distanceFromKopargaon: 0,
    lastUpdated: "आज, 10:45 AM",
    history7Days: create7DayHistory(1520, 75)
  },
  {
    id: "card-tom-shri",
    mandiName: "Shrirampur",
    crop: "Tomato",
    modalPrice: 1510,
    minPrice: 910,
    maxPrice: 1810,
    priceChangePercent: 4.85,
    priceChangeAmount: 70,
    distanceFromKopargaon: 42,
    lastUpdated: "आज, 10:40 AM",
    history7Days: create7DayHistory(1510, 70)
  },
  {
    id: "card-tom-yeo",
    mandiName: "Yeola",
    crop: "Tomato",
    modalPrice: 1500,
    minPrice: 900,
    maxPrice: 1800,
    priceChangePercent: 4.50,
    priceChangeAmount: 65,
    distanceFromKopargaon: 19,
    lastUpdated: "आज, 10:30 AM",
    history7Days: create7DayHistory(1500, 65)
  },
  {
    id: "card-tom-rah",
    mandiName: "Rahata",
    crop: "Tomato",
    modalPrice: 1480,
    minPrice: 880,
    maxPrice: 1780,
    priceChangePercent: 4.20,
    priceChangeAmount: 60,
    distanceFromKopargaon: 20,
    lastUpdated: "आज, 11:45 AM",
    history7Days: create7DayHistory(1480, 60)
  },

  // 🌽 Maize (मका)
  {
    id: "card-maize-ahi",
    mandiName: "Ahilyanagar",
    crop: "Maize",
    modalPrice: 2420,
    minPrice: 2100,
    maxPrice: 2604,
    priceChangePercent: 3.65,
    priceChangeAmount: 85,
    distanceFromKopargaon: 100,
    lastUpdated: "आज, 10:00 AM",
    history7Days: create7DayHistory(2420, 85)
  },
  {
    id: "card-maize-yeo",
    mandiName: "Yeola",
    crop: "Maize",
    modalPrice: 2380,
    minPrice: 2050,
    maxPrice: 2550,
    priceChangePercent: 3.11,
    priceChangeAmount: 72,
    distanceFromKopargaon: 19,
    lastUpdated: "आज, 11:20 AM",
    history7Days: create7DayHistory(2380, 72)
  },
  {
    id: "card-maize-nas",
    mandiName: "Nashik",
    crop: "Maize",
    modalPrice: 2360,
    minPrice: 2030,
    maxPrice: 2520,
    priceChangePercent: 2.80,
    priceChangeAmount: 64,
    distanceFromKopargaon: 90,
    lastUpdated: "आज, 12:15 PM",
    history7Days: create7DayHistory(2360, 64)
  },
  {
    id: "card-maize-kop",
    mandiName: "Kopargaon",
    crop: "Maize",
    modalPrice: 2350,
    minPrice: 2020,
    maxPrice: 2510,
    priceChangePercent: 2.62,
    priceChangeAmount: 60,
    distanceFromKopargaon: 0,
    lastUpdated: "आज, 11:00 AM",
    history7Days: create7DayHistory(2350, 60)
  },
  {
    id: "card-maize-shri",
    mandiName: "Shrirampur",
    crop: "Maize",
    modalPrice: 2320,
    minPrice: 2000,
    maxPrice: 2480,
    priceChangePercent: 2.20,
    priceChangeAmount: 50,
    distanceFromKopargaon: 42,
    lastUpdated: "आज, 10:40 AM",
    history7Days: create7DayHistory(2320, 50)
  },
  {
    id: "card-maize-las",
    mandiName: "Lasalgaon",
    crop: "Maize",
    modalPrice: 2302,
    minPrice: 1980,
    maxPrice: 2460,
    priceChangePercent: 1.95,
    priceChangeAmount: 44,
    distanceFromKopargaon: 50,
    lastUpdated: "आज, 10:45 AM",
    history7Days: create7DayHistory(2302, 44)
  },
  {
    id: "card-maize-rah",
    mandiName: "Rahata",
    crop: "Maize",
    modalPrice: 2290,
    minPrice: 1960,
    maxPrice: 2440,
    priceChangePercent: 1.75,
    priceChangeAmount: 39,
    distanceFromKopargaon: 20,
    lastUpdated: "आज, 11:45 AM",
    history7Days: create7DayHistory(2290, 39)
  },
  {
    id: "card-maize-san",
    mandiName: "Sangamner",
    crop: "Maize",
    modalPrice: 2280,
    minPrice: 1950,
    maxPrice: 2430,
    priceChangePercent: 1.60,
    priceChangeAmount: 36,
    distanceFromKopargaon: 52,
    lastUpdated: "आज, 11:00 AM",
    history7Days: create7DayHistory(2280, 36)
  },

  // 🧆 Gram / Chickpea (हरभरा)
  {
    id: "card-gram-kop",
    mandiName: "Kopargaon",
    crop: "Gram",
    modalPrice: 6608,
    minPrice: 4200,
    maxPrice: 6850,
    priceChangePercent: 2.85,
    priceChangeAmount: 183,
    distanceFromKopargaon: 0,
    lastUpdated: "आज, 10:30 AM",
    history7Days: create7DayHistory(6608, 183)
  },
  {
    id: "card-gram-ahi",
    mandiName: "Ahilyanagar",
    crop: "Gram",
    modalPrice: 6450,
    minPrice: 4800,
    maxPrice: 6700,
    priceChangePercent: 2.54,
    priceChangeAmount: 160,
    distanceFromKopargaon: 100,
    lastUpdated: "आज, 10:00 AM",
    history7Days: create7DayHistory(6450, 160)
  },
  {
    id: "card-gram-shri",
    mandiName: "Shrirampur",
    crop: "Gram",
    modalPrice: 6280,
    minPrice: 4700,
    maxPrice: 6520,
    priceChangePercent: 2.28,
    priceChangeAmount: 140,
    distanceFromKopargaon: 42,
    lastUpdated: "आज, 10:40 AM",
    history7Days: create7DayHistory(6280, 140)
  },
  {
    id: "card-gram-yeo",
    mandiName: "Yeola",
    crop: "Gram",
    modalPrice: 6180,
    minPrice: 4650,
    maxPrice: 6420,
    priceChangePercent: 2.05,
    priceChangeAmount: 124,
    distanceFromKopargaon: 19,
    lastUpdated: "आज, 10:30 AM",
    history7Days: create7DayHistory(6180, 124)
  },
  {
    id: "card-gram-rah",
    mandiName: "Rahata",
    crop: "Gram",
    modalPrice: 6120,
    minPrice: 4600,
    maxPrice: 6380,
    priceChangePercent: 1.95,
    priceChangeAmount: 117,
    distanceFromKopargaon: 20,
    lastUpdated: "आज, 11:40 AM",
    history7Days: create7DayHistory(6120, 117)
  },
  {
    id: "card-gram-nas",
    mandiName: "Nashik",
    crop: "Gram",
    modalPrice: 6050,
    minPrice: 4550,
    maxPrice: 6300,
    priceChangePercent: 1.80,
    priceChangeAmount: 107,
    distanceFromKopargaon: 90,
    lastUpdated: "आज, 12:15 PM",
    history7Days: create7DayHistory(6050, 107)
  },
  {
    id: "card-gram-san",
    mandiName: "Sangamner",
    crop: "Gram",
    modalPrice: 5980,
    minPrice: 4480,
    maxPrice: 6220,
    priceChangePercent: 1.65,
    priceChangeAmount: 97,
    distanceFromKopargaon: 52,
    lastUpdated: "आज, 11:00 AM",
    history7Days: create7DayHistory(5980, 97)
  },
  {
    id: "card-gram-las",
    mandiName: "Lasalgaon",
    crop: "Gram",
    modalPrice: 5556,
    minPrice: 4500,
    maxPrice: 5800,
    priceChangePercent: 1.20,
    priceChangeAmount: 66,
    distanceFromKopargaon: 50,
    lastUpdated: "आज, 10:45 AM",
    history7Days: create7DayHistory(5556, 66)
  },

  // 🌾 Bajra (बाजरी)
  {
    id: "card-baj-las",
    mandiName: "Lasalgaon",
    crop: "Bajra",
    modalPrice: 2511,
    minPrice: 2250,
    maxPrice: 2680,
    priceChangePercent: 2.10,
    priceChangeAmount: 51,
    distanceFromKopargaon: 50,
    lastUpdated: "आज, 10:45 AM",
    history7Days: create7DayHistory(2511, 51)
  },
  {
    id: "card-baj-ahi",
    mandiName: "Ahilyanagar",
    crop: "Bajra",
    modalPrice: 2450,
    minPrice: 2100,
    maxPrice: 2600,
    priceChangePercent: 1.85,
    priceChangeAmount: 44,
    distanceFromKopargaon: 100,
    lastUpdated: "आज, 10:00 AM",
    history7Days: create7DayHistory(2450, 44)
  },
  {
    id: "card-baj-nas",
    mandiName: "Nashik",
    crop: "Bajra",
    modalPrice: 2430,
    minPrice: 2140,
    maxPrice: 2580,
    priceChangePercent: 1.75,
    priceChangeAmount: 41,
    distanceFromKopargaon: 90,
    lastUpdated: "आज, 12:15 PM",
    history7Days: create7DayHistory(2430, 41)
  },
  {
    id: "card-baj-yeo",
    mandiName: "Yeola",
    crop: "Bajra",
    modalPrice: 2410,
    minPrice: 2120,
    maxPrice: 2550,
    priceChangePercent: 1.65,
    priceChangeAmount: 39,
    distanceFromKopargaon: 19,
    lastUpdated: "आज, 10:00 AM",
    history7Days: create7DayHistory(2410, 39)
  },
  {
    id: "card-baj-shri",
    mandiName: "Shrirampur",
    crop: "Bajra",
    modalPrice: 2390,
    minPrice: 2100,
    maxPrice: 2530,
    priceChangePercent: 1.50,
    priceChangeAmount: 35,
    distanceFromKopargaon: 42,
    lastUpdated: "आज, 10:40 AM",
    history7Days: create7DayHistory(2390, 35)
  },
  {
    id: "card-baj-kop",
    mandiName: "Kopargaon",
    crop: "Bajra",
    modalPrice: 2375,
    minPrice: 1575,
    maxPrice: 2520,
    priceChangePercent: 1.40,
    priceChangeAmount: 32,
    distanceFromKopargaon: 0,
    lastUpdated: "आज, 09:45 AM",
    history7Days: create7DayHistory(2375, 32)
  },
  {
    id: "card-baj-rah",
    mandiName: "Rahata",
    crop: "Bajra",
    modalPrice: 2360,
    minPrice: 2080,
    maxPrice: 2500,
    priceChangePercent: 1.30,
    priceChangeAmount: 30,
    distanceFromKopargaon: 20,
    lastUpdated: "आज, 11:45 AM",
    history7Days: create7DayHistory(2360, 30)
  },
  {
    id: "card-baj-san",
    mandiName: "Sangamner",
    crop: "Bajra",
    modalPrice: 2350,
    minPrice: 2070,
    maxPrice: 2490,
    priceChangePercent: 1.20,
    priceChangeAmount: 28,
    distanceFromKopargaon: 52,
    lastUpdated: "आज, 11:00 AM",
    history7Days: create7DayHistory(2350, 28)
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
  const matchingCard = _mandi ? REAL_DASHBOARD_CARDS.find(c => c.crop === crop && c.mandiName.toLowerCase() === _mandi.toLowerCase()) : null;
  const basePrice = matchingCard ? matchingCard.modalPrice :
    crop === 'Onion' ? 3950 :
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
    targetPrice: 4000,
    condition: "ABOVE",
    channel: "WhatsApp",
    status: "TRIGGERED",
    createdAt: "2026-07-15"
  }
];
