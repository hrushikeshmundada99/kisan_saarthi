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
import { SellTimingCard } from '../components/SellTimingCard';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { useToast } from '../components/Toast';
import {
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
  Calendar,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  AlertCircle
} from 'lucide-react';

export const PriceForecastPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { showToast } = useToast();
  const isMr = i18n.language === 'mr';

  const cropParam = searchParams.get('crop');
  const mandiParam = searchParams.get('mandi');

  const [crop, setCrop] = useState<string>(cropParam && CROPS_LIST.includes(cropParam) ? cropParam : 'Onion');
  const [mandi, setMandi] = useState<string>(mandiParam && MANDIS_LIST.includes(mandiParam) ? mandiParam : 'Kopargaon');
  const [horizonDays, setHorizonDays] = useState<7 | 14 | 30>(14);
  const [historyTimeline, setHistoryTimeline] = useState<'30d' | '6m' | '1y' | '6y'>('30d');

  // Retraining state
  const [isRetraining, setIsRetraining] = useState<boolean>(false);
  const [showDiagnostics, setShowDiagnostics] = useState<boolean>(false);

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
        isMr
          ? `✅ AI मॉडेल यशस्वीरित्या अपडेट झाले! अचूकता: ${result.state.metrics.accuracyScorePct}%`
          : `✅ Model updated successfully! Accuracy: ${result.state.metrics.accuracyScorePct}%`,
        'success'
      );
    } catch (err) {
      showToast(isMr ? 'मॉडेल ट्रेनिंग करताना त्रुटी आली.' : 'Error updating model.', 'error');
    } finally {
      setIsRetraining(false);
    }
  };

  // Find today's index in the series
  const todayIdx = useMemo(() => {
    const idx = forecastData.findIndex((p) => p.actualPrice !== null && p.predictedPrice !== null);
    return idx !== -1 ? idx : Math.min(30, forecastData.length - 1);
  }, [forecastData]);

  const todayPoint = forecastData[todayIdx] || { actualPrice: 3950, predictedPrice: 3950 };
  const currentPrice = todayPoint.actualPrice || todayPoint.predictedPrice || 3950;

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

  // Processing linkage advice with case-insensitive crop lookup & live modal price
  const linkageKey = Object.keys(PROCESSING_LINKAGES).find((k) => k.toLowerCase() === (crop || '').toLowerCase()) || 'Tomato';
  const rawLinkage = PROCESSING_LINKAGES[linkageKey] || PROCESSING_LINKAGES['Tomato'];
  const processingLinkage = {
    ...rawLinkage,
    rawMandiPrice: currentPrice || rawLinkage.rawMandiPrice
  };

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto font-sans text-slate-800 animate-in fade-in duration-300">
      
      {/* 🌿 1. Clean, Minimalist Header & Selection Toolbar */}
      <div className="space-y-4">
        {/* Page Title & Subtitle */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 border-b border-slate-200 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>{modelState.metrics.accuracyScorePct}% Model Accuracy (R²: {modelState.metrics.r2Score})</span>
              </span>
              <span className="text-xs text-slate-500 font-medium hidden sm:inline">• 6-Year Historical Data</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              {t('forecast.title')}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 font-normal mt-1">
              {isMr 
                ? '६ वर्षांचा ऐतिहासिक Agmarknet डेटा (२,४२०+ दिवस) आणि मशीन लर्निंगवर आधारित दर अंदाज'
                : 'Crop price predictions based on 6 years of historical Agmarknet mandi trends.'}
            </p>
          </div>

          <div className="text-xs text-slate-500 font-medium shrink-0">
            {isMr ? `अद्ययावत: ${modelState.lastUpdated}` : `Last Updated: ${modelState.lastUpdated}`}
          </div>
        </div>

        {/* Clean Filter Controls Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
          
          {/* Crop Selector */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-700">
              {t('forecast.selectCrop')}
            </label>
            <div className="relative flex items-center">
              <Sprout className="absolute left-3.5 w-4 h-4 text-emerald-700 shrink-0 pointer-events-none" />
              <select
                value={crop}
                onChange={(e) => handleCropChange(e.target.value)}
                className="w-full pl-10 pr-4 h-11 bg-white border border-slate-300 rounded-xl text-slate-900 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 transition-all cursor-pointer shadow-xs"
              >
                {CROPS_LIST.map((cItem) => (
                  <option key={cItem} value={cItem} className="font-medium py-1">
                    {t(`crops.${cItem}`, cItem)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Mandi Selector */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-700">
              {t('forecast.selectMandi')}
            </label>
            <div className="relative flex items-center">
              <Store className="absolute left-3.5 w-4 h-4 text-amber-600 shrink-0 pointer-events-none" />
              <select
                value={mandi}
                onChange={(e) => handleMandiChange(e.target.value)}
                className="w-full pl-10 pr-4 h-11 bg-white border border-slate-300 rounded-xl text-slate-900 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 transition-all cursor-pointer shadow-xs"
              >
                {MANDIS_LIST.map((mItem) => (
                  <option key={mItem} value={mItem} className="font-medium py-1">
                    {t(`mandis.${mItem}`, mItem)}
                  </option>
                ))}
              </select>
            </div>
          </div>

        </div>
      </div>

      {/* 📊 2. Clean 3-Stat Metric Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Metric 1: Current Price */}
        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-2 hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <span>{t('forecast.currentPrice')}</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold text-slate-900 tracking-tight">
              ₹{currentPrice.toLocaleString('en-IN')}{' '}
              <span className="text-xs font-normal text-slate-500">/ क्विंटल</span>
            </div>
            <p className="text-xs text-emerald-700 font-medium flex items-center gap-1 mt-1">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>{t(`mandis.${mandi}`, mandi)} बाजार समिती</span>
            </p>
          </div>
        </div>

        {/* Metric 2: Expected Peak */}
        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-2 hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <span>{isMr ? `संभाव्य उच्चांकी दर (${horizonDays} दिवस)` : `Expected Peak (${horizonDays} Days)`}</span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-700">
              {isRising ? <TrendingUp className="w-4 h-4 text-emerald-600" /> : <TrendingDown className="w-4 h-4 text-rose-600" />}
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold text-amber-700 tracking-tight">
              ₹{peakPrice.toLocaleString('en-IN')}{' '}
              <span className="text-xs font-normal text-slate-500">/ क्विंटल</span>
            </div>
            <p className={`text-xs font-semibold flex items-center gap-1 mt-1 ${isRising ? 'text-emerald-700' : 'text-rose-700'}`}>
              {isRising ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
              <span>{pctChangeNum >= 0 ? `+${pctChangeNum}% अंदाजित वाढ` : `${pctChangeNum}% घसरण`}</span>
            </p>
          </div>
        </div>

        {/* Metric 3: Best Sell Window */}
        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-2 hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <span>{isMr ? 'विक्रीची योग्य वेळ' : 'Optimal Selling Window'}</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-800">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 tracking-tight truncate">
              {bestSellDate}
            </div>
            <p className="text-xs text-emerald-700 font-medium mt-1">
              {pctChangeNum >= 0
                ? `अतिरिक्त फायदा: +₹${Math.round(peakPrice - currentPrice)} / क्विंटल`
                : 'दर घटण्यापूर्वी माल विक्रीचा विचार करा'}
            </p>
          </div>
        </div>

      </div>

      {/* 🎯 3. "When to Sell?" AI Guidance Card */}
      <SellTimingCard crop={crop} mandi={mandi} />

      {/* 📈 4. Interactive Forecast Chart & Integrated Timeline Controls */}
      <div className="space-y-3">
        {/* Timeline Switcher Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
            <Calendar className="w-4 h-4 text-emerald-700" />
            <span>{isMr ? 'ऐतिहासिक डेटा कालावधी:' : 'Historical Timeline:'}</span>
          </div>

          <div className="inline-flex items-center p-1 bg-slate-100 rounded-xl">
            {([
              { id: '30d', label: isMr ? '३० दिवस' : '30 Days' },
              { id: '6m', label: isMr ? '६ महिने' : '6 Months' },
              { id: '1y', label: isMr ? '१ वर्ष' : '1 Year' },
              { id: '6y', label: isMr ? '६ वर्षे' : '6 Years' },
            ] as const).map((tItem) => {
              const isActive = historyTimeline === tItem.id;
              return (
                <button
                  key={tItem.id}
                  type="button"
                  onClick={() => setHistoryTimeline(tItem.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-emerald-700 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tItem.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Forecast Chart */}
        <ForecastChart
          crop={crop}
          mandi={mandi}
          data={forecastData}
          horizonDays={horizonDays}
          onHorizonChange={(h) => setHorizonDays(h)}
        />
      </div>

      {/* 🏭 5. Post-Harvest Value Addition & Processing */}
      <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/60">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {isMr ? 'काढणी पश्चात प्रक्रिया व थेट बाजार जोडणी' : 'Post-Harvest Processing & Market Linkage'}
              </h3>
              <p className="text-xs text-slate-500 font-normal">
                {isMr ? 'थेट प्रक्रिया केंद्राशी जोडल्यास जास्त दर मिळण्याची संधी' : 'Value addition options for better profit margins'}
              </p>
            </div>
          </div>

          <span className="px-3 py-1 bg-emerald-50 text-emerald-800 font-semibold text-xs rounded-xl border border-emerald-200 shrink-0 self-start sm:self-auto">
            +{processingLinkage.netExtraProfitPerQ} ₹/q अतिरिक्त नफा
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <span className="text-slate-500 font-medium">{isMr ? 'मंडी दर:' : 'Standard Rate:'}</span>
            <div className="text-base font-bold text-slate-900">
              ₹{processingLinkage.rawMandiPrice} / क्विंटल
            </div>
          </div>

          <div className="p-4 bg-[#FFFFFF] border border-[#D8E6D8] rounded-2xl space-y-1">
            <span className="text-[#1B5E20] font-black">
              {i18n.language === 'mr' ? 'प्रक्रिया / चॅनेल नाव:' : 'Processing / Channel:'}
            </span>
            <div className="text-sm font-black text-[#1B5E20]">
              {i18n.language === 'mr' ? processingLinkage.channelNameMr : processingLinkage.channelNameEn}
            </div>
          </div>

          <div className="p-4 bg-emerald-100 border border-emerald-300 rounded-2xl space-y-1">
            <span className="text-emerald-950 font-black">
              {i18n.language === 'mr' ? 'मिळणारा निव्वळ जादा भाव:' : 'Net Extra Realization:'}
            </span>
            <div className="text-xl font-black text-[#1B5E20]">
              +₹{processingLinkage.netExtraProfitPerQ} / {i18n.language === 'mr' ? 'क्विंटल' : 'Quintal'}
            </div>
          </div>
        </div>

        <div className="p-4 bg-[#FFFFFF] border-l-4 border-[#FFB300] rounded-r-2xl border border-[#D8E6D8]">
          <p className="text-sm font-black text-[#0F291E] leading-relaxed">
            👉 {i18n.language === 'mr' ? processingLinkage.recommendedActionMr : processingLinkage.recommendedActionEn}
          </p>
        </div>
      </div>

      {/* 💡 6. AI Agronomist Insight */}
      <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700 border border-amber-200/60">
            <Lightbulb className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {t('forecast.insightTitle')}
            </h3>
            <p className="text-xs text-slate-500">
              {isMr ? 'ऐतिहासिक डेटा आणि AI मॉडेल शिफारस' : 'Market intelligence recommendation'}
            </p>
          </div>
        </div>

        <div className="border-l-4 border-emerald-600 bg-emerald-50/50 p-4 rounded-r-xl text-sm font-semibold text-slate-900 leading-relaxed">
          "{isRising
            ? (isMr
                ? `पुढील ${horizonDays} दिवसांत ${t(`crops.${crop}`, crop)} भावात सुमारे ~${Math.abs(pctChangeNum)}% तेजीचा अंदाज आहे. साठवणूक क्षमता असल्यास थांबून विक्री करणे फायदेशीर ठरेल.`
                : `Prices for ${t(`crops.${crop}`, crop)} are expected to rise by ~${Math.abs(pctChangeNum)}% over the next ${horizonDays} days.`)
            : (isMr
                ? `पुढील ${horizonDays} दिवसांत भावात ~${Math.abs(pctChangeNum)}% घटीची शक्यता आहे. सध्याचा दर उत्तम असल्याने माल विक्री करणे योग्य ठरेल.`
                : `Prices are expected to decline by ~${Math.abs(pctChangeNum)}% over the next ${horizonDays} days. Consider selling soon.`)
          }"
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span className="flex items-center gap-1.5 font-medium text-slate-700">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>AI Reliability Score: <strong>{modelState.metrics.accuracyScorePct}% (R²: {modelState.metrics.r2Score})</strong></span>
          </span>

          <div className="inline-flex items-center gap-1 text-slate-500 text-xs">
            <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>{isMr ? 'स्थानिक आवकनुसार दरात बदल संभवतो' : 'Rates may vary with sudden supply spikes'}</span>
          </div>
        </div>
      </div>

      {/* ⚙️ 7. Minimalist Collapsible Model Performance & Technical Specs */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-slate-500" />
            <span className="text-xs font-semibold text-slate-700">
              {isMr ? 'AI मॉडेल तांत्रिक तपशील (Model Specs)' : 'Model Specifications'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRetrainModel}
              disabled={isRetraining}
              className="rounded-lg h-8 text-xs font-semibold border-slate-300 hover:bg-slate-50 text-slate-700"
            >
              <RefreshCw className={`w-3 h-3 text-slate-600 ${isRetraining ? 'animate-spin' : ''}`} />
              <span>{isRetraining ? (isMr ? 'ट्रेनिंग...' : 'Updating...') : (isMr ? 'अपडेट करा' : 'Update Model')}</span>
            </Button>

            <button
              onClick={() => setShowDiagnostics((prev) => !prev)}
              className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer border border-slate-200"
            >
              {showDiagnostics ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {showDiagnostics && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-2 border-t border-slate-100 animate-in fade-in duration-200">
            <div className="p-3 bg-slate-50 rounded-xl space-y-0.5">
              <span className="text-slate-500 block font-medium">Training Data:</span>
              <span className="font-semibold text-slate-900">2020 - 2026 (6 Years)</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl space-y-0.5">
              <span className="text-slate-500 block font-medium">MAPE Score:</span>
              <span className="font-semibold text-emerald-700">{modelState.metrics.mapePct}%</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl space-y-0.5">
              <span className="text-slate-500 block font-medium">RMSE Error:</span>
              <span className="font-semibold text-slate-900">₹{modelState.metrics.rmse}/Q</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl space-y-0.5">
              <span className="text-slate-500 block font-medium">Pipeline Status:</span>
              <span className="font-semibold text-emerald-700">● Online Daily Sync</span>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
