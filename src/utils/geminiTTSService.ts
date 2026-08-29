// Gemini TTS Audio Engine — Converts Gemini PCM Audio into Browser Playable WAV & HTML Audio
import { speakText as speakBrowserFallback, stopSpeech as stopBrowserFallback } from './speechService';

let activeAudioElement: HTMLAudioElement | null = null;
const ttsAudioCache = new Map<string, string>();

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

/**
 * Converts Base64 16-bit PCM Audio into a standard 44-byte RIFF WAV Blob
 */
export function pcmToWavBlob(base64Pcm: string, sampleRate = 24000, numChannels = 1): Blob {
  const binaryStr = atob(base64Pcm);
  const pcmLength = binaryStr.length;
  const wavBuffer = new ArrayBuffer(44 + pcmLength);
  const view = new DataView(wavBuffer);

  // RIFF header
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + pcmLength, true);
  writeString(view, 8, 'WAVE');

  // fmt chunk
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // 1 = PCM
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * 2, true);
  view.setUint16(32, numChannels * 2, true);
  view.setUint16(34, 16, true);

  // data chunk
  writeString(view, 36, 'data');
  view.setUint32(40, pcmLength, true);

  // Copy raw PCM byte data
  const pcmBytes = new Uint8Array(wavBuffer, 44, pcmLength);
  for (let i = 0; i < pcmLength; i++) {
    pcmBytes[i] = binaryStr.charCodeAt(i);
  }

  return new Blob([wavBuffer], { type: 'audio/wav' });
}

export interface PlayTTSOptions {
  text: string;
  lang?: string;
  isMuted?: boolean;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: any) => void;
}

/**
 * Stop any active HTML audio or Web Speech playback
 */
export function stopGeminiAudio(): void {
  if (activeAudioElement) {
    try {
      activeAudioElement.pause();
      activeAudioElement.currentTime = 0;
    } catch (e) {
      // Ignore audio stop errors
    }
    activeAudioElement = null;
  }
  stopBrowserFallback();
}

/**
 * Primary Gemini TTS Audio Player (Fetches from /api/tts & plays native WAV audio)
 */
export async function playGeminiMarathiAudio({ text, lang = 'mr', isMuted = false, onStart, onEnd, onError }: PlayTTSOptions): Promise<void> {
  if (isMuted || !text || !text.trim()) {
    if (onEnd) onEnd();
    return;
  }

  stopGeminiAudio();

  const cacheKey = `${lang}_${text.slice(0, 100)}`;
  let audioUrl = ttsAudioCache.get(cacheKey);

  if (!audioUrl) {
    try {
      console.log(`[Gemini TTS Client]: Requesting audio for text: "${text.slice(0, 50)}..."`);
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, lang })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.audioBase64) {
          let blob: Blob;
          if (data.mimeType && data.mimeType.includes('wav')) {
            const binaryStr = atob(data.audioBase64);
            const pcmBytes = new Uint8Array(binaryStr.length);
            for (let i = 0; i < binaryStr.length; i++) {
              pcmBytes[i] = binaryStr.charCodeAt(i);
            }
            blob = new Blob([pcmBytes], { type: 'audio/wav' });
          } else {
            // Convert PCM to WAV container
            blob = pcmToWavBlob(data.audioBase64, data.sampleRate || 24000);
          }

          audioUrl = URL.createObjectURL(blob);
          ttsAudioCache.set(cacheKey, audioUrl);
        }
      }
    } catch (err) {
      console.warn('[Gemini TTS API Fetch Exception, falling back to Web Speech]:', err);
    }
  }

  // If Gemini TTS audio URL was generated successfully, play HTML Audio!
  if (audioUrl) {
    try {
      const audio = new Audio(audioUrl);
      activeAudioElement = audio;

      audio.onplay = () => {
        console.log('[Gemini TTS Audio]: Audio playback started ("बोलत आहे...").');
        if (onStart) onStart();
      };

      audio.onended = () => {
        console.log('[Gemini TTS Audio]: Audio playback completed.');
        activeAudioElement = null;
        if (onEnd) onEnd();
      };

      audio.onerror = (e) => {
        console.warn('[Gemini TTS Audio Element Error]:', e);
        activeAudioElement = null;
        if (onError) onError(e);
        if (onEnd) onEnd();
      };

      await audio.play();
      return;
    } catch (playErr) {
      console.warn('[Audio play() rejection, falling back to Web Speech]:', playErr);
    }
  }

  // Fallback to Web Speech Synthesis if Gemini TTS key/endpoint is unconfigured
  console.log('[Speech Fallback]: Using Web Speech Synthesis engine.');
  speakBrowserFallback({ text, lang, isMuted, onStart, onEnd, onError });
}
