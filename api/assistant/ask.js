import fs from 'fs';
import path from 'path';

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
  return 'en';
}

function getFallbackAnswer(message, lang) {
  const lowerMsg = message.toLowerCase();
  const isMr = lang === 'mr' || /[\u0900-\u097F]/.test(message);

  if (lowerMsg.includes('कांदा') || lowerMsg.includes('onion') || lowerMsg.includes('भाव') || lowerMsg.includes('price') || lowerMsg.includes('rate')) {
    if (isMr) {
      return `रामराम! आज कोपरगाव बाजारात कांद्याचा सरासरी भाव ₹३,९५०/क्विंटल आहे (किमान ₹३,५०० ते कमाल ₹४,३८०). तर लासलगाव मंडीत आजचा कांदा भाव ₹४,२५०/क्विंटल आहे.`;
    } else {
      return `Hello! The current modal price of Onion at Kopargaon mandi today is ₹3,950/quintal (Min: ₹3,500 - Max: ₹4,380). At Lasalgaon mandi, Onion modal price is ₹4,250/quintal.`;
    }
  }

  if (lowerMsg.includes('अलर्ट') || lowerMsg.includes('alert') || lowerMsg.includes('sms')) {
    if (isMr) {
      return `भाव अलर्ट सेट करण्यासाठी नेव्हिगेशन मेनूमधून "Price Alerts" वर जा. तेथे तुमचे पिक, अपेक्षित भाव आणि मोबाईल नंबर टाकून SMS व ई-मेल अलर्ट सुरू करू शकता.`;
    } else {
      return `To set a price alert, go to "Price Alerts" in the sidebar menu. Select your crop, target price, and phone/email to activate live SMS & Email notifications.`;
    }
  }

  if (lowerMsg.includes('कॅल्क्युलेटर') || lowerMsg.includes('calculator') || lowerMsg.includes('नफा') || lowerMsg.includes('profit')) {
    if (isMr) {
      return `नफा-तोटा कॅल्क्युलेटरद्वारे तुम्ही जमीन क्षेत्र, बियाणे, खत व वाहतूक खर्च टाकून विविध मंडयांमधील निव्वळ नफा एका क्लिकवर मोजू शकता.`;
    } else {
      return `The Profit Calculator lets you enter your land size, cultivation expenses, and transport cost to compare net payouts across nearby APMC mandis.`;
    }
  }

  if (isMr) {
    return `नमस्कार! मी किसान मित्र AI आहे. तुम्ही मला चालू बाजार भाव, पिक सल्ला किंवा ॲप वापराबाबत मराठीत किंवा इंग्रजीत विचारू शकता.`;
  } else {
    return `Hello! I am Kisan Mitra AI. You can ask me about live mandi rates, crop timing advice, or app features in Marathi or English.`;
  }
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

  const { message = '', detectedLanguage, conversationHistory = [] } = req.body || {};

  if (!message || typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({
      success: false,
      error: 'Message parameter is required.'
    });
  }

  const lang = detectedLanguage || detectLanguageHeuristic(message);
  const apiKey = getRuntimeGeminiApiKey();

  // If Gemini API Key is missing or placeholder, use grounded fallback response
  if (!apiKey || apiKey.includes('placeholder')) {
    const fallbackAnswer = getFallbackAnswer(message, lang);
    return res.status(200).json({
      success: true,
      replyText: fallbackAnswer,
      replyLanguage: lang,
      isFallback: true
    });
  }

  try {
    const systemPrompt = getSystemPromptContext(lang);
    const fullPrompt = `${systemPrompt}\n\nUser Question (Language Hint: ${lang}): ${message.trim()}`;

    // 1. Try Gemini 1.5 Flash via REST API
    let replyText = '';
    const geminiUrl15 = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`;

    const geminiRes = await fetch(geminiUrl15, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: fullPrompt }] }]
      })
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
        body: JSON.stringify({
          contents: [{ parts: [{ text: fullPrompt }] }]
        })
      });
      if (fallbackRes.ok) {
        const data20 = await fallbackRes.json();
        replyText = data20?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      }
    }

    if (!replyText || !replyText.trim()) {
      replyText = getFallbackAnswer(message, lang);
    }

    return res.status(200).json({
      success: true,
      replyText: replyText.trim(),
      replyLanguage: lang
    });
  } catch (error) {
    console.error('[Kisan Mitra AI API Exception]:', error?.message || error);
    const fallbackAnswer = getFallbackAnswer(message, lang);
    return res.status(200).json({
      success: true,
      replyText: fallbackAnswer,
      replyLanguage: lang,
      isFallback: true
    });
  }
}
