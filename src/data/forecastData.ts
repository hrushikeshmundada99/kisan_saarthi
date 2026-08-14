export interface ForecastPointItem {
  date: string;
  actualPrice: number | null;
  predictedPrice: number | null;
  upperBound: number | null;
  lowerBound: number | null;
}

export const CROPS_LIST = ['Onion', 'Soybean', 'Cotton', 'Sugarcane', 'Pomegranate', 'Wheat', 'Tomato'];
export const MANDIS_LIST = ['Kopargaon', 'Rahata', 'Shrirampur', 'Yeola', 'Lasalgaon', 'Sangamner', 'Nashik', 'Ahilyanagar'];

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
  Lasalgaon: 270,
  Sangamner: -40,
  Nashik: 200,
  Ahilyanagar: 40
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

  // Today bridge point
  const todayStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
  const todayPrice = Math.round(base);

  data.push({
    date: todayStr,
    actualPrice: todayPrice,
    predictedPrice: todayPrice,
    upperBound: todayPrice + 35,
    lowerBound: todayPrice - 35
  });

  // Future 30 days (predictedPrice present, actual null)
  for (let i = 1; i <= 30; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const dateStr = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });

    const futureTrend = base + (i * trendSlope);
    const noise = Math.cos(i * 0.6) * 45;
    const predicted = Math.round(futureTrend + noise);
    const uncertaintyBand = Math.round(40 + (i * 2.5));

    data.push({
      date: dateStr,
      actualPrice: null,
      predictedPrice: predicted,
      upperBound: predicted + uncertaintyBand,
      lowerBound: Math.max(100, predicted - uncertaintyBand)
    });
  }

  return data;
};
