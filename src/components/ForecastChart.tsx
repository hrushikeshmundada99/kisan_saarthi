import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { type ForecastPointItem } from '../data/forecastData';
import { Card } from './Card';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';
import { Calendar, Sparkles, TrendingUp, TrendingDown } from 'lucide-react';

interface ForecastChartProps {
  crop: string;
  mandi: string;
  data: ForecastPointItem[];
  horizonDays: 7 | 14 | 30;
  onHorizonChange: (horizon: 7 | 14 | 30) => void;
}

export const ForecastChart: React.FC<ForecastChartProps> = ({
  crop,
  mandi,
  data,
  horizonDays,
  onHorizonChange
}) => {
  const { t } = useTranslation();

  // Slice data: past 30 days + horizon future points
  const filteredData = data.slice(0, 31 + horizonDays);

  // Compute overall forecast price direction (Up = Green, Down = Red)
  const { isRising, pctChange } = useMemo(() => {
    const todayPt = filteredData[30] || { actualPrice: 3950, predictedPrice: 3950 };
    const startPrice = todayPt.actualPrice || todayPt.predictedPrice || 3950;
    const lastPt = filteredData[filteredData.length - 1];
    const endPrice = lastPt?.predictedPrice || startPrice;
    const diff = endPrice - startPrice;
    const pct = parseFloat(((diff / startPrice) * 100).toFixed(1));
    return { isRising: pct >= 0, pctChange: pct };
  }, [filteredData]);

  const waveColor = isRising ? '#16A34A' : '#DC2626';

  return (
    <Card hoverable={false} className="space-y-4 border border-[#E1EBE1] rounded-3xl p-4 sm:p-6 shadow-sm bg-[#FFFFFF]">
      {/* Header & 3-Button Horizon Segmented Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E1EBE1]">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base sm:text-lg font-black text-[#0F291E] flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#1B5E20]" />
              <span>
                {t(`crops.${crop}`, crop)} ({t(`mandis.${mandi}`, mandi)}) - {horizonDays} दिवसांचा भाव अंदाज
              </span>
            </h3>

            {/* Dynamic Trend Badge: Green for Up, Red for Down */}
            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black border shadow-xs ${
              isRising
                ? 'bg-emerald-100 text-emerald-950 border-emerald-300'
                : 'bg-rose-100 text-rose-950 border-rose-300'
            }`}>
              {isRising ? (
                <>
                  <TrendingUp className="w-3.5 h-3.5 text-[#16A34A]" />
                  <span>तेजीचा अंदाज (+{Math.abs(pctChange)}%)</span>
                </>
              ) : (
                <>
                  <TrendingDown className="w-3.5 h-3.5 text-[#DC2626]" />
                  <span>घटीचा अंदाज (-{Math.abs(pctChange)}%)</span>
                </>
              )}
            </span>
          </div>

          <p className="text-xs sm:text-sm text-[#526058] font-semibold">
            {isRising
              ? '🟢 हिरवी लाईन: पुढील दिवसांत बाजारात भाव वाढण्याचा अंदाज आहे.'
              : '🔴 लाल लाईन: पुढील दिवसांत बाजारात भाव कमी होण्याचा अंदाज आहे.'}
          </p>
        </div>

        {/* 3-Button Segmented Horizon Control Group */}
        <div className="inline-flex items-center p-1 bg-[#F4F9F4] border border-[#D8E6D8] rounded-2xl self-start sm:self-auto shadow-xs">
          {([7, 14, 30] as const).map((days) => {
            const isActive = horizonDays === days;
            return (
              <button
                key={days}
                onClick={() => onHorizonChange(days)}
                className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-black transition-all duration-300 min-h-[38px] cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-[#1B5E20] to-[#2E7D32] text-[#FFFFFF] shadow-md scale-105'
                    : 'text-[#526058] hover:text-[#1B5E20] hover:bg-[#FFFFFF]'
                }`}
              >
                {days} दिवस
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Recharts ComposedChart Container with Dynamic Wave Line */}
      <div className="h-[300px] sm:h-[380px] w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={filteredData} margin={{ top: 15, right: 10, left: -15, bottom: 0 }}>
            <defs>
              <linearGradient id="forecastWaveConfidenceGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={waveColor} stopOpacity={0.25} />
                <stop offset="95%" stopColor={waveColor} stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="actualPriceAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1B5E20" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#1B5E20" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="4 4" stroke="#E1EBE1" vertical={false} />
            <XAxis
              dataKey="date"
              stroke="#526058"
              fontSize={11}
              fontWeight={700}
              tickLine={false}
              interval={horizonDays === 30 ? 4 : 2}
            />
            <YAxis
              stroke="#526058"
              fontSize={11}
              fontWeight={700}
              domain={['auto', 'auto']}
              tickFormatter={(val) => `₹${val}`}
              tickLine={false}
            />
            
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const pt = payload[0].payload as ForecastPointItem;

                  return (
                    <div className="bg-[#FFFFFF] border-2 border-[#1B5E20] p-3 rounded-2xl shadow-xl text-xs space-y-2 min-w-[200px]">
                      <div className="font-black text-[#0F291E] border-b border-[#E1EBE1] pb-1 flex items-center justify-between">
                        <span>तारीख: {label}</span>
                        {pt.predictedPrice !== null && pt.actualPrice === null && (
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-black border ${
                            isRising
                              ? 'bg-emerald-100 text-emerald-950 border-emerald-300'
                              : 'bg-rose-100 text-rose-950 border-rose-300'
                          }`}>
                            {isRising ? '📈 तेजी अंदाज' : '📉 मंदी अंदाज'}
                          </span>
                        )}
                      </div>

                      {pt.actualPrice !== null && (
                        <div className="text-[#1B5E20] font-black flex justify-between">
                          <span>मागील प्रत्यक्ष भाव:</span>
                          <span>₹{pt.actualPrice.toLocaleString('en-IN')}</span>
                        </div>
                      )}

                      {pt.predictedPrice !== null && (
                        <div className={`font-black flex justify-between ${
                          isRising ? 'text-[#16A34A]' : 'text-[#DC2626]'
                        }`}>
                          <span>अंदाजित भाव:</span>
                          <span>₹{pt.predictedPrice.toLocaleString('en-IN')}</span>
                        </div>
                      )}

                      {pt.upperBound !== null && pt.lowerBound !== null && (
                        <div className="text-[#526058] font-bold text-[11px] pt-1 border-t border-[#E1EBE1]">
                          अपेक्षित कक्षा: ₹{pt.lowerBound.toLocaleString('en-IN')} - ₹{pt.upperBound.toLocaleString('en-IN')}
                        </div>
                      )}
                    </div>
                  );
                }
                return null;
              }}
            />

            <Legend
              verticalAlign="top"
              height={36}
              formatter={(value) => {
                if (value === 'actualPrice') return 'मागील प्रत्यक्ष दर (Historical)';
                if (value === 'predictedPrice') return isRising ? '🟢 वाढीचा अंदाज (Rising Forecast)' : '🔴 घटीचा अंदाज (Falling Forecast)';
                if (value === 'upperBound') return 'संभाव्य अंदाज पट्टा (Confidence Band)';
                return value;
              }}
            />

            {/* Confidence Band Area */}
            <Area
              type="monotone"
              dataKey="upperBound"
              stroke="none"
              fill="url(#forecastWaveConfidenceGrad)"
              name="upperBound"
              isAnimationActive
              animationDuration={800}
            />

            {/* Historical Price Solid Line */}
            <Line
              type="monotone"
              dataKey="actualPrice"
              stroke="#1B5E20"
              strokeWidth={3}
              dot={{ r: 3.5, fill: '#1B5E20' }}
              activeDot={{ r: 6, fill: '#0F291E' }}
              name="actualPrice"
              connectNulls
              isAnimationActive
              animationDuration={800}
            />

            {/* Predicted Price Dynamic Wave Line (Green if rising, Red if falling) */}
            <Line
              type="monotone"
              dataKey="predictedPrice"
              stroke={waveColor}
              strokeWidth={3.5}
              strokeDasharray="5 5"
              dot={{ r: 4, fill: waveColor }}
              activeDot={{ r: 7, fill: waveColor }}
              name="predictedPrice"
              connectNulls
              isAnimationActive
              animationDuration={1000}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Explanatory Footer note */}
      <div className="flex items-center gap-2 p-3 bg-[#F4F9F4] rounded-2xl border border-[#D8E6D8] text-xs text-[#526058] font-bold">
        <Sparkles className="w-4 h-4 text-[#FFB300] shrink-0" />
        <span>
          {isRising
            ? '✅ भावात वाढ अपेक्षित असल्यामुळे माल योग्य वेळेत चांगल्या भावात विकता येईल.'
            : '⚠️ भावात घट होण्याची शक्यता असल्याने लवकरात लवकर विक्री करणे फायदेशीर ठरेल.'}
        </span>
      </div>
    </Card>
  );
};
