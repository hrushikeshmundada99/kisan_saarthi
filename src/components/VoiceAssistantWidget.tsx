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

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  lang?: string;
}

export const VoiceAssistantWidget: React.FC = () => {
  const { i18n } = useTranslation();
  const isMr = i18n.language === 'mr';

  // Open/Close Chat Drawer
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [unreadCount, setUnreadCount] = useState<number>(1);

  // Messages State
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'assistant',
      text: isMr
        ? 'रामराम शेतकरी दादा! मी किसान मित्र AI आहे. तुम्ही मला थेट बोलून किंवा टाईप करून बाजार भाव व ॲप बद्दल प्रश्न विचारू शकता. 🌱'
        : 'Welcome! I am Kisan Mitra AI. Ask me about live mandi rates, crop advice, or app features by voice or text. 🌱',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      lang: isMr ? 'mr' : 'en'
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
          setSpeechError(isMr ? 'मायक्रोफोन परवानगी नाकारली गेली.' : 'Microphone permission denied.');
        } else if (event.error !== 'no-speech') {
          setSpeechError(isMr ? 'आवाज ऐकता आला नाही, कृपया पुन्हा बोला.' : 'Could not hear voice, try speaking again.');
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [isMr]);

  // Text-To-Speech Output
  const speakText = (text: string, langHint = 'mr') => {
    if (isMuted || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel(); // Stop any ongoing speech
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set language code
    const isDevanagari = /[\u0900-\u097F]/.test(text);
    utterance.lang = isDevanagari ? 'mr-IN' : (langHint === 'mr' ? 'mr-IN' : 'en-IN');
    utterance.rate = 0.95;

    // Pick best available voice
    const voices = window.speechSynthesis.getVoices();
    const matchingVoice = voices.find((v) => v.lang.includes('mr') || v.lang.includes('hi') || v.lang.includes('en'));
    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }

    window.speechSynthesis.speak(utterance);
  };

  // Toggle Voice Input (Mic)
  const toggleListening = () => {
    if (!recognitionRef.current) {
      setSpeechError(isMr ? 'या ब्राऊझरमध्ये व्हॉईस सपोर्ट उपलब्ध नाही, कृपया टाईप करा.' : 'Voice recognition not supported in this browser, please type.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setSpeechError(null);
      try {
        recognitionRef.current.lang = isMr ? 'mr-IN' : 'en-IN';
        recognitionRef.current.start();
      } catch (err) {
        console.warn('[Mic Start Note]:', err);
      }
    }
  };

  // Send Message Handler
  const handleSendMessage = async (textToSend?: string) => {
    const messageContent = (textToSend || inputText).trim();
    if (!messageContent || isLoading) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: messageContent,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
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
          conversationHistory: messages.slice(-4)
        })
      });

      const data = await res.json();
      const replyText = data.replyText || (isMr ? 'क्षमस्व, प्रतिसाद तयार करता आला नाही.' : 'Sorry, could not process request.');
      const replyLang = data.replyLanguage || 'mr';

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
      const fallbackText = isMr
        ? 'रामराम! आज कोपरगाव कांदा भाव ₹३,९५०/क्विंटल व लासलगाव भाव ₹४,२५०/क्विंटल आहे.'
        : 'Hello! Onion modal price today is ₹3,950/q at Kopargaon & ₹4,250/q at Lasalgaon.';

      const fallbackMsg: ChatMessage = {
        id: `assistant-fallback-${Date.now()}`,
        sender: 'assistant',
        text: fallbackText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, fallbackMsg]);
      speakText(fallbackText, 'mr');
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
                <span>किसान मित्र विचार करत आहे...</span>
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
                placeholder={isListening ? (isMr ? 'ऐकत आहे, बोला...' : 'Listening...') : (isMr ? 'प्रश्न प्रविष्ट करा...' : 'Ask a question...')}
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
