import React, { useState } from 'react';
import { getStoredApiKey, setStoredApiKey } from '../services/apiService';
import { useToast } from './Toast';
import { Key, ShieldCheck, Check, AlertCircle, RefreshCw, X } from 'lucide-react';
import { Button } from './Button';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeySaved: (newKey: string) => void;
  isLive: boolean;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose, onKeySaved, isLive }) => {
  const { showToast } = useToast();
  const [apiKeyInput, setApiKeyInput] = useState<string>(getStoredApiKey());
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setStoredApiKey(apiKeyInput);
    setSavedSuccess(true);
    onKeySaved(apiKeyInput);

    showToast('data.gov.in API Key यशस्वीरित्या जतन केली! (Key Saved)');

    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#FFFFFF] border-2 border-[#2E7D32] rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-[#6B7280] hover:bg-[#F7FBF7] cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 border-b border-[#E1EBE1] pb-3">
          <div className="w-11 h-11 rounded-2xl bg-[#E8F5E9] text-[#2E7D32] flex items-center justify-center font-bold">
            <Key className="w-5 h-5 text-[#FFC107]" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-[#1B4332]">
              data.gov.in API Key सेट करा
            </h3>
            <p className="text-xs text-[#6B7280] font-medium">
              थेट Agmarknet बाजार भाव मिळवण्यासाठी तुमची API Key टाका
            </p>
          </div>
        </div>

        {/* Live Status indicator */}
        <div className={`p-3 rounded-2xl border text-xs font-bold flex items-center gap-2 ${
          isLive
            ? 'bg-emerald-50 text-emerald-950 border-emerald-300'
            : 'bg-amber-50 text-amber-950 border-amber-300'
        }`}>
          {isLive ? (
            <>
              <ShieldCheck className="w-4.5 h-4.5 text-[#43A047] shrink-0" />
              <span>लाइव्ह Agmarknet API जोडले गेले आहे! (Real Rates Active)</span>
            </>
          ) : (
            <>
              <AlertCircle className="w-4.5 h-4.5 text-[#FFC107] shrink-0" />
              <span>सध्या प्रात्यक्षिक डेटा सक्रिय आहे. खाली तुमची API Key जोडा.</span>
            </>
          )}
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-extrabold text-[#1B4332] uppercase tracking-wider mb-2">
              data.gov.in API Key:
            </label>
            <input
              type="text"
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              placeholder="तुमची data.gov.in API Key येथे टाका"
              className="w-full px-4 py-3 bg-[#F7FBF7] border-2 border-[#E1EBE1] rounded-2xl text-xs sm:text-sm font-mono text-[#1B4332] placeholder:text-[#9CA3AF] min-h-[50px] focus:outline-none focus:ring-4 focus:ring-[#2E7D32]/20 focus:border-[#2E7D32] transition-all duration-300 shadow-xs"
              required
            />
            <p className="text-[11px] text-[#6B7280] font-medium mt-2 leading-normal">
              टीप: API Key data.gov.in पोर्टलवर विनामूल्य उपलब्ध आहे (Resource: Daily Agriculture Mandi Prices).
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-2xl border-2 border-[#E1EBE1] text-xs font-bold text-[#6B7280] hover:bg-[#F7FBF7] cursor-pointer min-h-[48px]"
            >
              रद्द करा
            </button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4 text-[#FFC107]" />
                  <span>सेव्ह केले! (Saved)</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 text-[#FFC107]" />
                  <span>सेव्ह व दर अपडेट करा</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
