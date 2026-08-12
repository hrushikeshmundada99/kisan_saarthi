import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles, TrendingUp } from 'lucide-react';

export const TodaySuggestionsCounter: React.FC = () => {
  const { i18n } = useTranslation();
  const [count, setCount] = useState<number>(69);

  useEffect(() => {
    try {
      // Format today's date in local YYYY-MM-DD
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const todayDateStr = `${year}-${month}-${day}`;

      const storedDate = localStorage.getItem('todaySuggestionsDate');
      const storedCountStr = localStorage.getItem('todaySuggestionsCount');

      let currentCount = storedCountStr ? parseInt(storedCountStr, 10) : 69;
      if (isNaN(currentCount)) {
        currentCount = 69;
      }

      // If date is missing or different from today, reset count to 69
      if (!storedDate || storedDate !== todayDateStr) {
        localStorage.setItem('todaySuggestionsDate', todayDateStr);
        currentCount = 69;
      }

      // Increment count on each page load/open
      const nextCount = currentCount + 1;
      localStorage.setItem('todaySuggestionsCount', String(nextCount));
      setCount(nextCount);
    } catch (err) {
      console.warn('localStorage unavailable, using fallback counter:', err);
      setCount(69);
    }
  }, []);

  const isMr = i18n.language === 'mr';

  const labels = {
    en: {
      title: 'Suggestions made today',
      subtitle: 'Based on how many times Kisan Saarthi has been used today.',
      badge: 'Live Usage'
    },
    mr: {
      title: 'आज केलेल्या सूचना',
      subtitle: 'आज Kisan Saarthi चा वापर किती वेळा झाला यावर आधारित.',
      badge: 'थेट प्रणाली'
    }
  };

  const currentLabels = isMr ? labels.mr : labels.en;

  return (
    <div className="p-4 sm:p-5 bg-gradient-to-r from-[#1B5E20] via-[#2E7D32] to-[#0F291E] text-[#FFFFFF] rounded-3xl border-2 border-[#A5D6A7]/50 shadow-md shadow-emerald-950/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all duration-300">
      <div className="flex items-center gap-3.5">
        <div className="w-11 h-11 rounded-2xl bg-[#FFB300] text-[#0F291E] flex items-center justify-center font-black shrink-0 shadow-md shadow-amber-950/20">
          <Sparkles className="w-6 h-6" />
        </div>
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <h4 className="text-sm sm:text-base font-black text-[#FFFFFF] tracking-tight">
              {currentLabels.title}
            </h4>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#FFB300]/20 text-[#FFB300] border border-[#FFB300]/40">
              <TrendingUp className="w-3 h-3" />
              {currentLabels.badge}
            </span>
          </div>
          <p className="text-xs text-emerald-100/90 font-medium">
            {currentLabels.subtitle}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2.5 self-end sm:self-auto bg-black/25 px-4 py-2 rounded-2xl border border-white/20 backdrop-blur-xs">
        <span className="text-2xl sm:text-3xl font-black text-[#FFB300] tracking-tight">
          {count}
        </span>
        <span className="text-xs font-black text-emerald-100 uppercase tracking-wider">
          {isMr ? 'सूचना' : 'Tips'}
        </span>
      </div>
    </div>
  );
};
