// Sell Timing Recommendation Engine for Kisan Saarthi
// Analyzes multi-horizon price trends (7, 14, 30 days) to recommend SELL NOW vs WAIT

import { calculateMandiForecast } from './forecastEngine';
import { fetchAgmarknetRecords, type DailyMandiPriceRecord } from '../data/agmarknetDataset';

export interface HorizonBreakdownItem {
  horizon: 7 | 14 | 30;
  projectedPrice: number;
  expectedChangePct: number;
  confidence: 'High' | 'Moderate' | 'Low';
  confidenceBand: [number, number];
}

export interface SellTimingRecommendation {
  crop: string;
  mandi: string;
  action: 'SELL_NOW' | 'WAIT';
  waitDays?: 7 | 14 | 30;
  expectedGainPct: number;
  confidence: 'High' | 'Moderate' | 'Low';
  currentPrice: number;
  projectedPrice: number;
  reasoning: string[];
  reasoningMr: string[];
  horizonBreakdown: HorizonBreakdownItem[];
  generatedAt: string;
}

// Configurable Gain Thresholds
export const THRESHOLDS = {
  MIN_GAIN_7D_PCT: 3.0,   // Minimum 3% expected gain to recommend 7-day hold
  MIN_GAIN_14D_PCT: 5.0,  // Minimum 5% expected gain to recommend 14-day hold
  MIN_GAIN_30D_PCT: 8.0   // Minimum 8% expected gain to recommend 30-day hold
};

/**
 * Computes confidence rating based on confidence band spread vs projected price
 */
function evaluateConfidence(
  confidenceMin: number,
  confidenceMax: number,
  projectedPrice: number,
  horizon: 7 | 14 | 30
): 'High' | 'Moderate' | 'Low' {
  if (projectedPrice <= 0) return 'Low';
  const spreadRatio = (confidenceMax - confidenceMin) / projectedPrice;

  // Confidence thresholds scale with time horizon
  const maxHighSpread = horizon === 7 ? 0.12 : horizon === 14 ? 0.18 : 0.24;
  const maxModSpread = horizon === 7 ? 0.22 : horizon === 14 ? 0.28 : 0.36;

  if (spreadRatio <= maxHighSpread) return 'High';
  if (spreadRatio <= maxModSpread) return 'Moderate';
  return 'Low';
}

/**
 * Produces comprehensive Sell/Wait timing recommendation for a given crop & mandi
 */
export function calculateSellTimingRecommendation(
  crop: string,
  mandi: string,
  customRecords?: DailyMandiPriceRecord[]
): SellTimingRecommendation {
  // Normalize IDs for agmarknet dataset fetch
  const cropId = crop.toLowerCase().replace(/\s+/g, '_');
  const mandiId = mandi.toLowerCase().replace(/\s+/g, '_');
  const records = customRecords || fetchAgmarknetRecords(mandiId, cropId);

  const forecast7 = calculateMandiForecast(records, 7);
  const forecast14 = calculateMandiForecast(records, 14);
  const forecast30 = calculateMandiForecast(records, 30);

  const currentPrice = forecast7.currentPrice || (crop.toLowerCase().includes('onion') ? 3950 : 4620);

  // Extract future projection points
  const p7 = forecast7.chartPoints[forecast7.chartPoints.length - 1];
  const p14 = forecast14.chartPoints[forecast14.chartPoints.length - 1];
  const p30 = forecast30.chartPoints[forecast30.chartPoints.length - 1];

  const price7 = p7?.forecastModal || currentPrice;
  const price14 = p14?.forecastModal || currentPrice;
  const price30 = p30?.forecastModal || currentPrice;

  const band7: [number, number] = p7?.confidenceBand || [price7 * 0.95, price7 * 1.05];
  const band14: [number, number] = p14?.confidenceBand || [price14 * 0.92, price14 * 1.08];
  const band30: [number, number] = p30?.confidenceBand || [price30 * 0.88, price30 * 1.12];

  const change7Pct = parseFloat((((price7 - currentPrice) / currentPrice) * 100).toFixed(1));
  const change14Pct = parseFloat((((price14 - currentPrice) / currentPrice) * 100).toFixed(1));
  const change30Pct = parseFloat((((price30 - currentPrice) / currentPrice) * 100).toFixed(1));

  const conf7 = evaluateConfidence(band7[0], band7[1], price7, 7);
  const conf14 = evaluateConfidence(band14[0], band14[1], price14, 14);
  const conf30 = evaluateConfidence(band30[0], band30[1], price30, 30);

  const horizonBreakdown: HorizonBreakdownItem[] = [
    {
      horizon: 7,
      projectedPrice: price7,
      expectedChangePct: change7Pct,
      confidence: conf7,
      confidenceBand: band7
    },
    {
      horizon: 14,
      projectedPrice: price14,
      expectedChangePct: change14Pct,
      confidence: conf14,
      confidenceBand: band14
    },
    {
      horizon: 30,
      projectedPrice: price30,
      expectedChangePct: change30Pct,
      confidence: conf30,
      confidenceBand: band30
    }
  ];

  // Decision Logic: find shortest horizon clearing minimum gain threshold with acceptable confidence
  let action: 'SELL_NOW' | 'WAIT' = 'SELL_NOW';
  let waitDays: 7 | 14 | 30 | undefined = undefined;
  let expectedGainPct = 0;
  let overallConfidence: 'High' | 'Moderate' | 'Low' = 'High';
  let projectedPrice = currentPrice;

  if (change7Pct >= THRESHOLDS.MIN_GAIN_7D_PCT && conf7 !== 'Low') {
    action = 'WAIT';
    waitDays = 7;
    expectedGainPct = change7Pct;
    overallConfidence = conf7;
    projectedPrice = price7;
  } else if (change14Pct >= THRESHOLDS.MIN_GAIN_14D_PCT && conf14 !== 'Low') {
    action = 'WAIT';
    waitDays = 14;
    expectedGainPct = change14Pct;
    overallConfidence = conf14;
    projectedPrice = price14;
  } else if (change30Pct >= THRESHOLDS.MIN_GAIN_30D_PCT && conf30 !== 'Low') {
    action = 'WAIT';
    waitDays = 30;
    expectedGainPct = change30Pct;
    overallConfidence = conf30;
    projectedPrice = price30;
  } else {
    action = 'SELL_NOW';
    waitDays = undefined;
    expectedGainPct = 0;
    overallConfidence = conf7;
    projectedPrice = currentPrice;
  }

  // Generate plain-language reasoning bullets in English & Marathi
  const reasoning: string[] = [];
  const reasoningMr: string[] = [];

  if (action === 'WAIT' && waitDays) {
    reasoning.push(
      `Prices projected to rise by +${expectedGainPct}% (~₹${Math.round(projectedPrice - currentPrice)}/q) over the next ${waitDays} days.`
    );
    reasoningMr.push(
      `पुढील ${waitDays} दिवसांत भावात +${expectedGainPct}% (~₹${Math.round(projectedPrice - currentPrice)}/क्विंटल) वाढ होण्याची दाट शक्यता.`
    );

    if (overallConfidence === 'High') {
      reasoning.push(`High historical predictability and steady regional mandi arrivals support this price surge.`);
      reasoningMr.push(`बाजारपेठेतील मागील आवक व सातत्यपूर्ण मागणीमुळे या तेजीची खात्री जास्त आहे.`);
    } else {
      reasoning.push(`Moderate confidence: monitor local weather and auction volume closely while holding.`);
      reasoningMr.push(`मध्यम खात्री: माल थांबवताना स्थानिक हवामान व आवकेवर लक्ष ठेवा.`);
    }

    if (waitDays === 7) {
      reasoning.push(`Short-term holding (1 week) offers the best risk-adjusted profit before supply normalizes.`);
      reasoningMr.push(`७ दिवसांची अल्पकालीन साठवणूक कमी जोखमीत चांगला नफा मिळवून देईल.`);
    } else if (waitDays === 14) {
      reasoning.push(`Medium-term supply deficit in ${mandi} area expected to peak around 2 weeks.`);
      reasoningMr.push(`${mandi} परिसरात पुढील २ आठवड्यांत आवक तुटवड्यामुळे भाव शिखरावर पोहोचेल.`);
    } else {
      reasoning.push(`Long-term seasonal transition favors strong price appreciation by month-end.`);
      reasoningMr.push(`महिन्याअखेरीस हंगामी बदल व सणासुदीच्या मागणीमुळे मोठा नफा संभवतो.`);
    }
  } else {
    reasoning.push(`Current price (₹${currentPrice}/q) is near short-term peak; future gains do not justify holding risks.`);
    reasoningMr.push(`आजचा भाव (₹${currentPrice}/क्विंटल) समाधानकारक असून पुढे भाववाढीची शक्यता मर्यादित आहे.`);

    if (change7Pct < 0 || change14Pct < 0) {
      reasoning.push(`Downward pressure or market saturation expected in coming 7-14 days.`);
      reasoningMr.push(`पुढील ७-१४ दिवसांत आवक वाढल्याने दरात घसरण होण्याची शक्यता आहे.`);
    } else {
      reasoning.push(`Expected gains (<${THRESHOLDS.MIN_GAIN_7D_PCT}%) are too small to offset storage weight loss and carrying cost.`);
      reasoningMr.push(`संभाव्य भाववाढ अगदी नगण्य असल्याने साठवणूक आणि घट खर्चाचा भार परवडणारा नाही.`);
    }

    reasoning.push(`Immediate sale locks in guaranteed cash realization today.`);
    reasoningMr.push(`आजच माल विकल्यास खात्रीशीर रोख रक्कम सुरक्षित हातात पडेल.`);
  }

  return {
    crop,
    mandi,
    action,
    waitDays,
    expectedGainPct,
    confidence: overallConfidence,
    currentPrice,
    projectedPrice,
    reasoning,
    reasoningMr,
    horizonBreakdown,
    generatedAt: new Date().toISOString()
  };
}
