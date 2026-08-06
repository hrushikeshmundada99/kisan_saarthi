export interface ForecastPointItem {
  date: string;
  actualPrice: number | null;
  predictedPrice: number | null;
  upperBound: number | null;
  lowerBound: number | null;
}

export const CROPS_LIST = ['Onion', 'Soybean', 'Cotton', 'Sugarcane', 'Pomegranate', 'Wheat', 'Tomato'];
export const MANDIS_LIST = ['Kopargaon', 'Rahata', 'Shrirampur', 'Yeola', 'Sangamner', 'Nashik', 'Ahmednagar'];

// Base price map per crop and mandi
const CROP_BASE_PRICES: Record<string, number> = {
  Onion: 1850,
  Soybean: 4620,
  Cotton: 7240,
  Sugarcane: 3150,
  Pomegranate: 8450,
  Wheat: 2480,
  Tomato: 1420
};

const MANDI_PRICE_OFFSETS: Record<string, number> = {
  Kopargaon: 0,
  Rahata: 70,
  Shrirampur: 15,
  Yeola: 130,
  Sangamner: -40,
  Nashik: 200,
  Ahmednagar: 40
};

// Generate 30 days past + 30 days future forecast data
export const getForecastDataForCombination = (crop: string, mandi: string): ForecastPointItem[] => {
  const base = (CROP_BASE_PRICES[crop] || 1800) + (MANDI_PRICE_OFFSETS[mandi] || 0);
  const data: ForecastPointItem[] = [];

  // Trend factor based on crop type
  const isUpwardTrend = crop === 'Onion' || crop === 'Pomegranate' || crop === 'Wheat';
  const trendSlope = isUpwardTrend ? 6.5 : -4.2;

  // Past 30 days (actualPrice present, predicted null)
  for (let i = 30; i >= 1; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });

    const pastTrend = base - (i * (trendSlope * 0.7));
    const noise = Math.sin(i * 0.8) * 35 + ((i % 3 === 0 ? 15 : -10));
    const price = Math.round(pastTrend + noise);

    data.push({
      date: dateStr,
      actualPrice: price,
      predictedPrice: null,
      upperBound: null,
      lowerBound: null
    });
  }

  // Today (bridge point with both actual and predicted)
  const today = new Date();
  const todayStr = today.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
  data.push({
    date: todayStr,
    actualPrice: base,
    predictedPrice: base,
    upperBound: base,
    lowerBound: base
  });

  // Future 30 days (actualPrice null, predictedPrice + confidence bounds)
  for (let i = 1; i <= 30; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const dateStr = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });

    const futurePrice = Math.round(base + (i * trendSlope) + (Math.cos(i * 0.4) * 18));
    const bandMargin = Math.round(25 + (i * 4.5));

    data.push({
      date: dateStr,
      actualPrice: null,
      predictedPrice: futurePrice,
      upperBound: futurePrice + bandMargin,
      lowerBound: Math.max(100, futurePrice - bandMargin)
    });
  }

  return data;
};
