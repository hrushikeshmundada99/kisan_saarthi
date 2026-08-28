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
    console.warn('[Gemini TTS env read note]:', e);
  }
  return process.env.GEMINI_API_KEY || null;
}

export function cleanTextForTTS(text = '', lang = 'mr') {
  if (!text) return '';

  let cleaned = text
    .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '') // Remove emojis
    .replace(/[*#_`~•]/g, ' ') // Remove bullets & markdown
    .replace(/₹\s*/g, lang === 'en' ? 'Rupees ' : 'रुपये ')
    .replace(/\/क्विंटल/g, lang === 'en' ? ' per quintal' : ' दर क्विंटल')
    .replace(/\/quintal/gi, ' per quintal')
    .replace(/\n+/g, '. ')
    .replace(/\s+/g, ' ')
    .trim();

  return cleaned;
}

export default async function handler(req, res) {
  // CORS Headers
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

  const { text = '', lang = 'mr', voice = 'Puck' } = req.body || {};

  if (!text || typeof text !== 'string' || !text.trim()) {
    return res.status(400).json({
      success: false,
      error: 'Text parameter is required.'
    });
  }

  const cleanedText = cleanTextForTTS(text, lang);
  const apiKey = getRuntimeGeminiApiKey();

  console.log(`[Gemini TTS Backend]: Generating Audio for text (${lang}): "${cleanedText}"`);

  if (!apiKey || apiKey.includes('placeholder') || apiKey.startsWith('AQ.')) {
    return res.status(400).json({
      success: false,
      error: 'Valid Gemini API key required for Gemini TTS audio generation.'
    });
  }

  try {
    const speechPrompt = `Speak the following text naturally in clear, warm Indian Marathi. Pronounce Marathi words naturally: ${cleanedText}`;

    // Try Gemini 2.0 Flash REST API with Audio Modality
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(apiKey)}`;

    const geminiRes = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: speechPrompt }]
          }
        ],
        generationConfig: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: voice
              }
            }
          }
        }
      })
    });

    if (geminiRes.ok) {
      const data = await geminiRes.json();
      const parts = data?.candidates?.[0]?.content?.parts || [];
      
      let audioPart = parts.find((p) => p.inlineData && p.inlineData.mimeType && p.inlineData.mimeType.startsWith('audio/'));

      if (audioPart) {
        const mimeType = audioPart.inlineData.mimeType || 'audio/pcm';
        const audioBase64 = audioPart.inlineData.data;

        console.log(`[Gemini TTS Success]: Generated Audio Bytes (mimeType: ${mimeType}, base64Length: ${audioBase64.length})`);

        return res.status(200).json({
          success: true,
          mimeType,
          audioBase64,
          sampleRate: 24000
        });
      }
    }

    // Failover fallback if Gemini Audio modality endpoint is unavailable
    return res.status(500).json({
      success: false,
      error: 'Gemini TTS REST API did not return audio inlineData.'
    });
  } catch (err) {
    console.error('[Gemini TTS Exception]:', err?.message || err);
    return res.status(500).json({
      success: false,
      error: err?.message || 'Gemini TTS generation failed.'
    });
  }
}
