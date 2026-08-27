import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  type PriceAlertItem,
  evaluateAlertStatus,
  generateSmsAlertText,
  generateSmsDirectUrl,
  dispatchSmsToFarmer,
  type SmsDispatchResult
} from '../utils/alertManager';
import { Card } from './Card';
import { useAuth } from '../context/AuthContext';
import { useToast } from './Toast';
import { sendPriceAlertEmail } from '../utils/emailAlertService';
import {
  Bell,
  BellOff,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Clock,
  Smartphone,
  Send,
  MessageSquareText,
  Radio,
  CheckCheck,
  Mail,
  AlertCircle
} from 'lucide-react';

interface AlertCardProps {
  alert: PriceAlertItem;
  onToggleStatus: (id: string) => void;
  onDelete: (id: string) => void;
}

export const AlertCard: React.FC<AlertCardProps> = ({ alert, onToggleStatus, onDelete }) => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [showSmsPreview, setShowSmsPreview] = useState(false);
  const [isSendingSms, setIsSendingSms] = useState(false);
  const [lastDispatch, setLastDispatch] = useState<SmsDispatchResult | null>(null);

  const { currentPrice, distanceToTarget, isTriggered } = evaluateAlertStatus(alert);
  const isDisabled = alert.status === 'DISABLED';

  const isAbove = alert.condition === 'ABOVE';
  const mandiName = alert.mandi === 'ANY' ? (i18n.language === 'mr' ? 'कोणतीही जवळची बाजार समिती' : 'Any nearby market') : t(`mandis.${alert.mandi}`, alert.mandi);
  const cropName = t(`crops.${alert.crop}`, alert.crop);

  const farmerPhone = alert.farmerPhone || user?.phone || '9822154321';
  const farmerName = user?.name || 'शेतकरी';
  const smsText = generateSmsAlertText(alert, farmerName);
  const smsUrl = generateSmsDirectUrl(alert, farmerPhone, farmerName);

  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailSuccessTime, setEmailSuccessTime] = useState<string | null>(null);

  const cachedEmail = typeof window !== 'undefined' ? localStorage.getItem('KISAN_SAARTHI_USER_EMAIL') : null;
  const initialEmail = (alert.farmerEmail || user?.email || cachedEmail || 'farmer@gmail.com').replace('example.com', 'gmail.com');
  const [customEmail, setCustomEmail] = useState<string>(initialEmail);
  const farmerEmail = customEmail || initialEmail;

  const emailSubject = encodeURIComponent(`Price Alert Triggered: ${cropName} at ${mandiName}`);
  const emailBody = encodeURIComponent(
    `रामराम ${farmerName}!\n\n` +
    `${cropName} पिकाचा भाव ${mandiName} बाजार समितीत ₹${currentPrice}/क्विंटल पोहोचला आहे.\n` +
    `लक्ष्य भाव: ₹${alert.targetPrice}/क्विंटल.\n\n` +
    `किसान सारथी • APMC Intelligence`
  );
  const emailMailtoUrl = `mailto:${farmerEmail}?subject=${emailSubject}&body=${emailBody}`;

  const handleSendSms = async () => {
    setIsSendingSms(true);
    try {
      const res = await dispatchSmsToFarmer(alert, farmerPhone, farmerName);
      setLastDispatch(res);
      setShowSmsPreview(true);
      showToast(`+91 ${farmerPhone} वर SMS संदेश यशस्वीरीत्या पाठवला! (SMS Dispatched)`, 'success');
    } catch (e) {
      showToast('SMS पाठवताना अडचण आली, कृपया पुन्हा प्रयत्न करा', 'error');
    } finally {
      setIsSendingSms(false);
    }
  };

  const handleSendEmail = async () => {
    setIsSendingEmail(true);
    setEmailError(null);
    try {
      const res = await sendPriceAlertEmail({
        alertId: alert.id,
        toEmail: farmerEmail,
        cropName,
        mandiName,
        currentPrice,
        targetPrice: alert.targetPrice,
        condition: alert.condition,
        farmerName
      });

      if (res.success && res.messageId) {
        setEmailError(null);
        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setEmailSuccessTime(timeStr);
        showToast(
          i18n.language === 'mr'
            ? `📧 ${farmerEmail} वर ई-मेल अलर्ट यशस्वीरीत्या पाठवला!`
            : `📧 Email alert successfully sent to ${farmerEmail}`,
          'success'
        );
      } else {
        setEmailSuccessTime(null);
        const errMsg = res.error || 'ई-मेल पाठवता आला नाही';
        setEmailError(errMsg);
        showToast(errMsg, 'error');
      }
    } catch (err: any) {
      const errMsg = err?.message || 'ई-मेल पाठवताना त्रुटी आली';
      setEmailError(errMsg);
      showToast(errMsg, 'error');
    } finally {
      setIsSendingEmail(false);
    }
  };

  return (
    <Card
      hoverable
      className={`relative overflow-hidden transition-all duration-300 space-y-3.5 rounded-3xl p-5 shadow-xs border-2 ${
        isTriggered
          ? 'border-[#FFB300] bg-gradient-to-br from-amber-500/10 via-[#FFFFFF] to-[#F4F9F4] shadow-md ring-2 ring-[#FFB300]/40'
          : isDisabled
          ? 'opacity-60 bg-[#F4F9F4] border-[#D8E6D8]'
          : 'border-[#D8E6D8] hover:border-[#1B5E20] bg-[#FFFFFF]'
      }`}
    >
      {/* Timeline Left Accent Line */}
      <div className={`absolute top-0 left-0 bottom-0 w-1.5 rounded-l-3xl ${
        isTriggered ? 'bg-[#FFB300]' : isDisabled ? 'bg-[#526058]' : 'bg-[#1B5E20]'
      }`}></div>

      {/* Top Banner Header */}
      <div className="flex items-start justify-between gap-3 pl-1.5">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm shrink-0 shadow-xs ${
            isTriggered
              ? 'bg-[#FFB300] text-[#0F291E] animate-pulse'
              : isDisabled
              ? 'bg-[#D8E6D8] text-[#526058]'
              : 'bg-gradient-to-br from-[#1B5E20] to-[#2E7D32] text-[#FFFFFF]'
          }`}>
            <Bell className="w-5 h-5 stroke-[2.5]" />
          </div>

          <div>
            <h3 className="text-lg font-black text-[#0F291E]">
              {cropName} ({mandiName})
            </h3>
            <p className="text-xs text-[#526058] font-bold mt-0.5">
              {isAbove
                ? (i18n.language === 'mr' ? `भाव ₹${alert.targetPrice.toLocaleString('en-IN')} च्या वर गेल्यास` : `When price rises above ₹${alert.targetPrice.toLocaleString('en-IN')}`)
                : (i18n.language === 'mr' ? `भाव ₹${alert.targetPrice.toLocaleString('en-IN')} च्या खाली आल्यास` : `When price falls below ₹${alert.targetPrice.toLocaleString('en-IN')}`)}
            </p>
          </div>
        </div>

        {/* Status Badges */}
        <div className="shrink-0">
          {isTriggered && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-950 border border-amber-300 shadow-xs">
              <AlertTriangle className="w-3.5 h-3.5 text-[#D97706]" />
              <span>{i18n.language === 'mr' ? 'भाव आला!' : 'TRIGGERED!'}</span>
            </span>
          )}
          {!isTriggered && !isDisabled && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-950 border border-emerald-300 shadow-xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#2E7D32]" />
              <span>{i18n.language === 'mr' ? 'सक्रिय' : 'ACTIVE'}</span>
            </span>
          )}
          {isDisabled && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gray-200 text-gray-800 border border-gray-300">
              <BellOff className="w-3.5 h-3.5" />
              <span>{i18n.language === 'mr' ? 'थांबवला' : 'PAUSED'}</span>
            </span>
          )}
        </div>
      </div>

      {/* Price Context & Progress Box */}
      <div className="p-3.5 bg-[#F4F9F4] rounded-2xl border border-[#D8E6D8] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs ml-1.5">
        <div className="space-y-0.5 text-center sm:text-left">
          <div className="text-[#526058] font-black uppercase tracking-wider text-[11px]">
            {i18n.language === 'mr' ? 'आजचा चालू बाजार भाव:' : 'Current Price:'}
          </div>
          <div className="text-2xl font-black text-[#1B5E20]">
            ₹{currentPrice.toLocaleString('en-IN')}{' '}
            <span className="text-xs font-bold text-[#526058]">/ क्विंटल</span>
          </div>
        </div>

        <div className="text-center sm:text-right space-y-0.5 border-t sm:border-t-0 sm:border-l border-[#D8E6D8] pt-2 sm:pt-0 sm:pl-4 w-full sm:w-auto">
          <div className="text-[#526058] font-black uppercase tracking-wider text-[11px]">
            {i18n.language === 'mr' ? 'तुमचा ठरवलेला लक्ष्य भाव:' : 'Target Price:'}
          </div>
          <div className="text-2xl font-black text-[#D97706]">
            ₹{alert.targetPrice.toLocaleString('en-IN')}
          </div>
        </div>
      </div>

      {/* Distance Progress */}
      {!isTriggered && !isDisabled && (
        <div className="space-y-1 text-xs ml-1.5">
          <div className="flex justify-between text-[#526058] font-black">
            <span className="flex items-center gap-1 text-[#1B5E20]">
              {isAbove ? <TrendingUp className="w-3.5 h-3.5 text-[#FFB300]" /> : <TrendingDown className="w-3.5 h-3.5 text-[#E53935]" />}
              {i18n.language === 'mr' ? `लक्ष्यापासून फक्त ₹${distanceToTarget} दूर` : `₹${distanceToTarget} away from target`}
            </span>
            <span className="text-xs text-[#D97706] font-black">
              {((currentPrice / alert.targetPrice) * 100).toFixed(0)}% गाठले
            </span>
          </div>

          <div className="w-full bg-[#D8E6D8] h-2 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-[#1B5E20] to-[#FFB300] h-full rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, Math.max(10, (currentPrice / alert.targetPrice) * 100))}%` }}
            />
          </div>
        </div>
      )}

      {/* Notification Actions: Direct SMS + Email Alert + View SMS */}
      <div className="space-y-2 ml-1.5">
        <div className="flex flex-col sm:flex-row gap-2">
          {/* Direct Send SMS Button */}
          <button
            type="button"
            onClick={handleSendSms}
            disabled={isSendingSms}
            className="flex-1 py-2.5 px-3 rounded-2xl bg-gradient-to-r from-[#1B5E20] to-[#2E7D32] text-[#FFFFFF] text-xs font-black hover:from-[#144919] hover:to-[#1B5E20] transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-emerald-950/15 min-h-[44px]"
          >
            <Smartphone className="w-4 h-4 text-[#FFB300]" />
            <span>
              {isSendingSms
                ? 'SMS पाठवला जात आहे...'
                : i18n.language === 'mr'
                ? 'SIM SMS पाठवा'
                : 'Send SIM SMS'}
            </span>
            <Send className="w-3.5 h-3.5" />
          </button>

          {/* Email Alert Action Button */}
          <button
            type="button"
            onClick={handleSendEmail}
            disabled={isSendingEmail}
            className="flex-1 py-2.5 px-3 rounded-2xl bg-[#FFFFFF] border-2 border-[#1B5E20] text-[#1B5E20] text-xs font-black hover:bg-[#E8F5E9] transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs min-h-[44px]"
          >
            <Mail className="w-4 h-4 text-[#FFB300]" />
            <span>
              {isSendingEmail
                ? (i18n.language === 'mr' ? 'ई-मेल पाठवत आहे...' : 'Sending Email...')
                : (i18n.language === 'mr' ? 'ई-मेल अलर्ट पाठवा (Email)' : 'Email Alert')}
            </span>
          </button>

          {/* View SMS Text Button */}
          <button
            type="button"
            onClick={() => setShowSmsPreview(!showSmsPreview)}
            className="py-2 px-3 rounded-2xl border border-[#D8E6D8] bg-[#F4F9F4] text-xs font-black text-[#0F291E] hover:bg-[#E8F5E9] transition-all flex items-center justify-center gap-1.5 min-h-[44px] cursor-pointer"
          >
            <MessageSquareText className="w-4 h-4 text-[#1B5E20]" />
            <span>{showSmsPreview ? (i18n.language === 'mr' ? 'लपवा' : 'Hide') : (i18n.language === 'mr' ? 'SMS पहा' : 'View SMS')}</span>
          </button>
        </div>

        {/* Email Error Alert Banner (if failure e.g. missing API key or network) */}
        {emailError && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2 text-xs text-rose-800 font-bold animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span>{emailError}</span>
            </div>
          </div>
        )}

        {/* Email Success Confirmation Banner */}
        {emailSuccessTime && !emailError && (
          <div className="p-3.5 bg-emerald-50 border-2 border-emerald-300 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-emerald-950 font-black animate-in fade-in duration-200 shadow-xs">
            <div className="flex items-center gap-1.5">
              <CheckCheck className="w-4 h-4 text-[#2E7D32] shrink-0" />
              <span>{i18n.language === 'mr' ? `ई-मेल पाठवला गेला (${farmerEmail})` : `Email dispatched to ${farmerEmail}`}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <a
                href={emailMailtoUrl}
                target="_blank"
                rel="noreferrer"
                className="px-2.5 py-1 rounded-xl bg-[#FFFFFF] border border-[#1B5E20] text-[#1B5E20] text-[11px] font-black hover:bg-[#E8F5E9] transition-all flex items-center gap-1 shadow-xs cursor-pointer"
              >
                <Mail className="w-3.5 h-3.5 text-[#FFB300]" />
                <span>Gmail मध्ये उघडा</span>
              </a>
              <span className="text-[10px] text-[#526058] font-bold">{emailSuccessTime}</span>
            </div>
          </div>
        )}

        {/* SMS Live Delivery Notification / Preview Bubble */}
        {showSmsPreview && (
          <div className="p-3.5 bg-[#FFFFFF] border-2 border-[#A5D6A7] rounded-2xl shadow-sm space-y-2 animate-in fade-in duration-200">
            <div className="flex items-center justify-between text-[11px] font-black text-[#1B5E20]">
              <span className="flex items-center gap-1">
                <Smartphone className="w-3.5 h-3.5 text-[#2E7D32]" />
                मोबाईल नंबर: +91 {farmerPhone}
              </span>
              {lastDispatch ? (
                <span className="text-emerald-700 font-black flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  <CheckCheck className="w-3.5 h-3.5 text-[#2E7D32]" />
                  डिलिव्हर झाले ({lastDispatch.timestamp})
                </span>
              ) : (
                <span className="text-[#526058] font-bold">SIM SMS मजकूर</span>
              )}
            </div>

            <div className="p-2.5 bg-[#F4F9F4] rounded-xl border border-[#D8E6D8] text-xs font-bold text-[#0F291E] leading-relaxed">
              "{smsText}"
            </div>

            <div className="flex items-center justify-between text-[10px] font-bold text-[#526058] pt-1 border-t border-[#D8E6D8]">
              <span className="flex items-center gap-1">
                <Radio className="w-3 h-3 text-[#FFB300]" />
                मोबाईल नेटवर्क: Jio / Airtel 4G SIM
              </span>
              <a
                href={smsUrl}
                className="text-[#1B5E20] underline font-black hover:text-[#0F291E]"
              >
                फोन ॲपमध्ये उघडा
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Timeline Footer Controls: Registered SIM + Date + Pause/Enable + Delete */}
      <div className="flex items-center justify-between border-t border-[#D8E6D8] pt-3 text-xs ml-1.5">
        
        {/* SIM Badge & Date */}
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 bg-emerald-50 text-emerald-950 border border-emerald-200 rounded-lg text-[11px] font-black flex items-center gap-1">
            <Smartphone className="w-3.5 h-3.5 text-[#1B5E20]" />
            <span>SIM SMS (+91 {farmerPhone.slice(-10)})</span>
          </span>

          <span className="hidden sm:flex items-center gap-1 text-[11px] font-semibold text-[#526058]">
            <Clock className="w-3.5 h-3.5" />
            {alert.createdAt}
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onToggleStatus(alert.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all min-h-[36px] cursor-pointer border ${
              isDisabled
                ? 'bg-emerald-50 text-emerald-950 border-emerald-300 hover:bg-emerald-100'
                : 'bg-[#F4F9F4] text-[#526058] border-[#D8E6D8] hover:bg-[#E8F5E9] hover:text-[#1B5E20]'
            }`}
          >
            {isDisabled ? (i18n.language === 'mr' ? 'सुरू करा' : 'Enable') : (i18n.language === 'mr' ? 'थांबवा' : 'Pause')}
          </button>

          {confirmingDelete ? (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => onDelete(alert.id)}
                className="px-3 py-1.5 bg-[#E53935] text-[#FFFFFF] text-xs font-black rounded-xl hover:bg-rose-700 min-h-[36px] cursor-pointer shadow-xs"
              >
                होय, हटवा
              </button>
              <button
                type="button"
                onClick={() => setConfirmingDelete(false)}
                className="px-2 py-1.5 text-xs font-bold text-[#526058] hover:underline min-h-[36px] cursor-pointer"
              >
                रद्द
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmingDelete(true)}
              className="p-1.5 text-[#E53935] hover:text-rose-900 hover:bg-rose-50 rounded-xl transition-colors min-h-[36px] cursor-pointer"
              title="हटवा (Delete Alert)"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </Card>
  );
};
