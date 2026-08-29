// Universal Intent Detection, Entity Extraction, and Language Processor for Kisan Mitra AI

export type AssistantIntent =
  | 'MANDI_PRICE_TODAY'
  | 'MANDI_PRICE'
  | 'CROP_CULTIVATION'
  | 'FERTILIZER'
  | 'PEST_DISEASE'
  | 'CROP_ADVICE'
  | 'WEATHER'
  | 'PROFIT_CALCULATOR'
  | 'PRICE_ALERTS'
  | 'VOICE_NAVIGATION'
  | 'GREETING'
  | 'GENERAL_FARMING';

export type SupportedLanguage = 'mr' | 'mr_roman' | 'hi' | 'en';

export interface ExtractedEntities {
  commodity?: string; // e.g. 'onion', 'soybean', 'cotton', 'sugarcane', 'pomegranate', 'wheat', 'tomato'
  market?: string;    // e.g. 'Nashik', 'Lasalgaon', 'Kopargaon', 'Rahata', 'Yeola', 'Sangamner', 'Shrirampur', 'Ahilyanagar'
  date?: string;      // e.g. 'today', 'tomorrow'
  navRoute?: string;  // e.g. '/comparison', '/trends', '/recommendation', '/calculator', '/alerts', '/profile', '/'
}

export interface IntentAnalysisResult {
  intent: AssistantIntent;
  language: SupportedLanguage;
  entities: ExtractedEntities;
  normalizedText: string;
}

// 1. Language Detection & Text Normalization
export function detectLanguageAndNormalize(text: string): { language: SupportedLanguage; normalizedText: string } {
  if (!text) return { language: 'mr', normalizedText: '' };

  const raw = text.trim();
  const normalizedText = raw
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const devanagariCount = (raw.match(/[\u0900-\u097F]/g) || []).length;
  if (devanagariCount > 0) {
    return { language: 'mr', normalizedText };
  }

  const romanMarathiKeywords = [
    'bhav', 'bajar', 'bajarbhav', 'kanda', 'kandaa', 'kandyacha', 'kandyachya', 'kandya', 'sang', 'song', 'aaj',
    'madhe', 'se', 'cha', 'chi', 'che', 'kiti', 'aahe', 'mala', 'udya', 'dakhav', 'ughad',
    'pahije', 'batao', 'karo', 'shuru', 'paus', 'hava', 'rate', 'khat', 'dyaycha', 'rog', 'ala', 'kru', 'karavi',
    'lagvad', 'perava', 'kid', 'sheti'
  ];

  const words = normalizedText.split(' ');
  const hasRomanMarathi = words.some((w) => romanMarathiKeywords.includes(w));

  if (hasRomanMarathi) {
    return { language: 'mr_roman', normalizedText };
  }

  if (words.some((w) => ['kya', 'batao', 'bhai', 'kaise', 'mandi', 'dam'].includes(w))) {
    return { language: 'hi', normalizedText };
  }

  return { language: 'en', normalizedText };
}

// 2. Unicode-Safe Entity Extraction Engine
export function extractEntities(normalizedText: string, context?: ExtractedEntities): ExtractedEntities {
  const entities: ExtractedEntities = { ...context };

  // Commodity mapping
  if (/(kanda|kandaa|kandyacha|kandyachya|kandya|kande|onion|onions|कांदा|कांद्याचा|कांद्याचे|कांद्याला|कांदे)/i.test(normalizedText)) {
    entities.commodity = 'onion';
  } else if (/(soybean|soyabean|soya|सोयाबीन)/i.test(normalizedText)) {
    entities.commodity = 'soybean';
  } else if (/(kapus|cotton|कापूस)/i.test(normalizedText)) {
    entities.commodity = 'cotton';
  } else if (/(sugarcane|sugar|us|ऊस)/i.test(normalizedText)) {
    entities.commodity = 'sugarcane';
  } else if (/(dalimb|pomegranate|डाळिंब)/i.test(normalizedText)) {
    entities.commodity = 'pomegranate';
  } else if (/(gahu|gehu|wheat|गहू)/i.test(normalizedText)) {
    entities.commodity = 'wheat';
  } else if (/(tomato|tamatar|टोमॅटो)/i.test(normalizedText)) {
    entities.commodity = 'tomato';
  }

  // Market mapping
  if (/(lasalgaon|lasalganv|lasalgaoncha|लासलगाव|लासलगावमध्ये|लासलगावचा|लासलगावची)/i.test(normalizedText)) {
    entities.market = 'Lasalgaon';
  } else if (/(nashik|nasik|nashikcha|नाशिक|नाशिकमध्ये|नाशिकचा|नाशिकची)/i.test(normalizedText)) {
    entities.market = 'Nashik';
  } else if (/(kopargaon|koparganv|kopargaoncha|कोपरगाव|कोपरगावमध्ये|कोपरगावचा)/i.test(normalizedText)) {
    entities.market = 'Kopargaon';
  } else if (/(rahata|raheta|राहाता|राहात्यामध्ये|राहाताचा)/i.test(normalizedText)) {
    entities.market = 'Rahata';
  } else if (/(yeola|yewla|yeolacha|येवला|येवल्यामध्ये|येवलाचा)/i.test(normalizedText)) {
    entities.market = 'Yeola';
  } else if (/(sangamner|sangamnercha|संगमनेर|संगमनेरमध्ये)/i.test(normalizedText)) {
    entities.market = 'Sangamner';
  } else if (/(shrirampur|shrirampura|श्रीरामपूर)/i.test(normalizedText)) {
    entities.market = 'Shrirampur';
  } else if (/(ahilyanagar|ahmednagar|अहिल्यानगर|अहमदनगर)/i.test(normalizedText)) {
    entities.market = 'Ahilyanagar';
  } else if (/(pimpalgaon|पिंपळगाव)/i.test(normalizedText)) {
    entities.market = 'Pimpalgaon';
  }

  // Date mapping
  if (/(aaj|aajcha|aajche|today|आज|आजचा|आजचे)/i.test(normalizedText)) {
    entities.date = 'today';
  } else if (/(udya|tomorrow|उद्या)/i.test(normalizedText)) {
    entities.date = 'tomorrow';
  }

  return entities;
}

// 3. Navigation Intent Resolver
export function checkNavigationIntent(normalizedText: string): string | null {
  if (
    /(mandi|bajar|bazar|market|मंडी|बाजार)/i.test(normalizedText) &&
    /(open|ughad|dakhav|dakhva|ja|go|compare|comparison|tulna|उघडा|दाखवा)/i.test(normalizedText)
  ) {
    return '/comparison';
  }

  if (
    /(weather|havaman|paus|rain|trend|trends|forecast|हवामान|पाऊस)/i.test(normalizedText) &&
    /(open|ughad|dakhav|dakhva|ja|go|paha|show|उघडा|दाखवा)/i.test(normalizedText)
  ) {
    return '/trends';
  }

  if (
    /(crop|pik|salla|recommendation|advice|पिक|सल्ला)/i.test(normalizedText) &&
    /(open|ughad|dakhav|dakhva|ja|go|paha|show|उघडा|दाखवा)/i.test(normalizedText)
  ) {
    return '/recommendation';
  }

  if (
    /(profit|calculator|nafa|ganit|tota|नफा|कॅल्क्युलेटर)/i.test(normalizedText) &&
    /(open|ughad|dakhav|dakhva|ja|go|moja|calculate|उघडा|दाखवा)/i.test(normalizedText)
  ) {
    return '/calculator';
  }

  if (
    /(alert|alerts|notification|sms|अलर्ट)/i.test(normalizedText) &&
    /(open|ughad|dakhav|dakhva|ja|go|set|उघडा|दाखवा)/i.test(normalizedText)
  ) {
    return '/alerts';
  }

  if (
    /(profile|account|setting|settings|mahitie|प्रोफाईल)/i.test(normalizedText) &&
    /(open|ughad|dakhav|dakhva|ja|go|उघडा|दाखवा)/i.test(normalizedText)
  ) {
    return '/profile';
  }

  if (
    /(home|dashboard|main|back|parat|डॅशबोर्ड|मुख्य)/i.test(normalizedText) &&
    /(open|ughad|ja|go|var|उघडा)/i.test(normalizedText)
  ) {
    return '/';
  }

  return null;
}

// 4. Intent Classification Engine
export function classifyIntent(text: string, context?: ExtractedEntities): IntentAnalysisResult {
  const { language, normalizedText } = detectLanguageAndNormalize(text);
  const entities = extractEntities(normalizedText, context);

  // Check for navigation first
  const navRoute = checkNavigationIntent(normalizedText);
  if (navRoute) {
    entities.navRoute = navRoute;
    return { intent: 'VOICE_NAVIGATION', language, entities, normalizedText };
  }

  const isPriceKeyword = /(bhav|bajar|bazar|rate|price|kiti|dam|sang|song|भाव|दर|बाजारभाव|किंमत|सांगा)/i.test(normalizedText);
  const hasMarket = Boolean(entities.market);

  if ((isPriceKeyword || hasMarket) && (entities.commodity || hasMarket || /(bhav|bajar|bazar|rate|price|भाव|दर)/i.test(normalizedText))) {
    if (entities.date === 'today' || /(aaj|today|आज)/i.test(normalizedText)) {
      return { intent: 'MANDI_PRICE_TODAY', language, entities, normalizedText };
    }
    return { intent: 'MANDI_PRICE', language, entities, normalizedText };
  }

  if (/(khat|fertilizer|npk|urea|dap|ssp|mop|खत|खते|माती परीक्षण)/i.test(normalizedText)) {
    return { intent: 'FERTILIZER', language, entities, normalizedText };
  }

  if (/(rog|kid|pest|disease|fungus|thrips|insect|कीड|रोग|अळी|करपा|थ्रिप्स)/i.test(normalizedText)) {
    return { intent: 'PEST_DISEASE', language, entities, normalizedText };
  }

  if (/(lagvad|perava|perani|cultivation|growing|sowing|लागवड|पेरणी|कशी करावी|कधी करावी)/i.test(normalizedText)) {
    return { intent: 'CROP_CULTIVATION', language, entities, normalizedText };
  }

  if (/(paus|rain|weather|havaman|barish|ढग|पाऊस|हवामान)/i.test(normalizedText)) {
    return { intent: 'WEATHER', language, entities, normalizedText };
  }

  if (/(hi|hello|hey|ramram|ram ram|namaskar|नमस्कार|रामराम)/i.test(normalizedText)) {
    return { intent: 'GREETING', language, entities, normalizedText };
  }

  return { intent: 'GENERAL_FARMING', language, entities, normalizedText };
}
