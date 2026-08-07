import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import {
  CROPS_LIST,
  MANDIS_LIST,
  getForecastDataForCombination,
  type ForecastPointItem
} from '../data/mockForecastData';
import {
  MOCK_WEATHER_SIGNALS,
  MOCK_PROCESSING_LINKAGES
} from '../data/mockWeatherAndRecommendationData';
import { ForecastChart } from '../components/ForecastChart';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import {
  Sparkles,
  AlertCircle,
  Lightbulb,
  ShieldCheck,
  ArrowUpRight,
  ArrowDownRight,
  Sprout,
  Store,
  RefreshCw,
  SearchX,
  TrendingUp,
  TrendingDown,
  DollarSign,
  CloudRain,
  Zap,
  Building2,
  AlertTriangle
} from 'lucide-react';

export const PriceForecastPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();

  // Read initial crop and mandi from URL query parameters, defaulting to Onion & Kopargaon
  const cropParam = searchParams.get('crop');
  const mandiParam = searchParams.get('mandi');

  const [crop, setCrop] = useState<string>(cropParam && CROPS_LIST.includes(cropParam) ? cropParam : 'Onion');
  const [mandi, setMandi] = useState<string>(mandiParam && MANDIS_LIST.includes(mandiParam) ? mandiParam : 'Kopargaon');
  const [horizonDays, setHorizonDays] = useState<7 | 14 | 30>(7);

  // Loading skeleton simulation state
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Sync state to URL search params
  const handleCropChange = (newCrop: string) => {
    setCrop(newCrop);
    setSearchParams({ crop: newCrop, mandi: mandi });
  };

  const handleMandiChange = (newMandi: string) => {
    setMandi(newMandi);
    setSearchParams({ crop: crop, mandi: newMandi });
  };

  // Simulate loading delay when inputs change
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(timer);
  }, [crop, mandi, horizonDays]);

  // Fetch forecast time series data
  const forecastData: ForecastPointItem[] = useMemo(() => {
    return getForecastDataForCombination(crop, mandi);
  }, [crop, mandi]);

  // Key Quick Stat Metrics
  const todayPoint = forecastData[30] || { actualPrice: 1850, predictedPrice: 1850 };
  const currentPrice = todayPoint.actualPrice || todayPoint.predictedPrice || 1850;

  // Peak & Low in forecast horizon window
  const horizonSlice = forecastData.slice(30, 31 + horizonDays);
  const futurePrices = horizonSlice
    .map((p) => p.predictedPrice)
    .filter((p): p is number => p !== null);

  const peakPrice = futurePrices.length > 0 ? Math.max(...futurePrices) : currentPrice;

  // Auto-generated Plain Language Insight Calculation
  const startPrice = currentPrice;
  const lastFuturePoint = horizonSlice[horizonSlice.length - 1];
  const endPrice = lastFuturePoint?.predictedPrice || currentPrice;
  const pctChangeNum = parseFloat((((endPrice - startPrice) / startPrice) * 100).toFixed(1));
  const isRising = pctChangeNum >= 0;

  // Formatted Insight text in Marathi and English
  const insightText = useMemo(() => {
    const isMarathi = i18n.language === 'mr';
    const absPct = Math.abs(pctChangeNum);

    if (isRising) {
      return isMarathi
        ? `पुढील ${horizonDays} दिवसांत भावात सुमारे ~${absPct}% वाढ होण्याची शक्यता आहे — साठवणूक क्षमता असल्यास माल 5-7 दिवस थांबवून विक्री करणे अधिक फायदेशीर ठरू शकते.`
        : `Prices expected to rise ~${absPct}% over the next ${horizonDays} days — consider holding stock if storage is available.`;
    } else {
      return isMarathi
        ? `पुढील ${horizonDays} दिवसांत भावात सुमारे ~${absPct}% घट होण्याची शक्यता आहे — लवकर विक्री करणे अधिक फायदेशीर ठरू शकते.`
        : `Prices expected to fall ~${absPct}% over the next ${horizonDays} days — selling soon may be more profitable.`;
    }
  }, [pctChangeNum, isRising, horizonDays, i18n.language]);

  // Weather signal data
  const todayWeatherSignal = MOCK_WEATHER_SIGNALS[0];
  const processingLinkage = MOCK_PROCESSING_LINKAGES[crop] || MOCK_PROCESSING_LINKAGES['Onion'];

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto animate-in fade-in duration-300">
      
      {/* 1. Large Prediction Summary Header Card */}
      <Card hoverable={false} className="p-6 sm:p-8 bg-gradient-to-br from-[#FFFFFF] via-[#F7FBF7] to-[#E8F5E9] border-2 border-[#81C784]/60 rounded-2xl shadow-md space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E1EBE1] pb-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#2E7D32]/10 text-[#2E7D32] text-xs font-black">
                <Sparkles className="w-4 h-4 text-[#FFC107] animate-pulse" />
                <span>AI मॉडेल अंदाज प्रणाली (Agmarknet Live Engine)</span>
              </div>

              {/* 2. Confidence Badge */}
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black bg-emerald-100 text-emerald-950 border border-emerald-300 shadow-xs">
                <ShieldCheck className="w-4 h-4 text-[#43A047]" />
                <span>88% High Confidence</span>
              </span>

              {/* 4. Climate Risk Advisory Flag */}
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black bg-amber-100 text-amber-950 border border-amber-300 shadow-xs animate-pulse">
                <AlertTriangle className="w-4 h-4 text-[#D97706]" />
                <span>हवामान इशारा: अवकाळी पाऊस</span>
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-[#1B4332] tracking-tight">
              {t('forecast.title')}
            </h1>
            <p className="text-sm text-[#6B7280] font-medium">
              {t('forecast.subtitle')}
            </p>
          </div>

          {/* Quick Info Badges */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="px-4 py-3 bg-[#FFFFFF] rounded-2xl border border-[#E1EBE1] text-center shadow-xs">
              <span className="text-[11px] font-extrabold text-[#6B7280] uppercase block">निवडलेले पिक</span>
              <span className="text-base font-black text-[#2E7D32]">{t(`crops.${crop}`, crop)}</span>
            </div>
            <div className="px-4 py-3 bg-[#FFFFFF] rounded-2xl border border-[#E1EBE1] text-center shadow-xs">
              <span className="text-[11px] font-extrabold text-[#6B7280] uppercase block">बाजार समिती</span>
              <span className="text-base font-black text-[#1B4332]">{t(`mandis.${mandi}`, mandi)}</span>
            </div>
          </div>
        </div>

        {/* Dropdown Selectors Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-extrabold text-[#1B4332] uppercase tracking-wider mb-2">
              {t('forecast.selectCrop')}
            </label>
            <div className="relative flex items-center">
              <Sprout className="absolute left-4 w-5 h-5 text-[#2E7D32] shrink-0 pointer-events-none" />
              <select
                value={crop}
                onChange={(e) => handleCropChange(e.target.value)}
                className="w-full pl-11 pr-4 min-h-[50px] bg-[#FFFFFF] border-2 border-[#E1EBE1] rounded-2xl text-[#1B4332] font-extrabold text-sm focus:outline-none focus:ring-4 focus:ring-[#2E7D32]/20 focus:border-[#2E7D32] transition-all duration-300 cursor-pointer shadow-xs"
              >
                {CROPS_LIST.map((cItem) => (
                  <option key={cItem} value={cItem} className="font-bold py-1">
                    {t(`crops.${cItem}`, cItem)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-extrabold text-[#1B4332] uppercase tracking-wider mb-2">
              {t('forecast.selectMandi')}
            </label>
            <div className="relative flex items-center">
              <Store className="absolute left-4 w-5 h-5 text-[#FFC107] shrink-0 pointer-events-none" />
              <select
                value={mandi}
                onChange={(e) => handleMandiChange(e.target.value)}
                className="w-full pl-11 pr-4 min-h-[50px] bg-[#FFFFFF] border-2 border-[#E1EBE1] rounded-2xl text-[#1B4332] font-extrabold text-sm focus:outline-none focus:ring-4 focus:ring-[#2E7D32]/20 focus:border-[#2E7D32] transition-all duration-300 cursor-pointer shadow-xs"
              >
                {MANDIS_LIST.map((mItem) => (
                  <option key={mItem} value={mItem} className="font-bold py-1">
                    {t(`mandis.${mItem}`, mItem)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* 1. Feature 1: Weather Signal Integration Input Bar */}
      <Card hoverable={false} className="p-5 bg-[#FFFFFF] border-2 border-[#81C784]/60 rounded-2xl shadow-sm space-y-3">
        <div className="flex items-center justify-between gap-3 pb-3 border-b border-[#E1EBE1]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-[#D97706] flex items-center justify-center font-black shrink-0">
              <CloudRain className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-[#1B4332]">
                हवामान इनपुट सिग्नल (Weather Signal to AI Model)
              </h3>
              <p className="text-xs text-[#6B7280] font-bold">
                कोपरगाव हवामान अंदाज AI दर मॉडेलमध्ये थेट इनपुट सिग्नल म्हणून समाविष्ट
              </p>
            </div>
          </div>

          <span className="hidden sm:inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-950 border border-emerald-300 text-xs font-black rounded-full">
            <Zap className="w-3.5 h-3.5 text-[#FFC107]" />
            Supply Shock Signal: Active
          </span>
        </div>

        <div className="p-4 bg-[#F7FBF7] rounded-2xl border border-[#E1EBE1] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-bold">
          <div className="flex items-center gap-3">
            <span className="text-base font-black text-[#2E7D32]">
              🌧️ {todayWeatherSignal.rainfallMm}mm पाऊस ({todayWeatherSignal.tempC}°C)
            </span>
            <span className="text-[#6B7280]">|</span>
            <span className="text-[#D97706] font-black">
              भावावर प्रभाव: +{todayWeatherSignal.supplyShockImpactPct}% (आवक तुटवडा)
            </span>
          </div>

          <span className="text-[#1B4332] font-black text-right">
            "{i18n.language === 'mr' ? todayWeatherSignal.descriptionMr : todayWeatherSignal.descriptionEn}"
          </span>
        </div>
      </Card>

      {/* Loading Skeleton State */}
      {isLoading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <Card key={n} hoverable={false} className="animate-pulse h-28 bg-[#F7FBF7]"></Card>
            ))}
          </div>
          <Card hoverable={false} className="animate-pulse h-96 bg-[#F7FBF7]"></Card>
        </div>
      ) : forecastData.length > 0 ? (
        <>
          {/* Expected Price Cards & Profit Card Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            
            {/* Current Price Card */}
            <Card hoverable={false} className="p-6 space-y-2 border border-[#E1EBE1] rounded-2xl shadow-sm bg-[#FFFFFF]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-[#6B7280] uppercase tracking-wider">
                  {t('forecast.currentPrice')}
                </span>
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#2E7D32] flex items-center justify-center font-bold">
                  <DollarSign className="w-5 h-5" />
                </div>
              </div>
              <div className="text-3xl sm:text-4xl font-black text-[#2E7D32]">
                ₹{currentPrice.toLocaleString('en-IN')}{' '}
                <span className="text-xs font-bold text-[#6B7280]">/ क्विंटल</span>
              </div>
              <p className="text-xs text-[#43A047] font-extrabold flex items-center gap-1">
                <ArrowUpRight className="w-4 h-4" />
                आज {t(`mandis.${mandi}`, mandi)} APMC
              </p>
            </Card>

            {/* Expected Peak Price Card */}
            <Card hoverable={false} className="p-6 space-y-2 bg-[#F7FBF7] border-2 border-[#FFC107]/50 rounded-2xl shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-[#D97706] uppercase tracking-wider">
                  {t('forecast.expectedPeak')} ({horizonDays} दिवस)
                </span>
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-[#D97706] flex items-center justify-center font-bold">
                  {isRising ? <TrendingUp className="w-5 h-5 text-[#43A047]" /> : <TrendingDown className="w-5 h-5 text-[#E53935]" />}
                </div>
              </div>
              <div className="text-3xl sm:text-4xl font-black text-[#D97706]">
                ₹{peakPrice.toLocaleString('en-IN')}{' '}
                <span className="text-xs font-bold text-[#6B7280]">/ क्विंटल</span>
              </div>
              <p className="text-xs text-[#D97706] font-extrabold flex items-center gap-1">
                {isRising ? <ArrowUpRight className="w-4 h-4 text-[#43A047]" /> : <ArrowDownRight className="w-4 h-4 text-[#E53935]" />}
                अंदाजित बदल: {pctChangeNum >= 0 ? `+${pctChangeNum}%` : `${pctChangeNum}%`}
              </p>
            </Card>

            {/* Profit Card */}
            <Card hoverable={false} className="p-6 space-y-2 border-2 border-[#81C784] rounded-2xl shadow-sm bg-[#FFFFFF]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-[#1B4332] uppercase tracking-wider">
                  अंदाजित निव्वळ नफा फरक
                </span>
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-[#2E7D32] flex items-center justify-center font-bold">
                  <Sparkles className="w-5 h-5 text-[#FFC107]" />
                </div>
              </div>
              <div className="text-3xl sm:text-4xl font-black text-[#1B4332]">
                {pctChangeNum >= 0 ? `+₹${Math.round(peakPrice - currentPrice)}` : `-₹${Math.round(currentPrice - peakPrice)}`}
                <span className="text-xs font-bold text-[#6B7280]"> / क्विंटल</span>
              </div>
              <p className="text-xs text-[#6B7280] font-extrabold">
                {pctChangeNum >= 0 ? 'प्रती क्विंटल संभाव्य अतिरिक्त फायदा' : 'संभाव्य जोखीम मर्यादा'}
              </p>
            </Card>

          </div>

          {/* Interactive Forecast Chart */}
          <ForecastChart
            crop={crop}
            mandi={mandi}
            data={forecastData}
            horizonDays={horizonDays}
            onHorizonChange={(h) => setHorizonDays(h)}
          />

          {/* 3. Feature 3: Post-Harvest Processing & Market Linkage Advice Card */}
          <Card hoverable={false} className="p-6 sm:p-8 bg-gradient-to-br from-[#FFFFFF] via-[#F7FBF7] to-[#E8F5E9] border-2 border-[#2E7D32] rounded-2xl shadow-md space-y-4">
            <div className="flex items-center justify-between gap-3 pb-3 border-b border-[#E1EBE1]">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#2E7D32] text-[#FFC107] flex items-center justify-center font-black shrink-0 shadow-md">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-[#1B4332]">
                    काढणी पश्चात प्रक्रिया व थेट बाजार जोडणी (Market Linkage & Processing)
                  </h3>
                  <span className="text-xs font-extrabold text-[#6B7280]">
                    "केवळ कच्चा माल मंडीत विकण्याऐवजी प्रक्रिया केंद्राशी जोडल्यास जास्त नफा मिळवा"
                  </span>
                </div>
              </div>

              <span className="px-3.5 py-1.5 bg-[#FFC107] text-[#1B4332] font-black text-xs rounded-2xl shadow-xs shrink-0">
                +{processingLinkage.netExtraProfitPerQ} ₹/q अतिरिक्त नफा
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-bold">
              <div className="p-4 bg-[#FFFFFF] border border-[#E1EBE1] rounded-2xl space-y-1">
                <span className="text-[#6B7280] font-extrabold">साधा मंडी भाव:</span>
                <div className="text-xl font-black text-[#1B4332]">
                  ₹{processingLinkage.rawMandiPrice} / क्विंटल
                </div>
              </div>

              <div className="p-4 bg-[#FFFFFF] border border-[#E1EBE1] rounded-2xl space-y-1">
                <span className="text-[#2E7D32] font-extrabold">प्रक्रिया / चॅनेल नाव:</span>
                <div className="text-sm font-black text-[#2E7D32]">
                  {i18n.language === 'mr' ? processingLinkage.channelNameMr : processingLinkage.channelNameEn}
                </div>
              </div>

              <div className="p-4 bg-emerald-100 border border-emerald-300 rounded-2xl space-y-1">
                <span className="text-emerald-950 font-extrabold">मिळणारा निव्वळ जादा भाव:</span>
                <div className="text-xl font-black text-[#2E7D32]">
                  +₹{processingLinkage.netExtraProfitPerQ} / क्विंटल
                </div>
              </div>
            </div>

            <div className="p-4 bg-[#FFFFFF] border-l-4 border-[#FFC107] rounded-r-2xl border border-[#E1EBE1]">
              <p className="text-sm font-black text-[#1B4332] leading-relaxed">
                👉 {i18n.language === 'mr' ? processingLinkage.recommendedActionMr : processingLinkage.recommendedActionEn}
              </p>
            </div>
          </Card>

          {/* Recommendation Box & Risk Indicator Card */}
          <Card hoverable={false} className="p-6 sm:p-8 bg-[#FFFFFF] border-2 border-[#81C784]/40 rounded-2xl shadow-md space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#2E7D32] text-[#FFC107] flex items-center justify-center font-black shrink-0 shadow-md">
                <Lightbulb className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-[#1B4332]">
                  {t('forecast.insightTitle')}
                </h3>
                <span className="text-xs font-bold text-[#6B7280]">
                  AI कृषी सल्लागार शिफारस (Agronomist Recommendation)
                </span>
              </div>
            </div>

            {/* Recommendation Quote Box */}
            <div className="border-l-4 border-[#2E7D32] bg-[#F7FBF7] p-5 rounded-r-2xl border border-[#E1EBE1]">
              <p className="text-base text-[#1B4332] leading-relaxed font-extrabold">
                "{insightText}"
              </p>
            </div>

            {/* Risk Indicator Pill */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-[#6B7280] pt-2 border-t border-[#E1EBE1]">
              <span className="flex items-center gap-1.5 font-extrabold text-[#2E7D32]">
                <ShieldCheck className="w-4 h-4 text-[#43A047]" />
                विश्वासार्हता निर्देशांक: <strong>88% (High Accuracy)</strong>
              </span>

              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 text-amber-950 border border-amber-300 font-extrabold">
                <AlertCircle className="w-4 h-4 text-[#FFC107] shrink-0" />
                <span>जोखीम टीप: हवामान व स्थानिक आवकीनुसार भावात बदल संभवतात</span>
              </div>
            </div>
          </Card>
        </>
      ) : (
        /* Empty State */
        <Card hoverable={false} className="p-12 text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-[#F7FBF7] text-[#FFC107] flex items-center justify-center mx-auto">
            <SearchX className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-[#2E7D32]">
            या पिक आणि मंडीसाठी अंदाज डेटा उपलब्ध नाही
          </h3>
          <p className="text-sm text-[#6B7280]">
            No forecast data available for this crop and mandi combination. Try selecting Kopargaon or Rahata.
          </p>
          <div className="pt-2">
            <Button
              variant="primary"
              onClick={() => {
                setCrop('Onion');
                setMandi('Kopargaon');
              }}
            >
              <RefreshCw className="w-4 h-4 text-[#FFC107]" />
              <span>रीसेट करा (Reset to Kopargaon Onion)</span>
            </Button>
          </div>
        </Card>
      )}

    </div>
  );
};
