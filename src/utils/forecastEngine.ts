import { type DailyMandiPriceRecord } from '../data/agmarknetDataset';

export interface MandiTrendChartPoint {
  date: string; // Formatted date string (e.g. "12 Aug")
  fullDate: string; // ISO Date YYYY-MM-DD
  isHistorical: boolean;
  isForecast: boolean;
  isToday?: boolean;
  
  // Historical Values
  modalPrice?: number;
  minPrice?: number;
  maxPrice?: number;
  priceRange?: [number, number]; // [minPrice, maxPrice] shaded band
  
  // Forecast Values
  forecastModal?: number;
  confidenceBand?: [number, number]; // [confidenceMin, confidenceMax] widening shaded band
  confidenceMin?: number;
  confidenceMax?: number;
  
  arrival?: number;
}

export interface MandiForecastSummary {
  chartPoints: MandiTrendChartPoint[];
  currentPrice: number;
  price7DaysAgo: number;
  pctChange7d: number;
  isRising: boolean;
  lastUpdatedDate: string;
  forecastHorizonDays: number;
}

/**
 * Modular forecasting engine:
 * Uses Exponential Smoothing combined with 30-day Moving Average Linear Trend to project future mandi prices.
 * Generates an expanding standard-error confidence band to visually communicate increasing uncertainty.
 */
export function calculateMandiForecast(
  historicalRecords: DailyMandiPriceRecord[],
  horizonDays: 7 | 14 = 7
): MandiForecastSummary {
  if (!historicalRecords || historicalRecords.length === 0) {
    return {
      chartPoints: [],
      currentPrice: 0,
      price7DaysAgo: 0,
      pctChange7d: 0,
      isRising: true,
      lastUpdatedDate: new Date().toISOString().split('T')[0],
      forecastHorizonDays: horizonDays
    };
  }

  // Take up to past 60 trade days for chart display
  const displayRecords = historicalRecords.slice(-60);
  const totalDisplayCount = displayRecords.length;
  const lastRecord = displayRecords[totalDisplayCount - 1];

  // 1. Calculate 7-day price percentage change
  const currentPrice = lastRecord.modalPrice;
  const index7dAgo = Math.max(0, totalDisplayCount - 7);
  const price7DaysAgo = displayRecords[index7dAgo].modalPrice;
  const priceDiff = currentPrice - price7DaysAgo;
  const pctChange7d = parseFloat(((priceDiff / (price7DaysAgo || 1)) * 100).toFixed(1));
  const isRising = pctChange7d >= 0;

  // 2. Compute Exponential Smoothing Baseline & Recent Trend Slope (over 30 records)
  const windowRecords = displayRecords.slice(-30);
  const windowCount = windowRecords.length;

  let alpha = 0.3; // Smoothing factor
  let smoothedPrice = windowRecords[0].modalPrice;
  const residualErrors: number[] = [];

  for (let i = 1; i < windowCount; i++) {
    const actual = windowRecords[i].modalPrice;
    smoothedPrice = alpha * actual + (1 - alpha) * smoothedPrice;
    residualErrors.push(Math.abs(actual - smoothedPrice));
  }

  // Calculate Linear Trend Slope (y = mx + c)
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
  for (let i = 0; i < windowCount; i++) {
    sumX += i;
    sumY += windowRecords[i].modalPrice;
    sumXY += i * windowRecords[i].modalPrice;
    sumX2 += i * i;
  }
  const slope = (windowCount * sumXY - sumX * sumY) / Math.max(1, windowCount * sumX2 - sumX * sumX);

  // Mean Absolute Residual Error as base uncertainty
  const baseResidualError = residualErrors.length > 0
    ? residualErrors.reduce((a, b) => a + b, 0) / residualErrors.length
    : Math.max(40, currentPrice * 0.03);

  // 3. Build Historical Chart Points
  const chartPoints: MandiTrendChartPoint[] = [];

  displayRecords.forEach((rec, idx) => {
    const isToday = idx === totalDisplayCount - 1;
    const formattedDate = formatDateTick(rec.date);

    chartPoints.push({
      date: formattedDate,
      fullDate: rec.date,
      isHistorical: true,
      isForecast: false,
      isToday,
      modalPrice: rec.modalPrice,
      minPrice: rec.minPrice,
      maxPrice: rec.maxPrice,
      priceRange: [rec.minPrice, rec.maxPrice],
      arrival: rec.arrival,
      // Connect history line to forecast line seamlessly on "Today" point
      ...(isToday
        ? {
            forecastModal: rec.modalPrice,
            confidenceBand: [rec.minPrice, rec.maxPrice],
            confidenceMin: rec.minPrice,
            confidenceMax: rec.maxPrice
          }
        : {})
    });
  });

  // 4. Generate Future Forecast Points (1 to horizonDays out)
  const lastDate = new Date(lastRecord.date);

  for (let step = 1; step <= horizonDays; step++) {
    const futureDateObj = new Date(lastDate);
    futureDateObj.setDate(lastDate.getDate() + step);
    const dateStr = futureDateObj.toISOString().split('T')[0];
    const formattedDate = formatDateTick(dateStr);

    // Projected modal price applying damped linear trend
    const damping = Math.pow(0.92, step);
    const trendAddition = slope * step * damping;
    const projectedModal = Math.round(Math.max(100, currentPrice + trendAddition));

    // Widening confidence band standard error calculation
    // Confidence range widens proportional to sqrt(step) / linear step multiplier
    const confidenceSpread = Math.round(baseResidualError * (1 + 0.15 * step));
    const confidenceMin = Math.max(50, projectedModal - confidenceSpread);
    const confidenceMax = projectedModal + confidenceSpread;

    chartPoints.push({
      date: formattedDate,
      fullDate: dateStr,
      isHistorical: false,
      isForecast: true,
      isToday: false,
      forecastModal: projectedModal,
      confidenceBand: [confidenceMin, confidenceMax],
      confidenceMin,
      confidenceMax
    });
  }

  return {
    chartPoints,
    currentPrice,
    price7DaysAgo,
    pctChange7d,
    isRising,
    lastUpdatedDate: lastRecord.date,
    forecastHorizonDays: horizonDays
  };
}

function formatDateTick(dateStr: string): string {
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const day = parseInt(parts[2], 10);
      const monthIndex = parseInt(parts[1], 10) - 1;
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${day} ${monthNames[monthIndex] || ''}`;
    }
  } catch {}
  return dateStr;
}
