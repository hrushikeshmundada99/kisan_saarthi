import React from 'react';
import { useTranslation } from 'react-i18next';
import { type MandiPriceCardItem } from '../data/mockData';
import { Card } from './Card';
import { Button } from './Button';
import { MapPin, TrendingUp, TrendingDown, Minus, Clock, Store } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, Tooltip, YAxis, XAxis } from 'recharts';

interface PriceCardProps {
  card: MandiPriceCardItem;
  onCompareClick?: (crop: string, mandi: string) => void;
  onForecastClick?: (crop: string, mandi: string) => void;
}

const CROP_EMOJIS: Record<string, string> = {
  Onion: '🧅',
  Soybean: '🌱',
  Cotton: '☁️',
  Sugarcane: '🎋',
  Pomegranate: '🍎',
  Wheat: '🌾',
  Tomato: '🍅'
};

export const PriceCard: React.FC<PriceCardProps> = ({ card, onCompareClick, onForecastClick }) => {
  const { t } = useTranslation();

  const isPositive = card.priceChangePercent > 0;
  const isNegative = card.priceChangePercent < 0;

  const priceRange = card.maxPrice - card.minPrice;
  const modalOffsetPct = priceRange > 0 ? ((card.modalPrice - card.minPrice) / priceRange) * 100 : 50;

  const emoji = CROP_EMOJIS[card.crop] || '🌱';

  return (
    <Card
      hoverable
      className="relative overflow-hidden group h-full flex flex-col justify-between border border-[#E1EBE1] rounded-2xl pt-5 pb-6 px-6 shadow-sm shadow-emerald-950/5 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-emerald-950/10 hover:border-[#81C784] transition-all duration-300 ease-in-out bg-[#FFFFFF]"
    >
      {/* 1. Nice Gradient Top Border */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#2E7D32] via-[#4CAF50] to-[#FFC107] rounded-t-2xl"></div>

      {/* Main Content Area */}
      <div className="space-y-4 pt-1">
        
        {/* Background Store Watermark */}
        <div className="absolute -right-4 -bottom-4 text-[#2E7D32]/5 group-hover:text-[#2E7D32]/10 transition-colors pointer-events-none">
          <Store className="w-28 h-28" />
        </div>

        {/* 2 & 3. Header: Icon on Left, Large Title & Small Subtitle */}
        <div className="flex items-start justify-between gap-3">
          
          {/* Icon on Left + Mandi Title & Subtitle */}
          <div className="flex items-start gap-3">
            {/* Left Crop Icon Badge */}
            <div className="w-12 h-12 rounded-2xl bg-[#E8F5E9] border border-[#81C784]/40 flex items-center justify-center text-2xl shrink-0 shadow-xs group-hover:scale-105 transition-transform duration-300">
              {emoji}
            </div>

            <div>
              {/* Large Title */}
              <h3 className="text-xl font-extrabold text-[#1B4332] leading-tight">
                {t(`mandis.${card.mandiName}`, card.mandiName)}
              </h3>

              {/* Crop Name */}
              <div className="text-xs font-extrabold text-[#2E7D32] mt-0.5">
                {t(`crops.${card.crop}`, card.crop)}
              </div>

              {/* Small Subtitle: Distance */}
              <div className="flex items-center gap-1 text-xs text-[#6B7280] font-medium mt-1">
                <MapPin className="w-3.5 h-3.5 text-[#FFC107] shrink-0" />
                <span>{card.distanceFromKopargaon === 0 ? 'कोपरगाव (0 km)' : `${card.distanceFromKopargaon} km ${t('dashboard.distanceFromKopargaon')}`}</span>
              </div>
            </div>
          </div>

          {/* Price Change Trend Badge */}
          <div className="shrink-0">
            {isPositive && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-950 border border-emerald-300 shadow-xs">
                <TrendingUp className="w-3.5 h-3.5 text-[#43A047]" />
                +{card.priceChangeAmount}
              </span>
            )}
            {isNegative && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold bg-rose-100 text-rose-950 border border-rose-300 shadow-xs">
                <TrendingDown className="w-3.5 h-3.5 text-[#E53935]" />
                {card.priceChangeAmount}
              </span>
            )}
            {!isPositive && !isNegative && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold bg-amber-100 text-amber-950 border border-amber-300 shadow-xs">
                <Minus className="w-3.5 h-3.5 text-amber-700" />
                ₹0
              </span>
            )}
          </div>

        </div>

        {/* Modal Price Main Highlight Box */}
        <div className="p-4 bg-[#F7FBF7] rounded-2xl border border-[#E1EBE1] shadow-xs">
          <div className="text-xs font-extrabold text-[#6B7280] uppercase tracking-wider">
            {t('dashboard.modalPrice')}
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-3xl font-black text-[#2E7D32]">
              ₹{card.modalPrice.toLocaleString('en-IN')}
            </span>
            <span className="text-xs font-bold text-[#6B7280]">/ क्विंटल</span>
          </div>
        </div>

        {/* Min - Max Range Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-[#6B7280] font-semibold">
            <span>{t('dashboard.minPrice')}: <strong className="text-[#1B4332]">₹{card.minPrice}</strong></span>
            <span>{t('dashboard.maxPrice')}: <strong className="text-[#1B4332]">₹{card.maxPrice}</strong></span>
          </div>
          <div className="relative w-full h-2 bg-[#E1EBE1] rounded-full overflow-hidden">
            <div
              className="absolute top-0 bottom-0 bg-gradient-to-r from-[#FFC107] via-[#4CAF50] to-[#2E7D32] rounded-full"
              style={{ width: '100%' }}
            />
            <div
              className="absolute top-0 bottom-0 w-2 bg-[#FFFFFF] border-2 border-[#1B4332] rounded-full shadow transform -translate-x-1/2"
              style={{ left: `${modalOffsetPct}%` }}
            />
          </div>
        </div>

        {/* 7-Day Forecast Sparkline Widget */}
        <div className="p-3 bg-[#F7FBF7] rounded-2xl border border-[#E1EBE1] space-y-1">
          <div className="flex items-center justify-between text-[11px] font-extrabold text-[#6B7280]">
            <span>7-दिवसीय भाव ट्रेंड</span>
            <span className="text-[#2E7D32]">Sparkline</span>
          </div>
          
          <div className="h-14 w-full pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={card.history7Days} margin={{ top: 4, right: 4, left: 4, bottom: 4 }}>
                <YAxis domain={['auto', 'auto']} hide />
                <XAxis dataKey="date" hide />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-[#FFFFFF] border border-[#E1EBE1] p-1.5 rounded-xl shadow-md text-xs font-bold">
                          <span className="text-[#6B7280]">{data.date}:</span>{' '}
                          <span className="text-[#2E7D32]">₹{data.price}</span>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke={isNegative ? '#E53935' : '#2E7D32'}
                  strokeWidth={2.5}
                  dot={{ r: 2, fill: isNegative ? '#E53935' : '#2E7D32' }}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Card Footer Actions & Metadata */}
      <div className="mt-4 pt-3 border-t border-[#E1EBE1] space-y-3">
        <div className="flex items-center justify-between text-xs text-[#6B7280]">
          <span className="flex items-center gap-1 text-[11px] font-semibold">
            <Clock className="w-3.5 h-3.5 text-[#6B7280]" />
            {card.lastUpdated}
          </span>
          <span className="text-[11px] font-extrabold text-[#2E7D32]">APMC Zone</span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {onCompareClick && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onCompareClick(card.crop, card.mandiName)}
              className="flex-1 text-xs font-bold"
            >
              {t('dashboard.compareMandis')}
            </Button>
          )}
          {onForecastClick && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => onForecastClick(card.crop, card.mandiName)}
              className="flex-1 text-xs font-bold"
            >
              {t('dashboard.viewFullForecast')}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};
