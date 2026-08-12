import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from './Card';
import { Button } from './Button';
import { getFast2SmsKey, setFast2SmsKey, sendRealSmsToIndianMobile } from '../services/smsService';
import {
  Smartphone,
  Key,
  ShieldCheck,
  Send,
  X,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  MessageSquare
} from 'lucide-react';
import { useToast } from './Toast';

interface SmsGatewayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SmsGatewayModal: React.FC<SmsGatewayModalProps> = ({ isOpen, onClose }) => {
  const { i18n } = useTranslation();
  const { showToast } = useToast();

  const [apiKey, setApiKey] = useState<string>('');
  const [testPhone, setTestPhone] = useState<string>('9822154321');
  const [isSendingTest, setIsSendingTest] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusType, setStatusType] = useState<'success' | 'error' | null>(null);

  useEffect(() => {
    if (isOpen) {
      setApiKey(getFast2SmsKey());
      setStatusMessage(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const testMsg = `रामराम शेतकरी दादा! किसान सारथी भाव अलर्ट SMS यशस्वी. - किसान सारथी कोपरगाव`;
  const nativeSmsUrl = `sms:${testPhone.replace(/\D/g, '').slice(-10)}?body=${encodeURIComponent(testMsg)}`;

  const handleSaveKey = () => {
    setFast2SmsKey(apiKey);
    showToast('Fast2SMS गेटवे की सेव्ह झाली!', 'success');
  };

  const handleSendTestSms = async () => {
    if (!testPhone || testPhone.length < 10) {
      setStatusType('error');
      setStatusMessage('कृपया १०-अंकी मोबाईल नंबर प्रविष्ट करा.');
      return;
    }

    setIsSendingTest(true);
    setStatusMessage(null);

    const res = await sendRealSmsToIndianMobile(testPhone, testMsg, apiKey);

    setIsSendingTest(false);
    if (res.success) {
      setStatusType('success');
      setStatusMessage(res.message);
      showToast(res.message, 'success');
    } else {
      setStatusType('error');
      setStatusMessage(res.message);
      showToast(res.message, 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <Card
        hoverable={false}
        className="w-full max-w-lg bg-[#FFFFFF] border-2 border-[#1B5E20] rounded-3xl p-6 shadow-2xl space-y-4 relative animate-in zoom-in-95 duration-200"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-[#526058] hover:bg-[#F4F9F4] cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 border-b border-[#D8E6D8] pb-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#1B5E20] to-[#2E7D32] text-[#FFB300] flex items-center justify-center font-black shadow-md shadow-emerald-950/20">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-[#0F291E]">
              {i18n.language === 'mr' ? 'प्रत्यक्ष मोबाईल SMS प्रणाली' : 'Real Mobile SMS Gateway'}
            </h2>
            <p className="text-xs text-[#526058] font-bold">
              {i18n.language === 'mr' ? 'Fast2SMS क्लाउड गेटवे व थेट SIM पर्याय' : 'Fast2SMS Cloud Gateway & Native SIM Options'}
            </p>
          </div>
        </div>

        {/* Option 1: Native SIM (100% Guaranteed on Mobile) */}
        <div className="p-3.5 bg-emerald-50 rounded-2xl border-2 border-emerald-300 space-y-2">
          <div className="flex items-center justify-between text-xs font-black text-emerald-950">
            <span className="flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-[#1B5E20]" />
              १. फोनच्या स्वतःच्या SIM मधून मोफत SMS (१००% हमी)
            </span>
            <span className="bg-emerald-200 text-emerald-950 px-2 py-0.5 rounded text-[10px]">१-क्लिक</span>
          </div>
          <p className="text-[11px] text-emerald-900 font-semibold">
            मोबाईल फोनवरून हे बटण दाबताच फोनचे SMS ॲप उघडेल आणि तुमच्या स्वतःच्या SIM कार्डवरून (Jio/Airtel/Vi) मेसेज जाईल.
          </p>
          <a
            href={nativeSmsUrl}
            className="w-full py-2 px-3 bg-[#1B5E20] text-[#FFFFFF] font-black rounded-xl text-xs flex items-center justify-center gap-1.5 hover:bg-[#144919] transition-all shadow-xs"
          >
            <MessageSquare className="w-3.5 h-3.5 text-[#FFB300]" />
            <span>फोनच्या SMS ॲपमधून प्रत्यक्ष मेसेज पाठवा</span>
          </a>
        </div>

        {/* Option 2: Cloud Gateway via Fast2SMS */}
        <div className="p-3.5 bg-[#F4F9F4] rounded-2xl border border-[#D8E6D8] space-y-2.5">
          <div className="text-xs font-black text-[#0F291E] flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Key className="w-3.5 h-3.5 text-[#1B5E20]" />
              २. क्लाउड Fast2SMS API गेटवे
            </span>
            <a
              href="https://www.fast2sms.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-[#1B5E20] underline font-bold flex items-center gap-0.5"
            >
              <span>Fast2SMS खाते</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="space-y-1">
            <label className="block text-[11px] font-bold text-[#526058]">
              Fast2SMS Authorization API Key:
            </label>
            <input
              type="text"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Fast2SMS API Key"
              className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#D8E6D8] rounded-xl text-xs font-mono text-[#0F291E] focus:ring-2 focus:ring-[#1B5E20]/20"
            />
          </div>

          {/* Test Phone Input */}
          <div className="flex gap-2">
            <input
              type="tel"
              maxLength={10}
              value={testPhone}
              onChange={(e) => setTestPhone(e.target.value.replace(/\D/g, ''))}
              placeholder="१०-अंकी मोबाईल नंबर"
              className="flex-1 px-3 py-2 bg-[#FFFFFF] border border-[#D8E6D8] rounded-xl text-xs font-black text-[#0F291E] focus:ring-2 focus:ring-[#1B5E20]/20"
            />
            <Button
              variant="primary"
              size="sm"
              onClick={handleSendTestSms}
              disabled={isSendingTest}
              className="shrink-0 text-xs font-black"
            >
              <Send className="w-3.5 h-3.5 text-[#FFB300]" />
              <span>{isSendingTest ? 'पाठवत आहे...' : 'क्लाउड SMS पाठवा'}</span>
            </Button>
          </div>

          {/* Status Message */}
          {statusMessage && (
            <div
              className={`p-2.5 rounded-xl text-xs font-black flex items-start gap-2 ${
                statusType === 'success'
                  ? 'bg-emerald-50 text-emerald-950 border border-emerald-200'
                  : 'bg-rose-50 text-rose-950 border border-rose-200'
              }`}
            >
              {statusType === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-[#2E7D32] shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-[#E53935] shrink-0 mt-0.5" />
              )}
              <span className="leading-snug">{statusMessage}</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#D8E6D8]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-black text-[#526058] hover:text-[#0F291E] cursor-pointer"
          >
            बंद करा
          </button>
          <Button
            variant="primary"
            size="md"
            onClick={() => {
              handleSaveKey();
              onClose();
            }}
            className="text-xs font-black"
          >
            <span>की सेव्ह करा (Save Key)</span>
          </Button>
        </div>
      </Card>
    </div>
  );
};
