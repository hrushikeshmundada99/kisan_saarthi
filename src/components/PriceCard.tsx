import React from 'react';
import { useTranslation } from 'react-i18next';
import { type MandiPriceCardItem } from '../data/mockData';
import { Card } from './Card';
import { Button } from './Button';
import { MapPin, TrendingUp, TrendingDown, Minus, Clock, Store, LineChart as ChartIcon, Scale } from 'lucide-react';
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
  const { t, i18n } = useTranslation();

  const isPositive = card.priceChangePercent > 0;
  const isNegative = card.priceChangePercent < 0;

  const priceRange = card.maxPrice - card.minPrice;
  const modalOffsetPct = priceRange > 0 ? ((card.modalPrice - card.minPrice) / priceRange) * 100 : 50;

  const emoji = CROP_EMOJIS[card.crop] || '🌱';

  return (
    <Card
      hoverable
      className="relative overflow-hidden group h-full flex flex-col justify-between border-2 border-[#D8E6D8] hover:border-[#1B5E20] rounded-3xl p-5 shadow-xs hover:shadow-xl hover:shadow-emerald-950/10 hover:-translate-y-1.5 transition-all duration-300 ease-in-out bg-[#FFFFFF]"
    >
      {/* Nice Gradient Top Border */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#1B5E20] via-[#2E7D32] to-[#FFB300] rounded-t-3xl"></div>

      {/* Main Content Area */}
      <div className="space-y-3.5 pt-1">
        
        {/* Background Store Watermark */}
        <div className="absolute -right-4 -bottom-4 text-[#1B5E20]/5 group-hover:text-[#1B5E20]/10 transition-colors pointer-events-none">
          <Store className="w-28 h-28" />
        </div>

        {/* Header: Emoji Icon on Left + Mandi & Crop Title */}
        <div className="flex items-start justify-between gap-3">
          
          <div className="flex items-start gap-3">
            {/* Emoji Badge */}
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#E8F5E9] to-[#F4F9F4] border border-[#A5D6A7] flex items-center justify-center text-2xl shrink-0 shadow-xs group-hover:scale-110 transition-transform duration-300">
              {emoji}
            </div>

            <div>
              {/* Mandi Title */}
              <h3 className="text-lg font-black text-[#0F291E] leading-tight">
                {t(`mandis.${card.mandiName}`, card.mandiName)}
              </h3>

              {/* Crop Name */}
              <div className="text-xs font-black text-[#1B5E20] mt-0.5">
                {t(`crops.${card.crop}`, card.crop)}
              </div>

              {/* Distance Subtitle */}
              <div className="flex items-center gap-1 text-[11px] text-[#526058] font-bold mt-0.5">
                <MapPin className="w-3 h-3 text-[#FFB300] shrink-0" />
                <span>{card.distanceFromKopargaon === 0 ? 'कोपरगाव (0 km)' : `${card.distanceFromKopargaon} km ${t('dashboard.distanceFromKopargaon')}`}</span>
              </div>
            </div>
          </div>

          {/* Price Change Trend Badge */}
          <div className="shrink-0">
            {isPositive && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-950 border border-emerald-300 shadow-xs">
                <TrendingUp className="w-3.5 h-3.5 text-[#2E7D32]" />
                +{card.priceChangeAmount}
              </span>
            )}
            {isNegative && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-rose-100 text-rose-950 border border-rose-300 shadow-xs">
                <TrendingDown className="w-3.5 h-3.5 text-[#E53935]" />
                {card.priceChangeAmount}
              </span>
            )}
            {!isPositive && !isNegative && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-950 border border-amber-300 shadow-xs">
                <Minus className="w-3.5 h-3.5 text-amber-700" />
                ₹0
              </span>
            )}
          </div>

        </div>

        {/* Modal Price Main Highlight Box */}
        <div className="p-3.5 bg-gradient-to-r from-[#F4F9F4] via-[#FFFFFF] to-[#F4F9F4] rounded-2xl border border-[#D8E6D8] shadow-xs">
          <div className="text-[11px] font-black text-[#526058] uppercase tracking-wider">
            {t('dashboard.modalPrice')}
          </div>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-3xl font-black text-[#1B5E20]">
              ₹{card.modalPrice.toLocaleString('en-IN')}
            </span>
            <span className="text-xs font-bold text-[#526058]">/ क्विंटल</span>
          </div>
        </div>

        {/* Min - Max Range Bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-[#526058] font-bold">
            <span>{t('dashboard.minPrice')}: <strong className="text-[#0F291E]">₹{card.minPrice}</strong></span>
            <span>{t('dashboard.maxPrice')}: <strong className="text-[#0F291E]">₹{card.maxPrice}</strong></span>
          </div>
          <div className="relative w-full h-2 bg-[#D8E6D8] rounded-full overflow-hidden">
            <div
              className="absolute top-0 bottom-0 bg-gradient-to-r from-[#FFB300] via-[#4CAF50] to-[#1B5E20] rounded-full"
              style={{ width: '100%' }}
            />
            <div
              className="absolute top-0 bottom-0 w-2 bg-[#FFFFFF] border-2 border-[#0F291E] rounded-full shadow transform -translate-x-1/2"
              style={{ left: `${modalOffsetPct}%` }}
            />
          </div>
        </div>

        {/* 7-Day Forecast Sparkline Widget */}
        <div className="p-2.5 bg-[#F4F9F4] rounded-2xl border border-[#D8E6D8] space-y-0.5">
          <div className="flex items-center justify-between text-[11px] font-black text-[#526058]">
            <span>{t('dashboard.forecastSparkline')}</span>
            <span className="text-[#1B5E20] text-[10px]">७ दिवस</span>
          </div>
          
          <div className="h-12 w-full pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={card.history7Days} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
                <YAxis domain={['auto', 'auto']} hide />
                <XAxis dataKey="date" hide />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-[#FFFFFF] border border-[#D8E6D8] p-1.5 rounded-xl shadow-md text-xs font-bold">
                          <span className="text-[#526058]">{data.date}:</span>{' '}
                          <span className="text-[#1B5E20] font-black">₹{data.price}</span>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke={isNegative ? '#E53935' : '#1B5E20'}
                  strokeWidth={2.5}
                  dot={{ r: 2, fill: isNegative ? '#E53935' : '#1B5E20' }}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Card Footer Actions & Metadata */}
      <div className="mt-3.5 pt-3 border-t border-[#D8E6D8] space-y-2.5">
        <div className="flex items-center justify-between text-[11px] text-[#526058]">
          <span className="flex items-center gap-1 font-semibold">
            <Clock className="w-3 h-3" />
            {card.lastUpdated}
          </span>
          <span className="font-black text-[#1B5E20]">
            {i18n.language === 'mr' ? 'कृषी बाजार समिती क्षेत्र' : 'APMC Market Zone'}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {onCompareClick && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onCompareClick(card.crop, card.mandiName)}
              className="flex-1 text-xs font-black min-h-[38px]"
            >
              <Scale className="w-3.5 h-3.5 text-[#1B5E20]" />
              <span>{t('dashboard.compareMandis')}</span>
            </Button>
          )}
          {onForecastClick && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => onForecastClick(card.crop, card.mandiName)}
              className="flex-1 text-xs font-black min-h-[38px]"
            >
              <ChartIcon className="w-3.5 h-3.5 text-[#FFB300]" />
              <span>{t('dashboard.viewFullForecast')}</span>
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};
