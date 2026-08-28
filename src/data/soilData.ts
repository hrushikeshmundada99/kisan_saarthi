export interface SoilTypeInfo {
  id: string;
  nameMr: string;
  nameEn: string;
  shortDescMr: string;
  shortDescEn: string;
  locationInfoMr: string;
  locationInfoEn: string;
  suitableCrops: string[];
  yieldMultiplier: number;
  careTipMr: string;
  careTipEn: string;
  colorBadge: string;
}

export const REGIONAL_SOIL_TYPES: SoilTypeInfo[] = [
  {
    id: 'BLACK_MEDIUM',
    nameMr: 'काळी मध्यम जमीन (Medium Black Soil)',
    nameEn: 'Medium Black Soil (Kali Mati)',
    shortDescMr: 'गोदावरी खोऱ्यात सर्वात लोकप्रिय, पाण्याचा मध्यम निचरा व सुपीकता.',
    shortDescEn: 'Most dominant in Godavari river basin, medium drainage & rich fertility.',
    locationInfoMr: '📍 कोपरगाव, राहाता, श्रीरामपूर व गोदावरी नदी खोऱ्यातील ५५% हून अधिक शेतीत ही जमीन आढळते.',
    locationInfoEn: '📍 Dominant across 55%+ farmlands in Kopargaon, Rahata, Shrirampur & Godavari basin.',
    suitableCrops: ['Onion', 'Soybean', 'Cotton', 'Wheat', 'Gram', 'Sugarcane', 'Maize', 'Bajra'],
    yieldMultiplier: 1.05,
    careTipMr: '💡 कांदा व सोयाबीन पिकासाठी सेंद्रिय खत व जिप्समचा वापर फायदेशीर ठरतो.',
    careTipEn: '💡 Organic compost & gypsum application boosts onion & soybean yield.',
    colorBadge: 'bg-[#2D5016]/10 text-[#2D5016] border-[#2D5016]/30'
  },
  {
    id: 'BLACK_DEEP',
    nameMr: 'काळी खोल / भारी जमीन (Deep Heavy Black Soil)',
    nameEn: 'Deep Heavy Black Soil (Karli Mati)',
    shortDescMr: 'अति-सुपीक, जास्त पाणी धरून ठेवणारी गाळाची भारी जमीन.',
    shortDescEn: 'Highly fertile alluvial soil with high water retention capacity.',
    locationInfoMr: '📍 प्रवरा नदी व गोदावरी कालवा बागायत क्षेत्रात (श्रीरामपूर, नेवासा, कोपरगाव) आढळते.',
    locationInfoEn: '📍 Found in irrigated Pravara & Godavari canal belts (Shrirampur, Newasa, Kopargaon).',
    suitableCrops: ['Sugarcane', 'Cotton', 'Wheat', 'Gram', 'Soybean'],
    yieldMultiplier: 1.08,
    careTipMr: '💡 पावसाळ्यात कांदा लागवडीसाठी बेडवर (Broad Bed Furrow) लागवड करावी.',
    careTipEn: '💡 Use raised Broad Bed Furrow (BBF) for onion to avoid waterlogging.',
    colorBadge: 'bg-[#1E293B]/10 text-[#1E293B] border-[#1E293B]/30'
  },
  {
    id: 'LOAMY',
    nameMr: 'पोयटा / मुरुमाड जमीन (Loamy / Sandy Loam Soil)',
    nameEn: 'Loamy Soil (Murumad Mati)',
    shortDescMr: 'उत्कृष्ट पाण्याचा निचरा, कांदा व फळबागांसाठी सर्वोत्कृष्ट जमीन.',
    shortDescEn: 'Excellent water drainage, optimal for onion and fruit orchards.',
    locationInfoMr: '📍 राहाता, येवला, नाशिक व संगमनेरच्या फळबाग व कांदा पट्ट्यात सर्वाधिक पसंती.',
    locationInfoEn: '📍 Highly preferred across Rahata, Yeola, Nashik & Sangamner orchard belts.',
    suitableCrops: ['Onion', 'Pomegranate', 'Tomato', 'Maize', 'Bajra', 'Wheat'],
    yieldMultiplier: 1.10,
    careTipMr: '💡 कांद्याची प्रत, रंग आणि साठवणूक क्षमता या जमिनीत सर्वात जास्त राहते.',
    careTipEn: '💡 Ensures best onion bulb color, quality, and long storage life.',
    colorBadge: 'bg-[#D97706]/10 text-[#D97706] border-[#D97706]/30'
  },
  {
    id: 'SANDY_LIGHT',
    nameMr: 'रेतीड / हलकी जमीन (Light Sandy Soil)',
    nameEn: 'Light Sandy Soil (Retaad Mati)',
    shortDescMr: 'जलद निचरा होणारी हलकी जमीन, कमी कालावधीच्या पिकांसाठी योग्य.',
    shortDescEn: 'Fast draining light soil, suitable for short-duration crops.',
    locationInfoMr: '📍 संगमनेर, येवला व नाशिक सीमावर्ती डोंगराळ पायथ्याच्या शेतात आढळते.',
    locationInfoEn: '📍 Common along hilly foothills of Sangamner, Yeola & Nashik borders.',
    suitableCrops: ['Onion', 'Bajra', 'Tomato', 'Pomegranate'],
    yieldMultiplier: 0.95,
    careTipMr: '💡 नत्र व विद्राव्य खते ठिबकद्वारे टप्प्याटप्प्याने देणे गरजेचे आहे.',
    careTipEn: '💡 Split nitrogen & fertigation via drip to prevent leaching.',
    colorBadge: 'bg-[#B45309]/10 text-[#B45309] border-[#B45309]/30'
  },
  {
    id: 'RED_LATERITE',
    nameMr: 'तांबडी / लाल मुरुमाड जमीन (Red / Laterite Soil)',
    nameEn: 'Red Laterite Soil (Tambadi Mati)',
    shortDescMr: 'लोह समृद्ध, फळबागा व भाजीपाल्यासाठी उत्तम निचऱ्याची जमीन.',
    shortDescEn: 'Iron-rich, well-drained soil great for pomegranate & vegetables.',
    locationInfoMr: '📍 नाशिक व संगमनेर तालुक्यातील फळबाग पट्ट्यात आढळते.',
    locationInfoEn: '📍 Found in pomegranate and horticultural zones of Nashik & Sangamner.',
    suitableCrops: ['Pomegranate', 'Tomato', 'Bajra', 'Onion'],
    yieldMultiplier: 1.02,
    careTipMr: '💡 स्फुरद व सूक्ष्म अन्नद्रव्ये (झिंक, बोरॉन) ची मात्रा नियमित द्यावी.',
    careTipEn: '💡 Apply micro-nutrients (Zinc, Boron) regularly for better crop quality.',
    colorBadge: 'bg-[#B91C1C]/10 text-[#B91C1C] border-[#B91C1C]/30'
  },
  {
    id: 'CHOPAN_SALINE',
    nameMr: 'चोपण / खारपड जमीन (Saline / Chopan Soil)',
    nameEn: 'Saline Chopan Soil',
    shortDescMr: 'क्षारांचे प्रमाण जास्त, सुधारणेसाठी सेंद्रिय खतांची गरज.',
    shortDescEn: 'High salinity content, requires organic soil amendment & gypsum.',
    locationInfoMr: '📍 जास्त सिंचन असलेल्या कालवा क्षेत्रातील सखल भागात आढळते.',
    locationInfoEn: '📍 Found in low-lying over-irrigated canal pocket areas.',
    suitableCrops: ['Sugarcane', 'Wheat'],
    yieldMultiplier: 0.88,
    careTipMr: '💡 जिप्सम ५०० किलो/एकरी व ताग/धैंचा गाडून जमीन सुधारावी.',
    careTipEn: '💡 Apply 500kg gypsum/acre & green manuring to improve soil structure.',
    colorBadge: 'bg-[#64748B]/10 text-[#64748B] border-[#64748B]/30'
  }
];
