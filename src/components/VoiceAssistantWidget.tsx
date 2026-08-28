import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Bot,
  X,
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Loader2,
  Sparkles
} from 'lucide-react';

import { REAL_DASHBOARD_CARDS } from '../data/realData';
import { REGIONAL_SOIL_TYPES } from '../data/soilData';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  lang?: string;
}

function searchWebsiteContentLocally(query: string, isMr: boolean): string {
  const q = query.toLowerCase().trim();

  // Entity Mapping Arrays for Strict Query Scoping
  const cropMap = [
    { key: 'onion', searchTerms: ['onion', 'कांदा', 'कांदे'] },
    { key: 'soybean', searchTerms: ['soybean', 'सोयाबीन'] },
    { key: 'cotton', searchTerms: ['cotton', 'कापूस'] },
    { key: 'wheat', searchTerms: ['wheat', 'गहू'] },
    { key: 'sugarcane', searchTerms: ['sugarcane', 'ऊस'] },
    { key: 'pomegranate', searchTerms: ['pomegranate', 'डाळिंब'] },
    { key: 'tomato', searchTerms: ['tomato', 'टोमॅटो'] },
    { key: 'maize', searchTerms: ['maize', 'मका'] },
    { key: 'gram', searchTerms: ['gram', 'हरभरा', 'चना'] },
    { key: 'bajra', searchTerms: ['bajra', 'बाजरी'] }
  ];

  const mandiMap = [
    { key: 'kopargaon', searchTerms: ['kopargaon', 'कोपरगाव'] },
    { key: 'lasalgaon', searchTerms: ['lasalgaon', 'लासलगाव'] },
    { key: 'yeola', searchTerms: ['yeola', 'येवला'] },
    { key: 'rahata', searchTerms: ['rahata', 'राहाता'] },
    { key: 'nashik', searchTerms: ['nashik', 'नाशिक'] },
    { key: 'sangamner', searchTerms: ['sangamner', 'संगमनेर'] },
    { key: 'ahilyanagar', searchTerms: ['ahilyanagar', 'अहिल्यानगर', 'अहमदनगर', 'nagar'] },
    { key: 'shrirampur', searchTerms: ['shrirampur', 'श्रीरामपूर'] }
  ];

  const detectedCropObj = cropMap.find(c => c.searchTerms.some(t => q.includes(t)));
  const detectedMandiObj = mandiMap.find(m => m.searchTerms.some(t => q.includes(t)));

  const detectedCrop = detectedCropObj ? detectedCropObj.key : null;
  const detectedMandi = detectedMandiObj ? detectedMandiObj.key : null;

  // SCENARIO 1: SPECIFIC MANDI + SPECIFIC CROP
  if (detectedCrop && detectedMandi) {
    const exact = REAL_DASHBOARD_CARDS.find(
      c => c.crop.toLowerCase().includes(detectedCrop) && c.mandiName.toLowerCase().includes(detectedMandi)
    );

    if (exact) {
      if (isMr) {
        return `रामराम! ${exact.mandiName} बाजारात आज ${exact.crop} चा चालू भाव ₹${exact.modalPrice}/क्विंटल आहे (किमान ₹${exact.minPrice} ते कमाल ₹${exact.maxPrice}).`;
      } else {
        return `Hello! Today's ${exact.crop} modal price at ${exact.mandiName} mandi is ₹${exact.modalPrice}/quintal (Min: ₹${exact.minPrice} - Max: ₹${exact.maxPrice}).`;
      }
    }
  }

  // SCENARIO 2: BROADER CROP QUERY (All Mandis for that Crop)
  if (detectedCrop && !detectedMandi) {
    const cropMatches = REAL_DASHBOARD_CARDS.filter(
      c => c.crop.toLowerCase().includes(detectedCrop)
    );

    if (cropMatches.length > 0) {
      if (isMr) {
        const text = cropMatches.map(c => `${c.mandiName}: ₹${c.modalPrice}/क्विंटल`).join(', ');
        return `रामराम! वेबसाईटवरील विविध बाजारांतील आजचे ${cropMatches[0].crop} भाव: ${text}.`;
      } else {
        const text = cropMatches.map(c => `${c.mandiName}: ₹${c.modalPrice}/q`).join(', ');
        return `Hello! Today's ${cropMatches[0].crop} prices across all mandis on our website: ${text}.`;
      }
    }
  }

  // SCENARIO 3: SPECIFIC MANDI QUERY (All Crops for that Mandi)
  if (detectedMandi && !detectedCrop) {
    const mandiMatches = REAL_DASHBOARD_CARDS.filter(
      c => c.mandiName.toLowerCase().includes(detectedMandi)
    );

    if (mandiMatches.length > 0) {
      if (isMr) {
        const text = mandiMatches.map(c => `${c.crop}: ₹${c.modalPrice}/क्विंटल`).join(', ');
        return `रामराम! आज ${mandiMatches[0].mandiName} बाजारातील चालू भाव: ${text}.`;
      } else {
        const text = mandiMatches.map(c => `${c.crop}: ₹${c.modalPrice}/q`).join(', ');
        return `Hello! Today's crop prices at ${mandiMatches[0].mandiName} mandi: ${text}.`;
      }
    }
  }

  // SCENARIO 4: Soil Query
  if (q.includes('माती') || q.includes('soil') || q.includes('जमीन') || q.includes('पोयटा') || q.includes('काळी') || q.includes('रेतीड') || q.includes('लाल')) {
    const soil = REGIONAL_SOIL_TYPES.find((s) => {
      const name = (s.nameMr + ' ' + s.nameEn).toLowerCase();
      if (q.includes('काळी खोल') || q.includes('भारी')) return name.includes('खोल');
      if (q.includes('काळी')) return name.includes('काळी');
      if (q.includes('पोयटा') || q.includes('मुरुमाड')) return name.includes('पोयटा');
      if (q.includes('रेतीड') || q.includes('हलकी')) return name.includes('रेतीड');
      if (q.includes('तांबडी') || q.includes('लाल')) return name.includes('तांबडी');
      return false;
    }) || REGIONAL_SOIL_TYPES[0];

    return isMr
      ? `रामराम! वेबसाईटवरील माती माहितीनुसार: ${soil.nameMr} ही ${soil.locationInfoMr} योग्य पिके: ${soil.suitableCrops.join(', ')}. सल्ला: ${soil.careTipMr}`
      : `Hello! According to our website: ${soil.nameEn} is ${soil.locationInfoEn} Optimal crops: ${soil.suitableCrops.join(', ')}. Agronomy advice: ${soil.careTipEn}`;
  }

  // 3. Profit Calculator Query
  if (q.includes('कॅल्क्युलेटर') || q.includes('calculator') || q.includes('नफा') || q.includes('profit')) {
    return isMr
      ? `वेबसाईटवरील "Profit Calculator" पृष्ठावर जाऊन तुम्ही मातीचा प्रकार, एकरी जमीन क्षेत्र आणि लागवड खर्च टाकून मंडयांमधील निव्वळ नफा मोजू शकता.`
      : `On our website's "Profit Calculator", you can enter soil type, land area, cultivation costs, and compare net payouts across nearby mandis.`;
  }

  // 4. Default Website Search
  return isMr
    ? `रामराम शेतकरी मित्र! मी किसान सारथी वेबसाईटवरील ताज्या माहितीवरून उत्तर देतो. तुम्ही मला चालू बाजार भाव, मातीचे प्रकार किंवा नफा कॅल्क्युलेटरबद्दल विचारू शकता.`
    : `Hello! I am Kisan Mitra AI. I search our current website data to answer questions about live mandi rates, soil types, price forecasts, or profit calculators.`;
}

export const VoiceAssistantWidget: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isMr = i18n.language === 'mr';

  // Open/Close Chat Drawer
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [unreadCount, setUnreadCount] = useState<number>(1);

  // Messages State
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'assistant',
      text: t('chatbot.welcomeMsg'),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      lang: i18n.language
    }
  ]);

  // Input & Processing States
  const [inputText, setInputText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [speechError, setSpeechError] = useState<string | null>(null);

  // References
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Auto-scroll to bottom of message list
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setUnreadCount(0);
    }
  }, [messages, isOpen]);

  // Initialize Web Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = isMr ? 'mr-IN' : 'en-IN';

      recognition.onstart = () => {
        setIsListening(true);
        setSpeechError(null);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript && transcript.trim()) {
          setInputText(transcript);
          handleSendMessage(transcript);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('[Speech Recognition Note]:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setSpeechError(t('chatbot.micDenied'));
        } else if (event.error !== 'no-speech') {
          setSpeechError(t('chatbot.micError'));
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [isMr, t]);

  // Text-To-Speech Output with strict voice engine locale alignment
  const speakText = (text: string, langHint = 'mr') => {
    if (isMuted || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel(); // Stop any ongoing speech
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Determine language locale
    const isDevanagari = /[\u0900-\u097F]/.test(text);
    const targetLocale = isDevanagari ? 'mr-IN' : (langHint === 'mr' ? 'mr-IN' : 'en-IN');
    utterance.lang = targetLocale;
    utterance.rate = 0.95;

    // Pick matching localized voice engine
    const voices = window.speechSynthesis.getVoices();
    const matchingVoice = voices.find((v) => 
      targetLocale.startsWith('mr') 
        ? (v.lang.includes('mr') || v.lang.includes('hi'))
        : (v.lang.includes('en-IN') || v.lang.includes('en'))
    );
    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }

    window.speechSynthesis.speak(utterance);
  };

  // Toggle Voice Input (Mic)
  const toggleListening = () => {
    if (!recognitionRef.current) {
      setSpeechError(t('chatbot.micNotSupported'));
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setSpeechError(null);
      try {
        recognitionRef.current.lang = i18n.language === 'mr' ? 'mr-IN' : 'en-IN';
        recognitionRef.current.start();
      } catch (err) {
        console.warn('[Mic Start Note]:', err);
      }
    }
  };

  // Send Message Handler with zero-lag i18n language switching
  const handleSendMessage = async (textToSend?: string) => {
    const messageContent = (textToSend || inputText).trim();
    if (!messageContent || isLoading) return;

    // 1. Language Detection & Instant Zero-Lag i18n Switch
    const isDevanagari = /[\u0900-\u097F]/.test(messageContent);
    const targetLang: 'mr' | 'en' = isDevanagari 
      ? 'mr' 
      : (/kanda|bhav|sanga|ahe|kay|kiti|aajcha|karava|vikava|kapus|gahat|daalimb|mati|jamin/i.test(messageContent)
          ? 'mr'
          : (/what|price|rate|show|tell|how|where|which|forecast/i.test(messageContent) ? 'en' : (isMr ? 'mr' : 'en')));

    // Synchronize i18n active language instantly
    if (i18n.language !== targetLang) {
      i18n.changeLanguage(targetLang);
    }

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: messageContent,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      lang: targetLang
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);
    setSpeechError(null);

    try {
      const res = await fetch('/api/assistant/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageContent,
          detectedLanguage: targetLang,
          conversationHistory: messages.slice(-4)
        })
      });

      const data = await res.json();
      const replyText = data.replyText || (targetLang === 'mr' ? 'क्षमस्व, प्रतिसाद तयार करता आला नाही.' : 'Sorry, could not process request.');
      const replyLang = data.replyLanguage || targetLang;

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        lang: replyLang
      };

      setMessages((prev) => [...prev, assistantMessage]);
      speakText(replyText, replyLang);
    } catch (err) {
      console.warn('[Assistant Fetch Error]:', err);
      const fallbackText = searchWebsiteContentLocally(messageContent, targetLang === 'mr');

      const fallbackMsg: ChatMessage = {
        id: `assistant-fallback-${Date.now()}`,
        sender: 'assistant',
        text: fallbackText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        lang: targetLang
      };
      setMessages((prev) => [...prev, fallbackMsg]);
      speakText(fallbackText, targetLang);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 animate-in fade-in duration-300">
      
      {/* 1. Floating Collapsed Chat Bubble Button */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="relative group p-4 rounded-3xl bg-gradient-to-br from-[#1B5E20] via-[#2E7D32] to-[#144919] text-[#FFFFFF] shadow-2xl shadow-emerald-950/30 hover:scale-105 transition-all duration-200 cursor-pointer flex items-center gap-3 ring-4 ring-[#FFFFFF]"
          title="किसान मित्र AI व्हॉईस असिस्टंट (Open Kisan Mitra Voice AI)"
        >
          <div className="w-10 h-10 rounded-2xl bg-[#FFB300] text-[#0F291E] flex items-center justify-center font-black shadow-inner shrink-0 group-hover:rotate-12 transition-transform duration-200">
            <Bot className="w-6 h-6 stroke-[2.5]" />
          </div>

          <div className="hidden sm:flex flex-col text-left pr-1">
            <span className="text-xs font-black tracking-tight text-[#FFB300] flex items-center gap-1">
              <span>किसान मित्र AI</span>
              <Sparkles className="w-3 h-3 text-[#FFB300] animate-pulse" />
            </span>
            <span className="text-[11px] font-extrabold text-[#E8F5E9]">
              {isMr ? 'व्हॉईस व चॅट सहाय्यक' : 'Voice & Chat Assistant'}
            </span>
          </div>

          {/* Unread notification pulse dot */}
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#FFB300] text-[#0F291E] rounded-full text-[10px] font-black flex items-center justify-center border-2 border-[#FFFFFF] animate-pulse">
              1
            </span>
          )}
        </button>
      )}

      {/* 2. Expanded Chat Drawer Panel */}
      {isOpen && (
        <div className="w-[92vw] sm:w-[380px] h-[520px] max-h-[85vh] bg-[#FFFFFF] border-2 border-[#1B5E20] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
          
          {/* Header Bar */}
          <div className="p-3.5 bg-gradient-to-r from-[#1B5E20] via-[#2E7D32] to-[#144919] text-[#FFFFFF] flex items-center justify-between shadow-xs shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-[#FFB300] text-[#0F291E] flex items-center justify-center font-black shadow-xs shrink-0">
                <Bot className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <h3 className="text-sm font-black text-[#FFFFFF] flex items-center gap-1.5 leading-tight">
                  <span>किसान मित्र AI (Voice & Text)</span>
                  <Sparkles className="w-3.5 h-3.5 text-[#FFB300]" />
                </h3>
                <p className="text-[10px] font-bold text-[#C8E6C9]">
                  {isMr ? 'मराठी व English मध्ये अचूक उत्तरे' : 'Bilingual Farmer Assistant'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {/* Global Mute Toggle */}
              <button
                type="button"
                onClick={() => {
                  const nextMute = !isMuted;
                  setIsMuted(nextMute);
                  if (nextMute) window.speechSynthesis.cancel();
                }}
                className={`p-2 rounded-xl transition-colors cursor-pointer text-xs font-black min-h-[34px] ${
                  isMuted ? 'bg-rose-500/20 text-rose-300' : 'bg-white/10 text-[#FFB300] hover:bg-white/20'
                }`}
                title={isMuted ? 'आवाज सुरू करा (Unmute)' : 'आवाज बंद करा (Mute)'}
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-2 text-[#E8F5E9] hover:text-[#FFFFFF] hover:bg-white/10 rounded-xl transition-colors cursor-pointer min-h-[34px]"
                title="बंद करा (Close)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-3 bg-gradient-to-b from-[#F4F9F4] via-[#FFFFFF] to-[#F4F9F4]">
            {/* Messages List */}
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} space-y-1 animate-in fade-in duration-150`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-2xl text-xs font-semibold leading-relaxed shadow-xs relative ${
                    msg.sender === 'user'
                      ? 'bg-[#1B5E20] text-[#FFFFFF] rounded-br-none font-bold'
                      : 'bg-[#FFFFFF] border-2 border-[#D8E6D8] text-[#0F291E] rounded-bl-none font-bold'
                  }`}
                >
                  <p>{msg.text}</p>
                </div>

                <div className="flex items-center gap-1.5 px-1 text-[10px] text-[#526058] font-bold">
                  <span>{msg.timestamp}</span>
                  {msg.sender === 'assistant' && (
                    <button
                      type="button"
                      onClick={() => speakText(msg.text, msg.lang)}
                      className="p-0.5 text-[#1B5E20] hover:text-[#0F291E] cursor-pointer"
                      title="पुन्हा ऐका (Replay Voice)"
                    >
                      <Volume2 className="w-3 h-3 text-[#1B5E20]" />
                    </button>
                  )}
                </div>
              </div>
            ))}

            {/* Quick Suggestion Chips for Fast Farmer Queries */}
            {messages.length <= 2 && !isLoading && (
              <div className="pt-2 flex flex-wrap gap-1.5 animate-in fade-in duration-200">
                {[
                  isMr ? '🧅 आजचा कांदा भाव काय?' : '🧅 Today Onion price?',
                  isMr ? '🔔 भाव अलर्ट कसा लावावा?' : '🔔 How to set alert?',
                  isMr ? '📊 नफा कसा मोजावा?' : '📊 Profit Calculator?'
                ].map((chip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendMessage(chip)}
                    className="px-2.5 py-1.5 rounded-xl bg-[#FFFFFF] border border-[#1B5E20] text-[#1B5E20] text-[11px] font-black hover:bg-[#E8F5E9] transition-all cursor-pointer shadow-2xs"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            )}

            {/* Typing Loader Indicator */}
            {isLoading && (
              <div className="flex items-center gap-2 p-3 bg-[#FFFFFF] border-2 border-[#D8E6D8] rounded-2xl rounded-bl-none text-xs font-black text-[#1B5E20] max-w-[70%] animate-pulse">
                <Loader2 className="w-4 h-4 animate-spin text-[#FFB300]" />
                <span>{t('chatbot.thinking')}</span>
              </div>
            )}

            {/* Speech error notice */}
            {speechError && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-[11px] font-bold">
                {speechError}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Bottom Controls Bar: Mic + Input Text + Send */}
          <div className="p-3 bg-[#FFFFFF] border-t border-[#D8E6D8] space-y-2 shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              {/* Voice Speech-to-Text Mic Button */}
              <button
                type="button"
                onClick={toggleListening}
                className={`p-2.5 rounded-2xl transition-all cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center shrink-0 shadow-xs ${
                  isListening
                    ? 'bg-rose-600 text-white animate-pulse ring-4 ring-rose-400/40'
                    : 'bg-[#F4F9F4] border-2 border-[#1B5E20] text-[#1B5E20] hover:bg-[#E8F5E9]'
                }`}
                title={isListening ? 'बोलणे थांबवा' : 'बोलून प्रश्न विचारा (Speak)'}
              >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5 text-[#1B5E20]" />}
              </button>

              {/* Text Input */}
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={isListening ? (isMr ? 'ऐकत आहे, बोला...' : 'Listening...') : t('chatbot.placeholder')}
                className="flex-1 px-3.5 py-2.5 min-h-[44px] bg-[#F4F9F4] border-2 border-[#D8E6D8] rounded-2xl text-xs font-black text-[#0F291E] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-4 focus:ring-[#1B5E20]/20 focus:border-[#1B5E20]"
              />

              {/* Send Button */}
              <button
                type="submit"
                disabled={!inputText.trim() || isLoading}
                className="p-2.5 rounded-2xl bg-gradient-to-r from-[#1B5E20] to-[#2E7D32] text-[#FFFFFF] font-black hover:from-[#144919] hover:to-[#1B5E20] disabled:opacity-50 disabled:pointer-events-none transition-all cursor-pointer shadow-md min-h-[44px] min-w-[44px] flex items-center justify-center shrink-0"
                title="पाठवा (Send)"
              >
                <Send className="w-4 h-4 text-[#FFB300]" />
              </button>
            </form>
          </div>

        </div>
      )}

    </div>
  );
};
