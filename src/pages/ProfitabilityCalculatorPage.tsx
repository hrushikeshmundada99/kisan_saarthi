import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { REAL_MANDI_RATES, MANDI_LOCATIONS } from '../data/realData';
import { CropSelector } from '../components/CropSelector';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell
} from 'recharts';
import {
  Calculator,
  Award,
  AlertTriangle,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  CheckSquare,
  Square,
  Sprout
} from 'lucide-react';

const CROP_DEFAULT_YIELDS: Record<string, number> = {
  Onion: 75,
  Soybean: 12,
  Cotton: 10,
  Sugarcane: 400,
  Pomegranate: 60,
  Wheat: 18,
  Tomato: 120
};

const ALL_MANDIS = ['Kopargaon', 'Lasalgaon', 'Rahata', 'Shrirampur', 'Yeola', 'Sangamner', 'Nashik', 'Ahmednagar'];

interface MandiProfitResult {
  mandiName: string;
  modalPrice: number;
  grossRevenue: number;
  cultivationCost: number;
  transportCostPerQ: number;
  totalTransportCost: number;
  totalExpenses: number;
  netProfit: number;
  profitPerQ: number;
  isLoss: boolean;
}

export const ProfitabilityCalculatorPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [searchParams] = useSearchParams();

  const initialCrop = searchParams.get('crop') || 'Onion';

  // Form State
  const [crop, setCrop] = useState<string>(initialCrop);
  const [landUnit, setLandUnit] = useState<'acres' | 'guntha'>('acres');
  const [landValue, setLandValue] = useState<number>(2);
  const [yieldPerAcre, setYieldPerAcre] = useState<number>(CROP_DEFAULT_YIELDS[initialCrop] || 75);

  // Cultivation Cost State Fields
  const [seedCost, setSeedCost] = useState<number>(12000);
  const [fertilizerCost, setFertilizerCost] = useState<number>(14000);
  const [laborCost, setLaborCost] = useState<number>(18000);
  const [irrigationCost, setIrrigationCost] = useState<number>(5000);
  const [miscCost, setMiscCost] = useState<number>(3000);

  // Selected Mandis to Compare (2 to 3 mandis)
  const [selectedMandis, setSelectedMandis] = useState<string[]>(['Kopargaon', 'Rahata', 'Yeola']);

  // Results & Expansion State
  const [calculatedResults, setCalculatedResults] = useState<MandiProfitResult[] | null>(null);
  const [expandedBreakdown, setExpandedBreakdown] = useState<Record<string, boolean>>({});

  // On Crop change, pre-fill realistic default yield
  const handleCropSelect = (selected: string) => {
    setCrop(selected);
    const defYield = CROP_DEFAULT_YIELDS[selected] || 20;
    setYieldPerAcre(defYield);
    setCalculatedResults(null);
  };

  // Convert land value to Acres
  const landInAcres = landUnit === 'acres' ? landValue : landValue / 40;

  // Validation
  const errors = useMemo(() => {
    const errs: Record<string, string> = {};
    if (landValue <= 0) errs.land = 'जमिनीचे क्षेत्र 0 पेक्षा जास्त असावे';
    if (yieldPerAcre <= 0) errs.yield = 'अपेक्षित उत्पन्न 0 पेक्षा जास्त असावे';
    if (seedCost < 0) errs.seed = 'खर्च उणे (-) असू नये';
    if (fertilizerCost < 0) errs.fertilizer = 'खर्च उणे (-) असू नये';
    if (laborCost < 0) errs.labor = 'खर्च उणे (-) असू नये';
    if (irrigationCost < 0) errs.irrigation = 'खर्च उणे (-) असू नये';
    if (miscCost < 0) errs.misc = 'खर्च उणे (-) असू नये';
    if (selectedMandis.length === 0) errs.mandi = 'तुलनेसाठी किमान 1 मंडी निवडा';
    return errs;
  }, [landValue, yieldPerAcre, seedCost, fertilizerCost, laborCost, irrigationCost, miscCost, selectedMandis]);

  const isValid = Object.keys(errors).length === 0;

  // Mandi Checkbox Toggle
  const toggleMandiSelection = (mandiName: string) => {
    setSelectedMandis((prev) => {
      if (prev.includes(mandiName)) {
        if (prev.length <= 1) return prev; // keep at least 1
        return prev.filter((m) => m !== mandiName);
      } else {
        if (prev.length >= 4) return prev; // limit max 4
        return [...prev, mandiName];
      }
    });
    setCalculatedResults(null);
  };

  // Run Calculation
  const handleCalculate = () => {
    if (!isValid) return;

    const totalYieldQuintals = landInAcres * yieldPerAcre;
    const totalCultivationCost = seedCost + fertilizerCost + laborCost + irrigationCost + miscCost;

    const results: MandiProfitResult[] = selectedMandis.map((mName) => {
      // Find mandi modal price from real data
      const matchedRate = REAL_MANDI_RATES.find(
        (r) => r.commodity === crop && r.mandi === mName
      ) || { modalPrice: crop === 'Onion' ? 3950 : 4620 };

      const modalPrice = matchedRate.modalPrice;
      const grossRevenue = Math.round(modalPrice * totalYieldQuintals);

      const locInfo = MANDI_LOCATIONS[mName] || { distanceKm: 25, estFreightRatePerQ: 35 };
      const transportCostPerQ = Math.round(locInfo.estFreightRatePerQ);
      const totalTransportCost = Math.round(transportCostPerQ * totalYieldQuintals);

      const totalExpenses = totalCultivationCost + totalTransportCost;
      const netProfit = grossRevenue - totalExpenses;
      const profitPerQ = totalYieldQuintals > 0 ? Math.round(netProfit / totalYieldQuintals) : 0;

      return {
        mandiName: mName,
        modalPrice,
        grossRevenue,
        cultivationCost: totalCultivationCost,
        transportCostPerQ,
        totalTransportCost,
        totalExpenses,
        netProfit,
        profitPerQ,
        isLoss: netProfit < 0
      };
    });

    setCalculatedResults(results);
  };

  // Find most profitable mandi
  const maxProfitMandiName = useMemo(() => {
    if (!calculatedResults || calculatedResults.length === 0) return '';
    const sorted = [...calculatedResults].sort((a, b) => b.netProfit - a.netProfit);
    return sorted[0].mandiName;
  }, [calculatedResults]);

  const isMr = i18n.language === 'mr';

  const handleReset = () => {
    setCrop('Onion');
    setLandValue(1);
    setLandUnit('acres');
    setYieldPerAcre(100);
    setSeedCost(12000);
    setFertilizerCost(15000);
    setLaborCost(18000);
    setIrrigationCost(5000);
    setMiscCost(3000);
    setSelectedMandis(['Kopargaon', 'Rahata', 'Yeola']);
    setCalculatedResults(null);
  };

  return (
    <div className="space-y-4 sm:space-y-5 pb-6 max-w-7xl mx-auto animate-in fade-in duration-200 px-1 sm:px-2">
      
      {/* Header Card */}
      <Card hoverable={false} className="space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#2D5016]/10 text-[#2D5016] text-xs font-bold">
          <Calculator className="w-3.5 h-3.5 text-[#D97706]" />
          <span>{isMr ? 'शेती नफा व गुंतवणूक परतावा मोजणी (Cultivation ROI Engine)' : 'Cultivation ROI Engine'}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#2D5016]">
          {t('calculator.title')}
        </h1>
        <p className="text-sm text-[#4B5563]">
          {t('calculator.subtitle')}
        </p>
      </Card>

      {/* Main Form & Setup Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Form Column */}
        <Card hoverable={false} className="lg:col-span-7 space-y-6">
          <div className="flex items-center justify-between border-b border-[#E5DFD5] pb-3">
            <h3 className="text-lg font-bold text-[#2D5016] flex items-center gap-2">
              <Sprout className="w-5 h-5 text-[#2D5016]" />
              <span>{isMr ? 'लागवड खर्च आणि उत्पादन तपशील भरा' : 'Enter Cultivation Cost & Yield Details'}</span>
            </h3>
            
            <button
              onClick={handleReset}
              className="text-xs font-bold text-[#D97706] hover:underline flex items-center gap-1 min-h-[44px] px-2 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{isMr ? 'फॉर्म रीसेट (Reset)' : 'Reset Form'}</span>
            </button>
          </div>

          {/* 1. Crop Selector */}
          <div>
            <label className="block text-xs font-bold text-[#4B5563] uppercase tracking-wider mb-2">
              1. पिक निवडा (Crop Choice):
            </label>
            <CropSelector
              selectedCrop={crop}
              onSelectCrop={handleCropSelect}
              variant="chips"
            />
          </div>

          {/* 1. Land Area + Unit Toggle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-[#4B5563] uppercase tracking-wider">
                  2. जमिनीचे क्षेत्र (Land Area):
                </label>

                {/* Unit Toggle Button */}
                <div className="inline-flex bg-[#FAF7F2] p-0.5 rounded-lg border border-[#E5DFD5] text-[11px] font-bold">
                  <button
                    type="button"
                    onClick={() => setLandUnit('acres')}
                    className={`px-2 py-0.5 rounded ${landUnit === 'acres' ? 'bg-[#2D5016] text-[#FFFFFF]' : 'text-[#4B5563]'}`}
                  >
                    {isMr ? 'एकरी (Acres)' : 'Acres'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setLandUnit('guntha')}
                    className={`px-2 py-0.5 rounded ${landUnit === 'guntha' ? 'bg-[#2D5016] text-[#FFFFFF]' : 'text-[#4B5563]'}`}
                  >
                    {isMr ? 'गुंठे (Guntha)' : 'Guntha'}
                  </button>
                </div>
              </div>

              <input
                type="number"
                min="0.1"
                step="0.5"
                value={landValue}
                onChange={(e) => setLandValue(Number(e.target.value))}
                className="w-full px-4 py-2.5 bg-[#FFFFFF] border border-[#E5DFD5] rounded-xl text-base font-bold text-[#1F2937] focus:ring-2 focus:ring-[#2D5016]/40 min-h-[44px] shadow-xs"
              />
              {errors.land && <p className="text-xs text-rose-600 font-bold mt-1">{errors.land}</p>}
            </div>

            {/* 1. Expected Yield Pre-fill */}
            <div>
              <label className="block text-xs font-bold text-[#4B5563] uppercase tracking-wider mb-1.5">
                {isMr ? '3. दर एकरी अपेक्षित उत्पादन (क्विंटल):' : '3. Expected Yield per Acre (Quintals):'}
              </label>
              <input
                type="number"
                min="1"
                value={yieldPerAcre}
                onChange={(e) => setYieldPerAcre(Number(e.target.value))}
                className="w-full px-4 py-2.5 bg-[#FFFFFF] border border-[#E5DFD5] rounded-xl text-base font-bold text-[#1F2937] focus:ring-2 focus:ring-[#2D5016]/40 min-h-[44px] shadow-xs"
              />
              {errors.yield && <p className="text-xs text-rose-600 font-bold mt-1">{errors.yield}</p>}
            </div>
          </div>

          {/* 1. Detailed Cultivation Expenses Inputs */}
          <div className="space-y-3 pt-2 border-t border-[#E5DFD5]">
            <h4 className="text-xs font-extrabold text-[#2D5016] uppercase tracking-wider">
              {isMr ? '4. लागवड खर्च तपशील (Cultivation Cost Breakup in ₹):' : '4. Cultivation Cost Breakup (₹):'}
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-[#4B5563] font-semibold mb-1">
                  {isMr ? 'बियाणे खर्च (Seed Cost):' : 'Seed Cost:'}
                </label>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={seedCost}
                  onChange={(e) => setSeedCost(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E5DFD5] rounded-xl text-sm font-bold text-[#1F2937] min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-xs text-[#4B5563] font-semibold mb-1">
                  {isMr ? 'खते व कीटकनाशके (Fertilizer/Pesticides):' : 'Fertilizers & Pesticides:'}
                </label>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={fertilizerCost}
                  onChange={(e) => setFertilizerCost(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E5DFD5] rounded-xl text-sm font-bold text-[#1F2937] min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-xs text-[#4B5563] font-semibold mb-1">
                  {isMr ? 'मजुरी व काढणी खर्च (Labor Cost):' : 'Labor & Harvesting:'}
                </label>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={laborCost}
                  onChange={(e) => setLaborCost(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E5DFD5] rounded-xl text-sm font-bold text-[#1F2937] min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-xs text-[#4B5563] font-semibold mb-1">
                  {isMr ? 'सिंचन व वीज खर्च (Irrigation):' : 'Irrigation & Power:'}
                </label>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={irrigationCost}
                  onChange={(e) => setIrrigationCost(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E5DFD5] rounded-xl text-sm font-bold text-[#1F2937] min-h-[44px]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs text-[#4B5563] font-semibold mb-1">
                  {isMr ? 'इतर / किरकोळ खर्च (Misc/Other Costs):' : 'Miscellaneous Costs:'}
                </label>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={miscCost}
                  onChange={(e) => setMiscCost(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E5DFD5] rounded-xl text-sm font-bold text-[#1F2937] min-h-[44px]"
                />
              </div>
            </div>
          </div>

          {/* 2. Mandi Selection Checkboxes for Multi-Mandi Comparison */}
          <div className="space-y-2 pt-2 border-t border-[#E5DFD5]">
            <label className="block text-xs font-bold text-[#4B5563] uppercase tracking-wider">
              {isMr ? '5. तुलनेसाठी बाजार समित्या निवडा (Select 2-3 Mandis to Compare):' : '5. Select Mandis to Compare:'}
            </label>

            <div className="flex flex-wrap gap-2">
              {ALL_MANDIS.map((mName) => {
                const isSelected = selectedMandis.includes(mName);
                return (
                  <button
                    key={mName}
                    type="button"
                    onClick={() => toggleMandiSelection(mName)}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all min-h-[44px] cursor-pointer ${
                      isSelected
                        ? 'bg-[#2D5016] text-[#FFFFFF] shadow-xs'
                        : 'bg-[#FAF7F2] text-[#2D5016] border border-[#E5DFD5] hover:bg-[#2D5016]/10'
                    }`}
                  >
                    {isSelected ? <CheckSquare className="w-4 h-4 text-[#D97706]" /> : <Square className="w-4 h-4 text-[#6B7280]" />}
                    <span>{t(`mandis.${mName}`, mName)}</span>
                  </button>
                );
              })}
            </div>
            {errors.mandi && <p className="text-xs text-rose-600 font-bold">{errors.mandi}</p>}
          </div>

          {/* Calculate Action Button */}
          <div className="pt-3">
            <Button
              variant="primary"
              size="lg"
              onClick={handleCalculate}
              disabled={!isValid}
              className="w-full"
            >
              <Calculator className="w-5 h-5 text-[#D97706]" />
              <span>{isMr ? 'नफा मोजा (Calculate Profitability)' : 'Calculate Profitability'}</span>
            </Button>
          </div>
        </Card>

        {/* 4. Results Column */}
        <div className="lg:col-span-5 space-y-6">
          
          {calculatedResults ? (
            <>
              {/* Overall Best Mandi Banner */}
              <Card hoverable={false} className="bg-gradient-to-r from-[#2D5016] to-[#1E3A0E] text-[#FFFFFF] p-5 space-y-2 relative overflow-hidden">
                <div className="absolute -right-4 -bottom-4 text-[#FFFFFF]/10 pointer-events-none">
                  <Award className="w-32 h-32" />
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#D97706] text-[#FFFFFF] text-xs font-black rounded-full shadow-xs">
                  <Award className="w-4 h-4" />
                  <span>{isMr ? 'सर्वाधिक फायदेशीर पर्याय' : 'Most Profitable Mandi'}</span>
                </div>
                <h3 className="text-2xl font-black text-[#FFFFFF]">
                  {t(`mandis.${maxProfitMandiName}`, maxProfitMandiName)} बाजार समिती
                </h3>
                <p className="text-xs text-[#FAF7F2] leading-relaxed">
                  वाहतूक भाडे व लागवड खर्च वजा करून या मंडीत तुम्हाला सर्वात जास्त निव्वळ नफा मिळेल.
                </p>
              </Card>

              {/* 4. Recharts Bar Chart Comparing Net Profit */}
              <Card hoverable={false} className="space-y-3">
                <h4 className="text-xs font-bold text-[#4B5563] uppercase tracking-wider">
                  {isMr ? 'मंडीनुसार निव्वळ नफा तुलना (Net Profit Comparison Chart)' : 'Net Profit Comparison Chart'}
                </h4>
                <div className="h-52 w-full pt-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={calculatedResults} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5DFD5" vertical={false} />
                      <XAxis
                        dataKey="mandiName"
                        stroke="#4B5563"
                        fontSize={11}
                        tickFormatter={(m: string) => String(t(`mandis.${m}`, m))}
                      />
                      <YAxis
                        stroke="#4B5563"
                        fontSize={11}
                        tickFormatter={(val: number) => `₹${(val / 1000).toFixed(0)}k`}
                      />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const res = payload[0].payload as MandiProfitResult;
                            return (
                              <div className="bg-[#FFFFFF] border border-[#E5DFD5] p-3 rounded-xl shadow-md text-xs space-y-1 font-bold">
                                <div className="text-[#2D5016]">{t(`mandis.${res.mandiName}`, res.mandiName)}</div>
                                <div className={res.isLoss ? 'text-rose-700' : 'text-[#2D5016]'}>
                                  {isMr ? 'निव्वळ नफा:' : 'Net Profit:'} ₹{res.netProfit.toLocaleString('en-IN')}
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar dataKey="netProfit" radius={[6, 6, 0, 0]}>
                        {calculatedResults.map((entry) => (
                          <Cell
                            key={entry.mandiName}
                            fill={entry.mandiName === maxProfitMandiName ? '#2D5016' : entry.isLoss ? '#DC2626' : '#D97706'}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              {/* 4 & 5. Side-by-Side Result Cards per Mandi */}
              <div className="space-y-4">
                {calculatedResults.map((res) => {
                  const isBest = res.mandiName === maxProfitMandiName;
                  const isExpanded = !!expandedBreakdown[res.mandiName];

                  return (
                    <Card
                      key={res.mandiName}
                      hoverable={false}
                      className={`space-y-3 transition-all ${
                        isBest ? 'border-2 border-[#2D5016] ring-1 ring-[#2D5016]/20' : 'border-[#E5DFD5]'
                      }`}
                    >
                      <div className="flex items-center justify-between border-b border-[#E5DFD5] pb-2">
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-extrabold text-[#2D5016]">
                            {t(`mandis.${res.mandiName}`, res.mandiName)}
                          </h4>
                          {isBest && (
                            <span className="px-2 py-0.5 bg-[#2D5016] text-[#FFFFFF] text-[10px] font-black rounded-full">
                              {isMr ? 'सर्वोत्तम पर्याय' : 'Best Option'}
                            </span>
                          )}
                        </div>
                        <span className="text-xs font-semibold text-[#4B5563]">
                          {isMr ? 'भाव:' : 'Price:'} ₹{res.modalPrice}/q
                        </span>
                      </div>

                      {/* Revenue & Expenses Summary Grid */}
                      <div className="grid grid-cols-2 gap-2 text-center text-xs">
                        <div className="p-2.5 bg-[#FAF7F2] rounded-xl border border-[#E5DFD5]">
                          <span className="text-[#4B5563] font-semibold">{isMr ? 'एकूण महसूल' : 'Gross Revenue'}</span>
                          <div className="text-sm font-extrabold text-[#1F2937] mt-0.5">
                            ₹{res.grossRevenue.toLocaleString('en-IN')}
                          </div>
                        </div>

                        <div className="p-2.5 bg-[#FAF7F2] rounded-xl border border-[#E5DFD5]">
                          <span className="text-[#4B5563] font-semibold">{isMr ? 'एकूण खर्च' : 'Total Cost'}</span>
                          <div className="text-sm font-extrabold text-rose-700 mt-0.5">
                            ₹{res.totalExpenses.toLocaleString('en-IN')}
                          </div>
                        </div>
                      </div>

                      {/* 5. Net Profit / Loss Box & Warning */}
                      <div className={`p-4 rounded-xl text-center space-y-1 ${
                        res.isLoss
                          ? 'bg-rose-100 border border-rose-300 text-rose-950'
                          : 'bg-[#2D5016] text-[#FFFFFF]'
                      }`}>
                        <div className="text-xs uppercase tracking-wider font-semibold opacity-90">
                          {res.isLoss ? (isMr ? 'निव्वळ तोटा (Net Loss)' : 'Net Loss') : (isMr ? 'निव्वळ नफा (Net Profit)' : 'Net Profit')}
                        </div>
                        <div className={`text-2xl font-black ${res.isLoss ? 'text-rose-700' : 'text-[#D97706]'}`}>
                          ₹{res.netProfit.toLocaleString('en-IN')}
                        </div>
                        <div className="text-xs font-semibold opacity-90">
                          ({isMr ? 'दर क्विंटल नफा:' : 'Net Profit / q:'} ₹{res.profitPerQ.toLocaleString('en-IN')})
                        </div>
                      </div>

                      {/* 5. Negative Net Profit Warning Edge Case */}
                      {res.isLoss && (
                        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2 font-semibold">
                          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                          <span>
                            {isMr
                              ? 'या बाजार समितीत विक्री केल्यास सध्याच्या खर्चानुसार नुकसान होण्याची शक्यता आहे.'
                              : 'Selling here may result in a loss based on current costs.'}
                          </span>
                        </div>
                      )}

                      {/* 4. Expandable Breakdown */}
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedBreakdown((prev) => ({
                            ...prev,
                            [res.mandiName]: !prev[res.mandiName]
                          }))
                        }
                        className="w-full text-xs font-bold text-[#2D5016] hover:underline flex items-center justify-center gap-1 pt-1 cursor-pointer"
                      >
                        <span>{isMr ? `खर्चाची संपूर्ण विभागणी ${isExpanded ? 'लपवा' : 'पहा'}` : `${isExpanded ? 'Hide' : 'Show'} Cost Breakdown`}</span>
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>

                      {isExpanded && (
                        <div className="space-y-1.5 text-xs text-[#4B5563] p-3 bg-[#FAF7F2] rounded-xl border border-[#E5DFD5] font-medium animate-in fade-in duration-150">
                          <div className="flex justify-between">
                            <span>{isMr ? 'लागवड खर्च (बियाणे/खते/मजुरी):' : 'Cultivation Cost (Seeds/Fertilizers/Labor):'}</span>
                            <span className="font-bold text-[#1F2937]">₹{res.cultivationCost.toLocaleString('en-IN')}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>{isMr ? `वाहतूक भाडे (रु.${res.transportCostPerQ}/q):` : `Transport Freight (₹${res.transportCostPerQ}/q):`}</span>
                            <span className="font-bold text-rose-700">₹{res.totalTransportCost.toLocaleString('en-IN')}</span>
                          </div>
                          <div className="flex justify-between border-t border-[#E5DFD5] pt-1 font-bold text-[#1F2937]">
                            <span>{isMr ? 'एकूण खर्च:' : 'Total Cost:'}</span>
                            <span>₹{res.totalExpenses.toLocaleString('en-IN')}</span>
                          </div>
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            </>
          ) : (
            /* Initial Prompt State */
            <Card hoverable={false} className="p-8 text-center space-y-4 border-2 border-dashed border-[#E5DFD5]">
              <div className="w-16 h-16 rounded-full bg-[#FAF7F2] text-[#D97706] flex items-center justify-center mx-auto">
                <Calculator className="w-8 h-8" />
              </div>
              <div className="space-y-1 max-w-sm mx-auto">
                <h3 className="text-lg font-bold text-[#2D5016]">
                  {isMr ? 'नफा मोजण्यासाठी डावीकडील माहिती भरा' : 'Fill details on left to calculate profit'}
                </h3>
                <p className="text-sm text-[#4B5563] leading-relaxed">
                  {isMr
                    ? 'लागवड खर्च, जमिनीचे क्षेत्र आणि अपेक्षित उत्पन्न भरून "नफा मोजा" बटणावर क्लिक करा.'
                    : 'Enter cultivation cost, land area, and expected yield, then click Calculate Profitability.'}
                </p>
              </div>
            </Card>
          )}

        </div>

      </div>
    </div>
  );
};
