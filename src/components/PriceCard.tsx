import React from 'react';
import { useTranslation } from 'react-i18next';
import { type MandiPriceCardItem } from '../data/realData';
import { Card } from './Card';
import { Button } from './Button';
import { MapPin, TrendingUp, TrendingDown, Minus, Clock, Store, LineChart as ChartIcon, Scale } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, Tooltip, YAxis, XAxis } from 'recharts';

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
  Tomato: '🍅',
  Maize: '🌽',
  Gram: '🧆',
  Bajra: '🌾'
};

export const PriceCard: React.FC<PriceCardProps> = ({ card, onCompareClick, onForecastClick }) => {
  const { t, i18n } = useTranslation();

  // Price direction: Green if increasing or zero, Red if decreasing
  const isPositive = card.priceChangeAmount > 0;
  const isNegative = card.priceChangeAmount < 0;

  // Determine wave color & gradient ID based on price slope
  const waveColor = isNegative ? '#DC2626' : '#16A34A';
  const gradientId = `wave-grad-${card.id}`;

  const priceRange = card.maxPrice - card.minPrice;
  const modalOffsetPct = priceRange > 0 ? ((card.modalPrice - card.minPrice) / priceRange) * 100 : 50;

  const emoji = CROP_EMOJIS[card.crop] || '🌱';

  return (
    <Card
      hoverable
      className="relative overflow-hidden group h-full flex flex-col justify-between border-2 border-[#D8E6D8] hover:border-[#1B5E20] rounded-3xl p-4 sm:p-5 shadow-xs hover:shadow-xl hover:shadow-emerald-950/10 hover:-translate-y-1.5 transition-all duration-300 ease-in-out bg-[#FFFFFF]"
    >
      {/* Dynamic Colored Top Border */}
      <div className={`absolute top-0 left-0 right-0 h-1.5 rounded-t-3xl ${
        isNegative
          ? 'bg-gradient-to-r from-[#DC2626] via-[#EF4444] to-[#F87171]'
          : 'bg-gradient-to-r from-[#1B5E20] via-[#2E7D32] to-[#FFB300]'
      }`} />

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
                <TrendingUp className="w-3.5 h-3.5 text-[#16A34A]" />
                +{card.priceChangeAmount}
              </span>
            )}
            {isNegative && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-rose-100 text-rose-950 border border-rose-300 shadow-xs">
                <TrendingDown className="w-3.5 h-3.5 text-[#DC2626]" />
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

        {/* Responsive 7-Day Wave Sparkline: Green Wave for Increase, Red Wave for Decrease */}
        <div className={`p-2.5 rounded-2xl border space-y-1 transition-colors ${
          isNegative
            ? 'bg-rose-50/50 border-rose-200'
            : 'bg-[#F4F9F4] border-[#D8E6D8]'
        }`}>
          <div className="flex items-center justify-between text-[11px] font-black">
            <span className={isNegative ? 'text-rose-950' : 'text-[#0F291E]'}>
              {t('dashboard.forecastSparkline')}
            </span>
            <span className={`text-[10px] px-2 py-0.2 rounded-md font-extrabold flex items-center gap-1 ${
              isNegative
                ? 'bg-rose-100 text-rose-950 border border-rose-300'
                : 'bg-emerald-100 text-emerald-950 border border-emerald-300'
            }`}>
              {isNegative ? '📉 मंदी (दर कमी)' : '📈 तेजी (दर वाढ)'}
            </span>
          </div>
          
          <div className="h-14 w-full pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={card.history7Days} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
                <defs>
                  <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={waveColor} stopOpacity={0.35} />
                    <stop offset="95%" stopColor={waveColor} stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <YAxis domain={['auto', 'auto']} hide />
                <XAxis dataKey="date" hide />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-[#FFFFFF] border-2 border-[#1B5E20] p-1.5 rounded-xl shadow-md text-xs font-bold">
                          <span className="text-[#526058]">{data.date}:</span>{' '}
                          <span className="text-[#1B5E20] font-black">₹{data.price}</span>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke={waveColor}
                  strokeWidth={2.8}
                  fill={`url(#${gradientId})`}
                  dot={{ r: 2.5, fill: waveColor }}
                  activeDot={{ r: 5, fill: waveColor }}
                />
              </AreaChart>
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
