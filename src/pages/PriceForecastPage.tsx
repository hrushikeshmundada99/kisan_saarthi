import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import {
  CROPS_LIST,
  MANDIS_LIST,
  getForecastDataForCombination,
  type ForecastPointItem
} from '../data/forecastData';
import {
  PROCESSING_LINKAGES
} from '../data/weatherAndRecommendationData';
import {
  getOrTrainModelState,
  triggerManualRetrain,
  type ModelTrainingState
} from '../services/dailyModelUpdater';
import { ForecastChart } from '../components/ForecastChart';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { useToast } from '../components/Toast';
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
  TrendingUp,
  TrendingDown,
  DollarSign,
  Building2,
  Award,
  Cpu,
  CheckCircle2,
  Calendar
} from 'lucide-react';

export const PriceForecastPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { showToast } = useToast();

  const cropParam = searchParams.get('crop');
  const mandiParam = searchParams.get('mandi');

  const [crop, setCrop] = useState<string>(cropParam && CROPS_LIST.includes(cropParam) ? cropParam : 'Onion');
  const [mandi, setMandi] = useState<string>(mandiParam && MANDIS_LIST.includes(mandiParam) ? mandiParam : 'Kopargaon');
  const [horizonDays, setHorizonDays] = useState<7 | 14 | 30>(14);
  const [historyTimeline, setHistoryTimeline] = useState<'30d' | '6m' | '1y' | '6y'>('30d');

  // Retraining state
  const [isRetraining, setIsRetraining] = useState<boolean>(false);

  // Model State with continuous daily learning
  const [modelState, setModelState] = useState<ModelTrainingState>(() => getOrTrainModelState(crop, mandi));

  // Sync state to URL search params
  const handleCropChange = (newCrop: string) => {
    setCrop(newCrop);
    setSearchParams({ crop: newCrop, mandi });
  };

  const handleMandiChange = (newMandi: string) => {
    setMandi(newMandi);
    setSearchParams({ crop, mandi: newMandi });
  };

  // Update model state when crop or mandi changes
  useEffect(() => {
    const updatedState = getOrTrainModelState(crop, mandi);
    setModelState(updatedState);
  }, [crop, mandi]);

  // Determine history window days based on timeline selector
  const historyWindowDays = useMemo(() => {
    switch (historyTimeline) {
      case '6y': return 2190;
      case '1y': return 365;
      case '6m': return 180;
      case '30d': default: return 30;
    }
  }, [historyTimeline]);

  // Fetch forecast time series data
  const forecastData: ForecastPointItem[] = useMemo(() => {
    return getForecastDataForCombination(crop, mandi, horizonDays, historyWindowDays);
  }, [crop, mandi, horizonDays, historyWindowDays]);

  // Manual Trigger: Retrain Model
  const handleRetrainModel = async () => {
    try {
      setIsRetraining(true);
      const result = await triggerManualRetrain(crop, mandi);
      setModelState(result.state);
      showToast(
        i18n.language === 'mr'
          ? `✅ AI मॉडेल ६ वर्षांच्या Agmarknet डेटावर यशस्वीरित्या पुन्हा ट्रेन झाले! अचूकता: ${result.state.metrics.accuracyScorePct}%`
          : `✅ AI Model retrained successfully on 6-year Agmarknet data! Accuracy: ${result.state.metrics.accuracyScorePct}%`,
        'success'
      );
    } catch (err) {
      showToast('मॉडेल ट्रेनिंग करताना त्रुटी आली.', 'error');
    } finally {
      setIsRetraining(false);
    }
  };

  // Find today's index in the series
  const todayIdx = useMemo(() => {
    const idx = forecastData.findIndex((p) => p.actualPrice !== null && p.predictedPrice !== null);
    return idx !== -1 ? idx : Math.min(30, forecastData.length - 1);
  }, [forecastData]);

  const todayPoint = forecastData[todayIdx] || { actualPrice: 1850, predictedPrice: 1850 };
  const currentPrice = todayPoint.actualPrice || todayPoint.predictedPrice || 1850;

  // Peak in future horizon window
  const futureSlice = forecastData.slice(todayIdx, todayIdx + horizonDays + 1);
  const futurePrices = futureSlice
    .map((p) => p.predictedPrice)
    .filter((p): p is number => p !== null && p !== undefined);

  const peakPrice = futurePrices.length > 0 ? Math.max(...futurePrices) : currentPrice;

  // Best Selling Date
  const peakPoint = futureSlice.find((p) => p.predictedPrice === peakPrice);
  const bestSellDate = peakPoint?.date || 'पुढील १०-१२ दिवस';

  // Percentage Change Calculation
  const startPrice = currentPrice;
  const lastFuturePoint = futureSlice[futureSlice.length - 1];
  const endPrice = lastFuturePoint?.predictedPrice || currentPrice;
  const pctChangeNum = parseFloat((((endPrice - startPrice) / (startPrice || 1)) * 100).toFixed(1));
  const isRising = pctChangeNum >= 0;

  // Processing linkage advice
  const processingLinkage = PROCESSING_LINKAGES[crop] || PROCESSING_LINKAGES['Onion'];

  return (
    <div className="space-y-4 sm:space-y-5 pb-6 max-w-7xl mx-auto animate-in fade-in duration-200">
      
      {/* 1. Header Card with Crop & Mandi Selectors */}
      <Card hoverable={false} className="p-4 sm:p-6 bg-gradient-to-br from-[#FFFFFF] via-[#F7FBF7] to-[#E8F5E9] border-2 border-[#81C784]/60 rounded-3xl shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E1EBE1] pb-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#2E7D32]/10 text-[#2E7D32] text-xs font-black">
                <Sparkles className="w-3.5 h-3.5 text-[#FFC107] animate-pulse" />
                <span>६-वर्षीय Agmarknet AI दर मॉडेल (2020-2026)</span>
              </div>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-950 border border-emerald-300 shadow-xs">
                <ShieldCheck className="w-3.5 h-3.5 text-[#43A047]" />
                <span>अचूकता: {modelState.metrics.accuracyScorePct}% (R²: {modelState.metrics.r2Score})</span>
              </span>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-teal-100 text-teal-950 border border-teal-300 shadow-xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-700" />
                <span>दैनिक अपडेट: {modelState.lastUpdated}</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#1B4332] tracking-tight">
              {t('forecast.title')}
            </h1>
            <p className="text-xs sm:text-sm text-[#6B7280] font-semibold">
              मागील ६ वर्षांचा Agmarknet ऐतिहासिक डेटा (२,४२०+ दिवस) व AI मशीन लर्निंगवर आधारित अचूक दर अंदाज
            </p>
          </div>

          {/* Quick Info Badges */}
          <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 sm:gap-3 w-full md:w-auto shrink-0">
            <div className="px-3 py-2 sm:px-4 sm:py-3 bg-[#FFFFFF] rounded-2xl border border-[#D8E6D8] text-center shadow-xs">
              <span className="text-[10px] sm:text-[11px] font-black text-[#526058] uppercase block">
                {i18n.language === 'mr' ? 'निवडलेले पिक' : 'Selected Crop'}
              </span>
              <span className="text-sm sm:text-base font-black text-[#1B5E20] truncate block">{t(`crops.${crop}`, crop)}</span>
            </div>
            <div className="px-3 py-2 sm:px-4 sm:py-3 bg-[#FFFFFF] rounded-2xl border border-[#D8E6D8] text-center shadow-xs">
              <span className="text-[10px] sm:text-[11px] font-black text-[#526058] uppercase block">
                {i18n.language === 'mr' ? 'बाजार समिती' : 'Mandi'}
              </span>
              <span className="text-sm sm:text-base font-black text-[#0F291E] truncate block">{t(`mandis.${mandi}`, mandi)}</span>
            </div>
          </div>
        </div>

        {/* Dropdown Selectors */}
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
                className="w-full pl-11 pr-4 min-h-[50px] bg-[#FFFFFF] border-2 border-[#E1EBE1] rounded-2xl text-[#1B4332] font-extrabold text-sm focus:outline-none focus:ring-4 focus:ring-[#2E7D32]/20 focus:border-[#2E7D32] transition-all cursor-pointer shadow-xs"
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
                className="w-full pl-11 pr-4 min-h-[50px] bg-[#FFFFFF] border-2 border-[#E1EBE1] rounded-2xl text-[#1B4332] font-extrabold text-sm focus:outline-none focus:ring-4 focus:ring-[#2E7D32]/20 focus:border-[#2E7D32] transition-all cursor-pointer shadow-xs"
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

      {/* 2. ⚡ AI Model Continuous Training & Performance Card */}
      <Card hoverable={false} className="p-4 sm:p-6 bg-[#FFFFFF] border-2 border-[#D8E6D8] rounded-3xl shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E1EBE1]">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#1B5E20] text-[#FFC107] flex items-center justify-center font-black shrink-0 shadow-xs">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-[#0F291E] flex items-center gap-2">
                <span>AI मॉडेल ट्रेनिंग व परफॉर्मन्स (Continuous Learning)</span>
                <span className="text-[10px] px-2 py-0.5 bg-emerald-100 text-emerald-950 font-black rounded-full border border-emerald-300">
                  {modelState.metrics.modelVersion}
                </span>
              </h3>
              <p className="text-xs text-[#526058] font-bold">
                डेटाबेस: २०२० ते २०२६ (६ वर्षे, २,४२० दिवस) • अल्गोरिदम: Holt-Winters Triple Smoothing + Elasticity
              </p>
            </div>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={handleRetrainModel}
            disabled={isRetraining}
            className="rounded-2xl min-h-[42px] font-black text-xs shrink-0 self-start sm:self-auto"
          >
            <RefreshCw className={`w-4 h-4 text-[#FFC107] ${isRetraining ? 'animate-spin' : ''}`} />
            <span>{isRetraining ? 'मॉडेल ट्रेनिंग सुरू आहे...' : '⚡ मॉडेल री-ट्रेन करा (Retrain Model)'}</span>
          </Button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-[#F4F9F4] rounded-2xl border border-[#D8E6D8] space-y-1">
            <span className="text-[#526058] font-bold block">प्रशिक्षण कालावधी:</span>
            <span className="text-base font-black text-[#1B5E20]">६ वर्षे (2020-2026)</span>
            <span className="text-[10px] text-[#526058] block">{modelState.totalTrainingDays} दैनिक रेकॉर्ड्स</span>
          </div>

          <div className="p-3 bg-[#F4F9F4] rounded-2xl border border-[#D8E6D8] space-y-1">
            <span className="text-[#526058] font-bold block">मॉडेल अचूकता (Accuracy):</span>
            <span className="text-base font-black text-[#1B5E20]">{modelState.metrics.accuracyScorePct}%</span>
            <span className="text-[10px] text-emerald-700 block font-bold">MAPE: {modelState.metrics.mapePct}%</span>
          </div>

          <div className="p-3 bg-[#F4F9F4] rounded-2xl border border-[#D8E6D8] space-y-1">
            <span className="text-[#526058] font-bold block">R² तंदुरुस्ती स्कोअर:</span>
            <span className="text-base font-black text-[#0F291E]">{modelState.metrics.r2Score}</span>
            <span className="text-[10px] text-teal-800 block font-bold">RMSE: ₹{modelState.metrics.rmse}/Q</span>
          </div>

          <div className="p-3 bg-[#F4F9F4] rounded-2xl border border-[#D8E6D8] space-y-1">
            <span className="text-[#526058] font-bold block">दैनिक स्वयंचलित अपडेट:</span>
            <span className="text-xs font-black text-[#0F291E] block truncate">{modelState.lastUpdated}</span>
            <span className="text-[10px] text-emerald-700 block font-bold">● Active Online Pipeline</span>
          </div>
        </div>
      </Card>

      {/* 3. Historical Timeline Explorer Switcher */}
      <Card hoverable={false} className="p-4 bg-[#FFFFFF] border-2 border-[#D8E6D8] rounded-3xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-black text-[#0F291E]">
          <Calendar className="w-4 h-4 text-[#1B5E20]" />
          <span>ऐतिहासिक डेटा कालावधी (Historical Timeline):</span>
        </div>

        <div className="inline-flex items-center p-1 bg-[#F4F9F4] border border-[#D8E6D8] rounded-2xl shadow-xs self-start sm:self-auto">
          {([
            { id: '30d', label: '३० दिवस (30 Days)' },
            { id: '6m', label: '६ महिने (6 Months)' },
            { id: '1y', label: '१ वर्ष (1 Year)' },
            { id: '6y', label: '⭐ ६ वर्षे (6 Years / 2020-2026)' },
          ] as const).map((tItem) => {
            const isActive = historyTimeline === tItem.id;
            return (
              <button
                key={tItem.id}
                type="button"
                onClick={() => setHistoryTimeline(tItem.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-[#1B5E20] to-[#2E7D32] text-[#FFFFFF] shadow-sm'
                    : 'text-[#526058] hover:text-[#0F291E]'
                }`}
              >
                {tItem.label}
              </button>
            );
          })}
        </div>
      </Card>

      {/* 4. Key Metrics: Today Price, Forecast Peak, Best Selling Window */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
        
        {/* Today's Price */}
        <Card hoverable={false} className="p-5 sm:p-6 space-y-2 border-2 border-[#D8E6D8] rounded-3xl shadow-xs bg-[#FFFFFF]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-[#526058] uppercase tracking-wider">
              {t('forecast.currentPrice')}
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#1B5E20] flex items-center justify-center font-bold">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-[#1B5E20]">
            ₹{currentPrice.toLocaleString('en-IN')}{' '}
            <span className="text-xs font-bold text-[#526058]">/ क्विंटल</span>
          </div>
          <p className="text-xs text-emerald-700 font-black flex items-center gap-1">
            <ArrowUpRight className="w-4 h-4" />
            <span>आज {t(`mandis.${mandi}`, mandi)} बाजार समिती</span>
          </p>
        </Card>

        {/* Expected Peak in Horizon */}
        <Card hoverable={false} className="p-5 sm:p-6 space-y-2 bg-[#F4F9F4] border-2 border-[#FFB300]/60 rounded-3xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-[#D97706] uppercase tracking-wider">
              संभाव्य उच्चांकी दर ({horizonDays} दिवस)
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-[#D97706] flex items-center justify-center font-bold">
              {isRising ? <TrendingUp className="w-5 h-5 text-[#16A34A]" /> : <TrendingDown className="w-5 h-5 text-[#DC2626]" />}
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-[#D97706]">
            ₹{peakPrice.toLocaleString('en-IN')}{' '}
            <span className="text-xs font-bold text-[#526058]">/ क्विंटल</span>
          </div>
          <p className="text-xs text-[#D97706] font-black flex items-center gap-1">
            {isRising ? <ArrowUpRight className="w-4 h-4 text-[#16A34A]" /> : <ArrowDownRight className="w-4 h-4 text-[#DC2626]" />}
            <span>अंदाजित बदल: {pctChangeNum >= 0 ? `+${pctChangeNum}% तेजी` : `${pctChangeNum}% घसरण`}</span>
          </p>
        </Card>

        {/* 🏆 Best Selling Window Recommendation */}
        <Card hoverable={false} className="p-5 sm:p-6 space-y-2 border-2 border-[#1B5E20] rounded-3xl shadow-xs bg-gradient-to-br from-[#FFFFFF] via-[#F4F9F4] to-[#E8F5E9]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-[#1B5E20] uppercase tracking-wider">
              कधी विकावे? (Best Selling Window)
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#FFB300] text-[#0F291E] flex items-center justify-center font-bold shadow-xs">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#0F291E] truncate">
            {bestSellDate}
          </div>
          <p className="text-xs text-emerald-800 font-bold">
            {pctChangeNum >= 0
              ? `संभाव्य फायदा: +₹${Math.round(peakPrice - currentPrice)} / क्विंटल जास्तीचा नफा`
              : 'दर कमी होण्याआधी त्वरित मालाची विक्री करा'}
          </p>
        </Card>

      </div>

      {/* 5. Interactive Forecast Chart with Horizon Controls */}
      <ForecastChart
        crop={crop}
        mandi={mandi}
        data={forecastData}
        horizonDays={horizonDays}
        onHorizonChange={(h) => setHorizonDays(h)}
      />

      {/* 6. Post-Harvest Processing & Market Linkage Advice Card */}
      <Card hoverable={false} className="p-6 sm:p-8 bg-gradient-to-br from-[#FFFFFF] via-[#F4F9F4] to-[#E8F5E9] border-2 border-[#1B5E20] rounded-3xl shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E1EBE1]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#1B5E20] text-[#FFC107] flex items-center justify-center font-black shrink-0 shadow-xs">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-black text-[#0F291E]">
                काढणी पश्चात प्रक्रिया व थेट बाजार जोडणी
              </h3>
              <span className="text-xs font-bold text-[#526058]">
                "केवळ कच्चा माल मंडीत विकण्याऐवजी प्रक्रिया केंद्राशी जोडल्यास जास्त नफा मिळवा"
              </span>
            </div>
          </div>

          <span className="px-3.5 py-1.5 bg-[#FFB300] text-[#0F291E] font-black text-xs rounded-2xl shadow-xs shrink-0 self-start sm:self-auto">
            +{processingLinkage.netExtraProfitPerQ} ₹/q अतिरिक्त नफा
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-bold">
          <div className="p-4 bg-[#FFFFFF] border border-[#D8E6D8] rounded-2xl space-y-1">
            <span className="text-[#526058] font-black">साधा मंडी भाव:</span>
            <div className="text-xl font-black text-[#0F291E]">
              ₹{processingLinkage.rawMandiPrice} / क्विंटल
            </div>
          </div>

          <div className="p-4 bg-[#FFFFFF] border border-[#D8E6D8] rounded-2xl space-y-1">
            <span className="text-[#1B5E20] font-black">प्रक्रिया / चॅनेल नाव:</span>
            <div className="text-sm font-black text-[#1B5E20]">
              {processingLinkage.channelNameMr}
            </div>
          </div>

          <div className="p-4 bg-emerald-100 border border-emerald-300 rounded-2xl space-y-1">
            <span className="text-emerald-950 font-black">मिळणारा निव्वळ जादा भाव:</span>
            <div className="text-xl font-black text-[#1B5E20]">
              +₹{processingLinkage.netExtraProfitPerQ} / क्विंटल
            </div>
          </div>
        </div>

        <div className="p-4 bg-[#FFFFFF] border-l-4 border-[#FFB300] rounded-r-2xl border border-[#D8E6D8]">
          <p className="text-sm font-black text-[#0F291E] leading-relaxed">
            👉 {processingLinkage.recommendedActionMr}
          </p>
        </div>
      </Card>

      {/* 7. AI Agronomist Recommendation & Risk Summary Card */}
      <Card hoverable={false} className="p-6 sm:p-8 bg-[#FFFFFF] border-2 border-[#D8E6D8] rounded-3xl shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#1B5E20] text-[#FFC107] flex items-center justify-center font-black shrink-0 shadow-xs">
            <Lightbulb className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h3 className="text-xl font-black text-[#0F291E]">
              {t('forecast.insightTitle')}
            </h3>
            <span className="text-xs font-bold text-[#526058]">
              ६-वर्षीय ऐतिहासिक कल आणि AI मशीन लर्निंग शिफारस
            </span>
          </div>
        </div>

        <div className="border-l-4 border-[#1B5E20] bg-[#F4F9F4] p-5 rounded-r-2xl border border-[#D8E6D8]">
          <p className="text-base text-[#0F291E] leading-relaxed font-black">
            "{isRising
              ? `पुढील ${horizonDays} दिवसांत ${t(`crops.${crop}`, crop)} भावात सुमारे ~${Math.abs(pctChangeNum)}% तेजीचा अंदाज आहे. सर्वोत्तम विक्री तारीख: ${bestSellDate}. साठवणूक क्षमता असल्यास माल थांबवून विक्री करणे फायदेशीर ठरेल.`
              : `पुढील ${horizonDays} दिवसांत भावात सुमारे ~${Math.abs(pctChangeNum)}% घटीची शक्यता आहे. सर्वोत्तम विक्री दर आज उपलब्ध असल्याने लवकरात लवकर माल विक्री करणे योग्य ठरेल.`
            }"
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-[#526058] pt-2 border-t border-[#E1EBE1]">
          <span className="flex items-center gap-1.5 font-black text-[#1B5E20]">
            <ShieldCheck className="w-4 h-4 text-[#16A34A]" />
            <span>AI मॉडेल विश्वासार्हता स्कोअर: <strong>{modelState.metrics.accuracyScorePct}% (R²: {modelState.metrics.r2Score})</strong></span>
          </span>

          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 text-amber-950 border border-amber-300 font-bold">
            <AlertCircle className="w-4 h-4 text-[#FFB300] shrink-0" />
            <span>जोखीम टीप: आवक वाढ किंवा अवकाळी हवामानानुसार स्थानिक दरात तफावत संभवते</span>
          </div>
        </div>
      </Card>

    </div>
  );
};
