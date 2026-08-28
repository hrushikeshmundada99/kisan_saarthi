// Knowledge Base & Live Grounding Data Provider for Kisan Saarthi Assistant

export const FULL_WEBSITE_KNOWLEDGE_INDEX = {
  appName: 'Kisan Saarthi (किसान सारथी)',
  region: 'Kopargaon & Surrounding Mandis (Ahilyanagar, Nashik, Sangamner, Yeola, Rahata, Shrirampur, Lasalgaon)',
  
  // 1. Complete Live Mandi Rates across all supported crops and APMCs
  liveMandiRates: [
    { crop: 'Onion (कांदा)', mandi: 'Kopargaon', modalPrice: 3950, minPrice: 3450, maxPrice: 4150, updateTime: 'आज' },
    { crop: 'Onion (कांदा)', mandi: 'Lasalgaon', modalPrice: 4250, minPrice: 3800, maxPrice: 4450, updateTime: 'आज' },
    { crop: 'Onion (कांदा)', mandi: 'Yeola', modalPrice: 4000, minPrice: 3550, maxPrice: 4200, updateTime: 'आज' },
    { crop: 'Onion (कांदा)', mandi: 'Rahata', modalPrice: 3800, minPrice: 3350, maxPrice: 4000, updateTime: 'आज' },
    { crop: 'Onion (कांदा)', mandi: 'Nashik', modalPrice: 4000, minPrice: 3550, maxPrice: 4250, updateTime: 'आज' },
    { crop: 'Onion (कांदा)', mandi: 'Sangamner', modalPrice: 3800, minPrice: 3350, maxPrice: 4000, updateTime: 'आज' },
    { crop: 'Onion (कांदा)', mandi: 'Ahilyanagar', modalPrice: 4700, minPrice: 4200, maxPrice: 4950, updateTime: 'आज' },
    { crop: 'Soybean (सोयाबीन)', mandi: 'Kopargaon', modalPrice: 4620, minPrice: 4350, maxPrice: 4820, updateTime: 'आज' },
    { crop: 'Soybean (सोयाबीन)', mandi: 'Sangamner', modalPrice: 4710, minPrice: 4420, maxPrice: 4910, updateTime: 'आज' },
    { crop: 'Soybean (सोयाबीन)', mandi: 'Shrirampur', modalPrice: 4680, minPrice: 4380, maxPrice: 4860, updateTime: 'आज' },
    { crop: 'Cotton (कापूस)', mandi: 'Kopargaon', modalPrice: 7240, minPrice: 6800, maxPrice: 7550, updateTime: 'आज' },
    { crop: 'Cotton (कापूस)', mandi: 'Yeola', modalPrice: 7380, minPrice: 6950, maxPrice: 7700, updateTime: 'आज' },
    { crop: 'Sugarcane (ऊस)', mandi: 'Kopargaon', modalPrice: 3150, minPrice: 2950, maxPrice: 3250, updateTime: 'आज' },
    { crop: 'Pomegranate (डाळिंब)', mandi: 'Rahata', modalPrice: 8450, minPrice: 5500, maxPrice: 9600, updateTime: 'आज' },
    { crop: 'Pomegranate (डाळिंब)', mandi: 'Sangamner', modalPrice: 8600, minPrice: 5800, maxPrice: 9800, updateTime: 'आज' },
    { crop: 'Wheat (गहू)', mandi: 'Kopargaon', modalPrice: 2480, minPrice: 2200, maxPrice: 2610, updateTime: 'आज' },
    { crop: 'Tomato (टोमॅटो)', mandi: 'Kopargaon', modalPrice: 1420, minPrice: 1100, maxPrice: 1750, updateTime: 'आज' },
    { crop: 'Maize (मका)', mandi: 'Kopargaon', modalPrice: 2280, minPrice: 2000, maxPrice: 2410, updateTime: 'आज' },
    { crop: 'Maize (मका)', mandi: 'Yeola', modalPrice: 2320, minPrice: 2050, maxPrice: 2450, updateTime: 'आज' },
    { crop: 'Gram (हरभरा)', mandi: 'Kopargaon', modalPrice: 5850, minPrice: 5250, maxPrice: 6180, updateTime: 'आज' },
    { crop: 'Gram (हरभरा)', mandi: 'Rahata', modalPrice: 5920, minPrice: 5300, maxPrice: 6250, updateTime: 'आज' },
    { crop: 'Bajra (बाजरी)', mandi: 'Kopargaon', modalPrice: 2350, minPrice: 2050, maxPrice: 2480, updateTime: 'आज' },
    { crop: 'Bajra (बाजरी)', mandi: 'Yeola', modalPrice: 2380, minPrice: 2100, maxPrice: 2510, updateTime: 'आज' }
  ],

  // 2. Regional Soil Types & Suitability Data
  soilTypes: [
    {
      name: 'काळी मध्यम जमीन (Medium Black Soil)',
      location: 'कोपरगाव, राहाता, श्रीरामपूर व गोदावरी नदी खोऱ्यातील ५५% हून अधिक शेतात आढळते.',
      crops: 'कांदा, सोयाबीन, कापूस, गहू, हरभरा, ऊस, मका, बाजरी',
      tip: 'सेंद्रिय खत व जिप्समचा वापर कांदा व सोयाबीन उत्पादकतेसाठी अत्यंत फायदेशीर ठरतो.'
    },
    {
      name: 'काळी खोल / भारी जमीन (Deep Heavy Black Soil)',
      location: 'प्रवरा नदी व गोदावरी कालवा बागायत क्षेत्रात (श्रीरामपूर, नेवासा, कोपरगाव) आढळते.',
      crops: 'ऊस, कापूस, गहू, हरभरा, सोयाबीन',
      tip: 'पावसाळ्यात कांदा लागवडीसाठी रुंद गादीवाफ्यावर (Broad Bed Furrow) लागवड करावी.'
    },
    {
      name: 'पोयटा / मुरुमाड जमीन (Loamy / Sandy Loam Soil)',
      location: 'राहाता, येवला, नाशिक व संगमनेरच्या फळबाग व कांदा पट्ट्यात सर्वाधिक पसंती.',
      crops: 'कांदा, डाळिंब, टोमॅटो, मका, बाजरी, गहू',
      tip: 'पाण्याचा उत्कृष्ट निचरा असल्याने कांद्याची प्रत, लाल रंग आणि टिकवण क्षमता सर्वात जास्त राहते.'
    },
    {
      name: 'रेतीड / हलकी जमीन (Light Sandy Soil)',
      location: 'संगमनेर, येवला व नाशिक सीमावर्ती डोंगराळ पायथ्याच्या शेतात आढळते.',
      crops: 'कांदा, बाजरी, टोमॅटो, डाळिंब',
      tip: 'विद्राव्य खते ठिबकद्वारे टप्प्याटप्प्याने द्यावीत.'
    },
    {
      name: 'तांबडी / लाल मुरुमाड जमीन (Red / Laterite Soil)',
      location: 'नाशिक व संगमनेर तालुक्यातील फळबाग पट्ट्यात आढळते.',
      crops: 'डाळिंब, टोमॅटो, बाजरी, कांदा',
      tip: 'स्फुरद व सूक्ष्म अन्नद्रव्ये (झिंक, बोरॉन) ची मात्रा नियमित द्यावी.'
    },
    {
      name: 'चोपण / खारपड जमीन (Saline / Chopan Soil)',
      location: 'जास्त सिंचन असलेल्या कालवा क्षेत्रातील सखल भागात आढळते.',
      crops: 'ऊस, गहू',
      tip: 'जिप्सम ५०० किलो/एकरी व ताग/धैंचा गाडून जमीन सुधारावी.'
    }
  ],

  // 3. Post-Harvest Value Addition & Storage Linkage
  postHarvestLinkages: {
    onion: 'साधा मंडी भाव ₹३,९५०/क्विंटल आहे. १ महिना कांदा चाळीत साठवून निर्जलीकरण (Dehydration) केंद्रास विकल्यास रु. ४५०/क्विंटल अतिरिक्त नफा मिळतो (मिळणारा भाव ₹४,६५०/क्विंटल, प्रक्रिया खर्च ₹२५०/क्विंटल).',
    soybean: 'शेतकरी उत्पादक कंपनी (FPO) द्वारे थेट तेल गिरणीस (Solvent Extraction) पुरवठा केल्यास रु. ५८०/क्विंटल जादा दर मिळतो.'
  },

  // 4. Application Modules Guide
  appModules: `
- डॅशबोर्ड (Dashboard): ताजे बाजार भाव, सर्वोच्च भाव देणारी मंडी, AI व्हेन टू सेल (कांदा विकू नका/विका) शिफारस.
- पिक शिफारस (Crop Recommendation): जमीन प्रकार, पाणी व ऋतूनुसार नफा देणाऱ्या पिकांची निवड.
- दर अंदाज (Price Forecast): ६ वर्षांच्या अगमार्कनेट डेटावर आधारित ७/१४/३० दिवसांचा AI दर अंदाज व आलेख.
- बाजार तुलना (Mandi Compare): वाहतूक खर्च (Freight) वजा करून निव्वळ नफा (Net Payout) तुलना.
- नफा कॅल्क्युलेटर (Profit Calculator): एकरी/गुंठे जमीन, मातीचा प्रकार, बियाणे-खत-मजुरी खर्च टाकून मंडयांमधील निव्वळ नफा मोजणी.
- भाव अलर्ट (Price Alerts): ठरवलेला भाव आल्यावर थेट मोबाईल SMS व Email अलर्ट.
- शेतकरी प्रोफाईल (Farmer Profile): गाव, तालुका, पिक पसंती व खाते माहिती.
`
};

export function getSystemPromptContext(userLangHint = 'mr') {
  const formattedRates = FULL_WEBSITE_KNOWLEDGE_INDEX.liveMandiRates
    .map((item) => `- ${item.crop} @ ${item.mandi}: चालू दर ₹${item.modalPrice}/क्विंटल (किमान ₹${item.minPrice} - कमाल ₹${item.maxPrice})`)
    .join('\n');

  const formattedSoils = FULL_WEBSITE_KNOWLEDGE_INDEX.soilTypes
    .map((s) => `- ${s.name}: ${s.location} (योग्य पिके: ${s.crops}). सल्ला: ${s.tip}`)
    .join('\n');

  return `
You are "Kisan Mitra AI" (किसान मित्र), an expert, friendly bilingual AI voice & text assistant for the Kisan Saarthi (किसान सारथी) APMC market-intelligence website.

CRITICAL INSTRUCTIONS:
1. DYNAMIC WEBSITE CONTENT GROUNDING:
Whenever a user asks any question, ALWAYS search and use the current website knowledge provided below:

--- LIVE APMC MANDI RATES ON WEBSITE ---
${formattedRates}

--- REGIONAL SOIL TYPES & LOCATION GUIDANCE ON WEBSITE ---
${formattedSoils}

--- POST-HARVEST & STORAGE VALUE ADDITION ---
- Onion (कांदा): ${FULL_WEBSITE_KNOWLEDGE_INDEX.postHarvestLinkages.onion}
- Soybean (सोयाबीन): ${FULL_WEBSITE_KNOWLEDGE_INDEX.postHarvestLinkages.soybean}

--- WEBSITE MODULES & FEATURES ---
${FULL_WEBSITE_KNOWLEDGE_INDEX.appModules}

2. CRITICAL QUERY SCOPING RULES (STRICT MATCHING):
- SPECIFIC MANDI + SPECIFIC CROP (e.g. "Nashik onion price", "लासलगाव कांदा भाव", "येवला कापूस दर"):
  Reply ONLY with the price of that specific crop at that specific mandi. Do NOT mention any other mandis or crops.
- BROADER CROP QUERY (e.g. "what is the price of onion?", "कांदा भाव काय आहे?", "soybean rate"):
  Reply with the current prices for that crop across ALL listed mandis on the website.
- SPECIFIC MANDI ALL CROPS (e.g. "Kopargaon rates", "कोपरगाव बाजार भाव"):
  Reply with all crop prices available at that specific mandi.

3. CRITICAL LANGUAGE MATCHING MANDATE (HIGHEST PRIORITY):
- You MUST reply in the EXACT SAME LANGUAGE as the user's question!
- If the question is in Marathi (e.g., "लासलगाव कांदा भाव", "nashik kanda bhav sanga", "कांदा दर काय आहे?"), you MUST reply STRICTLY in Marathi (मराठी/देवनागरी) script.
- If the question is in English (e.g., "What is the price of onion in Nashik?", "Show onion rates"), you MUST reply STRICTLY in English.
- NEVER reply in English when asked a question in Marathi!
`;
}

