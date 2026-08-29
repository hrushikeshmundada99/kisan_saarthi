import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import {
  REGIONAL_STORAGE_FACILITIES,
  filterFacilities,
  type StorageFacility
} from '../data/storageFacilitiesData';
import {
  analyzeStorageDecision,
  type StorageDecisionResult
} from '../services/storageIntelligenceEngine';
import { REAL_DASHBOARD_CARDS } from '../data/realData';
import { FacilityDetailsModal } from '../components/FacilityDetailsModal';
import { Card } from '../components/Card';
import { useToast } from '../components/Toast';
import {
  Building2,
  ShieldCheck,
  Phone,
  ExternalLink,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Sparkles,
  Info
} from 'lucide-react';

const CROP_OPTIONS = [
  'Onion',
  'Potato',
  'Tomato',
  'Wheat',
  'Soybean',
  'Cotton',
  'Pomegranate',
  'Grapes',
  'Maize'
];

const MANDI_OPTIONS = [
  'Kopargaon',
  'Rahata',
  'Yeola',
  'Lasalgaon',
  'Nashik',
  'Shrirampur',
  'Sangamner',
  'Ahilyanagar'
];

export const StorageIntelligencePage: React.FC = () => {
  const { i18n } = useTranslation();
  const isMr = i18n.language === 'mr';
  const [searchParams] = useSearchParams();
  const { showToast } = useToast();

  // Query Param Prefills
  const paramCrop = searchParams.get('crop') || 'Onion';
  const paramMandi = searchParams.get('mandi') || 'Kopargaon';

  // State Filters
  const [crop, setCrop] = useState<string>(paramCrop);
  const [mandi, setMandi] = useState<string>(paramMandi);
  const [quantityQ, setQuantityQ] = useState<number>(100);
  const [storageDays, setStorageDays] = useState<number>(30);
  const [maxDistanceKm, setMaxDistanceKm] = useState<number>(50);
  const [facilityType, setFacilityType] = useState<string>('all');

  // Selected Facility State
  const [selectedFacilityId, setSelectedFacilityId] = useState<string>(
    REGIONAL_STORAGE_FACILITIES[0].id
  );
  const [activeModalFacility, setActiveModalFacility] = useState<StorageFacility | null>(null);

  // Filtered Facilities List
  const filteredFacilities = useMemo(() => {
    return filterFacilities(REGIONAL_STORAGE_FACILITIES, {
      crop,
      mandi,
      maxDistanceKm,
      facilityType,
      minCapacityQuintals: quantityQ
    });
  }, [
    crop,
    mandi,
    maxDistanceKm,
    facilityType,
    quantityQ
  ]);

  // Active Selected Facility
  const activeFacility = useMemo(() => {
    return (
      filteredFacilities.find((f) => f.id === selectedFacilityId) ||
      filteredFacilities[0] ||
      REGIONAL_STORAGE_FACILITIES[0]
    );
  }, [filteredFacilities, selectedFacilityId]);

  // Keep selected facility in sync if filtered list updates
  useEffect(() => {
    if (filteredFacilities.length > 0 && !filteredFacilities.some((f) => f.id === selectedFacilityId)) {
      setSelectedFacilityId(filteredFacilities[0].id);
    }
  }, [filteredFacilities, selectedFacilityId]);

  // Current Mandi Price Lookup
  const currentPrice = useMemo(() => {
    const card = REAL_DASHBOARD_CARDS.find((c) => c.crop === crop && c.mandiName === mandi) ||
      REAL_DASHBOARD_CARDS.find((c) => c.crop === crop);
    return card?.modalPrice || (crop === 'Onion' ? 4150 : 5000);
  }, [crop, mandi]);

  // Run Storage Decision Analysis
  const decisionResult: StorageDecisionResult = useMemo(() => {
    return analyzeStorageDecision({
      crop,
      mandiName: mandi,
      quantityQ,
      currentPriceOverride: currentPrice,
      facility: activeFacility,
      storageDurationDays: storageDays
    });
  }, [crop, mandi, quantityQ, currentPrice, activeFacility, storageDays]);

  const handleBestStorageClick = () => {
    if (filteredFacilities.length === 0) {
      showToast(isMr ? 'कोणतेही योग्य गोदाम सापडले नाही.' : 'No matching facility found.', 'error');
      return;
    }
    // Find highest rated / best match facility
    const best = [...filteredFacilities].sort((a, b) => b.reliabilityScore - a.reliabilityScore)[0];
    setSelectedFacilityId(best.id);
    showToast(
      isMr
        ? `⚡ ${best.nameMr} हे सर्वोत्कृष्ट केंद्र निवडले!`
        : `⚡ Selected ${best.name} as best match!`,
      'success'
    );
  };

  return (
    <div className="space-y-5 pb-8 max-w-7xl mx-auto animate-in fade-in duration-200">
      
      {/* 1. Page Header Card */}
      <Card hoverable={false} className="p-4 sm:p-6 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1B5E20]/10 text-[#1B5E20] text-xs font-black mb-2">
              <Building2 className="w-3.5 h-3.5 text-[#FFB300]" />
              <span>{isMr ? 'साठवणूक बुद्धिमत्ता व निर्णय सल्लागार' : 'Storage Intelligence Engine'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#1B4332] tracking-tight">
              {isMr ? 'साठवणूक बुद्धिमत्ता (SELL NOW vs STORE)' : 'Storage Intelligence Engine'}
            </h1>
            <p className="text-xs sm:text-sm text-[#526058] font-semibold mt-1">
              {isMr
                ? 'आजच माल विकावा की साठवून ठेवून भविष्यात विकावा? साठवणूक खर्च, वजन घट व धोके तपासून निखळ नफ्याचे अचूक गणित.'
                : 'Decide whether to sell immediately or store produce. Evaluates costs, spoilage, future prices & risk.'}
            </p>
          </div>

          <button
            onClick={handleBestStorageClick}
            className="self-start md:self-auto px-5 py-3 bg-[#FFC107] hover:bg-[#FFB300] text-[#1B4332] font-black text-xs sm:text-sm rounded-2xl transition-all shadow-md flex items-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isMr ? '⚡ सर्वोत्कृष्ट साठवणूक पर्याय शोधा' : '⚡ Find Best Storage For Me'}</span>
          </button>
        </div>

        {/* 2. Controls Grid (Crop + Mandi + Quantity + Duration) */}
        <div className="pt-4 border-t border-[#E1EBE1] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4">
          
          {/* Crop Selection */}
          <div className="lg:col-span-4 space-y-1.5">
            <label className="block text-xs font-extrabold text-[#1B4332] uppercase tracking-wider">
              {isMr ? '१. पिक निवडा (CROP):' : '1. Select Crop:'}
            </label>
            <select
              value={crop}
              onChange={(e) => setCrop(e.target.value)}
              className="w-full px-3 py-2.5 bg-[#FFFFFF] border-2 border-[#E1EBE1] rounded-2xl text-xs sm:text-sm font-black text-[#1B4332] focus:ring-3 focus:ring-[#2E7D32]/20 focus:border-[#2E7D32] transition-all cursor-pointer shadow-xs min-h-[46px]"
            >
              {CROP_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  🌱 {c}
                </option>
              ))}
            </select>
          </div>

          {/* Mandi Selection */}
          <div className="lg:col-span-3 space-y-1.5">
            <label className="block text-xs font-extrabold text-[#1B4332] uppercase tracking-wider">
              {isMr ? '२. बाजार समिती (TARGET MANDI):' : '2. Target Mandi:'}
            </label>
            <select
              value={mandi}
              onChange={(e) => setMandi(e.target.value)}
              className="w-full px-3 py-2.5 bg-[#FFFFFF] border-2 border-[#E1EBE1] rounded-2xl text-xs sm:text-sm font-black text-[#1B4332] focus:ring-3 focus:ring-[#2E7D32]/20 focus:border-[#2E7D32] transition-all cursor-pointer shadow-xs min-h-[46px]"
            >
              {MANDI_OPTIONS.map((m) => (
                <option key={m} value={m}>
                  📍 {m} APMC (₹{REAL_DASHBOARD_CARDS.find((c) => c.mandiName === m && c.crop === crop)?.modalPrice || currentPrice}/Q)
                </option>
              ))}
            </select>
          </div>

          {/* Quantity Input */}
          <div className="lg:col-span-3 space-y-1.5">
            <label className="block text-xs font-extrabold text-[#1B4332] uppercase tracking-wider">
              {isMr ? '३. एकूण वजन (QUANTITY IN Q):' : '3. Quantity (Quintals):'}
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="5"
                max="1000"
                value={quantityQ}
                onChange={(e) => setQuantityQ(Math.max(1, Number(e.target.value)))}
                className="w-full px-3 py-2.5 bg-[#FFFFFF] border-2 border-[#E1EBE1] rounded-2xl text-xs sm:text-sm font-black text-[#1B4332] focus:ring-3 focus:ring-[#2E7D32]/20 focus:border-[#2E7D32] transition-all min-h-[46px] shadow-xs"
              />
              <div className="flex gap-1 shrink-0">
                {[50, 100, 200].map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => setQuantityQ(q)}
                    className={`px-2 py-1 text-[11px] font-bold rounded-lg border cursor-pointer ${
                      quantityQ === q
                        ? 'bg-[#1B5E20] text-white border-[#1B5E20]'
                        : 'bg-white text-[#1B4332] border-[#D8E6D8] hover:bg-[#E8F5E9]'
                    }`}
                  >
                    {q}Q
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Storage Duration Days */}
          <div className="lg:col-span-2 space-y-1.5">
            <label className="block text-xs font-extrabold text-[#1B4332] uppercase tracking-wider">
              {isMr ? '४. कालावधी (DURATION):' : '4. Storage Duration:'}
            </label>
            <select
              value={storageDays}
              onChange={(e) => setStorageDays(Number(e.target.value))}
              className="w-full px-3 py-2.5 bg-[#FFFFFF] border-2 border-[#E1EBE1] rounded-2xl text-xs sm:text-sm font-black text-[#1B4332] focus:ring-3 focus:ring-[#2E7D32]/20 focus:border-[#2E7D32] transition-all cursor-pointer shadow-xs min-h-[46px]"
            >
              <option value={15}>{isMr ? '१५ दिवस (15 Days)' : '15 Days'}</option>
              <option value={30}>{isMr ? '३० दिवस (30 Days)' : '30 Days'}</option>
              <option value={45}>{isMr ? '४५ दिवस (45 Days)' : '45 Days'}</option>
              <option value={60}>{isMr ? '६० दिवस (60 Days)' : '60 Days'}</option>
              <option value={90}>{isMr ? '९० दिवस (90 Days)' : '90 Days'}</option>
            </select>
          </div>

        </div>
      </Card>

      {/* 3. MASTER DECISION CARD: SELL NOW vs STORE & SELL LATER */}
      <Card hoverable={false} className="p-4 sm:p-6 space-y-5 border-2 border-[#1B5E20]/30 bg-[#FFFFFF]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E1EBE1] pb-4">
          <div>
            <span className="px-3 py-1 bg-[#1B5E20] text-white text-xs font-black rounded-full shadow-xs">
              {isMr ? 'अंतिम आर्थिक तुलना' : 'Master Financial Decision'}
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-[#1B4332] mt-1.5 flex items-center gap-2">
              <span>{isMr ? '🌾 आजच विक्री (SELL NOW) vs साठवणूक (STORE & SELL LATER)' : '🌾 SELL NOW vs STORE & SELL LATER'}</span>
            </h2>
          </div>

          {/* Decision Status Badge */}
          <div className="self-start sm:self-auto">
            <span
              className={`px-4 py-2 text-xs sm:text-sm font-black rounded-2xl shadow-md inline-flex items-center gap-1.5 ${
                decisionResult.recommendation === 'STORE'
                  ? 'bg-emerald-600 text-white'
                  : decisionResult.recommendation === 'HOLD_WITH_CAUTION'
                  ? 'bg-amber-500 text-white'
                  : 'bg-rose-600 text-white'
              }`}
            >
              <span>{isMr ? decisionResult.recommendationTitleMr : decisionResult.recommendationTitleEn}</span>
            </span>
          </div>
        </div>

        {/* Side-by-Side Options Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          
          {/* OPTION A: SELL NOW */}
          <div className="p-4 sm:p-5 rounded-2xl border-2 border-[#D8E6D8] bg-[#F7FBF7] space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-[#D8E6D8] pb-2.5">
              <h3 className="text-sm font-black text-[#1B4332] uppercase tracking-wider flex items-center gap-1.5">
                <span>⚡ {isMr ? decisionResult.optionSellNow.titleMr : decisionResult.optionSellNow.titleEn}</span>
              </h3>
              <span className="px-2.5 py-0.5 bg-[#FFFFFF] border border-[#D8E6D8] text-[#526058] text-[11px] font-bold rounded-lg">
                {isMr ? 'आजचा दर (Today)' : 'Today Rate'}
              </span>
            </div>

            <div className="space-y-1.5 text-xs font-semibold text-[#526058]">
              <div className="flex justify-between">
                <span>{isMr ? 'आजचा मंडी भाव (Current Mandi Price):' : 'Current Mandi Price:'}</span>
                <strong className="text-[#1B4332]">₹{decisionResult.optionSellNow.pricePerQ} / {isMr ? 'क्विंटल' : 'Quintal'}</strong>
              </div>
              <div className="flex justify-between">
                <span>{isMr ? 'विक्रीयोग्य वजन (Produce Weight):' : 'Produce Quantity:'}</span>
                <strong className="text-[#1B4332]">{decisionResult.optionSellNow.quantityQ} {isMr ? 'क्विंटल' : 'Quintals'}</strong>
              </div>
              <div className="flex justify-between">
                <span>{isMr ? 'एकूण जमा रक्कम (Gross Revenue):' : 'Gross Revenue:'}</span>
                <strong className="text-[#1B4332]">₹{decisionResult.optionSellNow.grossRevenue.toLocaleString('en-IN')}</strong>
              </div>
              <div className="flex justify-between text-rose-700">
                <span>{isMr ? 'वाहतूक खर्च (Mandi Freight):' : 'Mandi Transport Freight:'}</span>
                <strong>- ₹{decisionResult.optionSellNow.mandiTransportCost.toLocaleString('en-IN')}</strong>
              </div>
            </div>

            <div className="pt-3 border-t border-[#D8E6D8] flex items-center justify-between bg-[#FFFFFF] p-3 rounded-xl border">
              <div>
                <span className="text-[11px] font-bold text-[#6B7280] block">
                  {isMr ? 'आज हातात पडणारा निखळ नफा:' : 'Net Realization Today:'}
                </span>
                <span className="text-xl font-black text-[#1B4332]">
                  ₹{decisionResult.optionSellNow.netRevenue.toLocaleString('en-IN')}
                </span>
              </div>
              <span className="text-xs font-bold text-[#526058] bg-[#FAF7F2] px-2.5 py-1 rounded-lg border border-[#E5DFD5]">
                ₹{decisionResult.optionSellNow.netRevenuePerQ}/Q
              </span>
            </div>
          </div>

          {/* OPTION B: STORE & SELL LATER */}
          <div className="p-4 sm:p-5 rounded-2xl border-2 border-[#1B5E20] bg-[#F4F9F4] space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-[#C8E6C9] pb-2.5">
              <h3 className="text-sm font-black text-[#1B5E20] uppercase tracking-wider flex items-center gap-1.5">
                <span>🏬 {isMr ? decisionResult.optionStoreLater.titleMr : decisionResult.optionStoreLater.titleEn}</span>
              </h3>
              <span className="px-2.5 py-0.5 bg-[#1B5E20] text-white text-[11px] font-bold rounded-lg shadow-xs">
                🟣 {storageDays} {isMr ? 'दिवसांनंतर अंदाज (Forecast)' : '-Day Forecast'}
              </span>
            </div>

            <div className="space-y-1.5 text-xs font-semibold text-[#526058]">
              <div className="flex justify-between">
                <span>{isMr ? 'अंदाजित भावी दर (Forecasted Price):' : 'Forecasted Future Price:'}</span>
                <strong className="text-[#1B5E20]">₹{decisionResult.optionStoreLater.pricePerQ} / {isMr ? 'क्विंटल' : 'Quintal'}</strong>
              </div>
              <div className="flex justify-between">
                <span>{isMr ? 'वजन घट (Spoilage/Shrinkage Loss):' : 'Spoilage / Shrinkage Loss:'}</span>
                <strong className="text-rose-600">-{decisionResult.economics.spoilageWeightLossPct}% ({decisionResult.economics.spoilageWeightLossQ} Q)</strong>
              </div>
              <div className="flex justify-between">
                <span>{isMr ? 'साठवणुकीनंतर शिल्लक माल (Sellable Weight):' : 'Sellable Weight After Storage:'}</span>
                <strong className="text-[#1B4332]">{decisionResult.economics.sellableQuantityQ} {isMr ? 'क्विंटल' : 'Quintals'}</strong>
              </div>
              <div className="flex justify-between text-rose-700">
                <span>{isMr ? 'साठवणूक व हाताळणी खर्च (Total Storage Expenses):' : 'Total Storage & Logistics Costs:'}</span>
                <strong>- ₹{decisionResult.economics.totalExpenses.toLocaleString('en-IN')}</strong>
              </div>
            </div>

            <div className="pt-3 border-t border-[#C8E6C9] flex items-center justify-between bg-[#FFFFFF] p-3 rounded-xl border border-[#A5D6A7]">
              <div>
                <span className="text-[11px] font-bold text-[#6B7280] block">
                  {isMr ? 'साठवणुकीनंतर हातात पडणारा निखळ नफा:' : 'Net Realization After Storage:'}
                </span>
                <span className="text-xl font-black text-[#1B5E20]">
                  ₹{decisionResult.optionStoreLater.netRevenue.toLocaleString('en-IN')}
                </span>
              </div>
              <span className="text-xs font-bold text-[#1B5E20] bg-[#E8F5E9] px-2.5 py-1 rounded-lg border border-[#A5D6A7]">
                ₹{decisionResult.optionStoreLater.netRevenuePerQ}/Q
              </span>
            </div>
          </div>

        </div>

        {/* Advantage & Break-Even Metric Banners */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          
          {/* Net Advantage Banner */}
          <div className={`p-4 rounded-2xl border-2 flex items-center justify-between gap-3 shadow-xs ${
            decisionResult.netAdvantageRs >= 0
              ? 'bg-[#E8F5E9] border-[#A5D6A7] text-[#1B5E20]'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}>
            <div>
              <span className="text-xs font-black uppercase tracking-wider block">
                {isMr ? 'साठवणुकीने होणारा अतिरिक्त निव्वळ फायदा (Net Advantage):' : 'Potential Additional Return From Storage:'}
              </span>
              <p className="text-2xl font-black mt-0.5">
                {decisionResult.netAdvantageRs >= 0 ? '+' : ''}₹{decisionResult.netAdvantageRs.toLocaleString('en-IN')}
                <span className="text-xs font-bold ml-1.5">({decisionResult.netAdvantagePct}%)</span>
              </p>
            </div>
            <div className="text-3xl shrink-0">
              {decisionResult.netAdvantageRs >= 0 ? '📈' : '📉'}
            </div>
          </div>

          {/* Break-Even Price Banner */}
          <div className="p-4 rounded-2xl border-2 border-amber-300 bg-amber-50 text-amber-900 flex items-center justify-between gap-3 shadow-xs">
            <div>
              <span className="text-xs font-black uppercase tracking-wider block text-amber-800">
                {isMr ? 'नफा मिळवण्यासाठी किमान आवश्यक भावी भाव (Break-Even Price):' : 'Minimum Break-Even Price Needed:'}
              </span>
              <p className="text-2xl font-black mt-0.5">
                ₹{decisionResult.breakEvenPricePerQ} / {isMr ? 'क्विंटल' : 'Quintal'}
              </p>
              <p className="text-[11px] font-bold text-amber-800 mt-0.5">
                {isMr
                  ? `अंदाजित भाव: ₹${decisionResult.forecastPricePerQ}/Q • फरक: `
                  : `Forecasted Price: ₹${decisionResult.forecastPricePerQ}/Q • Margin: `}
                <strong>{decisionResult.priceDifferenceRs >= 0 ? '+' : ''}₹{decisionResult.priceDifferenceRs}/Q</strong>
              </p>
            </div>
            <div className="text-3xl shrink-0">⚖️</div>
          </div>

        </div>

        {/* Explainable AI & Warnings List */}
        <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-[#E5DFD5] space-y-2">
          <h4 className="text-xs font-extrabold text-[#1B4332] uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-[#FFB300]" />
            <span>{isMr ? 'AI स्पष्टीकरण व सल्ला का दिला? (Explainable AI Insights)' : 'Why this recommendation? (Explainable AI)'}</span>
          </h4>

          <ul className="space-y-1.5 text-xs text-[#1B4332] font-semibold">
            {(isMr ? decisionResult.explainableReasonsMr : decisionResult.explainableReasonsEn).map((reason, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{reason}</span>
              </li>
            ))}

            {(isMr ? decisionResult.warningsMr : decisionResult.warningsEn).map((warn, idx) => (
              <li key={idx} className="flex items-start gap-2 text-amber-900 font-bold">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>{warn}</span>
              </li>
            ))}
          </ul>
        </div>
      </Card>

      {/* 4. RISK SCORE & OPTIMAL DURATION COMPARISON GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Risk Score Meter (7 Sub-Axes) + REASONS BREAKDOWN */}
        <Card hoverable={false} className="lg:col-span-5 p-4 sm:p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#E1EBE1] pb-3">
            <h3 className="text-sm font-black text-[#1B4332] uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#FFB300]" />
              <span>{isMr ? 'साठवणूक धोका गुण (STORAGE RISK SCORE)' : 'STORAGE RISK SCORE'}</span>
            </h3>
            <span
              className="px-3 py-1 text-xs font-black rounded-full text-white shadow-xs"
              style={{ backgroundColor: decisionResult.riskBreakdown.riskColor }}
            >
              {decisionResult.riskBreakdown.overallRiskScore} / 100
            </span>
          </div>

          <div className="space-y-2.5">
            <RiskSubBar label={isMr ? 'भाव चढ-उतार धोका (Price Volatility)' : 'Price Volatility Risk'} score={decisionResult.riskBreakdown.priceRisk} />
            <RiskSubBar label={isMr ? 'मालाचे वजन घट धोका (Spoilage Weight Loss)' : 'Spoilage Weight Loss Risk'} score={decisionResult.riskBreakdown.spoilageRisk} />
            <RiskSubBar label={isMr ? 'बाजार मागणी धोका (Market Volatility)' : 'Market Volatility Risk'} score={decisionResult.riskBreakdown.marketRisk} />
            <RiskSubBar label={isMr ? 'साठवणूक खर्च धोका (Cost Escalation)' : 'Storage Cost Escalation Risk'} score={decisionResult.riskBreakdown.costRisk} />
            <RiskSubBar label={isMr ? 'गुणवत्ता घसरण्याचा धोका (Quality Decay)' : 'Quality Degradation Risk'} score={decisionResult.riskBreakdown.qualityRisk} />
            <RiskSubBar label={isMr ? 'गोदाम विश्वसनीयता (Facility Reliability)' : 'Facility Reliability Risk'} score={decisionResult.riskBreakdown.facilityRisk} />
            <RiskSubBar label={isMr ? 'वाहतूक अंतर धोका (Transport Distance)' : 'Transport Distance Risk'} score={decisionResult.riskBreakdown.transportRisk} />
          </div>

          {/* USER REQUEST #2: Explicit Risk Score Reasons Breakdown */}
          <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#E5DFD5] space-y-2">
            <h4 className="text-xs font-extrabold text-[#1B4332] uppercase tracking-wider flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-[#1B5E20]" />
              <span>{isMr ? 'धोका गुणांकाचे स्पष्टीकरण व कारणे (Risk Factor Reasons)' : 'Why this Risk Score? (Risk Factor Breakdown & Reasons)'}</span>
            </h4>

            <ul className="space-y-1.5 text-[11px] text-[#526058] font-semibold">
              {(isMr ? decisionResult.riskBreakdown.riskReasonsMr : decisionResult.riskBreakdown.riskReasonsEn).map((reason, idx) => (
                <li key={idx} className="leading-relaxed">
                  {reason}
                </li>
              ))}
            </ul>
          </div>

          <div className="p-3 bg-[#F4F9F4] rounded-xl border border-[#D8E6D8] text-[11px] text-[#526058] font-semibold">
            🛡️ {isMr ? 'धोका गुण जितका कमी (३० पेक्षा कमी) तितकी साठवणूक सुरक्षित मानली जाते.' : 'A risk score below 30 indicates favorable & safe storage conditions.'}
          </div>
        </Card>

        {/* Optimal Storage Period Comparison Table */}
        <Card hoverable={false} className="lg:col-span-7 p-4 sm:p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#E1EBE1] pb-3">
            <h3 className="text-sm font-black text-[#1B4332] uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-[#FFB300]" />
              <span>{isMr ? 'सर्वोत्तम साठवणूक कालावधी तक्ता (OPTIMAL DURATION MATRIX)' : 'OPTIMAL STORAGE DURATION MATRIX'}</span>
            </h3>
            <span className="px-2.5 py-0.5 bg-[#1B5E20] text-white text-[11px] font-bold rounded-lg shadow-xs">
              ⚡ {isMr ? `सर्वोत्तम: ${decisionResult.optimalDays} दिवस` : `Optimal: ${decisionResult.optimalDays} Days`}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#FAF7F2] text-[#6B7280] uppercase font-bold border-b border-[#E5DFD5]">
                <tr>
                  <th className="py-2.5 px-3">{isMr ? 'कालावधी (Days)' : 'Duration'}</th>
                  <th className="py-2.5 px-3">{isMr ? 'अंदाजित भाव' : 'Expected Price'}</th>
                  <th className="py-2.5 px-3">{isMr ? 'एकूण खर्च' : 'Total Cost'}</th>
                  <th className="py-2.5 px-3">{isMr ? 'वजन घट' : 'Weight Loss'}</th>
                  <th className="py-2.5 px-3">{isMr ? 'हातात पडणारा निखळ नफा' : 'Net Realization'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5DFD5] font-semibold">
                {decisionResult.optimalPeriodList.map((row) => (
                  <tr
                    key={row.days}
                    className={`transition-colors ${
                      row.isOptimal ? 'bg-[#E8F5E9] font-black text-[#1B5E20]' : 'hover:bg-[#FAF7F2]'
                    }`}
                  >
                    <td className="py-2.5 px-3 flex items-center gap-1.5">
                      {row.isOptimal && <span className="text-emerald-600">👑</span>}
                      <span>
                        {row.days === 0
                          ? (isMr ? 'आजच (Sell Now)' : 'Sell Now Today')
                          : (isMr ? `${row.days} दिवस` : `${row.days} Days`)}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">₹{row.expectedPrice}</td>
                    <td className="py-2.5 px-3">₹{row.storageCost.toLocaleString('en-IN')}</td>
                    <td className="py-2.5 px-3">{row.spoilageLossPct}%</td>
                    <td className="py-2.5 px-3 font-bold">
                      ₹{row.netRevenue.toLocaleString('en-IN')}
                      {row.netAdvantageVsNow > 0 && (
                        <span className="text-[10px] text-emerald-700 block">
                          (+₹{row.netAdvantageVsNow.toLocaleString('en-IN')})
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

      </div>

      {/* 5. STORAGE FACILITY DISCOVERY GRID & FILTERS */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FFFFFF] p-4 rounded-2xl border border-[#D8E6D8]">
          <div>
            <h3 className="text-lg font-black text-[#1B4332] flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#FFB300]" />
              <span>
                {isMr
                  ? `जवळपास उपलब्ध शीतगृहे व गोदामे (${filteredFacilities.length} उपलब्ध)`
                  : `Nearby Storage Facilities (${filteredFacilities.length} Available)`}
              </span>
            </h3>
            <p className="text-xs text-[#6B7280] font-semibold">
              {isMr
                ? `${mandi} मंडी व तुमच्या स्थानापासून जवळची शासनमान्य व खाजगी साठवणूक केंद्रे.`
                : `Verified cold storage facilities and agricultural warehouses near ${mandi} APMC.`}
            </p>
          </div>

          {/* Secondary Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={maxDistanceKm}
              onChange={(e) => setMaxDistanceKm(Number(e.target.value))}
              className="px-3 py-1.5 bg-[#FAF7F2] border border-[#E5DFD5] rounded-xl text-xs font-bold text-[#1B4332]"
            >
              <option value={10}>{isMr ? '५-१० किमी (Within 10 km)' : 'Within 10 km'}</option>
              <option value={25}>{isMr ? '२५ किमी पर्यंत (Within 25 km)' : 'Within 25 km'}</option>
              <option value={50}>{isMr ? '५० किमी पर्यंत (Within 50 km)' : 'Within 50 km'}</option>
              <option value={100}>{isMr ? '१०० किमी पर्यंत (Within 100 km)' : 'Within 100 km'}</option>
            </select>

            <select
              value={facilityType}
              onChange={(e) => setFacilityType(e.target.value)}
              className="px-3 py-1.5 bg-[#FAF7F2] border border-[#E5DFD5] rounded-xl text-xs font-bold text-[#1B4332]"
            >
              <option value="all">{isMr ? 'सर्व प्रकार (All Storage Types)' : 'All Storage Types'}</option>
              <option value="cold_storage">{isMr ? 'शीतगृह (Cold Storage)' : 'Cold Storage'}</option>
              <option value="grain_warehouse">{isMr ? 'अन्नधान्य गोदाम (Grain WH)' : 'Grain Warehouse'}</option>
              <option value="ca_storage">{isMr ? 'सीए साठवणूक (CA Storage)' : 'Controlled Atmosphere (CA)'}</option>
            </select>
          </div>
        </div>

        {/* Facility Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFacilities.map((fac) => {
            const isSelected = fac.id === activeFacility.id;
            const distFromMandi = fac.distancesFromMandis[mandi] || fac.distanceFromFarmerKm;
            const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${fac.latitude},${fac.longitude}`;

            return (
              <Card
                key={fac.id}
                hoverable
                onClick={() => setSelectedFacilityId(fac.id)}
                className={`p-4 space-y-3 transition-all cursor-pointer border-2 ${
                  isSelected
                    ? 'border-[#1B5E20] ring-2 ring-[#1B5E20]/20 bg-[#F4F9F4]'
                    : 'border-[#E1EBE1] hover:border-[#A5D6A7]'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="px-2.5 py-0.5 bg-[#1B5E20] text-white text-[11px] font-black rounded-lg">
                    {isMr ? fac.typeMr : fac.typeEn}
                  </span>
                  <span className="text-xs font-black text-[#1B5E20] bg-[#E8F5E9] px-2 py-0.5 rounded-md border border-[#A5D6A7]">
                    ★ {fac.rating} ({fac.reliabilityScore}/100)
                  </span>
                </div>

                <div>
                  <h4 className="text-base font-black text-[#1B4332] line-clamp-1">
                    {isMr ? fac.nameMr : fac.name}
                  </h4>
                  <p className="text-xs text-[#526058] font-bold flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-[#FFB300] shrink-0" />
                    <span>
                      {isMr
                        ? `${mandi} मंडीपासून `
                        : `Distance from ${mandi} APMC: `}
                      <strong>{distFromMandi} km</strong>
                    </span>
                  </p>
                </div>

                <div className="p-2.5 bg-[#FFFFFF] rounded-xl border border-[#E1EBE1] text-xs space-y-1">
                  <div className="flex justify-between text-[#6B7280]">
                    <span>{isMr ? 'क्षमता (Capacity):' : 'Capacity:'}</span>
                    <strong className="text-[#1B4332]">{fac.availableCapacity} / {fac.totalCapacity} {fac.capacityUnit}</strong>
                  </div>
                  <div className="flex justify-between text-[#6B7280]">
                    <span>{isMr ? 'साठवणूक दर (Monthly Rate):' : 'Monthly Storage Rate:'}</span>
                    <strong className="text-[#1B5E20]">₹{fac.storageRatePerQuintalMonth} / {isMr ? 'क्विंटल' : 'Quintal'}</strong>
                  </div>
                </div>

                {/* Crops Chips */}
                <div className="flex flex-wrap gap-1">
                  {fac.supportedCrops.slice(0, 3).map((c) => (
                    <span key={c} className="px-2 py-0.5 bg-[#FAF7F2] text-[#1B4332] border text-[10px] font-bold rounded-md">
                      ✓ {c}
                    </span>
                  ))}
                  {fac.supportedCrops.length > 3 && (
                    <span className="px-1.5 py-0.5 text-[10px] text-[#6B7280] font-bold">
                      +{fac.supportedCrops.length - 3} {isMr ? 'अधिक' : 'more'}
                    </span>
                  )}
                </div>

                {/* Card Action Buttons */}
                <div className="pt-2 border-t border-[#E1EBE1] flex items-center justify-between gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveModalFacility(fac);
                    }}
                    className="px-3 py-1.5 bg-[#FFFFFF] hover:bg-[#FAF7F2] text-[#1B4332] border border-[#D8E6D8] text-xs font-black rounded-xl cursor-pointer"
                  >
                    {isMr ? 'तपशील पहा' : 'View Details'}
                  </button>

                  <a
                    href={`tel:${fac.phone}`}
                    onClick={(e) => e.stopPropagation()}
                    className="px-3 py-1.5 bg-[#1B5E20] hover:bg-[#123E1B] text-white text-xs font-black rounded-xl flex items-center gap-1 cursor-pointer"
                  >
                    <Phone className="w-3.5 h-3.5 text-[#FFB300]" />
                    <span>{isMr ? 'कॉल' : 'Call'}</span>
                  </a>

                  <a
                    href={googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="px-3 py-1.5 bg-[#FFC107] hover:bg-[#FFB300] text-[#1B4332] text-xs font-black rounded-xl flex items-center gap-1 cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>{isMr ? 'मॅप' : 'Map'}</span>
                  </a>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Facility Details Modal */}
      {activeModalFacility && (
        <FacilityDetailsModal
          facility={activeModalFacility}
          onClose={() => setActiveModalFacility(null)}
          onSelectForCalculation={(fac) => setSelectedFacilityId(fac.id)}
        />
      )}

    </div>
  );
};

const RiskSubBar: React.FC<{ label: string; score: number }> = ({ label, score }) => {
  let color = '#2E7D32';
  if (score > 60) color = '#EA580C';
  else if (score > 35) color = '#F59E0B';

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs font-bold text-[#1B4332]">
        <span>{label}</span>
        <span>{score} / 100</span>
      </div>
      <div className="w-full bg-[#E5DFD5] h-2 rounded-full overflow-hidden">
        <div
          className="h-full transition-all duration-300 rounded-full"
          style={{ width: `${score}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
};
