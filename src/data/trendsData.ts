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
const MANDIS = ['Kopargaon', 'Rahata', 'Shrirampur', 'Yeola', 'Sangamner', 'Nashik', 'Ahilyanagar'];

const CROP_SEASONAL_CURVES: Record<string, number[]> = {
  // Jan, Feb, Mar, Apr, May, Jun, Jul, Aug, Sep, Oct, Nov, Dec
  Onion: [0.90, 0.82, 0.76, 0.74, 0.78, 0.88, 1.00, 1.11, 1.27, 1.50, 1.60, 1.14],
  Soybean: [0.95, 0.96, 0.98, 1.00, 1.05, 1.10, 1.08, 1.02, 0.90, 0.85, 0.88, 0.92],
  Cotton: [0.98, 0.99, 1.02, 1.05, 1.08, 1.12, 1.05, 0.98, 0.92, 0.90, 0.93, 0.96],
  Sugarcane: [1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00],
  Pomegranate: [1.05, 1.08, 1.12, 1.15, 1.00, 0.90, 0.95, 1.02, 1.10, 1.20, 1.15, 1.08],
  Wheat: [0.90, 0.88, 0.82, 0.80, 0.85, 0.92, 1.00, 1.04, 1.08, 1.12, 1.15, 1.05],
  Tomato: [0.85, 0.80, 0.90, 1.10, 1.30, 1.65, 1.80, 1.40, 1.10, 0.95, 0.90, 0.85]
};

const CROP_BASE_PRICES: Record<string, number> = {
  Onion: 3950,
  Soybean: 4620,
  Cotton: 7240,
  Sugarcane: 3150,
  Pomegranate: 8450,
  Wheat: 2480,
  Tomato: 1420
};

const MANDI_OFFSETS: Record<string, number> = {
  Kopargaon: 0,
  Rahata: -150,
  Shrirampur: 20,
  Yeola: 50,
  Sangamner: -150,
  Nashik: 50,
  Ahilyanagar: 750
};

// Generate 365 days of realistic historical daily dataset
export const generate365DaysTrendsData = (): DailyTrendItem[] => {
  const records: DailyTrendItem[] = [];
  const today = new Date('2026-07-26');

  for (let i = 364; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);

    const year = d.getFullYear();
    const monthIndex = d.getMonth();
    const month = String(monthIndex + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    const displayDate = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    const monthKey = `${year}-${month}`;
    const monthName = d.toLocaleDateString('en-GB', { month: 'short' });

    CROPS.forEach((crop) => {
      const base = CROP_BASE_PRICES[crop] || 1800;
      const seasonalCurve = CROP_SEASONAL_CURVES[crop] || CROP_SEASONAL_CURVES['Onion'];
      const multiplier = seasonalCurve[monthIndex] || 1.0;

      MANDIS.forEach((mandiName) => {
        const offset = MANDI_OFFSETS[mandiName] || 0;
        const dailyNoise = Math.sin((i + 1) * 0.4 + crop.length) * 35;

        const modalPrice = Math.round((base + offset + dailyNoise) * multiplier);
        const arrivalsQuantity = Math.round(500 + Math.abs(Math.cos(i * 0.3) * 1500) / multiplier);

        records.push({
          date: dateStr,
          displayDate,
          monthKey,
          monthName,
          crop,
          mandiName,
          modalPrice,
          arrivalsQuantity
        });
      });
    });
  }

  return records;
};

export const getMonthlyAveragesForCrop = (crop: string, mandiName: string): MonthlyAverageItem[] => {
  const monthNamesMr = ['जाने', 'फेब्रु', 'मार्च', 'एप्रिल', 'मे', 'जून', 'जुलै', 'ऑगस्ट', 'सप्टेंबर', 'ऑक्टोबर', 'नोव्हेंबर', 'डिसेंबर'];
  const monthNamesEn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const base = CROP_BASE_PRICES[crop] || 1800;
  const offset = MANDI_OFFSETS[mandiName] || 0;
  const seasonalCurve = CROP_SEASONAL_CURVES[crop] || CROP_SEASONAL_CURVES['Onion'];

  const currentMonthIdx = new Date().getMonth();

  // Find max multiplier month to mark as peak month
  let maxMult = 0;
  let maxIdx = 10;
  seasonalCurve.forEach((mult, idx) => {
    if (mult > maxMult) {
      maxMult = mult;
      maxIdx = idx;
    }
  });

  return monthNamesEn.map((mEn, idx) => {
    const mult = seasonalCurve[idx] || 1.0;
    const avgPrice = Math.round((base + offset) * mult);
    const avgArrivals = Math.round(12000 / mult);

    return {
      monthIndex: idx,
      monthNameMr: monthNamesMr[idx],
      monthNameEn: mEn,
      avgPrice,
      avgArrivals,
      isPeakMonth: idx === maxIdx,
      isCurrentMonth: idx === currentMonthIdx
    };
  });
};

export const TRENDS_DAILY_DATA = generate365DaysTrendsData();
