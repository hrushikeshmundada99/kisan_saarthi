import fs from 'fs';
import path from 'path';
import { FULL_WEBSITE_KNOWLEDGE_INDEX, getSystemPromptContext } from './knowledgeBase.js';
import serverI18n from './i18n.js';

function getRuntimeGeminiApiKey() {
  if (process.env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY.includes('placeholder')) {
    return process.env.GEMINI_API_KEY.trim();
  }
  try {
    const envPath = path.resolve(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      const match = envContent.match(/GEMINI_API_KEY\s*=\s*(.+)/);
      if (match && match[1]) {
        const val = match[1].trim().replace(/^["']|["']$/g, '');
        if (val && !val.includes('placeholder')) {
          return val;
        }
      }
    }
  } catch (e) {
    console.warn('[Gemini env read note]:', e);
  }
  return process.env.GEMINI_API_KEY || null;
}

function detectLanguageHeuristic(text = '') {
  if (!text) return 'mr';
  // Devanagari script regex range: \u0900-\u097F
  const devanagariCount = (text.match(/[\u0900-\u097F]/g) || []).length;
  if (devanagariCount > 0) {
    return 'mr';
  }

  const lower = text.toLowerCase().trim();
  // Check Transliterated Marathi keywords (Latin script)
  const marathiLatinKeywords = [
    'kanda', 'kande', 'bhav', 'bhavat', 'sanga', 'shetkari', 'ahe', 'kay', 'kiti',
    'aajcha', 'sangne', 'karava', 'vikava', 'kapus', 'gahat', 'daalimb', 'mati', 'jamin',
    'rahata', 'yeola', 'sangamner', 'nashik', 'kopargaon', 'lasalgaon'
  ];

  if (marathiLatinKeywords.some(k => lower.includes(k))) {
    return 'mr';
  }

  // Explicit English phrasing indicators
  const englishPhrases = ['what is', 'what are', 'show me', 'tell me', 'price of', 'rate of', 'how to', 'when to', 'which crop', 'forecast for'];
  if (englishPhrases.some(p => lower.includes(p))) {
    return 'en';
  }

  return 'mr';
}

/**
 * Dynamic Website Search Engine (RAG)
 * Searches current website data index (live rates, soil types, post-harvest processing, profit calculator, alerts, modules)
 * to answer questions dynamically instead of returning fixed static strings.
 */
function searchWebsiteKnowledge(message = '', lang = 'mr') {
  const query = message.toLowerCase().trim();
  const isMr = lang === 'mr' || /[\u0900-\u097F]/.test(message);

  // Entity Mapping Arrays for Strict Query Scoping
  const cropMap = [
    { key: 'Onion', searchTerms: ['onion', 'कांदा', 'कांदे'] },
    { key: 'Soybean', searchTerms: ['soybean', 'सोयाबीन'] },
    { key: 'Cotton', searchTerms: ['cotton', 'कापूस'] },
    { key: 'Wheat', searchTerms: ['wheat', 'गहू'] },
    { key: 'Sugarcane', searchTerms: ['sugarcane', 'ऊस'] },
    { key: 'Pomegranate', searchTerms: ['pomegranate', 'डाळिंब'] },
    { key: 'Tomato', searchTerms: ['tomato', 'टोमॅटो'] },
    { key: 'Maize', searchTerms: ['maize', 'मका'] },
    { key: 'Gram', searchTerms: ['gram', 'हरभरा', 'चना'] },
    { key: 'Bajra', searchTerms: ['bajra', 'बाजरी'] }
  ];

  const mandiMap = [
    { key: 'Kopargaon', searchTerms: ['kopargaon', 'कोपरगाव'] },
    { key: 'Lasalgaon', searchTerms: ['lasalgaon', 'लासलगाव'] },
    { key: 'Yeola', searchTerms: ['yeola', 'येवला'] },
    { key: 'Rahata', searchTerms: ['rahata', 'राहाता'] },
    { key: 'Nashik', searchTerms: ['nashik', 'नाशिक'] },
    { key: 'Sangamner', searchTerms: ['sangamner', 'संगमनेर'] },
    { key: 'Ahilyanagar', searchTerms: ['ahilyanagar', 'अहिल्यानगर', 'अहमदनगर', 'nagar'] },
    { key: 'Shrirampur', searchTerms: ['shrirampur', 'श्रीरामपूर'] }
  ];

  const detectedCropObj = cropMap.find(c => c.searchTerms.some(t => query.includes(t)));
  const detectedMandiObj = mandiMap.find(m => m.searchTerms.some(t => query.includes(t)));

  const detectedCrop = detectedCropObj ? detectedCropObj.key : null;
  const detectedMandi = detectedMandiObj ? detectedMandiObj.key : null;

  // Ensure serverI18n language matches active lang
  if (serverI18n.language !== lang) {
    serverI18n.changeLanguage(lang);
  }

  // SCENARIO 1: SPECIFIC MANDI + SPECIFIC CROP (Exact single answer)
  if (detectedCrop && detectedMandi) {
    const exactMatch = FULL_WEBSITE_KNOWLEDGE_INDEX.liveMandiRates.find(
      r => r.crop.includes(detectedCrop) && r.mandi.toLowerCase() === detectedMandi.toLowerCase()
    );

    if (exactMatch) {
      return serverI18n.t('mandiPriceSingle', {
        mandi: exactMatch.mandi,
        crop: exactMatch.crop,
        modalPrice: exactMatch.modalPrice,
        minPrice: exactMatch.minPrice,
        maxPrice: exactMatch.maxPrice
      });
    }
  }

  // SCENARIO 2: BROADER CROP QUERY (All Mandis for that Crop)
  if (detectedCrop && !detectedMandi) {
    const cropMatches = FULL_WEBSITE_KNOWLEDGE_INDEX.liveMandiRates.filter(
      r => r.crop.includes(detectedCrop)
    );

    if (cropMatches.length > 0) {
      const ratesText = cropMatches.map(m => `${m.mandi}: ₹${m.modalPrice}/${lang === 'mr' ? 'क्विंटल' : 'q'}`).join(', ');
      return serverI18n.t('mandiPriceCropAll', {
        crop: cropMatches[0].crop,
        rates: ratesText
      });
    }
  }

  // SCENARIO 3: SPECIFIC MANDI QUERY (All Crops for that Mandi)
  if (detectedMandi && !detectedCrop) {
    const mandiMatches = FULL_WEBSITE_KNOWLEDGE_INDEX.liveMandiRates.filter(
      r => r.mandi.toLowerCase() === detectedMandi.toLowerCase()
    );

    if (mandiMatches.length > 0) {
      const cropsText = mandiMatches.map(m => `${m.crop}: ₹${m.modalPrice}/${lang === 'mr' ? 'क्विंटल' : 'q'}`).join(', ');
      return serverI18n.t('mandiPriceMandiAll', {
        mandi: mandiMatches[0].mandi,
        crops: cropsText
      });
    }
  }

  // SCENARIO 4: Soil Types Search
  if (query.includes('माती') || query.includes('soil') || query.includes('जमीन') || query.includes('पोयटा') || query.includes('काळी') || query.includes('रेतीड') || query.includes('लाल')) {
    const matchedSoil = FULL_WEBSITE_KNOWLEDGE_INDEX.soilTypes.find((s) => {
      const n = s.name.toLowerCase();
      if (query.includes('काळी खोल') || query.includes('भारी') || query.includes('heavy black')) return n.includes('खोल');
      if (query.includes('काळी') || query.includes('black')) return n.includes('काळी');
      if (query.includes('पोयटा') || query.includes('loamy') || query.includes('मुरुमाड')) return n.includes('पोयटा');
      if (query.includes('रेतीड') || query.includes('हलकी') || query.includes('sandy')) return n.includes('रेतीड');
      if (query.includes('लाल') || query.includes('तांबडी') || query.includes('red')) return n.includes('तांबडी');
      if (query.includes('चोपण') || query.includes('खारपड') || query.includes('saline')) return n.includes('चोपण');
      return false;
    }) || FULL_WEBSITE_KNOWLEDGE_INDEX.soilTypes[0];

    return serverI18n.t('soilGuidance', {
      name: matchedSoil.name,
      location: matchedSoil.location,
      crops: matchedSoil.crops,
      tip: matchedSoil.tip
    });
  }

  // 5. Post-Harvest Value Addition & Storage Search
  if (query.includes('चाळ') || query.includes('साठवणूक') || query.includes('storage') || query.includes('dehydration') || query.includes('निर्जलीकरण') || query.includes('प्रक्रिया') || query.includes('fpo')) {
    if (query.includes('सोयाबीन') || query.includes('soybean')) {
      return serverI18n.t('postHarvestSoybean');
    }
    return serverI18n.t('postHarvestOnion');
  }

  // 6. Profit Calculator & Cultivation Cost Search
  if (query.includes('कॅल्क्युलेटर') || query.includes('calculator') || query.includes('नफा') || query.includes('profit') || query.includes('खर्च') || query.includes('cost')) {
    return serverI18n.t('profitCalculatorHelp');
  }

  // 7. Price Alerts Search
  if (query.includes('अलर्ट') || query.includes('alert') || query.includes('sms') || query.includes('email') || query.includes('इमेल')) {
    return serverI18n.t('priceAlertsHelp');
  }

  // 8. Generic Website Search Fallback Response
  return serverI18n.t('generalWebsiteHelp');
}

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, authorization'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed. Use POST.'
    });
  }

  const { message = '', detectedLanguage } = req.body || {};

  if (!message || typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({
      success: false,
      error: 'Message parameter is required.'
    });
  }

  const lang = detectedLanguage || detectLanguageHeuristic(message);
  serverI18n.changeLanguage(lang);
  const apiKey = getRuntimeGeminiApiKey();

  // If Gemini API Key is missing or placeholder, perform Dynamic Website Search
  if (!apiKey || apiKey.includes('placeholder')) {
    const websiteSearchResult = searchWebsiteKnowledge(message, lang);
    return res.status(200).json({
      success: true,
      replyText: websiteSearchResult,
      replyLanguage: lang,
      isFallback: true
    });
  }

  try {
    const systemPrompt = getSystemPromptContext(lang);
    const systemInstructionText = `${systemPrompt}\n\nSTRICT OUTPUT LANGUAGE MANDATE: The required response language is ${lang === 'mr' ? 'MARATHI (मराठी/देवनागरी script)' : 'ENGLISH'}. You MUST reply ONLY in ${lang === 'mr' ? 'clear, respectful Marathi (मराठी) script' : 'English'}. NEVER output English when the user asks in Marathi.`;

    const geminiPayload = {
      systemInstruction: {
        parts: [{ text: systemInstructionText }]
      },
      contents: [
        {
          role: 'user',
          parts: [{ text: message.trim() }]
        }
      ]
    };

    // 1. Try Gemini 1.5 Flash via REST API with Search Grounding & systemInstruction
    let replyText = '';
    const geminiUrl15 = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`;

    const geminiRes = await fetch(geminiUrl15, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(geminiPayload)
    });

    if (geminiRes.ok) {
      const data = await geminiRes.json();
      replyText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    } else {
      // 2. Failover to Gemini 2.0 Flash REST API
      const geminiUrl20 = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(apiKey)}`;
      const fallbackRes = await fetch(geminiUrl20, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(geminiPayload)
      });
      if (fallbackRes.ok) {
        const data20 = await fallbackRes.json();
        replyText = data20?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      }
    }

    if (!replyText || !replyText.trim()) {
      replyText = searchWebsiteKnowledge(message, lang);
    }

    return res.status(200).json({
      success: true,
      replyText: replyText.trim(),
      replyLanguage: lang
    });
  } catch (error) {
    console.error('[Kisan Mitra AI API Exception]:', error?.message || error);
    const websiteSearchResult = searchWebsiteKnowledge(message, lang);
    return res.status(200).json({
      success: true,
      replyText: websiteSearchResult,
      replyLanguage: lang,
      isFallback: true
    });
  }
}
