export interface WeatherSignalItem {
  date: string;
  condition: 'Rain' | 'Sunny' | 'Cloudy' | 'Storm';
  tempC: number;
  rainfallMm: number;
  supplyShockImpactPct: number; // positive = price increase due to supply constraint
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  descriptionMr: string;
  descriptionEn: string;
}

export interface CropRecommendationItem {
  id: string;
  crop: string;
  cropNameMr: string;
  cropNameEn: string;
  expectedProfitPerAcre: number;
  marketDemandScore: number; // 1-100
  climateRiskScore: number; // 1-100 (lower is safer)
  waterRequirement: 'LOW' | 'MEDIUM' | 'HIGH';
  suitableSoil: Array<'BLACK' | 'LOAMY' | 'SANDY'>;
  suitableSeasons: Array<'KHARIF' | 'RABBI' | 'SUMMER'>;
  growingPeriodDays: number;
  headlineReasonMr: string;
  headlineReasonEn: string;
}

export interface ProcessingLinkageItem {
  crop: string;
  rawMandiPrice: number;
  channelNameMr: string;
  channelNameEn: string;
  processedPricePerQ: number;
  processingCostPerQ: number;
  netExtraProfitPerQ: number;
  recommendedActionMr: string;
  recommendedActionEn: string;
}

export const WEATHER_SIGNALS: WeatherSignalItem[] = [
  {
    date: '2026-08-07',
    condition: 'Rain',
    tempC: 28,
    rainfallMm: 42,
    supplyShockImpactPct: 8.5,
    riskLevel: 'HIGH',
    descriptionMr: 'कोपरगाव क्षेत्रात अवकाळी पाऊस — मंडीत आवक घटल्याने कांद्याच्या भावात ८-१०% वाढीची शक्यता',
    descriptionEn: 'Unseasonal rain in Kopargaon — 8-10% price surge expected due to arrival delay'
  },
  {
    date: '2026-08-08',
    condition: 'Storm',
    tempC: 26,
    rainfallMm: 65,
    supplyShockImpactPct: 12.0,
    riskLevel: 'CRITICAL',
    descriptionMr: 'मुसळधार पाऊस व पुराची शक्यता — काढणी झालेला माल सुरक्षित साठवणूक गृहात हलवा',
    descriptionEn: 'Heavy rain warning — move harvested crops to dry storage immediately'
  },
  {
    date: '2026-08-09',
    condition: 'Cloudy',
    tempC: 30,
    rainfallMm: 10,
    supplyShockImpactPct: 4.0,
    riskLevel: 'MEDIUM',
    descriptionMr: 'ढगाळ हवामान — हवेतील दमटपणामुळे काढणी पश्चात पिकाची काळजी घ्या',
    descriptionEn: 'Cloudy weather — maintain post-harvest ventilation for perishable crops'
  }
];

export const CROP_RECOMMENDATIONS: CropRecommendationItem[] = [
  {
    id: 'rec-101',
    crop: 'Onion',
    cropNameMr: 'लाल कांदा (Red Onion)',
    cropNameEn: 'Red Onion',
    expectedProfitPerAcre: 115000,
    marketDemandScore: 92,
    climateRiskScore: 25,
    waterRequirement: 'MEDIUM',
    suitableSoil: ['BLACK', 'LOAMY'],
    suitableSeasons: ['RABBI', 'KHARIF'],
    growingPeriodDays: 110,
    headlineReasonMr: 'स्थानिक व आंतरराष्ट्रीय बाजारात मागणी उच्च — सर्वाधिक परतावा देणारे पिक',
    headlineReasonEn: 'High domestic & export demand — top paying crop for Kopargaon region'
  },
  {
    id: 'rec-102',
    crop: 'Soybean',
    cropNameMr: 'सोयाबीन (Soybean)',
    cropNameEn: 'Soybean',
    expectedProfitPerAcre: 78000,
    marketDemandScore: 86,
    climateRiskScore: 18,
    waterRequirement: 'LOW',
    suitableSoil: ['BLACK', 'LOAMY', 'SANDY'],
    suitableSeasons: ['KHARIF'],
    growingPeriodDays: 95,
    headlineReasonMr: 'कमी पाण्याच्या उपलब्धतेतही स्थिर भाव व कमी हवामान धोका',
    headlineReasonEn: 'Stable price resilience with low water input & minimum climate risk'
  },
  {
    id: 'rec-103',
    crop: 'Cotton',
    cropNameMr: 'लांब धाग्याचा कापूस (Cotton)',
    cropNameEn: 'Long Staple Cotton',
    expectedProfitPerAcre: 92000,
    marketDemandScore: 84,
    climateRiskScore: 35,
    waterRequirement: 'MEDIUM',
    suitableSoil: ['BLACK'],
    suitableSeasons: ['KHARIF'],
    growingPeriodDays: 150,
    headlineReasonMr: 'सूत गिरण्यांकडून मोठी मागणी — दीर्घकालीन चांगला परतावा',
    headlineReasonEn: 'Strong textile mill linkage — consistent medium to long term ROI'
  },
  {
    id: 'rec-104',
    crop: 'Pomegranate',
    cropNameMr: 'डाळिंब (Bhagwa Pomegranate)',
    cropNameEn: 'Bhagwa Pomegranate',
    expectedProfitPerAcre: 185000,
    marketDemandScore: 95,
    climateRiskScore: 40,
    waterRequirement: 'LOW',
    suitableSoil: ['LOAMY', 'SANDY'],
    suitableSeasons: ['SUMMER', 'RABBI'],
    growingPeriodDays: 180,
    headlineReasonMr: 'उत्कृष्ट निर्यात मूल्य — फलोत्पादनात सर्वाधिक नफा देणारे पिक',
    headlineReasonEn: 'Premium export value — highest profit per acre horticultural crop'
  }
];

export const PROCESSING_LINKAGES: Record<string, ProcessingLinkageItem> = {
  Onion: {
    crop: 'Onion',
    rawMandiPrice: 1950,
    channelNameMr: 'कांदा चाळ साठवणूक व निर्जलीकरण (Dehydration & Storage Net)',
    channelNameEn: 'Onion Storage & Dehydration Processing',
    processedPricePerQ: 2650,
    processingCostPerQ: 250,
    netExtraProfitPerQ: 450,
    recommendedActionMr: 'सध्या मंडीत विकण्याऐवजी १ महिना चाळीत साठवून निर्जलीकरण केंद्रास विकल्यास रु. ४५०/क्विंटल अतिरिक्त नफा मिळेल.',
    recommendedActionEn: 'Store in onion chawl for 30 days or link with dehydration units for +₹450/quintal net extra gain.'
  },
  Soybean: {
    crop: 'Soybean',
    rawMandiPrice: 4620,
    channelNameMr: 'सोयाबीन तेल निर्मिती व पेंड प्रक्रिया (Solvent Extraction Linkage)',
    channelNameEn: 'Solvent Extraction Oil Mill Linkage',
    processedPricePerQ: 5500,
    processingCostPerQ: 300,
    netExtraProfitPerQ: 580,
    recommendedActionMr: 'शेतकरी उत्पादक कंपनी (FPO) द्वारे थेट तेल गिरणीस पुरवठा केल्यास रु. ५८०/क्विंटल जादा दर मिळतो.',
    recommendedActionEn: 'Supply directly to Oil Extraction Mills via FPO for +₹580/quintal additional margin.'
  },
  Cotton: {
    crop: 'Cotton',
    rawMandiPrice: 7100,
    channelNameMr: 'जिनिंग व गाठी निर्मिती प्रक्रिया (Ginning & Pressing)',
    channelNameEn: 'Ginning & Pressing Processing',
    processedPricePerQ: 8100,
    processingCostPerQ: 400,
    netExtraProfitPerQ: 600,
    recommendedActionMr: 'रूई व सरकी वेगळी करून जिनिंग मिलला दिल्यास प्रति क्विंटल रु. ६०० जास्त परतावा मिळतो.',
    recommendedActionEn: 'Process via Ginning mill to separate lint & seed for +₹600/quintal higher realization.'
  }
};

// Aliases for backwards compatibility
export const MOCK_WEATHER_SIGNALS = WEATHER_SIGNALS;
export const MOCK_CROP_RECOMMENDATIONS = CROP_RECOMMENDATIONS;
export const MOCK_PROCESSING_LINKAGES = PROCESSING_LINKAGES;
