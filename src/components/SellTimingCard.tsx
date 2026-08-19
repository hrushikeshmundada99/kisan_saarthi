// Sell Timing Recommendation Component with Immediate & Delayed Feedback
// Implements multi-horizon price guidance and closes the feedback loop with farmers

import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from './Card';
import { Button } from './Button';
import { useToast } from './Toast';
import { useAuth } from '../context/AuthContext';
import {
  calculateSellTimingRecommendation,
  type SellTimingRecommendation,
  type HorizonBreakdownItem
} from '../utils/sellTimingEngine';
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  Check,
  ThumbsUp,
  ThumbsDown,
  Clock,
  Calendar,
  HelpCircle,
  ArrowRight,
  Send
} from 'lucide-react';

interface SellTimingCardProps {
  crop: string;
  mandi: string;
  className?: string;
  onNavigateToForecast?: () => void;
}

const PENDING_FOLLOWUPS_KEY = 'KISAN_SAARTHI_PENDING_SELL_FOLLOWUPS';

interface PendingFollowUp {
  recId: string;
  crop: string;
  mandi: string;
  action: 'SELL_NOW' | 'WAIT';
  waitDays: number;
  shownAt: number; // timestamp
  predictedPrice: number;
}

export const SellTimingCard: React.FC<SellTimingCardProps> = ({
  crop,
  mandi,
  className = '',
  onNavigateToForecast
}) => {
  const { i18n } = useTranslation();
  const { showToast } = useToast();
  const { user, isLoggedIn } = useAuth();
  const isMr = i18n.language === 'mr';

  // Compute recommendation
  const rec: SellTimingRecommendation = useMemo(() => {
    return calculateSellTimingRecommendation(crop, mandi);
  }, [crop, mandi]);

  // Recommendation DB Log ID
  const [recDbId, setRecDbId] = useState<string | null>(null);

  // Feedback States
  const [immediateVoted, setImmediateVoted] = useState<boolean | null>(null);
  const [isSubmittingImmediate, setIsSubmittingImmediate] = useState<boolean>(false);

  // Delayed Follow-Up Prompt State
  const [activeFollowUp, setActiveFollowUp] = useState<PendingFollowUp | null>(null);
  const [actualSellPrice, setActualSellPrice] = useState<string>('');
  const [followedAdvice, setFollowedAdvice] = useState<boolean>(true);
  const [isSubmittingFollowUp, setIsSubmittingFollowUp] = useState<boolean>(false);
  const [followUpDismissed, setFollowUpDismissed] = useState<boolean>(false);

  // 1. Log recommendation to backend API on mount or crop/mandi change
  useEffect(() => {
    let isMounted = true;
    setImmediateVoted(null);

    const logRecommendation = async () => {
      try {
        const res = await fetch('/api/recommendations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            crop: rec.crop,
            mandi: rec.mandi,
            action: rec.action,
            waitDays: rec.waitDays,
            expectedGainPct: rec.expectedGainPct,
            confidence: rec.confidence,
            predictedPrice: rec.projectedPrice,
            currentPrice: rec.currentPrice
          })
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success && data.id && isMounted) {
            setRecDbId(data.id);

            // If user is logged in, register pending follow-up in localStorage
            if (isLoggedIn && rec.action === 'WAIT' && rec.waitDays) {
              registerPendingFollowUp({
                recId: data.id,
                crop: rec.crop,
                mandi: rec.mandi,
                action: rec.action,
                waitDays: rec.waitDays,
                shownAt: Date.now(),
                predictedPrice: rec.projectedPrice
              });
            }
          }
        }
      } catch (err) {
        console.warn('[Log Recommendation Note]:', err);
      }
    };

    logRecommendation();

    return () => {
      isMounted = false;
    };
  }, [rec.crop, rec.mandi, rec.action, rec.waitDays, isLoggedIn]);

  // 2. Check for eligible delayed follow-ups for logged-in farmers
  useEffect(() => {
    if (!isLoggedIn) {
      setActiveFollowUp(null);
      return;
    }

    try {
      const stored = localStorage.getItem(PENDING_FOLLOWUPS_KEY);
      if (stored) {
        const list: PendingFollowUp[] = JSON.parse(stored);
        const now = Date.now();

        // Check if any recommendation's wait period has elapsed
        // (For testing and authentic UX: wait period in days or at least 1 minute after logging)
        const ready = list.find((item) => {
          const elapsedMs = now - item.shownAt;
          const waitMs = item.waitDays * 24 * 60 * 60 * 1000;
          // Trigger if elapsed or for recent test item
          return elapsedMs >= Math.min(waitMs, 30000);
        });

        if (ready && !followUpDismissed) {
          setActiveFollowUp(ready);
        }
      }
    } catch (err) {
      console.warn('[Check Follow-ups Note]:', err);
    }
  }, [isLoggedIn, followUpDismissed, crop, mandi]);

  const registerPendingFollowUp = (followUp: PendingFollowUp) => {
    try {
      const stored = localStorage.getItem(PENDING_FOLLOWUPS_KEY);
      const list: PendingFollowUp[] = stored ? JSON.parse(stored) : [];
      // Keep unique by crop & mandi
      const filtered = list.filter((i) => !(i.crop === followUp.crop && i.mandi === followUp.mandi));
      filtered.push(followUp);
      localStorage.setItem(PENDING_FOLLOWUPS_KEY, JSON.stringify(filtered.slice(-5)));
    } catch {}
  };

  const removePendingFollowUp = (recId: string) => {
    try {
      const stored = localStorage.getItem(PENDING_FOLLOWUPS_KEY);
      if (stored) {
        const list: PendingFollowUp[] = JSON.parse(stored);
        const filtered = list.filter((i) => i.recId !== recId);
        localStorage.setItem(PENDING_FOLLOWUPS_KEY, JSON.stringify(filtered));
      }
    } catch {}
    setActiveFollowUp(null);
  };

  // Submit Immediate Feedback (Thumbs Up / Down)
  const handleImmediateFeedback = async (wasHelpful: boolean) => {
    if (!recDbId) return;
    setIsSubmittingImmediate(true);
    setImmediateVoted(wasHelpful);

    try {
      await fetch('/api/recommendations/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          recommendation_id: recDbId,
          was_helpful: wasHelpful
        })
      });

      showToast(
        isMr
          ? wasHelpful ? '👍 धन्यवाद! तुमचा अभिप्राय नोंदवला गेला.' : 'अभिप्राय नोंदवला, आम्ही अंदाज अधिक अचूक करू.'
          : wasHelpful ? '👍 Thank you! Feedback recorded.' : 'Feedback recorded, we will refine our model.',
        'success'
      );
    } catch (err) {
      console.warn('[Feedback Submit Note]:', err);
    } finally {
      setIsSubmittingImmediate(false);
    }
  };

  // Submit Delayed Follow-up (Actual Price Received)
  const handleFollowUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeFollowUp) return;

    const numericPrice = parseFloat(actualSellPrice);
    if (isNaN(numericPrice) || numericPrice <= 0) {
      showToast(isMr ? 'कृपया मिळालेला योग्य भाव टाका.' : 'Please enter a valid price.', 'error');
      return;
    }

    setIsSubmittingFollowUp(true);

    try {
      await fetch('/api/recommendations/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          recommendation_id: activeFollowUp.recId,
          actual_sell_price: numericPrice,
          followed_advice: followedAdvice,
          was_helpful: true
        })
      });

      showToast(
        isMr
          ? `🎉 धन्यवाद ${user?.name || 'शेतकरी दादा'}! तुमच्या खऱ्या बाजार भावाची नोंद झाली. यामुळे इतर शेतकऱ्यांनाही अचूक अंदाज मिळतील!`
          : `🎉 Thank you! Real sell price recorded. This improves accuracy for all farmers!`,
        'success'
      );

      removePendingFollowUp(activeFollowUp.recId);
    } catch (err) {
      showToast('माहिती सेव्ह करताना त्रुटी आली.', 'error');
    } finally {
      setIsSubmittingFollowUp(false);
    }
  };

  const isWait = rec.action === 'WAIT';

  return (
    <div className={`space-y-4 ${className}`}>
      
      {/* Delayed Follow-Up Verification Banner (if active) */}
      {activeFollowUp && isLoggedIn && !followUpDismissed && (
        <Card
          hoverable={false}
          className="p-4 sm:p-5 bg-gradient-to-r from-amber-50 via-[#FFFFFF] to-emerald-50 border-2 border-[#FFB300] rounded-3xl shadow-sm space-y-3 animate-in slide-in-from-top duration-300"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-[#FFB300] text-[#0F291E] flex items-center justify-center font-black shrink-0 shadow-xs">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm sm:text-base font-black text-[#0F291E]">
                  {isMr
                    ? `शेतकरी दादा, तुम्ही ${activeFollowUp.crop} विकला का?`
                    : `Farmer check-in: Did you sell your ${activeFollowUp.crop}?`}
                </h4>
                <p className="text-xs text-[#526058] font-bold">
                  {isMr
                    ? `आम्ही ${activeFollowUp.waitDays} दिवसांपूर्वी ₹${activeFollowUp.predictedPrice}/क्विंटल भावाचा अंदाज दिला होता. तुम्हाला प्रत्यक्षात काय भाव मिळाला?`
                    : `We projected ₹${activeFollowUp.predictedPrice}/q ${activeFollowUp.waitDays} days ago. What price did you receive?`}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setFollowUpDismissed(true)}
              className="text-[#526058] hover:text-[#0F291E] text-xs font-black p-1"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleFollowUpSubmit} className="flex flex-wrap items-center gap-3 pt-1 text-xs">
            <div className="relative flex-1 min-w-[180px]">
              <span className="absolute left-3 top-2.5 text-[#526058] font-black">₹</span>
              <input
                type="number"
                value={actualSellPrice}
                onChange={(e) => setActualSellPrice(e.target.value)}
                placeholder={isMr ? "मिळालेला भाव (उदा. २१५०)" : "Actual Price (e.g. 2150)"}
                className="w-full pl-7 pr-16 py-2 bg-[#FFFFFF] border-2 border-[#D8E6D8] rounded-xl font-black text-sm focus:outline-none focus:border-[#1B5E20]"
                required
              />
              <span className="absolute right-3 top-2.5 text-[10px] text-[#526058] font-bold">/क्विंटल</span>
            </div>

            <label className="flex items-center gap-1.5 font-bold text-[#0F291E] cursor-pointer">
              <input
                type="checkbox"
                checked={followedAdvice}
                onChange={(e) => setFollowedAdvice(e.target.checked)}
                className="w-4 h-4 rounded text-[#1B5E20] focus:ring-[#1B5E20]"
              />
              <span>{isMr ? 'मी अंदाज पाहून माल थांबवून विकला' : 'I followed this advice'}</span>
            </label>

            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isSubmittingFollowUp}
              className="rounded-xl min-h-[38px] text-xs font-black"
            >
              <Send className="w-3.5 h-3.5 text-[#FFB300]" />
              <span>{isSubmittingFollowUp ? 'नोंद होत आहे...' : (isMr ? 'भाव सबमिट करा' : 'Submit Price')}</span>
            </Button>
          </form>
        </Card>
      )}

      {/* Main Sell Timing Card */}
      <Card
        hoverable={false}
        className={`relative overflow-hidden p-5 sm:p-6 rounded-3xl border-2 shadow-sm transition-all duration-300 bg-[#FFFFFF] ${
          isWait
            ? 'border-[#1B5E20]/70 bg-gradient-to-br from-[#FFFFFF] via-[#F4F9F4] to-[#E8F5E9]'
            : 'border-amber-300 bg-gradient-to-br from-[#FFFFFF] via-[#FFFDF5] to-[#FFF8E7]'
        }`}
      >
        {/* Dynamic Top Accent Bar */}
        <div
          className={`absolute top-0 left-0 right-0 h-1.5 ${
            isWait
              ? 'bg-gradient-to-r from-[#1B5E20] via-[#2E7D32] to-[#FFB300]'
              : 'bg-gradient-to-r from-[#D97706] via-[#F59E0B] to-[#FFB300]'
          }`}
        />

        {/* 1. Header: Headline Action & Confidence Badge */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E1EBE1]">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-[#0F291E] text-[#FFFFFF] shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-[#FFB300]" />
                <span>{isMr ? 'कधी विकावे? AI शिफारस' : 'When to Sell? AI Guidance'}</span>
              </span>

              {/* Confidence Badge */}
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black border shadow-xs ${
                rec.confidence === 'High'
                  ? 'bg-emerald-100 text-emerald-950 border-emerald-300'
                  : rec.confidence === 'Moderate'
                  ? 'bg-amber-100 text-amber-950 border-amber-300'
                  : 'bg-rose-100 text-rose-950 border-rose-300'
              }`}>
                <ShieldCheck className="w-3.5 h-3.5 text-[#1B5E20]" />
                <span>{isMr ? `${rec.confidence === 'High' ? 'उच्च' : rec.confidence === 'Moderate' ? 'मध्यम' : 'कमी'} खात्री` : `${rec.confidence} Confidence`}</span>
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-[#0F291E] tracking-tight pt-1">
              {isWait ? (
                <span className="text-[#1B5E20] flex items-center gap-2">
                  <span>⏳ थांबा ~{rec.waitDays} दिवस (Wait ~{rec.waitDays} Days)</span>
                </span>
              ) : (
                <span className="text-[#B45309] flex items-center gap-2">
                  <span>⚡ आत्ताच विका (Sell Today)</span>
                </span>
              )}
            </h3>

            <p className="text-xs font-bold text-[#526058]">
              {crop} ({mandi} बाजार समिती) • आजचा दर: <strong className="text-[#0F291E]">₹{rec.currentPrice}</strong> / क्विंटल
            </p>
          </div>

          {/* Expected Gain / Outcome Pill */}
          <div className="p-3 bg-[#FFFFFF] border-2 border-[#D8E6D8] rounded-2xl text-center shadow-xs shrink-0 self-start sm:self-auto min-w-[140px]">
            <span className="text-[10px] font-black text-[#526058] uppercase block">
              {isWait ? (isMr ? 'संभाव्य नफा वाढ' : 'Expected Gain') : (isMr ? 'निकाली किंमत' : 'Realization')}
            </span>
            <div className="text-xl font-black text-[#1B5E20]">
              {isWait ? `+${rec.expectedGainPct}%` : `₹${rec.currentPrice}`}
            </div>
            <span className="text-[10px] font-black text-emerald-800 block">
              {isWait ? `~+₹${Math.round(rec.projectedPrice - rec.currentPrice)}/Q जादा` : (isMr ? 'आज खात्रीशीर विक्री' : 'Guaranteed Today')}
            </span>
          </div>
        </div>

        {/* 2. Three-Horizon Breakdown Grid (7, 14, 30 Days) */}
        <div className="py-4 space-y-2">
          <div className="flex items-center justify-between text-xs font-black text-[#0F291E]">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-[#1B5E20]" />
              <span>{isMr ? '७, १४ आणि ३० दिवसांचे भाव अंदाज विश्लेषण:' : '7, 14 & 30-Day Outlook Breakdown:'}</span>
            </span>
            {onNavigateToForecast && (
              <button
                type="button"
                onClick={onNavigateToForecast}
                className="text-emerald-800 hover:text-[#1B5E20] font-black flex items-center gap-1 text-[11px] cursor-pointer"
              >
                <span>{isMr ? 'चार्ट पहा' : 'View Full Chart'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {rec.horizonBreakdown.map((item: HorizonBreakdownItem) => {
              const isSelectedHorizon = rec.waitDays === item.horizon;
              const isGain = item.expectedChangePct >= 0;

              return (
                <div
                  key={item.horizon}
                  className={`p-3.5 rounded-2xl border-2 transition-all ${
                    isSelectedHorizon
                      ? 'bg-[#FFFFFF] border-[#1B5E20] shadow-md ring-2 ring-[#1B5E20]/20'
                      : 'bg-[#FFFFFF]/80 border-[#D8E6D8]'
                  }`}
                >
                  <div className="flex items-center justify-between pb-1.5 border-b border-[#E1EBE1]">
                    <span className="text-xs font-black text-[#0F291E]">
                      {item.horizon} {isMr ? 'दिवस' : 'Days'}
                    </span>
                    {isSelectedHorizon && (
                      <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-950 text-[10px] font-black rounded-md border border-emerald-300">
                        {isMr ? '★ शिफारस' : '★ Optimal'}
                      </span>
                    )}
                  </div>

                  <div className="pt-2 flex items-baseline justify-between">
                    <div>
                      <div className="text-lg font-black text-[#0F291E]">
                        ₹{item.projectedPrice}
                      </div>
                      <span className="text-[10px] text-[#526058] font-bold">
                        अंदाजित भाव
                      </span>
                    </div>

                    <div className="text-right">
                      <span className={`inline-flex items-center gap-0.5 text-xs font-black ${isGain ? 'text-[#16A34A]' : 'text-[#DC2626]'}`}>
                        {isGain ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {isGain ? `+${item.expectedChangePct}%` : `${item.expectedChangePct}%`}
                      </span>
                      <span className="text-[10px] text-[#526058] block font-bold">
                        {item.confidence === 'High' ? (isMr ? 'उच्च खात्री' : 'High') : item.confidence === 'Moderate' ? (isMr ? 'मध्यम' : 'Mod') : (isMr ? 'कमी' : 'Low')}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. Reasoning Bullets */}
        <div className="bg-[#FFFFFF] p-3.5 rounded-2xl border border-[#D8E6D8] space-y-1.5 text-xs">
          <span className="text-[11px] font-black text-[#526058] uppercase tracking-wider block">
            {isMr ? '💡 निर्णयामागील प्रमुख कारणे (Reasoning):' : '💡 Why this recommendation:'}
          </span>
          <ul className="space-y-1 text-[#0F291E] font-bold">
            {(isMr ? rec.reasoningMr : rec.reasoning).map((bullet, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-[#1B5E20] font-black mt-0.5">•</span>
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 4. Immediate Farmer Feedback Bar */}
        <div className="mt-4 pt-3 border-t border-[#E1EBE1] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-[#526058] font-bold">
            <HelpCircle className="w-4 h-4 text-[#FFB300]" />
            <span>{isMr ? 'ही शिफारस तुम्हाला उपयुक्त वाटली का?' : 'Was this recommendation helpful?'}</span>
          </div>

          {immediateVoted === null ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleImmediateFeedback(true)}
                disabled={isSubmittingImmediate}
                className="px-3 py-1.5 bg-[#FFFFFF] border-2 border-emerald-300 hover:bg-emerald-50 text-emerald-950 rounded-xl font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
              >
                <ThumbsUp className="w-3.5 h-3.5 text-[#16A34A]" />
                <span>{isMr ? 'होय (Yes)' : 'Yes'}</span>
              </button>

              <button
                type="button"
                onClick={() => handleImmediateFeedback(false)}
                disabled={isSubmittingImmediate}
                className="px-3 py-1.5 bg-[#FFFFFF] border-2 border-rose-300 hover:bg-rose-50 text-rose-950 rounded-xl font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
              >
                <ThumbsDown className="w-3.5 h-3.5 text-[#DC2626]" />
                <span>{isMr ? 'नाही (No)' : 'No'}</span>
              </button>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-950 font-black rounded-xl border border-emerald-300">
              <Check className="w-3.5 h-3.5 text-[#16A34A]" />
              <span>{isMr ? 'अभिप्राय नोंदवला, धन्यवाद!' : 'Feedback recorded, thanks!'}</span>
            </div>
          )}
        </div>

      </Card>
    </div>
  );
};
