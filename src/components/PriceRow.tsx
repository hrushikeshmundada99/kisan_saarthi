import React from 'react';
import { useTranslation } from 'react-i18next';
import { type MandiPriceCardItem } from '../data/realData';
import { Button } from './Button';
import { MapPin, TrendingUp, TrendingDown, Minus, Clock, Scale, LineChart } from 'lucide-react';

interface PriceRowProps {
  card: MandiPriceCardItem;
  onCompareClick?: (crop: string, mandi: string) => void;
  onForecastClick?: (crop: string, mandi: string) => void;
}

const CROP_THEMES: Record<string, { emoji: string; badgeBg: string; text: string; border: string }> = {
  Onion: { emoji: '🧅', badgeBg: 'bg-purple-100', text: 'text-purple-950', border: 'border-purple-300' },
  Soybean: { emoji: '🌱', badgeBg: 'bg-emerald-100', text: 'text-emerald-950', border: 'border-emerald-300' },
  Cotton: { emoji: '☁️', badgeBg: 'bg-sky-100', text: 'text-sky-950', border: 'border-sky-300' },
  Sugarcane: { emoji: '🎋', badgeBg: 'bg-lime-100', text: 'text-lime-950', border: 'border-lime-300' },
  Pomegranate: { emoji: '🍎', badgeBg: 'bg-rose-100', text: 'text-rose-950', border: 'border-rose-300' },
  Wheat: { emoji: '🌾', badgeBg: 'bg-amber-100', text: 'text-amber-950', border: 'border-amber-300' },
  Tomato: { emoji: '🍅', badgeBg: 'bg-red-100', text: 'text-red-950', border: 'border-red-300' },
  Maize: { emoji: '🌽', badgeBg: 'bg-yellow-100', text: 'text-yellow-950', border: 'border-yellow-300' },
  Gram: { emoji: '🧆', badgeBg: 'bg-orange-100', text: 'text-orange-950', border: 'border-orange-300' },
  Bajra: { emoji: '🌾', badgeBg: 'bg-green-100', text: 'text-green-950', border: 'border-green-300' }
};

export const PriceRow: React.FC<PriceRowProps> = ({ card, onCompareClick, onForecastClick }) => {
  const { t, i18n } = useTranslation();

  const isPositive = card.priceChangePercent > 0;
  const isNegative = card.priceChangePercent < 0;

  const theme = CROP_THEMES[card.crop] || CROP_THEMES.Onion;

  return (
    <div className="bg-[#FFFFFF] border-2 border-[#E5DFD5] hover:border-[#2D5016] rounded-3xl p-4 sm:p-5 shadow-xs hover:shadow-md transition-all space-y-3 relative overflow-hidden group">
      
      {/* Accent left line indicator */}
      <div className="absolute left-0 top-0 bottom-0 w-2 bg-[#2D5016] group-hover:bg-[#D97706] transition-colors"></div>

      {/* Main Row Container */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pl-2">
        
        {/* Left: Crop Emoji + Crop Name + Mandi */}
        <div className="flex items-center gap-3.5 md:w-1/3">
          <div className={`w-13 h-13 rounded-2xl ${theme.badgeBg} ${theme.border} border-2 flex items-center justify-center font-black text-2xl shrink-0 shadow-xs group-hover:scale-110 transition-transform`}>
            {theme.emoji}
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-xl font-black text-[#2D5016]">
                {t(`crops.${card.crop}`, card.crop)}
              </h3>
              <span className={`px-2.5 py-0.5 rounded-lg border text-xs font-black ${theme.badgeBg} ${theme.text} ${theme.border}`}>
                {t(`mandis.${card.mandiName}`, card.mandiName)}
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs text-[#4B5563] mt-1 font-bold">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#D97706]" />
                {card.distanceFromKopargaon === 0 ? (i18n.language === 'mr' ? 'कोपरगाव (0 km)' : 'Kopargaon (0 km)') : `${card.distanceFromKopargaon} km अंतर`}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-[#6B7280]">
                <Clock className="w-3.5 h-3.5" />
                {card.lastUpdated}
              </span>
            </div>
          </div>
        </div>

        {/* Center: Bright Modal Price & Range Matrix */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-gradient-to-r from-[#FAF7F2] via-[#FFFFFF] to-[#FAF7F2] p-3.5 rounded-2xl border-2 border-[#E5DFD5] md:w-1/3 text-center shadow-xs">
          {/* Modal Price Highlight */}
          <div>
            <div className="text-[11px] font-extrabold text-[#4B5563] uppercase tracking-wider">
              {t('dashboard.modalPrice')}
            </div>
            <div className="text-2xl font-black text-[#2D5016] mt-0.5">
              ₹{card.modalPrice.toLocaleString('en-IN')}
            </div>
            <div className="text-[10px] font-bold text-[#4B5563]">रु / क्विंटल</div>
          </div>

          {/* Min - Max Range */}
          <div>
            <div className="text-[11px] font-extrabold text-[#4B5563] uppercase tracking-wider">
              {t('dashboard.minMax')}
            </div>
            <div className="text-xs font-black text-[#1F2937] mt-1">
              ₹{card.minPrice} - ₹{card.maxPrice}
            </div>
            <div className="text-[10px] text-[#4B5563] font-semibold">Range</div>
          </div>

          {/* Daily Change Badge */}
          <div className="col-span-2 sm:col-span-1 flex flex-col items-center justify-center border-t sm:border-t-0 sm:border-l-2 border-[#E5DFD5] pt-2 sm:pt-0">
            <div className="text-[11px] font-extrabold text-[#4B5563] uppercase mb-0.5">
              बदल (Trend)
            </div>
            {isPositive && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-950 border-2 border-emerald-400 shadow-xs">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-700" />
                +{card.priceChangeAmount} (+{card.priceChangePercent.toFixed(1)}%)
              </span>
            )}
            {isNegative && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-rose-100 text-rose-950 border-2 border-rose-400 shadow-xs">
                <TrendingDown className="w-3.5 h-3.5 text-rose-700" />
                {card.priceChangeAmount} ({card.priceChangePercent.toFixed(1)}%)
              </span>
            )}
            {!isPositive && !isNegative && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-950 border-2 border-amber-300 shadow-xs">
                <Minus className="w-3.5 h-3.5 text-amber-700" />
                ₹0 (0%)
              </span>
            )}
          </div>
        </div>

        {/* Right: Quick Action Buttons */}
        <div className="flex items-center gap-2 md:w-1/4 justify-end">
          {onCompareClick && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onCompareClick(card.crop, card.mandiName)}
              className="flex-1 text-xs font-extrabold"
            >
              <Scale className="w-4 h-4 text-[#2D5016]" />
              <span>तुलना करा</span>
            </Button>
          )}
          {onForecastClick && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => onForecastClick(card.crop, card.mandiName)}
              className="flex-1 text-xs font-extrabold"
            >
              <LineChart className="w-4 h-4 text-[#D97706]" />
              <span>अंदाज पहा</span>
            </Button>
          )}
        </div>

      </div>

    </div>
  );
};
