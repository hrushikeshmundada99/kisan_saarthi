// Storage Intelligence Engine for Kisan Saarthi
// Economics, Crop Spoilage Loss Modeling, Risk Scoring (0-100), SELL NOW vs STORE Engine & Explainable AI

import type { StorageFacility } from '../data/storageFacilitiesData';
import { calculateFreight, getRecommendedVehicle } from '../data/transportData';
import { REAL_DASHBOARD_CARDS, MANDI_LOCATIONS } from '../data/realData';

export interface CropStorageProfile {
  crop: string;
  recommendedStorageTypeMr: string;
  recommendedStorageTypeEn: string;
  maxSafeDays: number;
  baseDailyLossPct: number; // Daily weight loss % (shrinkage/moisture)
  qualityDecayPctPer30Days: number; // Quality grade reduction % per month
  temperatureSensitivity: 'low' | 'medium' | 'high' | 'critical';
  humiditySensitivity: 'low' | 'medium' | 'high';
}

export const CROP_STORAGE_PROFILES: Record<string, CropStorageProfile> = {
  Onion: {
    crop: 'Onion',
    recommendedStorageTypeMr: 'हवेशीर साठवणूक किंवा कोल्ड स्टोरेज / CA',
    recommendedStorageTypeEn: 'Ventilated Warehouse or CA Cold Storage',
    maxSafeDays: 120,
    baseDailyLossPct: 0.12, // ~3.6% loss per 30 days
    qualityDecayPctPer30Days: 2.5,
    temperatureSensitivity: 'high',
    humiditySensitivity: 'high'
  },
  Potato: {
    crop: 'Potato',
    recommendedStorageTypeMr: 'कोल्ड स्टोरेज (२°C - ४°C)',
    recommendedStorageTypeEn: 'Cold Storage (2°C - 4°C)',
    maxSafeDays: 180,
    baseDailyLossPct: 0.08, // ~2.4% per 30 days
    qualityDecayPctPer30Days: 1.5,
    temperatureSensitivity: 'critical',
    humiditySensitivity: 'high'
  },
  Tomato: {
    crop: 'Tomato',
    recommendedStorageTypeMr: 'कोल्ड स्टोरेज (१०°C - १२°C)',
    recommendedStorageTypeEn: 'Cool Storage (10°C - 12°C)',
    maxSafeDays: 20,
    baseDailyLossPct: 0.45, // ~13.5% per 30 days (very perishable)
    qualityDecayPctPer30Days: 15.0,
    temperatureSensitivity: 'critical',
    humiditySensitivity: 'high'
  },
  Grapes: {
    crop: 'Grapes',
    recommendedStorageTypeMr: 'कोल्ड साखळी प्रशीतक (०°C - २°C)',
    recommendedStorageTypeEn: 'Pre-cooled Cold Chain (0°C - 2°C)',
    maxSafeDays: 45,
    baseDailyLossPct: 0.20,
    qualityDecayPctPer30Days: 8.0,
    temperatureSensitivity: 'critical',
    humiditySensitivity: 'high'
  },
  Pomegranate: {
    crop: 'Pomegranate',
    recommendedStorageTypeMr: 'कोल्ड साखळी (५°C - ७°C)',
    recommendedStorageTypeEn: 'Cold Storage (5°C - 7°C)',
    maxSafeDays: 60,
    baseDailyLossPct: 0.15,
    qualityDecayPctPer30Days: 4.0,
    temperatureSensitivity: 'high',
    humiditySensitivity: 'medium'
  },
  Wheat: {
    crop: 'Wheat',
    recommendedStorageTypeMr: 'अन्नधान्य कोरडे गोदाम',
    recommendedStorageTypeEn: 'Dry Grain Warehouse',
    maxSafeDays: 365,
    baseDailyLossPct: 0.015, // ~0.45% per 30 days
    qualityDecayPctPer30Days: 0.2,
    temperatureSensitivity: 'low',
    humiditySensitivity: 'medium'
  },
  Soybean: {
    crop: 'Soybean',
    recommendedStorageTypeMr: 'कोरडे कृषी माल गोदाम',
    recommendedStorageTypeEn: 'Dry Agricultural Warehouse',
    maxSafeDays: 240,
    baseDailyLossPct: 0.02,
    qualityDecayPctPer30Days: 0.5,
    temperatureSensitivity: 'low',
    humiditySensitivity: 'medium'
  },
  Cotton: {
    crop: 'Cotton',
    recommendedStorageTypeMr: 'सुरक्षित अग्निरोधक गोदाम',
    recommendedStorageTypeEn: 'Fire-Safe Dry Warehouse',
    maxSafeDays: 300,
    baseDailyLossPct: 0.01,
    qualityDecayPctPer30Days: 0.3,
    temperatureSensitivity: 'low',
    humiditySensitivity: 'low'
  },
  Maize: {
    crop: 'Maize',
    recommendedStorageTypeMr: 'अन्नधान्य गोदाम',
    recommendedStorageTypeEn: 'Grain Warehouse',
    maxSafeDays: 180,
    baseDailyLossPct: 0.025,
    qualityDecayPctPer30Days: 0.6,
    temperatureSensitivity: 'low',
    humiditySensitivity: 'medium'
  }
};

export interface StorageEconomicBreakdown {
  storageFeeTotal: number;
  storageFeePerQ: number;
  transportToFacilityCost: number;
  transportToFacilityPerQ: number;
  loadingUnloadingCost: number;
  handlingCost: number;
  packagingCost: number;
  insuranceCost: number;
  totalExpenses: number;
  costPerQuintalTotal: number;
  spoilageWeightLossQ: number;
  spoilageWeightLossPct: number;
  sellableQuantityQ: number;
  spoilageValueLossRs: number;
}

export interface OptionAnalysis {
  optionType: 'sell_now' | 'store_later';
  titleMr: string;
  titleEn: string;
  pricePerQ: number;
  quantityQ: number;
  grossRevenue: number;
  mandiTransportCost: number;
  storageExpenses: number;
  spoilageLossValue: number;
  netRevenue: number;
  netRevenuePerQ: number;
}

export interface RiskBreakdown {
  priceRisk: number; // 0-100
  spoilageRisk: number;
  marketRisk: number;
  costRisk: number;
  qualityRisk: number;
  facilityRisk: number;
  transportRisk: number;
  overallRiskScore: number; // 0-100
  riskCategoryMr: string;
  riskCategoryEn: string;
  riskColor: string;
  riskReasonsMr: string[];
  riskReasonsEn: string[];
}

export interface OptimalPeriodComparison {
  days: number;
  expectedPrice: number;
  storageCost: number;
  spoilageLossPct: number;
  sellableQuantityQ: number;
  netRevenue: number;
  netAdvantageVsNow: number;
  riskScore: number;
  isOptimal: boolean;
}

export interface StorageDecisionResult {
  crop: string;
  mandi: string;
  quantityQ: number;
  currentMandiPrice: number;
  storageDurationDays: number;
  facility: StorageFacility;
  cropProfile: CropStorageProfile;
  economics: StorageEconomicBreakdown;
  optionSellNow: OptionAnalysis;
  optionStoreLater: OptionAnalysis;
  netAdvantageRs: number;
  netAdvantagePct: number;
  breakEvenPricePerQ: number;
  forecastPricePerQ: number;
  priceDifferenceRs: number;
  riskBreakdown: RiskBreakdown;
  recommendation: 'STORE' | 'HOLD_WITH_CAUTION' | 'SELL_NOW' | 'INSUFFICIENT_DATA';
  recommendationTitleMr: string;
  recommendationTitleEn: string;
  optimalPeriodList: OptimalPeriodComparison[];
  optimalDays: number;
  explainableReasonsMr: string[];
  explainableReasonsEn: string[];
  warningsMr: string[];
  warningsEn: string[];
  facilityScore: number;
  facilityScoreReasonsMr: string[];
  facilityScoreReasonsEn: string[];
}

// Simulated price forecast lookup reusing live mandi rates + regional trends
export function getForecastPriceForHorizon(
  crop: string,
  _mandiName: string,
  currentPrice: number,
  days: number
): number {
  if (days <= 0) return currentPrice;

  // Regional seasonal trend factor map
  const seasonalFactors: Record<string, { monthlyGrowthRate: number; volatility: number }> = {
    Onion: { monthlyGrowthRate: 0.085, volatility: 0.12 }, // Onions historically rise 8.5% in late monsoon/post-harvest
    Potato: { monthlyGrowthRate: 0.060, volatility: 0.08 },
    Tomato: { monthlyGrowthRate: 0.040, volatility: 0.20 },
    Wheat: { monthlyGrowthRate: 0.025, volatility: 0.04 },
    Soybean: { monthlyGrowthRate: 0.035, volatility: 0.06 },
    Cotton: { monthlyGrowthRate: 0.030, volatility: 0.05 },
    Pomegranate: { monthlyGrowthRate: 0.075, volatility: 0.10 },
    Grapes: { monthlyGrowthRate: 0.090, volatility: 0.15 },
    Maize: { monthlyGrowthRate: 0.020, volatility: 0.05 }
  };

  const factor = seasonalFactors[crop] || { monthlyGrowthRate: 0.04, volatility: 0.08 };
  const months = days / 30;
  
  // Calculate price increase
  const growthMultiplier = 1 + factor.monthlyGrowthRate * months;
  const projectedPrice = Math.round(currentPrice * growthMultiplier);

  return projectedPrice;
}

export function analyzeStorageDecision({
  crop,
  mandiName,
  quantityQ,
  currentPriceOverride,
  facility,
  storageDurationDays
}: {
  crop: string;
  mandiName: string;
  quantityQ: number;
  currentPriceOverride?: number;
  facility: StorageFacility;
  storageDurationDays: number;
}): StorageDecisionResult {
  // 1. Resolve Current Mandi Price
  let currentPrice = currentPriceOverride || 0;
  if (!currentPrice || currentPrice <= 0) {
    const liveCard = REAL_DASHBOARD_CARDS.find(
      (c) => c.crop === crop && c.mandiName === mandiName
    ) || REAL_DASHBOARD_CARDS.find((c) => c.crop === crop);
    
    currentPrice = liveCard?.modalPrice || (crop === 'Onion' ? 4150 : 5000);
  }

  // 2. Crop Storage Profile
  const cropProfile = CROP_STORAGE_PROFILES[crop] || {
    crop,
    recommendedStorageTypeMr: 'सामान्य कोरडे गोदाम',
    recommendedStorageTypeEn: 'General Dry Warehouse',
    maxSafeDays: 90,
    baseDailyLossPct: 0.05,
    qualityDecayPctPer30Days: 1.0,
    temperatureSensitivity: 'medium',
    humiditySensitivity: 'medium'
  };

  // 3. Distance Calculations
  const distanceToFacilityKm = facility.distanceFromFarmerKm || 15;
  const distanceMandiKm = MANDI_LOCATIONS[mandiName]?.distanceKm || facility.distancesFromMandis[mandiName] || 25;

  // 4. Transport Freight Costs
  const vehicle = getRecommendedVehicle(quantityQ);
  const transportToFacilityCalc = calculateFreight({
    distanceKm: distanceToFacilityKm,
    totalQuantityQuintals: quantityQ,
    vehicle
  });
  const transportToMandiCalc = calculateFreight({
    distanceKm: distanceMandiKm,
    totalQuantityQuintals: quantityQ,
    vehicle
  });

  // 5. Storage Economic Expenses
  const months = storageDurationDays / 30;
  const storageFeeTotal = Math.round(quantityQ * facility.storageRatePerQuintalMonth * months);
  const storageFeePerQ = Math.round(storageFeeTotal / Math.max(1, quantityQ));

  const loadingUnloadingCost = Math.round(
    quantityQ * (facility.loadingChargePerQuintal + facility.unloadingChargePerQuintal)
  );
  const handlingCost = Math.round(quantityQ * facility.handlingChargePerQuintal);
  const packagingCost = Math.round(quantityQ * facility.packagingChargePerQuintal);
  const insuranceCost = facility.insuranceAvailable
    ? Math.round((currentPrice * quantityQ * (facility.insuranceRatePct / 100) * months))
    : 0;

  const totalExpenses =
    storageFeeTotal +
    transportToFacilityCalc.totalFreightCost +
    loadingUnloadingCost +
    handlingCost +
    packagingCost +
    insuranceCost;

  const costPerQuintalTotal = Math.round(totalExpenses / Math.max(1, quantityQ));

  // 6. Spoilage Loss Modeling
  const totalLossPct = Math.min(30, cropProfile.baseDailyLossPct * storageDurationDays);
  const spoilageWeightLossQ = Number((quantityQ * (totalLossPct / 100)).toFixed(2));
  const sellableQuantityQ = Math.max(0, Number((quantityQ - spoilageWeightLossQ).toFixed(2)));
  const spoilageValueLossRs = Math.round(spoilageWeightLossQ * currentPrice);

  const economics: StorageEconomicBreakdown = {
    storageFeeTotal,
    storageFeePerQ,
    transportToFacilityCost: transportToFacilityCalc.totalFreightCost,
    transportToFacilityPerQ: transportToFacilityCalc.freightPerQuintal,
    loadingUnloadingCost,
    handlingCost,
    packagingCost,
    insuranceCost,
    totalExpenses,
    costPerQuintalTotal,
    spoilageWeightLossQ,
    spoilageWeightLossPct: Number(totalLossPct.toFixed(1)),
    sellableQuantityQ,
    spoilageValueLossRs
  };

  // 7. Option A: Sell Now
  const grossSellNow = Math.round(quantityQ * currentPrice);
  const netSellNow = Math.max(0, grossSellNow - transportToMandiCalc.totalFreightCost);

  const optionSellNow: OptionAnalysis = {
    optionType: 'sell_now',
    titleMr: 'पर्याय १: आजच माल विका (SELL NOW)',
    titleEn: 'Option A: Sell Immediately Today',
    pricePerQ: currentPrice,
    quantityQ,
    grossRevenue: grossSellNow,
    mandiTransportCost: transportToMandiCalc.totalFreightCost,
    storageExpenses: 0,
    spoilageLossValue: 0,
    netRevenue: netSellNow,
    netRevenuePerQ: Math.round(netSellNow / Math.max(1, quantityQ))
  };

  // 8. Option B: Store N Days & Sell Later
  const forecastPricePerQ = getForecastPriceForHorizon(crop, mandiName, currentPrice, storageDurationDays);
  const grossStoreLater = Math.round(sellableQuantityQ * forecastPricePerQ);
  const netStoreLater = grossStoreLater - totalExpenses - transportToMandiCalc.totalFreightCost;

  const optionStoreLater: OptionAnalysis = {
    optionType: 'store_later',
    titleMr: `पर्याय २: ${storageDurationDays} दिवस साठवून नंतर विका (STORE)`,
    titleEn: `Option B: Store for ${storageDurationDays} Days & Sell Later`,
    pricePerQ: forecastPricePerQ,
    quantityQ: sellableQuantityQ,
    grossRevenue: grossStoreLater,
    mandiTransportCost: transportToMandiCalc.totalFreightCost,
    storageExpenses: totalExpenses,
    spoilageLossValue: spoilageValueLossRs,
    netRevenue: netStoreLater,
    netRevenuePerQ: Math.round(netStoreLater / Math.max(1, quantityQ))
  };

  // 9. Financial Differentials
  const netAdvantageRs = netStoreLater - netSellNow;
  const netAdvantagePct = Number(((netAdvantageRs / Math.max(1, netSellNow)) * 100).toFixed(1));

  // 10. Break-Even Price Formula
  // Break-even future price = (NetSellNow + TotalExpenses + MandiTransport) / SellableQuantity
  const breakEvenPricePerQ = Math.round(
    (netSellNow + totalExpenses + transportToMandiCalc.totalFreightCost) / Math.max(0.1, sellableQuantityQ)
  );
  const priceDifferenceRs = forecastPricePerQ - breakEvenPricePerQ;

  // 11. Storage Risk Matrix (0-100)
  const priceRisk = Math.min(100, Math.max(10, Math.round(storageDurationDays * 0.8 + (crop === 'Tomato' ? 30 : 10))));
  const spoilageRisk = Math.min(100, Math.max(5, Math.round(totalLossPct * 3.5)));
  const marketRisk = Math.min(100, Math.round(20 + (storageDurationDays > 45 ? 25 : 10)));
  const costRisk = Math.min(100, Math.round((totalExpenses / Math.max(1, grossSellNow)) * 300));
  const qualityRisk = Math.min(100, Math.round((cropProfile.qualityDecayPctPer30Days * months) * 10));
  const facilityRisk = Math.max(5, 100 - facility.reliabilityScore);
  const transportRisk = Math.min(100, Math.round((distanceToFacilityKm / 50) * 20));

  const overallRiskScore = Math.min(
    100,
    Math.round(
      priceRisk * 0.25 +
      spoilageRisk * 0.20 +
      marketRisk * 0.15 +
      costRisk * 0.15 +
      qualityRisk * 0.10 +
      facilityRisk * 0.10 +
      transportRisk * 0.05
    )
  );

  let riskCategoryMr = 'मध्यम धोका (Moderate Risk)';
  let riskCategoryEn = 'Moderate Risk';
  let riskColor = '#F59E0B';

  if (overallRiskScore <= 30) {
    riskCategoryMr = 'कमी धोका (Low Risk)';
    riskCategoryEn = 'Low Risk';
    riskColor = '#2E7D32';
  } else if (overallRiskScore <= 55) {
    riskCategoryMr = 'मध्यम धोका (Moderate Risk)';
    riskCategoryEn = 'Moderate Risk';
    riskColor = '#F59E0B';
  } else if (overallRiskScore <= 75) {
    riskCategoryMr = 'उच्च धोका (High Risk)';
    riskCategoryEn = 'High Risk';
    riskColor = '#EA580C';
  } else {
    riskCategoryMr = 'अति-उच्च धोका (Critical Risk)';
    riskCategoryEn = 'Critical Risk';
    riskColor = '#DC2626';
  }

  // Risk Score Explanation Bullet Points (Reasons for Risk Score)
  const riskReasonsMr: string[] = [];
  const riskReasonsEn: string[] = [];

  // Price Risk Explanation
  if (priceRisk <= 35) {
    riskReasonsMr.push(`भाव स्थिर राहण्याची शक्यता: पुढील ${storageDurationDays} दिवसांत अंदाजित दर वाढीमुळे भाव घसरण्याचा धोका कमी आहे (${priceRisk}/100).`);
    riskReasonsEn.push(`Price Stability: Price expected to appreciate over ${storageDurationDays} days, keeping market volatility risk low (${priceRisk}/100).`);
  } else {
    riskReasonsMr.push(`भाव चढ-उतार धोका: दीर्घ ${storageDurationDays} दिवसांच्या कालावधीमुळे बाजारभावात संभाव्य घसरणीची शक्यता आहे (${priceRisk}/100).`);
    riskReasonsEn.push(`Price Risk: Extended ${storageDurationDays}-day duration increases vulnerability to market price fluctuations (${priceRisk}/100).`);
  }

  // Spoilage Shrinkage Explanation
  if (spoilageRisk <= 30) {
    riskReasonsMr.push(`कमी वजन घट: ${crop} पिकासाठी ${storageDurationDays} दिवसांत अंदाजे ${totalLossPct.toFixed(1)}% (${spoilageWeightLossQ} Q) घट सुरक्षित मर्यादेत आहे (${spoilageRisk}/100).`);
    riskReasonsEn.push(`Controlled Spoilage: Expected ${totalLossPct.toFixed(1)}% (~${spoilageWeightLossQ} Q) weight shrinkage is within safe storage thresholds (${spoilageRisk}/100).`);
  } else {
    riskReasonsMr.push(`उच्च वजन घट धोका: ${storageDurationDays} दिवसांत ${totalLossPct.toFixed(1)}% (${spoilageWeightLossQ} Q) मालाचे वजन घटण्याचे नुकसान संभवते (${spoilageRisk}/100).`);
    riskReasonsEn.push(`High Spoilage Risk: Significant ${totalLossPct.toFixed(1)}% (~${spoilageWeightLossQ} Q) produce weight loss expected over ${storageDurationDays} days (${spoilageRisk}/100).`);
  }

  // Quality Risk Explanation
  if (qualityRisk <= 25) {
    riskReasonsMr.push(`गुणवत्ता टिकवण: ${cropProfile.recommendedStorageTypeMr} सुविधेमुळे पिकाची प्रत टिकून राहील (${qualityRisk}/100).`);
    riskReasonsEn.push(`Quality Retention: ${cropProfile.recommendedStorageTypeEn} minimizes grade degradation (${qualityRisk}/100).`);
  } else {
    riskReasonsMr.push(`गुणवत्ता घसरण्याचा धोका: जास्त दिवस साठवल्यास पिकाची गुणवत्ता खालावण्याचा धोका आहे (${qualityRisk}/100).`);
    riskReasonsEn.push(`Quality Loss Risk: Extended storage time may lead to partial crop grade reduction (${qualityRisk}/100).`);
  }

  // Facility & Transport Reliability Explanation
  riskReasonsMr.push(`गोदाम विश्वसनीयता व अंतर: निवडलेले केंद्र (${facility.nameMr}) ${distanceToFacilityKm} किमी अंतरावर असून ९०+ गुण दर्जा आहे (गोदाम धोका: ${facilityRisk}/100).`);
  riskReasonsEn.push(`Facility Reliability: Selected facility (${facility.name}) is within ${distanceToFacilityKm} km with a ${facility.reliabilityScore}/100 score (Facility Risk: ${facilityRisk}/100).`);

  const riskBreakdown: RiskBreakdown = {
    priceRisk,
    spoilageRisk,
    marketRisk,
    costRisk,
    qualityRisk,
    facilityRisk,
    transportRisk,
    overallRiskScore,
    riskCategoryMr,
    riskCategoryEn,
    riskColor,
    riskReasonsMr,
    riskReasonsEn
  };

  // 12. Optimal Period Evaluation Matrix (0, 15, 30, 45, 60 days)
  const testDays = [0, 15, 30, 45, 60];
  let maxRiskAdjNet = -Infinity;
  let optimalDays = 30;

  const optimalPeriodList: OptimalPeriodComparison[] = testDays.map((d) => {
    if (d === 0) {
      return {
        days: 0,
        expectedPrice: currentPrice,
        storageCost: 0,
        spoilageLossPct: 0,
        sellableQuantityQ: quantityQ,
        netRevenue: netSellNow,
        netAdvantageVsNow: 0,
        riskScore: 10,
        isOptimal: false
      };
    }

    const fPrice = getForecastPriceForHorizon(crop, mandiName, currentPrice, d);
    const m = d / 30;
    const sFee = Math.round(quantityQ * facility.storageRatePerQuintalMonth * m);
    const lossP = Math.min(30, cropProfile.baseDailyLossPct * d);
    const sellQ = Math.max(0, Number((quantityQ * (1 - lossP / 100)).toFixed(2)));
    const gRev = Math.round(sellQ * fPrice);
    const totExp = sFee + transportToFacilityCalc.totalFreightCost + loadingUnloadingCost;
    const netR = gRev - totExp - transportToMandiCalc.totalFreightCost;
    const netAdv = netR - netSellNow;
    const rScore = Math.min(100, Math.round(d * 0.9 + lossP * 2));

    const riskAdjNet = netR - (rScore * 100);
    if (riskAdjNet > maxRiskAdjNet) {
      maxRiskAdjNet = riskAdjNet;
      optimalDays = d;
    }

    return {
      days: d,
      expectedPrice: fPrice,
      storageCost: totExp,
      spoilageLossPct: Number(lossP.toFixed(1)),
      sellableQuantityQ: sellQ,
      netRevenue: netR,
      netAdvantageVsNow: netAdv,
      riskScore: rScore,
      isOptimal: false
    };
  });

  // Mark optimal
  optimalPeriodList.forEach((item) => {
    if (item.days === optimalDays) item.isOptimal = true;
  });

  // 13. Recommendation Logic
  let recommendation: 'STORE' | 'HOLD_WITH_CAUTION' | 'SELL_NOW' | 'INSUFFICIENT_DATA' = 'SELL_NOW';
  let recommendationTitleMr = 'आजच माल विका (RECOMMENDATION: SELL NOW)';
  let recommendationTitleEn = 'RECOMMENDATION: SELL NOW';

  if (storageDurationDays > cropProfile.maxSafeDays) {
    recommendation = 'SELL_NOW';
    recommendationTitleMr = 'आजच माल विका (साठवणूक मर्यादा ओलांडली)';
    recommendationTitleEn = 'SELL NOW (Exceeds Max Safe Storage Days)';
  } else if (netAdvantageRs > 5000 && overallRiskScore <= 55) {
    recommendation = 'STORE';
    recommendationTitleMr = 'साठवणूक करा (RECOMMENDATION: STORE)';
    recommendationTitleEn = 'RECOMMENDATION: STORE';
  } else if (netAdvantageRs > 1000 && overallRiskScore <= 70) {
    recommendation = 'HOLD_WITH_CAUTION';
    recommendationTitleMr = 'काळजीपूर्वक साठवणूक करा (HOLD WITH CAUTION)';
    recommendationTitleEn = 'RECOMMENDATION: HOLD WITH CAUTION';
  } else {
    recommendation = 'SELL_NOW';
    recommendationTitleMr = 'आजच माल विका (SELL NOW FOR BETTER NET REALIZATION)';
    recommendationTitleEn = 'RECOMMENDATION: SELL NOW';
  }

  // 14. Explainable AI Bullets
  const explainableReasonsMr: string[] = [];
  const explainableReasonsEn: string[] = [];
  const warningsMr: string[] = [];
  const warningsEn: string[] = [];

  const pctDiffPrice = Number((((forecastPricePerQ - currentPrice) / currentPrice) * 100).toFixed(1));

  if (forecastPricePerQ > currentPrice) {
    explainableReasonsMr.push(`अंदाजित बाजारभाव पुढील ${storageDurationDays} दिवसांत ₹${currentPrice} वरून ₹${forecastPricePerQ}/क्विंटल (+${pctDiffPrice}%) होण्याचा अंदाज आहे.`);
    explainableReasonsEn.push(`Forecast price expected to rise from ₹${currentPrice} to ₹${forecastPricePerQ}/Q (+${pctDiffPrice}%) over ${storageDurationDays} days.`);
  }

  if (netAdvantageRs > 0) {
    explainableReasonsMr.push(`साठवणूक व वाहतूक खर्च वजा करूनही अंदाजे ₹${netAdvantageRs.toLocaleString('en-IN')} चा अतिरिक्त निखळ नफा मिळण्याची शक्यता आहे.`);
    explainableReasonsEn.push(`Expected net additional return of ₹${netAdvantageRs.toLocaleString('en-IN')} after accounting for all storage & transport costs.`);
  } else {
    warningsMr.push(`साठवणूक व हाताळणी खर्चामुळे आजच माल विकणे अधिक फायदेशीर ठरत आहे (साठवणुकीने ₹${Math.abs(netAdvantageRs).toLocaleString('en-IN')} चे नुकसान होऊ शकते).`);
    warningsEn.push(`Selling today yields higher net return; storing may incur a loss of ₹${Math.abs(netAdvantageRs).toLocaleString('en-IN')} due to costs & weight shrinkage.`);
  }

  explainableReasonsMr.push(`निवडलेली साठवणूक संस्था (${facility.nameMr}) मोजक्या ${distanceToFacilityKm} किमी अंतरावर उपलब्ध असून विश्वसनीयता गुण ९०+ आहेत.`);
  explainableReasonsEn.push(`Selected facility (${facility.name}) is within ${distanceToFacilityKm} km with a high reliability rating of ${facility.reliabilityScore}/100.`);

  if (economics.spoilageWeightLossPct > 5) {
    warningsMr.push(`⚠️ ${storageDurationDays} दिवसांच्या साठवणुकीदरम्यान ${economics.spoilageWeightLossPct}% (सुमारे ${spoilageWeightLossQ} क्विंटल) वजन घट/नुकसान होण्याचा अंदाज आहे.`);
    warningsEn.push(`⚠️ Expected weight loss/shrinkage of ${economics.spoilageWeightLossPct}% (~${spoilageWeightLossQ} Quintals) over ${storageDurationDays} days.`);
  }

  if (forecastPricePerQ < breakEvenPricePerQ) {
    warningsMr.push(`⚠️ नफा मिळवण्यासाठी पुढील बाजारभाव किमान ₹${breakEvenPricePerQ}/क्विंटल जाणे आवश्यक आहे.`);
    warningsEn.push(`⚠️ Break-even price is ₹${breakEvenPricePerQ}/Q; forecasted price must exceed this to guarantee profit.`);
  }

  // 15. Facility Rating Score & Reasons
  let facilityScore = facility.reliabilityScore;
  const facilityScoreReasonsMr: string[] = [
    `मंडीपासून अंतर: ${facility.distancesFromMandis[mandiName] || distanceToFacilityKm} किमी`,
    `उपलब्ध क्षमता: ${facility.availableCapacity} MT`,
    `हमी: ${facility.insuranceAvailable ? 'विमा संरक्षण उपलब्ध' : 'विमा नाही'}`
  ];
  const facilityScoreReasonsEn: string[] = [
    `Distance from mandi: ${facility.distancesFromMandis[mandiName] || distanceToFacilityKm} km`,
    `Available Capacity: ${facility.availableCapacity} MT`,
    `Insurance: ${facility.insuranceAvailable ? 'Available' : 'Not available'}`
  ];

  return {
    crop,
    mandi: mandiName,
    quantityQ,
    currentMandiPrice: currentPrice,
    storageDurationDays,
    facility,
    cropProfile,
    economics,
    optionSellNow,
    optionStoreLater,
    netAdvantageRs,
    netAdvantagePct,
    breakEvenPricePerQ,
    forecastPricePerQ,
    priceDifferenceRs,
    riskBreakdown,
    recommendation,
    recommendationTitleMr,
    recommendationTitleEn,
    optimalPeriodList,
    optimalDays,
    explainableReasonsMr,
    explainableReasonsEn,
    warningsMr,
    warningsEn,
    facilityScore,
    facilityScoreReasonsMr,
    facilityScoreReasonsEn
  };
}
