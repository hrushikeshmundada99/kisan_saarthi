import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  MOCK_TRENDS_DAILY_DATA,
  getMonthlyAveragesForCrop,
  type DailyTrendItem,
  type MonthlyAverageItem
} from '../data/mockTrendsData';
import { CropSelector } from '../components/CropSelector';
import { MandiSelector } from '../components/MandiSelector';
import { Card } from '../components/Card';
import { EmptyState } from '../components/EmptyState';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';
import {
  BarChart3,
  Calendar,
  Flame,
  TrendingUp,
  Lightbulb,
  ShieldCheck,
  AlertCircle,
  Sparkles
} from 'lucide-react';

type RangeOption = '7d' | '30d' | '3m' | '1y';

export const MarketTrendsPage: React.FC = () => {
  const { t, i18n } = useTranslation();

  // Read initial crop and mandi state from localStorage or default to Onion & Kopargaon
  const [crop, setCrop] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('SELECTED_CROPS_FILTER');
      if (saved) {
        const arr = JSON.parse(saved);
        if (Array.isArray(arr) && arr.length > 0) return arr[0];
      }
    } catch {}
    return 'Onion';
  });

  const [mandi, setMandi] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('LAST_SELECTED_MANDI');
      if (saved) return saved;
    } catch {}
    return 'Kopargaon';
  });

  const [range, setRange] = useState<RangeOption>('30d');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Persist selections
  useEffect(() => {
    try {
      localStorage.setItem('LAST_SELECTED_MANDI', mandi);
    } catch {}
  }, [mandi]);

  // Simulate loading skeleton
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(timer);
  }, [crop, mandi, range]);

  // Slice daily dataset based on selected range (7d, 30d, 3m, 1y)
  const slicedDailyData: DailyTrendItem[] = useMemo(() => {
    const allMatching = MOCK_TRENDS_DAILY_DATA.filter(
      (item) => item.crop === crop && item.mandiName === mandi
    );

    const totalLen = allMatching.length;
    let daysToTake = 30;
    if (range === '7d') daysToTake = 7;
    if (range === '30d') daysToTake = 30;
    if (range === '3m') daysToTake = 90;
    if (range === '1y') daysToTake = 365;

    return allMatching.slice(Math.max(0, totalLen - daysToTake));
  }, [crop, mandi, range]);

  // Monthly averages for seasonal section
  const monthlyAverages: MonthlyAverageItem[] = useMemo(() => {
    return getMonthlyAveragesForCrop(crop, mandi);
  }, [crop, mandi]);

  const peakMonthItem = monthlyAverages.find((m) => m.isPeakMonth) || monthlyAverages[9];

  // Supply vs Demand Auto-Generated Insight Logic
  const insightText = useMemo(() => {
    if (slicedDailyData.length < 2) return '';

    const firstPt = slicedDailyData[0];
    const lastPt = slicedDailyData[slicedDailyData.length - 1];

    const priceDiff = lastPt.modalPrice - firstPt.modalPrice;
    const arrivalsDiff = lastPt.arrivalsQuantity - firstPt.arrivalsQuantity;
    const isMarathi = i18n.language === 'mr';

    if (arrivalsDiff > 100 && priceDiff < -30) {
      return isMarathi
        ? `मोठ्या प्रमाणावर आवक वाढल्यामुळे भावात घट झाली आहे — सध्या विक्री केल्यास अपेक्षित भाव न मिळण्याची शक्यता आहे.`
        : `High arrivals are pushing prices down — selling now may fetch a lower rate.`;
    } else if (arrivalsDiff < -100 && priceDiff > 30) {
      return isMarathi
        ? `बाजार समितीत आवक घटली असून मागणी वाढली आहे — साठवलेला माल विक्रीसाठी ही उत्तम वेळ आहे.`
        : `Low arrivals and rising demand — a good time to sell if you have stock ready.`;
    } else if (priceDiff > 0) {
      return isMarathi
        ? `बाजारात दरांचा कल तेजीचा असून आवक मर्यादित आहे — पुढील काही दिवसांत भाव स्थिर राहण्याची शक्यता आहे.`
        : `Prices show an upward trend with moderate arrivals — favorable market conditions.`;
    } else {
      return isMarathi
        ? `भाव आणि आवक स्थिर पातळीवर आहेत — बाजारपेठेत सर्वसामान्य मागणी-पुरवठा परिस्थिती आहे.`
        : `Price and arrivals are stable — standard market conditions.`;
    }
  }, [slicedDailyData, i18n.language]);

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-3 duration-300">
      
      {/* 1. Header & Dropdowns Selector Card */}
      <Card hoverable={false} className="p-6 sm:p-8 space-y-4 border border-[#E1EBE1] rounded-2xl shadow-sm bg-[#FFFFFF]">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#2E7D32]/10 text-[#2E7D32] text-xs font-black mb-2">
            <BarChart3 className="w-4 h-4 text-[#FFC107]" />
            <span>आवक व मागणी बुद्धिमत्ता (Supply vs Demand Engine)</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[#1B4332] tracking-tight">
            {t('trends.title')}
          </h1>
          <p className="text-sm text-[#6B7280] font-medium mt-1">
            {t('trends.subtitle')}
          </p>
        </div>

        {/* Dropdowns + Date Range Selector Segmented Control */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 pt-4 border-t border-[#E1EBE1]">
          
          {/* Crop Selector Column */}
          <div className="md:col-span-4">
            <label className="block text-xs font-extrabold text-[#1B4332] uppercase tracking-wider mb-2">
              पिक निवडा:
            </label>
            <CropSelector
              selectedCrop={crop}
              onSelectCrop={(c) => setCrop(c)}
              variant="dropdown"
            />
          </div>

          {/* Mandi Selector Column */}
          <div className="md:col-span-4">
            <label className="block text-xs font-extrabold text-[#1B4332] uppercase tracking-wider mb-2">
              मंडी निवडा:
            </label>
            <MandiSelector
              selectedMandi={mandi}
              onSelectMandi={(m) => setMandi(m)}
            />
          </div>

          {/* Date Range Selector Segmented Buttons Column */}
          <div className="md:col-span-4 space-y-2">
            <label className="block text-xs font-extrabold text-[#1B4332] uppercase tracking-wider">
              कालावधी (Timeframe):
            </label>
            
            <div className="flex bg-[#F7FBF7] p-1.5 rounded-2xl border border-[#E1EBE1] text-xs font-black shadow-xs">
              {(
                [
                  { id: '7d', labelMr: '7 दिवस', labelEn: '7 Days' },
                  { id: '30d', labelMr: '30 दिवस', labelEn: '30 Days' },
                  { id: '3m', labelMr: '3 महिने', labelEn: '3 Months' },
                  { id: '1y', labelMr: '1 वर्ष', labelEn: '1 Year' }
                ] as const
              ).map((opt) => {
                const isActive = range === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => setRange(opt.id)}
                    className={`flex-1 py-2 rounded-xl transition-all duration-300 min-h-[38px] cursor-pointer ${
                      isActive
                        ? 'bg-[#2E7D32] text-[#FFFFFF] shadow-md scale-102'
                        : 'text-[#6B7280] hover:text-[#2E7D32] hover:bg-[#FFFFFF]'
                    }`}
                  >
                    {i18n.language === 'mr' ? opt.labelMr : opt.labelEn}
                  </button>
                );
              })}
            </div>
          </div>

        </div>
      </Card>

      {/* Loading Skeleton State */}
      {isLoading ? (
        <div className="space-y-6">
          <Card hoverable={false} className="animate-pulse h-96 bg-[#F7FBF7] border border-[#E1EBE1] rounded-2xl"></Card>
          <Card hoverable={false} className="animate-pulse h-48 bg-[#F7FBF7] border border-[#E1EBE1] rounded-2xl"></Card>
        </div>
      ) : slicedDailyData.length > 0 ? (
        <>
          {/* Dual-Axis Recharts Composed Chart */}
          <Card hoverable={false} className="p-6 space-y-4 border border-[#E1EBE1] rounded-2xl shadow-sm bg-[#FFFFFF]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#E1EBE1]">
              <h3 className="text-lg font-extrabold text-[#1B4332] flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#2E7D32]" />
                <span>
                  {t(`crops.${crop}`, crop)} ({t(`mandis.${mandi}`, mandi)}) - {t('trends.priceVsArrivals')}
                </span>
              </h3>

              <span className="text-xs font-black text-[#2E7D32] bg-[#E8F5E9] px-3.5 py-1.5 rounded-full border border-[#81C784]/40">
                नियम: आवक वाढल्यास दर घटतात, आवक घटल्यास तेजी येते
              </span>
            </div>

            <div className="h-[340px] sm:h-[400px] w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={slicedDailyData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="4 4" stroke="#E1EBE1" vertical={false} />
                  
                  <XAxis
                    dataKey="displayDate"
                    stroke="#6B7280"
                    fontSize={11}
                    fontWeight={700}
                    tickLine={false}
                    interval={range === '1y' ? 30 : range === '3m' ? 10 : range === '30d' ? 3 : 0}
                  />
                  
                  <YAxis
                    yAxisId="left"
                    stroke="#2E7D32"
                    fontSize={11}
                    fontWeight={700}
                    tickFormatter={(val) => `₹${val}`}
                    tickLine={false}
                    domain={['auto', 'auto']}
                  />
                  
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    stroke="#FFC107"
                    fontSize={11}
                    fontWeight={700}
                    tickFormatter={(val) => `${val}q`}
                    tickLine={false}
                    domain={['auto', 'auto']}
                  />

                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const item = payload[0].payload as DailyTrendItem;
                        return (
                          <div className="bg-[#FFFFFF] border-2 border-[#81C784] p-3.5 rounded-2xl shadow-xl text-xs space-y-1.5 min-w-[200px]">
                            <div className="font-extrabold text-[#1B4332] border-b border-[#E1EBE1] pb-1">
                              तारीख: {label} ({item.date})
                            </div>
                            <div className="text-[#2E7D32] font-black flex justify-between gap-4">
                              <span>सरासरी दर (Price):</span>
                              <span>₹{item.modalPrice.toLocaleString('en-IN')} / क्विंटल</span>
                            </div>
                            <div className="text-[#D97706] font-extrabold flex justify-between gap-4">
                              <span>मंडी आवक (Arrivals):</span>
                              <span>{item.arrivalsQuantity.toLocaleString('en-IN')} क्विंटल</span>
                            </div>
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
                      if (value === 'modalPrice') return `${t('trends.pricePerQuintal')} (Line)`;
                      if (value === 'arrivalsQuantity') return `${t('trends.arrivalsQuintal')} (Bar)`;
                      return value;
                    }}
                  />

                  <Bar
                    yAxisId="right"
                    dataKey="arrivalsQuantity"
                    fill="#FFC107"
                    opacity={0.4}
                    radius={[6, 6, 0, 0]}
                    name="arrivalsQuantity"
                    isAnimationActive
                    animationDuration={1000}
                  />

                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="modalPrice"
                    stroke="#2E7D32"
                    strokeWidth={3.5}
                    dot={{ r: range === '7d' || range === '30d' ? 4 : 0, fill: '#2E7D32' }}
                    activeDot={{ r: 7, fill: '#1B4332' }}
                    name="modalPrice"
                    isAnimationActive
                    animationDuration={1200}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Supply vs Demand Insight Card */}
          <Card hoverable={false} className="p-6 border-2 border-[#81C784]/40 rounded-2xl bg-[#FFFFFF] shadow-sm space-y-3">
            <div className="flex items-center gap-3 text-[#2E7D32]">
              <div className="w-10 h-10 rounded-2xl bg-[#2E7D32] text-[#FFC107] flex items-center justify-center font-black shrink-0 shadow-md">
                <Lightbulb className="w-5 h-5 stroke-[2.5]" />
              </div>
              <h3 className="text-xl font-black text-[#1B4332]">
                मागणी-पुरवठा निष्कर्ष (Market Demand Insight)
              </h3>
            </div>

            <div className="border-l-4 border-[#2E7D32] bg-[#F7FBF7] p-5 rounded-r-2xl border border-[#E1EBE1]">
              <p className="text-base text-[#1B4332] leading-relaxed font-extrabold">
                "{insightText}"
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#6B7280] font-extrabold pt-1">
              <span className="flex items-center gap-1.5 text-[#2E7D32]">
                <ShieldCheck className="w-4 h-4 text-[#43A047]" />
                विश्लेषण कालावधी: <strong>{range.toUpperCase()}</strong>
              </span>
              <span className="flex items-center gap-1 text-[#FFC107]">
                <AlertCircle className="w-4 h-4 text-[#FFC107]" />
                Agmarknet नोंदणीकृत मंडी आवक आकडेवारी
              </span>
            </div>
          </Card>

          {/* Seasonal Pattern Section */}
          <Card hoverable={false} className="p-6 space-y-4 border border-[#E1EBE1] rounded-2xl shadow-sm bg-[#FFFFFF]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#E1EBE1]">
              <div>
                <h3 className="text-lg font-extrabold text-[#1B4332] flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#FFC107]" />
                  <span>{t('trends.seasonalTitle')} ({t(`crops.${crop}`, crop)})</span>
                </h3>
                <p className="text-sm text-[#6B7280] font-medium mt-0.5">
                  12 महिन्यांचे ऐतिहासिक सरासरी भाव आणि आवक चक्र
                </p>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-50 border border-amber-300 text-amber-950 rounded-2xl text-xs font-black shadow-xs">
                <Flame className="w-4 h-4 text-[#FFC107]" />
                <span>
                  {i18n.language === 'mr'
                    ? `ऐतिहासिकदृष्ट्या विक्रीसाठी सर्वोत्तम महिना: ${peakMonthItem.monthNameMr}`
                    : `Historically best month to sell: ${peakMonthItem.monthNameEn}`}
                </span>
              </div>
            </div>

            {/* Heatmap-style 12 Month Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
              {monthlyAverages.map((item) => {
                return (
                  <div
                    key={item.monthNameEn}
                    className={`p-4 rounded-2xl border transition-all text-center space-y-1 relative ${
                      item.isPeakMonth
                        ? 'bg-amber-50 border-2 border-[#FFC107] shadow-sm ring-2 ring-[#FFC107]/30'
                        : item.isCurrentMonth
                        ? 'bg-[#E8F5E9] border-2 border-[#2E7D32]'
                        : 'bg-[#FFFFFF] border-[#E1EBE1]'
                    }`}
                  >
                    {item.isPeakMonth && (
                      <span className="absolute -top-2.5 left-1/2 transform -translate-x-1/2 px-2.5 py-0.5 bg-[#FFC107] text-[#1B4332] text-[10px] font-black rounded-full shadow-xs">
                        सर्वोत्तम
                      </span>
                    )}

                    {item.isCurrentMonth && !item.isPeakMonth && (
                      <span className="absolute -top-2.5 left-1/2 transform -translate-x-1/2 px-2.5 py-0.5 bg-[#2E7D32] text-[#FFFFFF] text-[10px] font-black rounded-full shadow-xs">
                        चालू महिना
                      </span>
                    )}

                    <div className="text-xs font-extrabold text-[#6B7280] pt-1 uppercase">
                      {i18n.language === 'mr' ? item.monthNameMr : item.monthNameEn}
                    </div>

                    <div className={`text-base font-black ${item.isPeakMonth ? 'text-[#D97706]' : 'text-[#2E7D32]'}`}>
                      ₹{item.avgPrice.toLocaleString('en-IN')}
                    </div>

                    <div className="text-[11px] text-[#6B7280] font-bold">
                      आवक: {item.avgArrivals}q
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </>
      ) : (
        <EmptyState
          title="कोणताही ट्रेंड डेटा उपलब्ध नाही"
          description="निवडलेल्या पिक आणि मंडीसाठी माहिती प्रक्रियेत आहे."
          actionLabel="रीसेट करा"
          onAction={() => {
            setCrop('Onion');
            setMandi('Kopargaon');
            setRange('30d');
          }}
        />
      )}

    </div>
  );
};
