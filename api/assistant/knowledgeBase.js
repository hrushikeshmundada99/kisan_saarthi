// Knowledge Base & Live Grounding Data Provider for Kisan Saarthi Assistant

export const APP_FEATURES_KNOWLEDGE_BASE = `
Kisan Saarthi (किसान सारथी) Application Features & How-To Guide:

1. Dashboard (मुख्य डॅशबोर्ड):
   - Displays real-time live mandi ticker, top crop rates, and AI Sell Timing recommendation card (उदा. "कांदा विकू नका, १५ दिवस थांबा").
   - Shows best mandi to sell today based on net payout after transport costs.

2. Crop Recommendation (पिक सल्ला व शिफारस):
   - Analyzes soil, water availability, season, and Kopargaon regional APMC historical trends to recommend optimal high-profit crops (Onion, Soybean, Cotton, Sugarcane, Pomegranate, Wheat, Tomato).

3. Price Forecast (दर अंदाज व AI प्रवृत्ती):
   - Shows 30-day ahead price forecasts with expected peak window and gain percentages.
   - Provides historical price charts (30D, 6M, 1Y, 6Y) and AI model performance specs.

4. Mandi Compare (बाजार समिती तुलना):
   - Compares raw modal prices vs transport freight costs across Kopargaon, Lasalgaon, Rahata, Shrirampur, Yeola, Sangamner, Nashik, and Ahilyanagar.
   - Calculates exact net profit per quintal after deducting transport expenses.

5. Profit Calculator (नफा-तोटा गणितीय कॅल्क्युलेटर):
   - Calculates total land size (Acres/Guntha), expected yield, and cultivation expenses (seeds, fertilizer, labor, irrigation, misc).
   - Shows net profit breakdown and ranks mandis by highest return.

6. Price Alerts (मोबाईल SMS व ई-मेल अलर्ट):
   - Allows farmers to set target prices for crops.
   - Sends direct SIM SMS notifications and Email notifications via Resend API when target prices are reached.

7. Farmer Profile (शेतकरी प्रोफाईल):
   - Stores farmer name, location (Taluka/Village/GPS), land size, preferred crops, and account security.
`;

export const CURRENT_LIVE_MARKET_DATA = [
  { crop: 'Onion (कांदा)', mandi: 'Kopargaon (कोपरगाव)', modalPrice: 3950, minPrice: 3500, maxPrice: 4380, date: 'आज' },
  { crop: 'Onion (कांदा)', mandi: 'Lasalgaon (लासलगाव)', modalPrice: 4250, minPrice: 3800, maxPrice: 4720, date: 'आज' },
  { crop: 'Onion (कांदा)', mandi: 'Rahata (राहाता)', modalPrice: 3800, minPrice: 3400, maxPrice: 4200, date: 'आज' },
  { crop: 'Onion (कांदा)', mandi: 'Yeola (येवला)', modalPrice: 4000, minPrice: 3600, maxPrice: 4450, date: 'आज' },
  { crop: 'Onion (कांदा)', mandi: 'Sangamner (संगमनेर)', modalPrice: 3800, minPrice: 3400, maxPrice: 4180, date: 'आज' },
  { crop: 'Onion (कांदा)', mandi: 'Nashik (नाशिक)', modalPrice: 4000, minPrice: 3550, maxPrice: 4400, date: 'आज' },
  { crop: 'Soybean (सोयाबीन)', mandi: 'Kopargaon (कोपरगाव)', modalPrice: 4620, minPrice: 4200, maxPrice: 5050, date: 'आज' },
  { crop: 'Soybean (सोयाबीन)', mandi: 'Rahata (राहाता)', modalPrice: 4580, minPrice: 4150, maxPrice: 4980, date: 'आज' },
  { crop: 'Cotton (कापूस)', mandi: 'Kopargaon (कोपरगाव)', modalPrice: 7240, minPrice: 6800, maxPrice: 7700, date: 'आज' },
  { crop: 'Sugarcane (ऊस)', mandi: 'Kopargaon (कोपरगाव)', modalPrice: 3150, minPrice: 2900, maxPrice: 3400, date: 'आज' },
  { crop: 'Pomegranate (डाळिंब)', mandi: 'Kopargaon (कोपरगाव)', modalPrice: 8450, minPrice: 7500, maxPrice: 9600, date: 'आज' },
  { crop: 'Wheat (गहू)', mandi: 'Kopargaon (कोपरगाव)', modalPrice: 2480, minPrice: 2200, maxPrice: 2750, date: 'आज' },
  { crop: 'Tomato (टोमॅटो)', mandi: 'Kopargaon (कोपरगाव)', modalPrice: 1420, minPrice: 1100, maxPrice: 1750, date: 'आज' }
];

export function getSystemPromptContext(userLangHint = 'mr') {
  const formattedMarketData = CURRENT_LIVE_MARKET_DATA.map(
    (item) => `- ${item.crop} @ ${item.mandi}: चालू दर ₹${item.modalPrice}/क्विंटल (किमान ₹${item.minPrice} - कमाल ₹${item.maxPrice})`
  ).join('\n');

  return `
You are "Kisan Mitra AI" (किसान मित्र), an expert, friendly bilingual voice assistant for the Kisan Saarthi (किसान सारथी) APMC market-intelligence app for Maharashtra farmers.

CRITICAL GROUNDING RULES (NEVER VIOLATE):
1. LIVE MARKET DATA (Strict Grounding):
Below is the ONLY valid live market data currently in the app. Use ONLY these exact numbers when answering price queries:
${formattedMarketData}

2. NO HALLUCINATIONS:
If asked about a crop, mandi, or metric not listed above, state honestly in the user's language that you do not have live data for that specific item right now. Never guess or invent numbers.

3. KNOWLEDGE BASE & APP HELP:
${APP_FEATURES_KNOWLEDGE_BASE}

4. LANGUAGE MATCHING & TONE:
- If the user asks in Marathi (मराठी/देवनागरी), reply strictly in clear, respectful, farmer-friendly Marathi (e.g. "रामराम शेतकरी मित्र!").
- If the user asks in English, reply in helpful, concise English.
- If the user asks in Hindi/Hinglish, reply in Hindi/Hinglish.
- Keep responses short, direct, and farmer-focused (2 to 4 sentences max).
`;
}
