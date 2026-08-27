import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine
} from 'recharts';
import { type MandiTrendChartPoint } from '../utils/forecastEngine';
import { Sparkles, Calendar } from 'lucide-react';

interface MandiPriceTrendChartProps {
  data: MandiTrendChartPoint[];
  cropName: string;
  apmcName: string;
  horizonDays: 7 | 14 | 30;
  onHorizonChange: (days: 7 | 14 | 30) => void;
}

export const MandiPriceTrendChart: React.FC<MandiPriceTrendChartProps> = ({
  data,
  cropName,
  apmcName,
  horizonDays,
  onHorizonChange
}) => {
  const { i18n } = useTranslation();
  const isMr = i18n.language === 'mr';

  // Find index of "Today" for reference line
  const todayPoint = data.find((pt) => pt.isToday);
  const todayDateLabel = todayPoint?.date || '';

  return (
    <div className="space-y-4 bg-[#FFFFFF] border-2 border-[#D8E6D8] rounded-3xl p-4 sm:p-6 shadow-md">
      
      {/* Chart Top Header & Horizon Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E2ECE2]">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base sm:text-lg font-black text-[#0F291E] flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#1B5E20]" />
              <span>
                {cropName} ({apmcName}) — {isMr ? 'बाजार भाव कल व अंदाज' : 'Price Trend & Forecast'}
              </span>
            </h3>
            <span className="px-2.5 py-0.5 rounded-full bg-[#1B5E20]/10 text-[#1B5E20] text-xs font-black flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#FFB300]" />
              Agmarknet Daily Data
            </span>
          </div>
          <p className="text-xs text-[#526058] font-bold mt-1">
            {isMr
              ? 'स्थानिक बाजार समितीतील दररोजची आवक व दर (रु/क्विंटल)'
              : 'Daily arrivals & modal rates reported by mandi (₹/Quintal)'}
          </p>
        </div>

        {/* 7-Day vs 14-Day vs 30-Day Horizon Segmented Selector */}
        <div className="flex items-center gap-1.5 p-1 bg-[#F4F9F4] border border-[#D8E6D8] rounded-2xl self-start sm:self-auto">
          <span className="text-[11px] font-black text-[#526058] px-2">
            {isMr ? 'अंदाज कालावधी:' : 'Forecast Horizon:'}
          </span>
          {([7, 14, 30] as const).map((days) => {
            const isActive = horizonDays === days;
            return (
              <button
                key={days}
                onClick={() => onHorizonChange(days)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#1B5E20] text-[#FFFFFF] shadow-sm'
                    : 'text-[#526058] hover:text-[#1B5E20] hover:bg-[#E8F5E9]'
                }`}
              >
                {days} {isMr ? 'दिवस' : 'Days'}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Chart Area */}
      <div className="h-[320px] sm:h-[400px] w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 20, right: 15, left: -10, bottom: 25 }}>
            <defs>
              {/* Historical Min-Max Price Range Gradient */}
              <linearGradient id="historicalRangeGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1B5E20" stopOpacity={0.22} />
                <stop offset="95%" stopColor="#1B5E20" stopOpacity={0.03} />
              </linearGradient>

              {/* Forecast Widening Confidence Band Gradient */}
              <linearGradient id="forecastConfidenceGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#D97706" stopOpacity={0.28} />
                <stop offset="95%" stopColor="#D97706" stopOpacity={0.04} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="4 4" stroke="#E2ECE2" vertical={false} />

            <XAxis
              dataKey="date"
              stroke="#526058"
              fontSize={11}
              fontWeight={700}
              tickLine={false}
              axisLine={{ stroke: '#D8E6D8' }}
              interval="preserveStartEnd"
              minTickGap={24}
              angle={-20}
              textAnchor="end"
            />

            <YAxis
              stroke="#526058"
              fontSize={11}
              fontWeight={700}
              domain={['auto', 'auto']}
              tickFormatter={(val) => `₹${val}`}
              tickLine={false}
              axisLine={{ stroke: '#D8E6D8' }}
            />

            <Tooltip content={<CustomMandiTooltip isMr={isMr} />} />

            {/* Shaded Band 1: Historical Min-Max Price Range */}
            <Area
              type="monotone"
              dataKey="priceRange"
              stroke="none"
              fill="url(#historicalRangeGrad)"
              name="Historical Price Range"
              connectNulls={false}
            />

            {/* Shaded Band 2: Forecast Widening Confidence Interval */}
            <Area
              type="monotone"
              dataKey="confidenceBand"
              stroke="none"
              fill="url(#forecastConfidenceGrad)"
              name="Forecast Confidence Interval"
              connectNulls
            />

            {/* Line 1: Historical Modal Price (Solid Dark Green, gaps for no-trade days) */}
            <Line
              type="monotone"
              dataKey="modalPrice"
              stroke="#1B5E20"
              strokeWidth={3}
              dot={{ r: 3, fill: '#1B5E20', strokeWidth: 1, stroke: '#FFFFFF' }}
              activeDot={{ r: 6, fill: '#1B5E20', stroke: '#FFB300', strokeWidth: 2 }}
              name="Historical Modal Price"
              connectNulls={false}
            />

            {/* Line 2: Forecast Modal Price (Dashed Amber) */}
            <Line
              type="monotone"
              dataKey="forecastModal"
              stroke="#D97706"
              strokeWidth={3}
              strokeDasharray="6 4"
              dot={{ r: 3.5, fill: '#D97706', strokeWidth: 1, stroke: '#FFFFFF' }}
              activeDot={{ r: 6.5, fill: '#D97706', stroke: '#FFFFFF', strokeWidth: 2 }}
              name="Forecasted Price"
              connectNulls
            />

            {/* Vertical Reference Line for Today */}
            {todayDateLabel && (
              <ReferenceLine
                x={todayDateLabel}
                stroke="#1B5E20"
                strokeDasharray="3 3"
                strokeWidth={2}
                label={{
                  value: isMr ? 'आज' : 'Today',
                  position: 'top',
                  fill: '#1B5E20',
                  fontSize: 11,
                  fontWeight: 900
                }}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Explicit Custom Chart Legend */}
      <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 pt-2 pb-1 text-xs font-bold text-[#526058] border-t border-[#E2ECE2]">
        <div className="flex items-center gap-2">
          <span className="w-5 h-1 bg-[#1B5E20] rounded-full inline-block" />
          <span>{isMr ? 'मागील प्रत्यक्ष भाव (Modal Rate)' : 'Historical Price (Modal)'}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="w-4 h-3 bg-[#1B5E20]/20 rounded-xs border border-[#1B5E20]/40 inline-block" />
          <span>{isMr ? 'कमी-जास्त भाव पट्टा (Min-Max Range)' : 'Historical Price Range (Min-Max)'}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="w-5 h-1 border-t-2 border-dashed border-[#D97706] inline-block" />
          <span>{isMr ? 'अंदाजित भाव (AI Forecast)' : 'Forecast Price'}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="w-4 h-3 bg-[#D97706]/25 rounded-xs border border-[#D97706]/40 inline-block" />
          <span>{isMr ? 'संभाव्य अंदाज पट्टा (Confidence Band)' : 'Forecast Confidence Band'}</span>
        </div>
      </div>

    </div>
  );
};

// Custom Hover Tooltip
const CustomMandiTooltip = ({ active, payload, isMr }: any) => {
  if (!active || !payload || !payload.length) return null;

  const dataPoint: MandiTrendChartPoint = payload[0].payload;
  const isForecast = dataPoint.isForecast;

  return (
    <div className="bg-[#0F291E] text-[#FFFFFF] border-2 border-[#FFB300] rounded-2xl p-3 shadow-xl max-w-[240px] space-y-2 text-xs">
      <div className="flex items-center justify-between border-b border-emerald-800/80 pb-1.5">
        <span className="font-black text-[#FFB300]">{dataPoint.fullDate || dataPoint.date}</span>
        <span
          className={`px-2 py-0.5 rounded-full font-black text-[10px] uppercase ${
            isForecast ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'
          }`}
        >
          {dataPoint.isToday
            ? (isMr ? 'आजचे दर' : 'Today')
            : isForecast
            ? (isMr ? 'अंदाज' : 'Forecast')
            : (isMr ? 'प्रत्यक्ष' : 'Historical')}
        </span>
      </div>

      <div className="space-y-1">
        {/* Modal Price */}
        {!isForecast && dataPoint.modalPrice && (
          <div className="flex items-center justify-between font-extrabold text-sm">
            <span className="text-emerald-300">{isMr ? 'दररोजचा भाव:' : 'Modal Price:'}</span>
            <span className="text-[#FFFFFF]">₹{dataPoint.modalPrice.toLocaleString('en-IN')} /क्विंटल</span>
          </div>
        )}

        {/* Forecast Price */}
        {isForecast && dataPoint.forecastModal && (
          <div className="flex items-center justify-between font-extrabold text-sm">
            <span className="text-amber-300">{isMr ? 'अंदाजित भाव:' : 'Forecast Price:'}</span>
            <span className="text-[#FFFFFF]">₹{dataPoint.forecastModal.toLocaleString('en-IN')} /क्विंटल</span>
          </div>
        )}

        {/* Min & Max Price Range */}
        {!isForecast && dataPoint.minPrice && dataPoint.maxPrice && (
          <div className="flex items-center justify-between text-[11px] text-emerald-200">
            <span>{isMr ? 'कमी - जास्त भाव:' : 'Min - Max Range:'}</span>
            <span className="font-bold">₹{dataPoint.minPrice} - ₹{dataPoint.maxPrice}</span>
          </div>
        )}

        {/* Forecast Confidence Band */}
        {isForecast && dataPoint.confidenceMin && dataPoint.confidenceMax && (
          <div className="flex items-center justify-between text-[11px] text-amber-200">
            <span>{isMr ? 'अंदाज पट्टा:' : 'Confidence Range:'}</span>
            <span className="font-bold">₹{dataPoint.confidenceMin} - ₹{dataPoint.confidenceMax}</span>
          </div>
        )}

        {/* Arrival volume */}
        {dataPoint.arrival && (
          <div className="flex items-center justify-between text-[11px] text-emerald-300/80 pt-1 border-t border-emerald-900">
            <span>{isMr ? 'एकूण आवक:' : 'Arrival Volume:'}</span>
            <span className="font-bold">{dataPoint.arrival.toLocaleString('en-IN')} {isMr ? 'क्विंटल' : 'Qtls'}</span>
          </div>
        )}
      </div>
    </div>
  );
};
