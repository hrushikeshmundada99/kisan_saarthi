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
    rawMandiPrice: 4150,
    channelNameMr: 'कांदा चाळ साठवणूक व निर्जलीकरण (Dehydration & Storage Net)',
    channelNameEn: 'Onion Storage & Dehydration Processing',
    processedPricePerQ: 4850,
    processingCostPerQ: 250,
    netExtraProfitPerQ: 450,
    recommendedActionMr: 'सध्या मंडीत विकण्याऐवजी १ महिना चाळीत साठवून निर्जलीकरण केंद्रास विकल्यास रु. ४५०/क्विंटल अतिरिक्त नफा मिळेल.',
    recommendedActionEn: 'Store in onion chawl for 30 days or link with dehydration units for +₹450/quintal net extra gain.'
  },
  Soybean: {
    crop: 'Soybean',
    rawMandiPrice: 6032,
    channelNameMr: 'सोयाबीन तेल निर्मिती व पेंड प्रक्रिया (Solvent Extraction Linkage)',
    channelNameEn: 'Solvent Extraction Oil Mill Linkage',
    processedPricePerQ: 6900,
    processingCostPerQ: 280,
    netExtraProfitPerQ: 588,
    recommendedActionMr: 'शेतकरी उत्पादक कंपनी (FPO) द्वारे थेट तेल गिरणीस पुरवठा केल्यास रु. ५८८/क्विंटल जादा दर मिळतो.',
    recommendedActionEn: 'Supply directly to Oil Extraction Mills via FPO for +₹588/quintal additional margin.'
  },
  Cotton: {
    crop: 'Cotton',
    rawMandiPrice: 7300,
    channelNameMr: 'जिनिंग व गाठी निर्मिती प्रक्रिया (Ginning & Pressing)',
    channelNameEn: 'Ginning & Pressing Processing',
    processedPricePerQ: 8300,
    processingCostPerQ: 400,
    netExtraProfitPerQ: 600,
    recommendedActionMr: 'रूई व सरकी वेगळी करून जिनिंग मिलला दिल्यास प्रति क्विंटल रु. ६०० जास्त परतावा मिळतो.',
    recommendedActionEn: 'Process via Ginning mill to separate lint & seed for +₹600/quintal higher realization.'
  },
  Tomato: {
    crop: 'Tomato',
    rawMandiPrice: 1520,
    channelNameMr: 'टोमॅटो केचप व प्युरी प्रक्रिया केंद्र (Tomato Processing & Puree Plant)',
    channelNameEn: 'Tomato Ketchup & Puree Processing Unit',
    processedPricePerQ: 2100,
    processingCostPerQ: 200,
    netExtraProfitPerQ: 380,
    recommendedActionMr: 'कच्चा टोमॅटो बाजारात स्वस्त विकण्याऐवजी प्युरी व सॉस प्रक्रिया केंद्रास कंत्राटी पद्धतीने पुरवठा केल्यास ₹३८०/क्विंटल जादा भाव मिळतो.',
    recommendedActionEn: 'Supply to puree/sauce processing units under contract for +₹380/quintal higher realization.'
  },
  Wheat: {
    crop: 'Wheat',
    rawMandiPrice: 2650,
    channelNameMr: 'रॉलर आटा गिरणी व ग्रेडिंग पॅकिंग (Flour Mill & Sorting Packaging)',
    channelNameEn: 'Roller Flour Mill & Grading Unit',
    processedPricePerQ: 3100,
    processingCostPerQ: 150,
    netExtraProfitPerQ: 300,
    recommendedActionMr: 'गव्हाची स्वच्छता व ग्रेडिंग करून ५० किलो बॅग पॅकिंगसह आटा गिरणीस दिल्यास ₹३००/क्विंटल अतिरिक्त नफा मिळेल.',
    recommendedActionEn: 'Grade and supply packaged wheat bags to roller flour mills for +₹300/quintal extra gain.'
  },
  Pomegranate: {
    crop: 'Pomegranate',
    rawMandiPrice: 8300,
    channelNameMr: 'डाळिंब कळी/दाणे प्रक्रिया व अरिल एक्सपोर्ट पॅकिंग (Aril Extraction & Export Packhouse)',
    channelNameEn: 'Fresh Aril Extraction & Export Packhouse',
    processedPricePerQ: 10500,
    processingCostPerQ: 700,
    netExtraProfitPerQ: 1500,
    recommendedActionMr: 'फळांची वर्गवारी करून अ-ग्रेड फळे थेट एक्स्पोर्ट पॅकहाऊसला व बी-ग्रेड दाणे काढणी केंद्रास दिल्यास ₹१,५००/क्विंटल जादा मिळतात.',
    recommendedActionEn: 'Supply A-grade fruit to export packhouse and B-grade to aril units for +₹1,500/quintal margin.'
  },
  Maize: {
    crop: 'Maize',
    rawMandiPrice: 2350,
    channelNameMr: 'इथेनॉल व स्टार्च निर्मिती उद्योग (Distillery & Starch Plant)',
    channelNameEn: 'Ethanol Distillery & Starch Factory Linkage',
    processedPricePerQ: 2800,
    processingCostPerQ: 180,
    netExtraProfitPerQ: 270,
    recommendedActionMr: 'मका थेट इथेनॉल व स्टार्च प्रकल्पांना पुरवल्यास दलाली वाचून ₹२७०/क्विंटल निव्वळ जादा भाव मिळतो.',
    recommendedActionEn: 'Direct bulk delivery to ethanol plants saves commission for +₹270/quintal net profit.'
  },
  Gram: {
    crop: 'Gram',
    rawMandiPrice: 6608,
    channelNameMr: 'डाळ मिल व बेसन प्रक्रिया केंद्र (Dal Mill & Besan Processing)',
    channelNameEn: 'Dal Mill & Besan Manufacturing Linkage',
    processedPricePerQ: 7500,
    processingCostPerQ: 350,
    netExtraProfitPerQ: 542,
    recommendedActionMr: 'हरभऱ्याची डाळ करून डाळ मिल किंवा स्थानिक बेसन उत्पादकांना दिल्यास ₹५४२/क्विंटल जादा नफा होतो.',
    recommendedActionEn: 'Process into chana dal via mills for +₹542/quintal additional realization.'
  },
  Bajra: {
    crop: 'Bajra',
    rawMandiPrice: 2375,
    channelNameMr: 'पशुखाद्य व भरड धान्य पॅकिंग केंद्र (Cattle Feed & Millet Processing)',
    channelNameEn: 'Cattle Feed & Multi-Grain Processing Unit',
    processedPricePerQ: 2750,
    processingCostPerQ: 150,
    netExtraProfitPerQ: 225,
    recommendedActionMr: 'बाजरी पशुखाद्य कारखाने व मिलेट ब्रँड्सना क्लस्टरद्वारे पुरवल्यास ₹२२५/क्विंटल अतिरिक्त नफा मिळतो.',
    recommendedActionEn: 'Supply clean bajra to commercial feed mills for +₹225/quintal extra gain.'
  },
  Sugarcane: {
    crop: 'Sugarcane',
    rawMandiPrice: 3150,
    channelNameMr: 'गुळ व काकवी प्रक्रिया गृह (Jaggery & Organic Khandsari Unit)',
    channelNameEn: 'Jaggery & Organic Khandsari Processing Unit',
    processedPricePerQ: 3800,
    processingCostPerQ: 250,
    netExtraProfitPerQ: 400,
    recommendedActionMr: 'कारखान्याऐवजी ऑर्गनिक गुळ व काकवी बनवून थेट ग्राहकांना/मार्ट्सना विकल्यास ₹४००/क्विंटल जादा नफा.',
    recommendedActionEn: 'Process into organic jaggery/khandsari for retail sales to earn +₹400/quintal extra margin.'
  }
};

// Aliases for backwards compatibility
export const MOCK_WEATHER_SIGNALS = WEATHER_SIGNALS;
export const MOCK_CROP_RECOMMENDATIONS = CROP_RECOMMENDATIONS;
export const MOCK_PROCESSING_LINKAGES = PROCESSING_LINKAGES;
