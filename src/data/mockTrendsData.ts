export interface DailyTrendItem {
  date: string; // YYYY-MM-DD
  displayDate: string; // Short formatted date
  monthKey: string; // e.g. "2026-07"
  monthName: string; // e.g. "Jul"
  crop: string;
  mandiName: string;
  modalPrice: number;
  arrivalsQuantity: number;
}

export interface MonthlyAverageItem {
  monthIndex: number; // 0 to 11
  monthNameMr: string;
  monthNameEn: string;
  avgPrice: number;
  avgArrivals: number;
  isPeakMonth: boolean;
  isCurrentMonth: boolean;
}

const CROPS = ['Onion', 'Soybean', 'Cotton', 'Sugarcane', 'Pomegranate', 'Wheat', 'Tomato'];
const MANDIS = ['Kopargaon', 'Rahata', 'Shrirampur', 'Yeola', 'Sangamner', 'Nashik', 'Ahmednagar'];

const CROP_SEASONAL_CURVES: Record<string, number[]> = {
  // Jan, Feb, Mar, Apr, May, Jun, Jul, Aug, Sep, Oct, Nov, Dec (multipliers relative to base)
  Onion: [0.90, 0.82, 0.76, 0.74, 0.78, 0.88, 1.00, 1.11, 1.27, 1.50, 1.60, 1.14],
  Soybean: [0.95, 0.96, 0.98, 1.00, 1.05, 1.10, 1.08, 1.02, 0.90, 0.85, 0.88, 0.92],
  Cotton: [0.98, 0.99, 1.02, 1.05, 1.08, 1.12, 1.05, 0.98, 0.92, 0.90, 0.93, 0.96],
  Sugarcane: [1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00],
  Pomegranate: [1.05, 1.08, 1.12, 1.15, 1.00, 0.90, 0.95, 1.02, 1.10, 1.20, 1.15, 1.08],
  Wheat: [0.90, 0.88, 0.82, 0.80, 0.85, 0.92, 1.00, 1.04, 1.08, 1.12, 1.15, 1.05],
  Tomato: [0.85, 0.80, 0.90, 1.10, 1.30, 1.65, 1.80, 1.40, 1.10, 0.95, 0.90, 0.85]
};

const CROP_BASE_PRICES: Record<string, number> = {
  Onion: 1850,
  Soybean: 4620,
  Cotton: 7240,
  Sugarcane: 3150,
  Pomegranate: 8450,
  Wheat: 2480,
  Tomato: 1420
};

const MANDI_OFFSETS: Record<string, number> = {
  Kopargaon: 0,
  Rahata: 70,
  Shrirampur: 15,
  Yeola: 130,
  Sangamner: -40,
  Nashik: 200,
  Ahmednagar: 40
};

// Generate 365 days of realistic historical daily dataset
export const generate365DaysTrendsData = (): DailyTrendItem[] => {
  const records: DailyTrendItem[] = [];
  const today = new Date('2026-07-26');

  for (let i = 364; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);

    const year = d.getFullYear();
    const monthIdx = d.getMonth();
    const monthStr = String(monthIdx + 1).padStart(2, '0');
    const dayStr = String(d.getDate()).padStart(2, '0');
    const dateKey = `${year}-${monthStr}-${dayStr}`;
    const displayDate = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    const monthKey = `${year}-${monthStr}`;
    const monthName = d.toLocaleDateString('en-GB', { month: 'short' });

    CROPS.forEach((crop) => {
      const basePrice = CROP_BASE_PRICES[crop] || 1800;
      const seasonalCurve = CROP_SEASONAL_CURVES[crop] || CROP_SEASONAL_CURVES.Onion;
      const monthMultiplier = seasonalCurve[monthIdx];

      MANDIS.forEach((mandi) => {
        const mandiOffset = MANDI_OFFSETS[mandi] || 0;
        
        // Price inversely related to arrivals volume
        const daySin = Math.sin((365 - i) * 0.1) * 30;
        const priceNoise = ((i * 13 + mandi.length * 5) % 25) - 12;
        const calculatedPrice = Math.round((basePrice * monthMultiplier) + mandiOffset + daySin + priceNoise);

        // Inverse arrival volume: high price = low arrivals, low price = high arrivals
        const inverseArrivals = Math.round(4500 / monthMultiplier + Math.cos(i * 0.2) * 400);

        records.push({
          date: dateKey,
          displayDate,
          monthKey,
          monthName,
          crop,
          mandiName: mandi,
          modalPrice: calculatedPrice,
          arrivalsQuantity: Math.max(200, inverseArrivals)
        });
      });
    });
  }

  return records;
};

export const MOCK_TRENDS_DAILY_DATA = generate365DaysTrendsData();

// Get monthly averages for a crop & mandi
export const getMonthlyAveragesForCrop = (crop: string, mandi: string): MonthlyAverageItem[] => {
  const monthNamesMr = ['जानेवारी', 'फेब्रुवारी', 'मार्च', 'एप्रिल', 'मे', 'जून', 'जुलै', 'ऑगस्ट', 'सप्टेंबर', 'ऑक्टोबर', 'नोव्हेंबर', 'डिसेंबर'];
  const monthNamesEn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const basePrice = CROP_BASE_PRICES[crop] || 1850;
  const mandiOffset = MANDI_OFFSETS[mandi] || 0;
  const seasonalCurve = CROP_SEASONAL_CURVES[crop] || CROP_SEASONAL_CURVES.Onion;

  const result: MonthlyAverageItem[] = seasonalCurve.map((mult, idx) => {
    const price = Math.round((basePrice * mult) + mandiOffset);
    const arrivals = Math.round(4500 / mult);
    return {
      monthIndex: idx,
      monthNameMr: monthNamesMr[idx],
      monthNameEn: monthNamesEn[idx],
      avgPrice: price,
      avgArrivals: arrivals,
      isPeakMonth: false,
      isCurrentMonth: idx === 6 // July is current month index 6
    };
  });

  // Find max price month and mark as peak
  let maxP = 0;
  let maxIdx = 0;
  result.forEach((item, idx) => {
    if (item.avgPrice > maxP) {
      maxP = item.avgPrice;
      maxIdx = idx;
    }
  });
  result[maxIdx].isPeakMonth = true;

  return result;
};
