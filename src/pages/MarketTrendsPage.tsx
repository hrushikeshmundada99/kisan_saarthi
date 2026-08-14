import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import {
  APMC_LIST,
  CROP_LIST
} from '../data/agmarknetDataset';
import { MandiDataService, type MandiCropDataResult } from '../services/mandiDataService';
import { calculateMandiForecast, type MandiForecastSummary } from '../utils/forecastEngine';
import { MandiPriceTrendChart } from '../components/MandiPriceTrendChart';
import { Card } from '../components/Card';
import { EmptyState } from '../components/EmptyState';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  AlertCircle,
  Sparkles,
  Calendar,
  Building2,
  Sprout,
  Info
} from 'lucide-react';

export const MarketTrendsPage: React.FC = () => {
  const { i18n } = useTranslation();
  const isMr = i18n.language === 'mr';

  const [searchParams, setSearchParams] = useSearchParams();

  // 1. Read APMC & Crop from URL query parameters (or fallback to defaults)
  const apmcParam = searchParams.get('apmc');
  const cropParam = searchParams.get('crop');

  const selectedApmc = useMemo(() => {
    if (apmcParam) {
      const match = APMC_LIST.find(
        (a) => a.id.toLowerCase() === apmcParam.toLowerCase() || a.nameEn.toLowerCase().includes(apmcParam.toLowerCase())
      );
      if (match) return match.id;
    }
    return 'kopargaon';
  }, [apmcParam]);

  const selectedCrop = useMemo(() => {
    if (cropParam) {
      const match = CROP_LIST.find(
        (c) => c.id.toLowerCase() === cropParam.toLowerCase() || c.nameEn.toLowerCase().includes(cropParam.toLowerCase())
      );
      if (match) return match.id;
    }
    return 'onion';
  }, [cropParam]);

  const [horizonDays, setHorizonDays] = useState<7 | 14>(7);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Update URL params when dropdown selections change
  const handleApmcChange = (newApmcId: string) => {
    setSearchParams({ apmc: newApmcId, crop: selectedCrop });
  };

  const handleCropChange = (newCropId: string) => {
    setSearchParams({ apmc: selectedApmc, crop: newCropId });
  };

  // Simulate smooth data fetch loading
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 250);
    return () => clearTimeout(timer);
  }, [selectedApmc, selectedCrop]);

  // Fetch Agmarknet data & calculate forecast
  const mandiDataResult: MandiCropDataResult = useMemo(() => {
    return MandiDataService.getMandiCropData(selectedApmc, selectedCrop);
  }, [selectedApmc, selectedCrop]);

  const forecastSummary: MandiForecastSummary | null = useMemo(() => {
    if (mandiDataResult.status !== 'SUCCESS') return null;
    return calculateMandiForecast(mandiDataResult.records, horizonDays);
  }, [mandiDataResult, horizonDays]);

  const currentApmcInfo = APMC_LIST.find((a) => a.id === selectedApmc) || APMC_LIST[0];
  const currentCropInfo = CROP_LIST.find((c) => c.id === selectedCrop) || CROP_LIST[0];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans">
      
      {/* Top Header Title & Description */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#1B5E20] via-[#2E7D32] to-[#144919] p-6 sm:p-8 rounded-3xl text-[#FFFFFF] shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-[#FFB300]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFB300]/20 border border-[#FFB300]/40 text-[#FFB300] text-xs font-black uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Agmarknet Live Intelligence</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-[#FFFFFF]">
            {isMr ? 'बाजार भाव कल व AI भाव अंदाज' : 'Mandi Price Trends & AI Forecast'}
          </h1>

          <p className="text-sm sm:text-base text-emerald-100 font-medium max-w-2xl">
            {isMr
              ? 'महाराष्ट्रातील प्रमुख बाजार समित्यांचे दररोजचे ताजे भाव, ५-६ महिन्यांचे कल आणि पुढील ७-१४ दिवसांचा AI अंदाज एकाच जागी.'
              : 'Daily government APMC prices, min-max price ranges, and 7-14 day AI trend predictions for Maharashtra mandis.'}
          </p>
        </div>

        {/* Quick Data Sync Badge */}
        <div className="relative z-10 flex flex-col sm:flex-row md:flex-col items-start md:items-end justify-center gap-1.5 shrink-0 bg-[#FFFFFF]/10 backdrop-blur-md p-4 rounded-2xl border border-[#FFFFFF]/20 text-xs">
          <div className="flex items-center gap-1.5 font-black text-[#FFB300]">
            <ShieldCheck className="w-4 h-4" />
            <span>{isMr ? 'शासकीय Agmarknet डाटा' : 'Government Agmarknet Data'}</span>
          </div>
          <span className="text-emerald-100 font-bold">
            {isMr ? 'अद्ययावत तारीख:' : 'Data Updated:'} {mandiDataResult.lastUpdated}
          </span>
        </div>
      </div>

      {/* Selector Control Bar: Two Dropdowns (Select APMC & Select Crop) */}
      <Card hoverable={false} className="p-4 sm:p-6 bg-[#FFFFFF] border-2 border-[#D8E6D8] rounded-3xl shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
          
          {/* APMC Selector Dropdown */}
          <div className="flex-1 space-y-1.5">
            <label htmlFor="apmc-select" className="text-xs font-black uppercase tracking-wider text-[#0F291E] flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-[#1B5E20]" />
              <span>{isMr ? '१. बाजार समिती निवडा (Select APMC):' : '1. Select APMC Mandi:'}</span>
            </label>
            <div className="relative">
              <select
                id="apmc-select"
                value={selectedApmc}
                onChange={(e) => handleApmcChange(e.target.value)}
                className="w-full bg-[#F4F9F4] border-2 border-[#A5D6A7] text-[#0F291E] font-black text-sm sm:text-base rounded-2xl px-4 py-3 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#1B5E20] shadow-xs"
              >
                {APMC_LIST.map((apmc) => (
                  <option key={apmc.id} value={apmc.id}>
                    {isMr ? apmc.nameMr : apmc.nameEn} ({apmc.district})
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#1B5E20] font-black text-xs">
                ▼
              </div>
            </div>
          </div>

          {/* Crop Selector Dropdown */}
          <div className="flex-1 space-y-1.5">
            <label htmlFor="crop-select" className="text-xs font-black uppercase tracking-wider text-[#0F291E] flex items-center gap-1.5">
              <Sprout className="w-4 h-4 text-[#1B5E20]" />
              <span>{isMr ? '२. पिक निवडा (Select Crop):' : '2. Select Crop Commodity:'}</span>
            </label>
            <div className="relative">
              <select
                id="crop-select"
                value={selectedCrop}
                onChange={(e) => handleCropChange(e.target.value)}
                className="w-full bg-[#F4F9F4] border-2 border-[#A5D6A7] text-[#0F291E] font-black text-sm sm:text-base rounded-2xl px-4 py-3 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#1B5E20] shadow-xs"
              >
                {CROP_LIST.map((cropItem) => (
                  <option key={cropItem.id} value={cropItem.id}>
                    {isMr ? cropItem.nameMr : cropItem.nameEn} — [{cropItem.category}]
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#1B5E20] font-black text-xs">
                ▼
              </div>
            </div>
          </div>

        </div>

        {/* Selected Combination Info Pill */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#E2ECE2] text-xs font-bold text-[#526058]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#1B5E20]" />
            <span>
              {isMr ? 'निवडलेले संयोजन:' : 'Selected Combination:'}{' '}
              <strong className="text-[#0F291E]">
                {isMr ? currentCropInfo.nameMr : currentCropInfo.nameEn} @ {isMr ? currentApmcInfo.nameMr : currentApmcInfo.nameEn}
              </strong>
            </span>
          </div>

          <span className="text-[11px] text-[#526058] bg-[#F4F9F4] px-2.5 py-1 rounded-xl border border-[#D8E6D8]">
            🔗 Shareable URL: <code className="text-[#1B5E20] font-mono font-bold">?apmc={selectedApmc}&crop={selectedCrop}</code>
          </span>
        </div>
      </Card>

      {/* Main Data Content Section */}
      {isLoading ? (
        // Loading Skeleton State
        <Card hoverable={false} className="p-8 sm:p-12 border-2 border-[#D8E6D8] rounded-3xl bg-[#FFFFFF] space-y-6 animate-pulse">
          <div className="h-8 bg-[#E2ECE2] rounded-xl w-2/3" />
          <div className="h-64 sm:h-80 bg-[#F4F9F4] rounded-2xl w-full" />
          <div className="h-4 bg-[#E2ECE2] rounded-lg w-1/2" />
        </Card>
      ) : mandiDataResult.status === 'NO_DATA' ? (
        // Empty State: No Data for Combination (e.g. Sugarcane daily auctions)
        <EmptyState
          icon={AlertCircle}
          title={
            isMr
              ? `या पिक-बाजार समिती जोडीसाठी डेटा उपलब्ध नाही`
              : `Price data for ${currentCropInfo.nameEn} at ${currentApmcInfo.nameEn} isn't available yet`
          }
          description={
            isMr
              ? `ऊस किंवा काही विशेष पिकांची खरेदी दररोजच्या बाजार लिलावाद्वारे होत नसल्याने शासकीय Agmarknet मध्ये या दर नोंदी नसतात. कृपया इतर पिक निवडा.`
              : `Sugarcane and direct-contract crops do not trade through daily open mandi auctions. Consequently, Agmarknet daily price streams are not logged for this commodity. Please select another crop.`
          }
        />
      ) : mandiDataResult.status === 'INSUFFICIENT_DATA' ? (
        // Warning State: Insufficient Data (< 30 trade records)
        <Card hoverable={false} className="p-6 sm:p-8 border-2 border-amber-300 bg-amber-50/80 rounded-3xl space-y-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-amber-700 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="text-base sm:text-lg font-black text-amber-950">
                {isMr ? 'अपुरी बाजार माहिती (Insufficient Data)' : `Insufficient trade data for ${currentCropInfo.nameEn} at ${currentApmcInfo.nameEn}`}
              </h3>
              <p className="text-xs sm:text-sm text-amber-900 font-semibold leading-relaxed">
                {isMr
                  ? `या बाजार समितीत ${currentCropInfo.nameMr} पिकाच्या ३० दिवसांपेक्षा कमी दर नोंदी उपलब्ध आहेत. अचूक AI अंदाज व्यक्त करण्यासाठी किमान ३० दिवसांचा ऐतिहासिक डाटा आवश्यक असतो.`
                  : `This APMC commodity pair has fewer than 30 trade records logged on Agmarknet. A minimum of 30 historical trade days is required to generate a credible trend forecast.`
              }
              </p>
            </div>
          </div>
        </Card>
      ) : (
        // Success State: Render Trend Summary Cards + Recharts Graph
        <div className="space-y-6">
          
          {/* Trend Summary Metric Bar Above Graph */}
          {forecastSummary && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              {/* Metric 1: Current Modal Price */}
              <Card hoverable={false} className="p-4 sm:p-5 bg-[#FFFFFF] border-2 border-[#D8E6D8] rounded-3xl shadow-xs space-y-1">
                <span className="text-xs font-bold text-[#526058] flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-[#1B5E20]" />
                  {isMr ? 'आजचा मुख्य बाजार भाव (Modal Rate)' : 'Current Modal Price'}
                </span>
                <div className="text-2xl sm:text-3xl font-black text-[#0F291E]">
                  ₹{forecastSummary.currentPrice.toLocaleString('en-IN')}{' '}
                  <span className="text-xs font-bold text-[#526058]">/क्विंटल</span>
                </div>
                <div className="text-[11px] font-bold text-[#526058]">
                  {isMr ? 'मागील नोंदीतील ताजे दर' : 'Latest logged mandi rate'}
                </div>
              </Card>

              {/* Metric 2: 7-Day Price Trend Change */}
              <Card hoverable={false} className="p-4 sm:p-5 bg-[#FFFFFF] border-2 border-[#D8E6D8] rounded-3xl shadow-xs space-y-1">
                <span className="text-xs font-bold text-[#526058] flex items-center gap-1.5">
                  <BarChart3 className="w-4 h-4 text-[#1B5E20]" />
                  {isMr ? '७ दिवसांतील भाव बदल' : '7-Day Price Movement'}
                </span>

                <div className="flex items-center gap-2">
                  <div className="text-2xl sm:text-3xl font-black text-[#0F291E]">
                    {forecastSummary.pctChange7d >= 0 ? `+${forecastSummary.pctChange7d}%` : `${forecastSummary.pctChange7d}%`}
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-xs font-black border flex items-center gap-1 ${
                    forecastSummary.isRising
                      ? 'bg-emerald-100 text-emerald-950 border-emerald-300'
                      : 'bg-rose-100 text-rose-950 border-rose-300'
                  }`}>
                    {forecastSummary.isRising ? <TrendingUp className="w-4 h-4 text-emerald-700" /> : <TrendingDown className="w-4 h-4 text-rose-700" />}
                    <span>{forecastSummary.isRising ? (isMr ? 'तेजी' : 'Up') : (isMr ? 'मंदी' : 'Down')}</span>
                  </span>
                </div>

                <div className="text-[11px] font-bold text-[#526058]">
                  {isMr ? `७ दिवसांपूर्वी: ₹${forecastSummary.price7DaysAgo}` : `7 days ago: ₹${forecastSummary.price7DaysAgo}/Q`}
                </div>
              </Card>

              {/* Metric 3: Data Freshness Status */}
              <Card hoverable={false} className="p-4 sm:p-5 bg-[#FFFFFF] border-2 border-[#D8E6D8] rounded-3xl shadow-xs space-y-1">
                <span className="text-xs font-bold text-[#526058] flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#1B5E20]" />
                  {isMr ? 'डाटा अद्ययावत तारीख' : 'Data Last Updated'}
                </span>
                <div className="text-xl sm:text-2xl font-black text-[#1B5E20] truncate">
                  {forecastSummary.lastUpdatedDate}
                </div>
                <div className="text-[11px] font-bold text-[#526058]">
                  {isMr ? 'Agmarknet शासकीय दर नोंदी' : 'Verified APMC trade stream'}
                </div>
              </Card>

            </div>
          )}

          {/* Recharts Chart Component */}
          {forecastSummary && (
            <MandiPriceTrendChart
              data={forecastSummary.chartPoints}
              cropName={isMr ? currentCropInfo.nameMr : currentCropInfo.nameEn}
              apmcName={isMr ? currentApmcInfo.nameMr : currentApmcInfo.nameEn}
              horizonDays={horizonDays}
              onHorizonChange={(d) => setHorizonDays(d)}
            />
          )}

          {/* Mandatory Disclaimer Footer */}
          <div className="p-4 bg-[#F4F9F4] border border-[#D8E6D8] rounded-2xl flex items-start gap-3 text-xs text-[#526058]">
            <Info className="w-4 h-4 text-[#1B5E20] shrink-0 mt-0.5" />
            <p className="font-semibold leading-relaxed">
              <strong>{isMr ? 'टीप व अस्वीकरण:' : 'Disclaimer:'}</strong>{' '}
              {isMr
                ? 'हे भाव केंद्र सरकारच्या Agmarknet (data.gov.in) प्रणालीतील शासकीय दर नोंदींवर आधारित आहेत. पुढील ७-१४ दिवसांचे अंदाज हे सांख्यिकी आणि ऐतिहासिक आलेखांवर आधारित असून ते केवळ मार्गदर्शनासाठी आहेत; प्रत्यक्ष बाजारात आवक व वातावरणावर भाव बदलू शकतात.'
                : 'Prices are based on official government mandi (Agmarknet) reported data. Price forecasts are indicative algorithmic projections based on historical moving averages and seasonal trends, not guaranteed financial guarantees.'}
            </p>
          </div>

        </div>
      )}

    </div>
  );
};
