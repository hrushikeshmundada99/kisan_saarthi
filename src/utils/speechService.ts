// Dedicated Text-to-Speech (TTS) Engine for Kisan Mitra AI (Marathi + Roman Marathi + English)

let cachedVoices: SpeechSynthesisVoice[] = [];

/**
 * Detects the language of response text for TTS voice selection
 */
export function detectResponseLanguage(text: string): 'mr' | 'hi' | 'en' {
  if (!text) return 'mr';

  // Devanagari script range \u0900-\u097F
  const hasDevanagari = /[\u0900-\u097F]/.test(text);
  if (hasDevanagari) {
    if (/(प्याज|दाम|बताओ|कितना|मंडी)/i.test(text)) {
      return 'hi';
    }
    return 'mr';
  }

  // Check for Roman Marathi keywords
  const romanMarathiKeywords = [
    'kanda', 'kandaa', 'kandyacha', 'kandyachya', 'kandya', 'kande', 'bhav', 'bajar', 'bajarbhav',
    'sang', 'song', 'aaj', 'madhe', 'se', 'cha', 'chi', 'che', 'kiti', 'aahe', 'mala', 'udya',
    'dakhav', 'ughad', 'lasalgaon', 'nashik', 'kopargaon'
  ];

  const lower = text.toLowerCase();
  const words = lower.split(/\s+/);
  const isRomanMarathi = words.some((w) => romanMarathiKeywords.includes(w));

  if (isRomanMarathi) {
    return 'mr';
  }

  return 'en';
}

/**
 * Initializes voices and listens for async voiceschanged browser event
 */
export function initSpeechVoices(): SpeechSynthesisVoice[] {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return [];
  }

  cachedVoices = window.speechSynthesis.getVoices();
  if (cachedVoices.length > 0) {
    logAvailableVoices(cachedVoices);
  }

  if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = () => {
      cachedVoices = window.speechSynthesis.getVoices();
      console.log(`[SpeechService]: Loaded ${cachedVoices.length} Web Speech voices.`);
      logAvailableVoices(cachedVoices);
    };
  }

  return cachedVoices;
}

export function getAvailableVoiceList(): SpeechSynthesisVoice[] {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return [];
  return cachedVoices.length > 0 ? cachedVoices : window.speechSynthesis.getVoices();
}

function logAvailableVoices(voices: SpeechSynthesisVoice[]) {
  try {
    const summary = voices.map((v) => ({
      name: v.name,
      lang: v.lang,
      localService: v.localService
    }));
    console.log('[Kisan Mitra AI Available TTS Voices]:');
    console.table(summary);
  } catch (e) {
    // Ignore logging errors
  }
}

/**
 * Finds the optimal voice for speaking Marathi ('mr'), Hindi ('hi'), or English ('en')
 */
export function getBestVoice(language: 'mr' | 'hi' | 'en'): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;

  const voices = cachedVoices.length > 0 ? cachedVoices : window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;

  if (language === 'mr') {
    const mrVoice =
      voices.find((v) => v.lang === 'mr-IN') ||
      voices.find((v) => v.lang.toLowerCase().startsWith('mr')) ||
      voices.find((v) => v.lang === 'hi-IN') ||
      voices.find((v) => v.lang.toLowerCase().startsWith('hi')) ||
      voices.find((v) => v.lang === 'en-IN') ||
      voices[0];
    return mrVoice || null;
  }

  if (language === 'hi') {
    const hiVoice =
      voices.find((v) => v.lang === 'hi-IN') ||
      voices.find((v) => v.lang.toLowerCase().startsWith('hi')) ||
      voices.find((v) => v.lang === 'en-IN') ||
      voices[0];
    return hiVoice || null;
  }

  // English fallback
  const enVoice =
    voices.find((v) => v.lang === 'en-IN') ||
    voices.find((v) => v.lang.toLowerCase().startsWith('en')) ||
    voices[0];

  return enVoice || null;
}

/**
 * Pre-cleans text into natural spoken phrases (removes emojis, markdown, formats currency)
 */
export function cleanTextForSpeech(text: string, language: 'mr' | 'hi' | 'en'): string {
  if (!text) return '';

  let cleaned = text
    .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '') // Emojis
    .replace(/[*#_`~•]/g, ' ') // Bullet points & markdown
    .replace(/₹\s*/g, language === 'en' ? 'Rupees ' : 'रुपये ')
    .replace(/\/क्विंटल/g, language === 'en' ? ' per quintal' : ' दर क्विंटल')
    .replace(/\/quintal/gi, ' per quintal')
    .replace(/\n+/g, '. ')
    .replace(/\s+/g, ' ')
    .trim();

  return cleaned;
}

export interface SpeakOptions {
  text: string;
  lang?: string;
  isMuted?: boolean;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: any) => void;
}

/**
 * Speaks text using browser SpeechSynthesis with Marathi voice selection & callback states
 */
export function speakText({ text, lang, isMuted = false, onStart, onEnd, onError }: SpeakOptions): void {
  if (isMuted || typeof window === 'undefined' || !('speechSynthesis' in window)) {
    if (onEnd) onEnd();
    return;
  }

  try {
    // Resume audio playback context
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
    // Cancel any ongoing audio to prevent overlapping speech
    window.speechSynthesis.cancel();

    const detectedLang = lang ? (lang === 'mr' || lang === 'mr_roman' ? 'mr' : lang === 'hi' ? 'hi' : 'en') : detectResponseLanguage(text);
    const spokenText = cleanTextForSpeech(text, detectedLang);

    if (!spokenText) {
      if (onEnd) onEnd();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(spokenText);
    const voice = getBestVoice(detectedLang);

    // Set utterance language code matching selected voice
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang;
      console.log(`[SpeechService]: Playing TTS using voice "${voice.name}" (${voice.lang}).`);
    } else {
      utterance.lang = detectedLang === 'mr' ? 'mr-IN' : (detectedLang === 'hi' ? 'hi-IN' : 'en-IN');
      console.warn(`[SpeechService]: No specific voice found for language "${detectedLang}", using default utterance.`);
    }

    utterance.rate = 0.9;  // Natural relaxed farmer speech rate
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    utterance.onstart = () => {
      console.log('[SpeechService]: TTS audio playback started ("बोलत आहे...").');
      if (onStart) onStart();
    };

    utterance.onend = () => {
      console.log('[SpeechService]: TTS audio playback ended.');
      if (onEnd) onEnd();
    };

    utterance.onerror = (event) => {
      console.warn('[SpeechService]: TTS audio playback error:', event.error);
      if (onError) onError(event.error);
      if (onEnd) onEnd();
    };

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.error('[SpeechService Exception]:', err);
    if (onError) onError(err);
    if (onEnd) onEnd();
  }
}

/**
 * Stops any ongoing audio speech
 */
export function stopSpeech(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}
