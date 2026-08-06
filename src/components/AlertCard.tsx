import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  type PriceAlertItem,
  evaluateAlertStatus,
  generateWhatsAppAlertUrl
} from '../utils/alertManager';
import { Card } from './Card';
import { useAuth } from '../context/AuthContext';
import { Bell, BellOff, Trash2, CheckCircle2, AlertTriangle, TrendingUp, TrendingDown, ArrowRight, Clock, MessageSquare } from 'lucide-react';

interface AlertCardProps {
  alert: PriceAlertItem;
  onToggleStatus: (id: string) => void;
  onDelete: (id: string) => void;
}

export const AlertCard: React.FC<AlertCardProps> = ({ alert, onToggleStatus, onDelete }) => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const { currentPrice, distanceToTarget, isTriggered } = evaluateAlertStatus(alert);
  const isDisabled = alert.status === 'DISABLED';

  const isAbove = alert.condition === 'ABOVE';
  const mandiName = alert.mandi === 'ANY' ? (i18n.language === 'mr' ? 'कोणतीही जवळची मंडी' : 'Any nearby mandi') : t(`mandis.${alert.mandi}`, alert.mandi);
  const cropName = t(`crops.${alert.crop}`, alert.crop);

  const whatsappUrl = generateWhatsAppAlertUrl(alert, user?.phone || '9822154321', user?.name || 'शेतकरी');

  return (
    <Card
      hoverable
      className={`relative overflow-hidden transition-all duration-300 space-y-4 rounded-2xl p-6 shadow-sm border-2 ${
        isTriggered
          ? 'border-[#FFC107] bg-gradient-to-br from-amber-500/10 via-[#F7FBF7] to-[#FFFFFF] shadow-md ring-2 ring-[#FFC107]/40'
          : isDisabled
          ? 'opacity-60 bg-[#F7FBF7] border-[#E1EBE1]'
          : 'border-[#E1EBE1] hover:border-[#81C784] bg-[#FFFFFF]'
      }`}
    >
      {/* Timeline Left Accent Line */}
      <div className={`absolute top-0 left-0 bottom-0 w-1.5 rounded-l-2xl ${
        isTriggered ? 'bg-[#FFC107]' : isDisabled ? 'bg-[#9CA3AF]' : 'bg-[#2E7D32]'
      }`}></div>

      {/* Top Banner Header */}
      <div className="flex items-start justify-between gap-3 pl-2">
        <div className="flex items-center gap-3">
          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-extrabold text-sm shrink-0 shadow-xs ${
            isTriggered
              ? 'bg-[#FFC107] text-[#1B4332] animate-pulse'
              : isDisabled
              ? 'bg-[#E1EBE1] text-[#6B7280]'
              : 'bg-[#2E7D32] text-[#FFFFFF]'
          }`}>
            <Bell className="w-5 h-5 stroke-[2.5]" />
          </div>

          <div>
            <h3 className="text-lg font-black text-[#1B4332]">
              {cropName} ({mandiName})
            </h3>
            <p className="text-xs text-[#6B7280] font-bold mt-0.5">
              {isAbove
                ? (i18n.language === 'mr' ? `भाव ₹${alert.targetPrice.toLocaleString('en-IN')} च्या वर गेल्यास` : `When price rises above ₹${alert.targetPrice.toLocaleString('en-IN')}`)
                : (i18n.language === 'mr' ? `भाव ₹${alert.targetPrice.toLocaleString('en-IN')} च्या खाली आल्यास` : `When price falls below ₹${alert.targetPrice.toLocaleString('en-IN')}`)}
            </p>
          </div>
        </div>

        {/* Color-Coded Status Badges */}
        <div className="shrink-0">
          {isTriggered && (
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black bg-amber-100 text-amber-950 border border-amber-300 shadow-xs">
              <AlertTriangle className="w-4 h-4 text-[#D97706]" />
              {i18n.language === 'mr' ? 'ट्रिगर झाले!' : 'TRIGGERED!'}
            </span>
          )}
          {!isTriggered && !isDisabled && (
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black bg-emerald-100 text-emerald-950 border border-emerald-300 shadow-xs">
              <CheckCircle2 className="w-4 h-4 text-[#43A047]" />
              {i18n.language === 'mr' ? 'सक्रिय' : 'ACTIVE'}
            </span>
          )}
          {isDisabled && (
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-gray-200 text-gray-800 border border-gray-300">
              <BellOff className="w-4 h-4" />
              {i18n.language === 'mr' ? 'बंद' : 'DISABLED'}
            </span>
          )}
        </div>
      </div>

      {/* Price Context & Distance Progress Box */}
      <div className="p-4 bg-[#F7FBF7] rounded-2xl border border-[#E1EBE1] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs ml-2">
        <div className="space-y-0.5 text-center sm:text-left">
          <div className="text-[#6B7280] font-extrabold uppercase tracking-wider text-[11px]">सध्याचा चालू बाजार भाव:</div>
          <div className="text-2xl font-black text-[#2E7D32]">
            ₹{currentPrice.toLocaleString('en-IN')}{' '}
            <span className="text-xs font-bold text-[#6B7280]">/ क्विंटल</span>
          </div>
        </div>

        <div className="text-center sm:text-right space-y-0.5 border-t sm:border-t-0 sm:border-l border-[#E1EBE1] pt-2 sm:pt-0 sm:pl-4 w-full sm:w-auto">
          <div className="text-[#6B7280] font-extrabold uppercase tracking-wider text-[11px]">लक्ष्य भाव (Target):</div>
          <div className="text-2xl font-black text-[#D97706]">
            ₹{alert.targetPrice.toLocaleString('en-IN')}
          </div>
        </div>
      </div>

      {/* Progress Distance Bar for Non-Triggered Active Alerts */}
      {!isTriggered && !isDisabled && (
        <div className="space-y-1.5 text-xs ml-2">
          <div className="flex justify-between text-[#6B7280] font-extrabold">
            <span className="flex items-center gap-1 text-[#2E7D32]">
              {isAbove ? <TrendingUp className="w-4 h-4 text-[#FFC107]" /> : <TrendingDown className="w-4 h-4 text-[#E53935]" />}
              {i18n.language === 'mr' ? `लक्ष्यापासून फक्त ₹${distanceToTarget} दूर` : `₹${distanceToTarget} away from target`}
            </span>
            <span className="text-xs text-[#D97706] font-black">
              {((currentPrice / alert.targetPrice) * 100).toFixed(0)}% गाठले
            </span>
          </div>

          <div className="w-full bg-[#E1EBE1] h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-[#2E7D32] to-[#FFC107] h-full rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, Math.max(10, (currentPrice / alert.targetPrice) * 100))}%` }}
            />
          </div>
        </div>
      )}

      {/* Direct WhatsApp Send Action Button Strip */}
      <div className="ml-2">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-2.5 px-4 rounded-2xl bg-[#25D366] text-[#FFFFFF] text-xs font-black hover:bg-[#1EBE57] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-emerald-900/15 group min-h-[44px]"
        >
          <MessageSquare className="w-4 h-4 text-[#FFFFFF] fill-current group-hover:scale-110 transition-transform" />
          <span>व्हॉट्सॲपवर व्हिज्युअल अलर्ट पाठवा (Send Alert to WhatsApp)</span>
        </a>
      </div>

      {/* Triggered Alert Action Suggestion Box */}
      {isTriggered && (
        <div className="p-3.5 bg-amber-100 border-2 border-amber-300 rounded-2xl text-xs font-black text-amber-950 flex items-center justify-between gap-2 ml-2">
          <span>
            {i18n.language === 'mr'
              ? 'बधाई! भावाने तुमचे दिलेले लक्ष्य गाठले आहे. विक्रीचा विचार करा.'
              : 'Congratulations! Price hit your target. Consider selling now.'}
          </span>
          <ArrowRight className="w-4 h-4 text-[#D97706] shrink-0" />
        </div>
      )}

      {/* Timeline Footer Controls: Channels + Timestamp + Toggle + Delete */}
      <div className="flex items-center justify-between border-t border-[#E1EBE1] pt-3 text-xs ml-2">
        
        {/* Notification Channels Chips & Creation Date */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            {alert.notificationMethods.map((m) => (
              <span key={m} className="px-2.5 py-1 bg-[#F7FBF7] border border-[#E1EBE1] rounded-lg text-[10px] font-black text-[#2E7D32]">
                {m}
              </span>
            ))}
          </div>

          <span className="hidden sm:flex items-center gap-1 text-[11px] font-semibold text-[#6B7280]">
            <Clock className="w-3.5 h-3.5" />
            {alert.createdAt}
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Toggle Switch Button */}
          <button
            type="button"
            onClick={() => onToggleStatus(alert.id)}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all min-h-[40px] cursor-pointer border ${
              isDisabled
                ? 'bg-emerald-50 text-emerald-950 border-emerald-300 hover:bg-emerald-100'
                : 'bg-[#F7FBF7] text-[#6B7280] border-[#E1EBE1] hover:bg-[#E8F5E9] hover:text-[#2E7D32]'
            }`}
          >
            {isDisabled ? (i18n.language === 'mr' ? 'सुरू करा' : 'Enable') : (i18n.language === 'mr' ? 'थांबवा' : 'Pause')}
          </button>

          {/* Delete Button with Confirmation State */}
          {confirmingDelete ? (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => onDelete(alert.id)}
                className="px-3 py-2 bg-[#E53935] text-[#FFFFFF] text-xs font-black rounded-xl hover:bg-rose-700 min-h-[40px] cursor-pointer shadow-xs"
              >
                होय, हटवा
              </button>
              <button
                type="button"
                onClick={() => setConfirmingDelete(false)}
                className="px-2 py-2 text-xs font-bold text-[#6B7280] hover:underline min-h-[40px] cursor-pointer"
              >
                रद्द
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmingDelete(true)}
              className="p-2 text-[#E53935] hover:text-rose-900 hover:bg-rose-50 rounded-xl transition-colors min-h-[40px] cursor-pointer"
              title="हटवा (Delete Alert)"
            >
              <Trash2 className="w-4.5 h-4.5" />
            </button>
          )}
        </div>
      </div>
    </Card>
  );
};
