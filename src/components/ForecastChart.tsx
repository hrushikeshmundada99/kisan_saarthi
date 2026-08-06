import React from 'react';
import { useTranslation } from 'react-i18next';
import { type ForecastPointItem } from '../data/mockForecastData';
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
import { Calendar, Sparkles } from 'lucide-react';

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

  return (
    <Card hoverable={false} className="space-y-4 border border-[#E1EBE1] rounded-2xl p-6 shadow-sm bg-[#FFFFFF]">
      {/* Header & 3-Button Horizon Segmented Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E1EBE1]">
        <div>
          <h3 className="text-lg font-extrabold text-[#1B4332] flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#2E7D32]" />
            <span>
              {t(`crops.${crop}`, crop)} ({t(`mandis.${mandi}`, mandi)}) - {horizonDays} {t('forecast.days7').replace('7 ', '')} {t('forecast.predicted')}
            </span>
          </h3>
          <p className="text-sm text-[#6B7280] font-medium mt-0.5">
            ऐतिहासिक दर (Solid Green Line) + AI अंदाजित भाव (Dashed Gold Line)
          </p>
        </div>

        {/* 3-Button Segmented Horizon Control Group */}
        <div className="inline-flex items-center p-1.5 bg-[#F7FBF7] border border-[#E1EBE1] rounded-2xl self-start sm:self-auto shadow-xs">
          {([7, 14, 30] as const).map((days) => {
            const isActive = horizonDays === days;
            return (
              <button
                key={days}
                onClick={() => onHorizonChange(days)}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all duration-300 min-h-[38px] cursor-pointer ${
                  isActive
                    ? 'bg-[#2E7D32] text-[#FFFFFF] shadow-md scale-105'
                    : 'text-[#6B7280] hover:text-[#2E7D32] hover:bg-[#FFFFFF]'
                }`}
              >
                {days} {t('forecast.days7').replace('7 ', '')}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Recharts ComposedChart Container */}
      <div className="h-[340px] sm:h-[400px] w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={filteredData} margin={{ top: 15, right: 15, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="forecastConfidenceGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FFC107" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#FFC107" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="actualPriceGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2E7D32" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#2E7D32" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="4 4" stroke="#E1EBE1" vertical={false} />
            <XAxis
              dataKey="date"
              stroke="#6B7280"
              fontSize={11}
              fontWeight={700}
              tickLine={false}
              interval={horizonDays === 30 ? 4 : 2}
            />
            <YAxis
              stroke="#6B7280"
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
                    <div className="bg-[#FFFFFF] border-2 border-[#81C784] p-3.5 rounded-2xl shadow-xl text-xs space-y-2 min-w-[190px]">
                      <div className="font-extrabold text-[#1B4332] border-b border-[#E1EBE1] pb-1.5 flex items-center justify-between">
                        <span>तारीख: {label}</span>
                        {pt.predictedPrice !== null && pt.actualPrice === null && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-[#FFC107]/20 text-[#1B4332] border border-[#FFC107]/40">
                            अंदाजित (AI Forecast)
                          </span>
                        )}
                      </div>

                      {pt.actualPrice !== null && (
                        <div className="text-[#2E7D32] font-black flex justify-between">
                          <span>ऐतिहासिक भाव:</span>
                          <span>₹{pt.actualPrice.toLocaleString('en-IN')}</span>
                        </div>
                      )}

                      {pt.predictedPrice !== null && (
                        <div className="text-[#D97706] font-black flex justify-between">
                          <span>अंदाजित भाव:</span>
                          <span>₹{pt.predictedPrice.toLocaleString('en-IN')}</span>
                        </div>
                      )}

                      {pt.upperBound !== null && pt.lowerBound !== null && (
                        <div className="text-[#6B7280] font-bold text-[11px] pt-1 border-t border-[#E1EBE1]">
                          संभाव्य कक्षा: ₹{pt.lowerBound.toLocaleString('en-IN')} - ₹{pt.upperBound.toLocaleString('en-IN')}
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
              height={40}
              formatter={(value) => {
                if (value === 'actualPrice') return t('forecast.historical');
                if (value === 'predictedPrice') return t('forecast.predicted');
                if (value === 'upperBound') return t('forecast.confidenceRange');
                return value;
              }}
            />

            {/* Confidence Band Area */}
            <Area
              type="monotone"
              dataKey="upperBound"
              stroke="none"
              fill="url(#forecastConfidenceGrad)"
              name="upperBound"
              isAnimationActive
              animationDuration={1000}
            />

            {/* Historical Price Solid Line */}
            <Line
              type="monotone"
              dataKey="actualPrice"
              stroke="#2E7D32"
              strokeWidth={3.5}
              dot={{ r: 4, fill: '#2E7D32' }}
              activeDot={{ r: 7, fill: '#1B4332' }}
              name="actualPrice"
              connectNulls
              isAnimationActive
              animationDuration={1200}
            />

            {/* Predicted Price Dashed Line */}
            <Line
              type="monotone"
              dataKey="predictedPrice"
              stroke="#FFC107"
              strokeWidth={3.5}
              strokeDasharray="6 6"
              dot={{ r: 4.5, fill: '#FFC107' }}
              activeDot={{ r: 8, fill: '#D97706' }}
              name="predictedPrice"
              connectNulls
              isAnimationActive
              animationDuration={1400}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Explanatory Footer note */}
      <div className="flex items-center gap-2 p-3 bg-[#F7FBF7] rounded-2xl border border-[#E1EBE1] text-xs text-[#6B7280] font-medium">
        <Sparkles className="w-4 h-4 text-[#FFC107] shrink-0" />
        <span>
          पिवळी फिकट छटा (Shaded Area) AI मॉडेलचे कमाल आणि किमान दरांचे संभाव्य पट्टे (Confidence Band) दर्शवते.
        </span>
      </div>
    </Card>
  );
};
