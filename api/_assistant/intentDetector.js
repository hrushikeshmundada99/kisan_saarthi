// Backend Intent Detection & Universal Grounded Answer Generator for Kisan Mitra AI
import { CURRENT_LIVE_MARKET_DATA, APP_FEATURES_KNOWLEDGE_BASE } from './knowledgeBase.js';

export function analyzeMessage(text = '') {
  if (!text || typeof text !== 'string') {
    return { intent: 'UNKNOWN', language: 'mr', entities: {} };
  }

  const raw = text.trim();
  const normalizedText = raw
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const devanagariCount = (raw.match(/[\u0900-\u097F]/g) || []).length;
  let language = devanagariCount > 0 ? 'mr' : 'en';

  const romanMarathiKeywords = [
    'bhav', 'bajar', 'bajarbhav', 'kanda', 'kandaa', 'kandyacha', 'kandyachya', 'kandya', 'sang', 'song', 'aaj',
    'madhe', 'se', 'cha', 'chi', 'che', 'kiti', 'aahe', 'mala', 'udya', 'dakhav', 'ughad',
    'pahije', 'batao', 'karo', 'shuru', 'paus', 'hava', 'rate', 'khat', 'dyaycha', 'rog', 'ala', 'kru', 'karavi',
    'lagvad', 'perava', 'kid', 'sheti'
  ];

  const words = normalizedText.split(' ');
  const hasRomanMarathi = words.some((w) => romanMarathiKeywords.includes(w));
  if (hasRomanMarathi && devanagariCount === 0) {
    language = 'mr_roman';
  }

  const entities = {};

  // Extract Commodity
  if (/(kanda|kandaa|kandyacha|kandyachya|kandya|kande|onion|onions|कांदा|कांद्याचा|कांद्याचे|कांद्याला|कांदे)/i.test(normalizedText)) {
    entities.commodity = 'Onion';
  } else if (/(soybean|soyabean|soya|सोयाबीन)/i.test(normalizedText)) {
    entities.commodity = 'Soybean';
  } else if (/(kapus|cotton|कापूस)/i.test(normalizedText)) {
    entities.commodity = 'Cotton';
  } else if (/(sugarcane|sugar|us|ऊस)/i.test(normalizedText)) {
    entities.commodity = 'Sugarcane';
  } else if (/(dalimb|pomegranate|डाळिंब)/i.test(normalizedText)) {
    entities.commodity = 'Pomegranate';
  } else if (/(gahu|gehu|wheat|गहू)/i.test(normalizedText)) {
    entities.commodity = 'Wheat';
  } else if (/(tomato|tamatar|टोमॅटो)/i.test(normalizedText)) {
    entities.commodity = 'Tomato';
  }

  // Extract Market
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

  // Extract Date
  if (/(aaj|aajcha|aajche|today|आज|आजचा|आजचे)/i.test(normalizedText)) {
    entities.date = 'today';
  } else if (/(udya|tomorrow|उद्या)/i.test(normalizedText)) {
    entities.date = 'tomorrow';
  }

  let intent = 'GENERAL_FARMING';

  const isPriceKeyword = /(bhav|bajar|bazar|rate|price|kiti|dam|sang|song|भाव|दर|बाजारभाव|किंमत|सांगा)/i.test(normalizedText);

  if ((isPriceKeyword || entities.market) && (entities.commodity || entities.market || /(bhav|bajar|bazar|rate|price|भाव|दर)/i.test(normalizedText))) {
    intent = entities.date === 'today' ? 'MANDI_PRICE_TODAY' : 'MANDI_PRICE';
  } else if (/(khat|fertilizer|npk|urea|dap|ssp|mop|खत|खते|माती परीक्षण)/i.test(normalizedText)) {
    intent = 'FERTILIZER';
  } else if (/(rog|kid|pest|disease|fungus|thrips|insect|कीड|रोग|अळी|करपा|थ्रिप्स)/i.test(normalizedText)) {
    intent = 'PEST_DISEASE';
  } else if (/(lagvad|perava|perani|cultivation|growing|sowing|लागवड|पेरणी|कशी करावी|कधी करावी)/i.test(normalizedText)) {
    intent = 'CROP_CULTIVATION';
  } else if (/(paus|rain|weather|havaman|barish|ढग|पाऊस|हवामान)/i.test(normalizedText)) {
    intent = 'WEATHER';
  } else if (/(hi|hello|hey|ramram|ram ram|namaskar|नमस्कार|रामराम)/i.test(normalizedText)) {
    intent = 'GREETING';
  }

  return { intent, language, entities, normalizedText };
}

/**
 * Generates rich, farmer-friendly answers across all agricultural topics
 */
export function generateGroundedAnswer(text, langHint = 'mr') {
  const { intent, language, entities, normalizedText } = analyzeMessage(text);
  const targetLang = langHint || language;
  const commodity = entities.commodity || 'Onion';

  // 1. MANDI PRICE INTENT
  if (intent === 'MANDI_PRICE_TODAY' || intent === 'MANDI_PRICE' || entities.market) {
    const targetMarket = entities.market; // e.g. 'Lasalgaon', 'Nashik', 'Kopargaon'

    let matches = CURRENT_LIVE_MARKET_DATA.filter((item) => {
      const matchCrop = item.crop.toLowerCase().includes(commodity.toLowerCase());
      const matchMandi = targetMarket ? item.mandi.toLowerCase().includes(targetMarket.toLowerCase()) : true;
      return matchCrop && matchMandi;
    });

    if (targetMarket && matches.length === 0) {
      if (targetLang === 'mr') {
        return `माफ करा, सध्या ${targetMarket} मधील ${commodity} पिकाचा ताजा बाजारभाव मिळवता आला नाही. कृपया थोड्या वेळाने पुन्हा प्रयत्न करा.`;
      } else if (targetLang === 'mr_roman') {
        return `Maaf kara, sadhya ${targetMarket} madhe ${commodity} kandyacha tajaa bajarbhav milavta ala nahi. Krupaya thodya velane punha prayatna kara.`;
      } else {
        return `Sorry, I couldn't retrieve the latest ${targetMarket} ${commodity} market price right now. Please try again shortly.`;
      }
    }

    if (matches.length > 0) {
      const main = matches[0];
      if (targetLang === 'mr') {
        return `🧅 ${main.mandi} ${main.crop} बाजारभाव (आज)\n\n• सरासरी भाव: ₹${main.modalPrice.toLocaleString('en-IN')}/क्विंटल\n• किमान भाव: ₹${main.minPrice.toLocaleString('en-IN')}/क्विंटल\n• कमाल भाव: ₹${main.maxPrice.toLocaleString('en-IN')}/क्विंटल\n\nℹ️ अधिकृत Agmarknet APMC मंडी डेटावर आधारित.`;
      } else if (targetLang === 'mr_roman') {
        return `Aaj ${main.mandi} madhe ${main.crop} cha modal bajar bhav ₹${main.modalPrice.toLocaleString('en-IN')} per quintal aahe (Kiman ₹${main.minPrice} - Kamal ₹${main.maxPrice}).`;
      } else {
        return `Today's modal price for ${main.crop} at ${main.mandi} is ₹${main.modalPrice.toLocaleString('en-IN')}/quintal (Min: ₹${main.minPrice} - Max: ₹${main.maxPrice}).`;
      }
    }
  }

  // 2. FERTILIZER INTENT (खत व्यवस्थापन)
  if (intent === 'FERTILIZER') {
    if (targetLang === 'mr') {
      return `🌿 ${commodity} पिकासाठी खत व्यवस्थापन सल्ला:\n\n1. बेसअल डोस: लागवडीवेळी प्रति एकरी १ बॅग NPK 10:26:26 + १ बॅग सिंगल सुपर फॉस्फेट (SSP) + २५ किलो युरिया द्यावा.\n2. सल्फर (गंधक): कांद्याची गुणवत्ता व साठवणूक क्षमता वाढवण्यासाठी १० किलो गंधक प्रति एकरी टाकावे.\n3. नत्र डोस: लागवडीनंतर ३० व ४५ दिवसांनी युरिया २५ किलो प्रति एकरी टॉप ड्रेसिंग करावे.`;
    } else if (targetLang === 'mr_roman') {
      return `🌿 ${commodity} sathi Khat Vyavasthapan:\n\n1. Basal Dose: Planting veli per acre 1 bag NPK 10:26:26 + 1 bag SSP + 25kg Urea dya.\n2. Sulphur: Quality vadhvaysathi 10kg Sulphur per acre taka.\n3. Top Dressing: 30 & 45 days nantar 25kg Urea per acre dya.`;
    } else {
      return `🌿 Fertilizer Recommendation for ${commodity}:\n\n1. Basal Dose: 1 bag NPK 10:26:26 + 1 bag Single Super Phosphate + 25kg Urea per acre at planting.\n2. Sulphur: Apply 10kg Sulphur/acre to boost bulb shelf-life & quality.\n3. Top Dressing: Apply 25kg Urea/acre at 30 and 45 days after planting.`;
    }
  }

  // 3. PEST & DISEASE INTENT (कीड व रोग नियंत्रण)
  if (intent === 'PEST_DISEASE') {
    if (targetLang === 'mr') {
      return `🐛 ${commodity} कीड व रोग नियंत्रण उपाय:\n\n1. थ्रिप्स (पिळ पडणे): निंबोळी अर्क ५ मिली किंवा फिपरोनिल ५% एस.सी. २ मिली प्रति लिटर पाण्यात मिसळून फवारावे.\n2. करपा व पांढरे ठिपके: मॅन्कोझेब ७५% डब्ल्यूपी २.५ ग्रॅम किंवा टेब्युकोनॅझोल ०.७ ग्रॅम प्रति लिटर फवारावे.\n3. सेंद्रिय उपाय: प्रति एकरी १५ पिवळे व निळे चिकट सापळे लावावेत.`;
    } else if (targetLang === 'mr_roman') {
      return `🐛 ${commodity} Kid va Rog Niyantran:\n\n1. Thrips: Neem Oil 5ml/L kiwa Fipronil 5% SC 2ml/L spray kara.\n2. Karpa / Purple Blotch: Mancozeb 2.5g/L kiwa Tebuconazole 0.7g/L spray kara.\n3. Yellow Sticky Traps: Per acre 15 traps lava.`;
    } else {
      return `🐛 Pest & Disease Control for ${commodity}:\n\n1. Thrips: Spray Neem Oil (5ml/L) or Fipronil 5% SC (2ml/L).\n2. Blotch/Fungus: Spray Mancozeb 75% WP (2.5g/L) or Tebuconazole (0.7g/L).\n3. Traps: Install 15 yellow/blue sticky traps per acre.`;
    }
  }

  // 4. CROP CULTIVATION INTENT (पिक लागवड व पेरणी)
  if (intent === 'CROP_CULTIVATION') {
    if (targetLang === 'mr') {
      return `🌱 ${commodity} पिक लागवड मार्गदर्शन:\n\n1. हंगाम: खरीप (जून-जुलै), रांगडा (ऑगस्ट-सप्टेंबर) व रब्बी (ऑक्टोबर-नोव्हेंबर).\n2. जमीन व तयारी: चांगला निचरा होणारी मध्यम ते काळी जमीन. सरगादी वाफ्यावर ठिबक व मंचावर लागवड करावी.\n3. बियाणे प्रमाण: प्रति एकरी ३ ते ४ किलो बियाणे रोपासाठी वापरावे.\n4. अंतर: १५ सेमी x १० सेमी अंतरावर पुनर्लागवड करावी.`;
    } else if (targetLang === 'mr_roman') {
      return `🌱 ${commodity} Lagvad Margadarshan:\n\n1. Season: Kharif (June-July), Rangada (Aug-Sept), Rabi (Oct-Nov).\n2. Soil: Well drained medium-black soil.\n3. Seed Rate: 3 to 4 kg per acre.\n4. Spacing: 15cm x 10cm planting spacing.`;
    } else {
      return `🌱 ${commodity} Cultivation Guide:\n\n1. Season: Kharif (June-July), Late Kharif (Aug-Sept), Rabi (Oct-Nov).\n2. Soil: Well-drained medium-black to loamy soil.\n3. Seed Rate: 3-4 kg seeds per acre.\n4. Spacing: 15cm x 10cm planting spacing on raised beds.`;
    }
  }

  // 5. WEATHER INTENT (हवामान अंदाज)
  if (intent === 'WEATHER') {
    if (targetLang === 'mr') {
      return `🌦️ हवामान अंदाज (नाशिक व कोपरगाव परिसर):\n\nआज हवामान निरभ्र असून पुढील २४ तासांत हलक्या पावसाची शक्यता आहे. तापमान २८°C ते ३२°C दरम्यान राहील. फवारणीसाठी हवामान अनुकूल आहे.`;
    } else if (targetLang === 'mr_roman') {
      return `🌦️ Weather Update:\n\nAaj Kopargaon va Nashik madhe havaaman nirabhra aahe, 24 tasat halkya paavsaachi shakyata aahe (28°C - 32°C).`;
    } else {
      return `🌦️ Weather Update (Nashik & Kopargaon):\n\nMostly clear today with a slight chance of light showers in the next 24 hours (28°C - 32°C). Conditions are favorable for spraying.`;
    }
  }

  // 6. GREETING INTENT
  if (intent === 'GREETING') {
    if (targetLang === 'mr') {
      return `रामराम शेतकरी दादा! मी किसान मित्र AI आहे. तुम्ही मला चालू बाजार भाव, खत व्यवस्थापन, पिक लागवड किंवा रोग नियंत्रणाबद्दल विचारू शकता. 🌱`;
    } else if (targetLang === 'mr_roman') {
      return `Ram ram farmer brother! I am Kisan Mitra AI. Ask me about mandi prices, fertilizer, crop advice or pest control. 🌱`;
    } else {
      return `Hello! I am Kisan Mitra AI. Ask me about live mandi rates, fertilizer doses, crop cultivation, or pest control. 🌱`;
    }
  }

  // 7. GENERAL FARMING GUIDANCE (Covers soil testing, organic farming, general guidance)
  if (targetLang === 'mr') {
    return `🌱 शेतकरी सल्ला मार्गदर्शन:\n\n• पिक लागवडीसाठी जमीन तयार करताना शेणखत किंवा कंपोस्ट खत मिसळा.\n• खतांचा अतिरिक्त खर्च वाचवण्यासाठी माती परीक्षण (Soil Testing) करून घ्या.\n• अधिक माहितीसाठी ॲपमधील "पिक सल्ला" (Crop Advice) विभाग पहा.`;
  } else if (targetLang === 'mr_roman') {
    return `🌱 Sheti Salla:\n\n• Lagvadi purvi compost kiwa FYM mix kara.\n• Fertilizer cost kami karnyasathi Soil Testing kara.\n• More details sathi "Crop Advice" section paha.`;
  } else {
    return `🌱 General Farming Advice:\n\n• Mix well-rotted FYM/compost during land preparation.\n• Conduct soil testing to optimize fertilizer spending.\n• Explore the "Crop Advice" section in the app for crop recommendations.`;
  }
}
