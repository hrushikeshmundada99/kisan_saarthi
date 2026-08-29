import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  DATEWISE_COMPARISON_DATA,
  MANDIS
} from '../data/mandiComparisonData';
import { MANDI_LOCATIONS, REAL_DASHBOARD_CARDS } from '../data/realData';
import {
  VEHICLE_OPTIONS,
  CAPACITY_TIERS,
  calculateFreight,
  getRecommendedVehicle,
  type VehicleOption
} from '../data/transportData';
import { MandiComparisonRow } from '../components/MandiComparisonRow';
import { MandiDateMatrixTable } from '../components/MandiDateMatrixTable';
import { CropSelector } from '../components/CropSelector';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { useToast } from '../components/Toast';
import {
  Scale,
  Truck,
  MapPin,
  ArrowUpDown,
  Info,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Grid,
  List,
  SearchX,
  RefreshCw
} from 'lucide-react';

const getTodayDateStr = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

export const MandiComparisonPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showToast } = useToast();

  const initialCrop = searchParams.get('crop') || 'Onion';
  const TODAY_DATE = getTodayDateStr();

  const [crop, setCrop] = useState<string>(initialCrop);
  const [selectedDate, setSelectedDate] = useState<string>(TODAY_DATE);
  const [quantity, setQuantity] = useState<number>(20);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleOption>(() => getRecommendedVehicle(20));
  const [isManualVehicleOverride, setIsManualVehicleOverride] = useState<boolean>(false);
  const [showCustomVehicleMenu, setShowCustomVehicleMenu] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'netPrice' | 'distance' | 'rawPrice'>('netPrice');
  const [showMatrixView, setShowMatrixView] = useState<boolean>(false);

  // Loading skeleton state for simulated fetching
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 200);
    return () => clearTimeout(timer);
  }, [crop, selectedDate]);

  const handleSelectTier = (tierId: string) => {
    const foundInTier = VEHICLE_OPTIONS.find((v) => v.categoryTier === tierId) || VEHICLE_OPTIONS[0];
    setSelectedVehicle(foundInTier);
    setIsManualVehicleOverride(true);
  };

  const handleManualVehicleSelect = (vehicleId: string) => {
    const found = VEHICLE_OPTIONS.find((v) => v.id === vehicleId);
    if (found) {
      setSelectedVehicle(found);
      setIsManualVehicleOverride(true);
    }
  };

  const handleResetToAutoVehicle = () => {
    setIsManualVehicleOverride(false);
    setSelectedVehicle(getRecommendedVehicle(quantity));
    setShowCustomVehicleMenu(false);
    showToast(i18n.language === 'mr' ? '⚡ वजनानुसार सर्वोत्कृष्ट वाहन निवडले!' : '⚡ Auto-selected best vehicle for load!', 'success');
  };

  const handleQuantityChange = (newQty: number) => {
    setQuantity(newQty);
    if (!isManualVehicleOverride) {
      setSelectedVehicle(getRecommendedVehicle(newQty));
    }
  };

  // Navigate date +1 or -1 day
  const handleStepDate = (daysDelta: number) => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + daysDelta);

    const year = current.getFullYear();
    const month = String(current.getMonth() + 1).padStart(2, '0');
    const day = String(current.getDate()).padStart(2, '0');
    const newDateStr = `${year}-${month}-${day}`;

    // Clamp between 30 days ago and today
    const dMin = new Date();
    dMin.setDate(dMin.getDate() - 30);
    const minDateStr = dMin.toISOString().split('T')[0];

    if (newDateStr >= minDateStr && newDateStr <= TODAY_DATE) {
      setSelectedDate(newDateStr);
    }
  };

  // Check if today is selected
  const isTodaySelected = selectedDate === TODAY_DATE;

  // Formatted date string for header
  const formattedSelectedDateDisplay = useMemo(() => {
    const d = new Date(selectedDate);
    return d.toLocaleDateString(i18n.language === 'mr' ? 'mr-IN' : 'en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }, [selectedDate, i18n.language]);

  // Filter records
  const filteredRecordsForDate = useMemo(() => {
    if (isTodaySelected) {
      const liveCardsForCrop = REAL_DASHBOARD_CARDS.filter((c) => c.crop === crop);
      const cardMap = new Map(liveCardsForCrop.map((c) => [c.mandiName, c]));

      const defaultBasePrices: Record<string, number> = {
        Onion: 4050, Soybean: 5850, Cotton: 7350, Sugarcane: 3140, Pomegranate: 8500,
        Wheat: 2650, Tomato: 1560, Maize: 2350, Gram: 6180, Bajra: 2410
      };
      const base = liveCardsForCrop[0]?.modalPrice || defaultBasePrices[crop] || 4050;

      return MANDIS.map((mandi) => {
        const liveCard = cardMap.get(mandi);
        const dist = MANDI_LOCATIONS[mandi]?.distanceKm ?? (mandi === 'Kopargaon' ? 0 : 25);
        
        let modal = base;
        if (liveCard) {
          modal = liveCard.modalPrice;
        } else {
          if (mandi === 'Lasalgaon' && crop === 'Onion') modal = 4250;
          else if (mandi === 'Ahilyanagar' && crop === 'Onion') modal = 4350;
          else if (mandi === 'Nashik' && crop === 'Onion') modal = 4050;
          else if (mandi === 'Yeola' && crop === 'Onion') modal = 4000;
          else if (mandi === 'Sangamner' && crop === 'Onion') modal = 4100;
          else if (mandi === 'Rahata' && crop === 'Onion') modal = 4120;
          else if (mandi === 'Shrirampur' && crop === 'Onion') modal = 4080;
        }

        const minPrice = Math.round(modal * 0.88);
        const maxPrice = Math.round(modal * 1.12);

        return {
          date: TODAY_DATE,
          formattedDate: formattedSelectedDateDisplay,
          crop,
          commodity: crop,
          mandiName: mandi,
          distanceFromKopargaon: dist,
          minPrice,
          maxPrice,
          modalPrice: modal,
          arrivalsQuantity: Math.round(150 + (dist * 2.5))
        };
      });
    }

    let matches = DATEWISE_COMPARISON_DATA.filter(
      (r) => (r.crop === crop || r.commodity === crop) && r.date === selectedDate
    );

    if (matches.length === 0) {
      const fallbackPrices: Record<string, number> = {
        Onion: 4150, Soybean: 6032, Cotton: 7300, Wheat: 2650, Pomegranate: 8500,
        Sugarcane: 3140, Tomato: 1520, Maize: 2350, Gram: 6180, Bajra: 2410
      };
      const base = fallbackPrices[crop] || 4000;

      matches = MANDIS.map((mandi) => {
        const dist = MANDI_LOCATIONS[mandi]?.distanceKm ?? (mandi === 'Kopargaon' ? 0 : 25);
        return {
          date: selectedDate,
          formattedDate: formattedSelectedDateDisplay,
          crop,
          commodity: crop,
          mandiName: mandi,
          distanceFromKopargaon: dist,
          minPrice: Math.round(base * 0.9),
          maxPrice: Math.round(base * 1.1),
          modalPrice: base,
          arrivalsQuantity: 120
        };
      });
    }

    return matches;
  }, [crop, selectedDate, isTodaySelected]);

  // Process vehicle-based transport & net prices
  const processedRates = useMemo(() => {
    return filteredRecordsForDate.map((rate) => {
      const loc = MANDI_LOCATIONS[rate.mandiName] || {
        distanceKm: rate.distanceFromKopargaon,
        estFreightRatePerQ: rate.distanceFromKopargaon * 1.3
      };
      
      const freightCalc = calculateFreight({
        distanceKm: loc.distanceKm,
        totalQuantityQuintals: quantity,
        vehicle: selectedVehicle
      });

      const transportPerQ = freightCalc.freightPerQuintal;
      const netPerQ = rate.modalPrice - transportPerQ;

      return {
        id: `rate-${rate.mandiName}-${rate.date}`,
        commodity: rate.crop,
        commodityKey: rate.crop,
        mandi: rate.mandiName,
        mandiKey: rate.mandiName,
        minPrice: rate.minPrice,
        maxPrice: rate.maxPrice,
        modalPrice: rate.modalPrice,
        arrivalDate: rate.date,
        arrivalsQuantity: rate.arrivalsQuantity,
        distanceKm: loc.distanceKm,
        dailyChange: 0,
        dailyChangePct: 0,
        transportPerQ,
        netPerQ,
        tripsNeeded: freightCalc.tripsNeeded,
        totalFreightCost: freightCalc.totalFreightCost,
        costPerTrip: freightCalc.costPerTrip,
        vehicleName: i18n.language === 'mr' ? selectedVehicle.nameMr : selectedVehicle.nameEn
      };
    });
  }, [filteredRecordsForDate, selectedVehicle, quantity, i18n.language]);

  // Sort processed rates
  const sortedRates = useMemo(() => {
    return [...processedRates].sort((a, b) => {
      if (sortBy === 'netPrice') return b.netPerQ - a.netPerQ;
      if (sortBy === 'rawPrice') return b.modalPrice - a.modalPrice;
      if (sortBy === 'distance') return a.distanceKm - b.distanceKm;
      return 0;
    });
  }, [processedRates, sortBy]);

  const bestMandiId = sortedRates.length > 0 ? sortedRates[0].id : '';

  const last7DaysList = useMemo(() => {
    const dates: string[] = [];
    const base = new Date(selectedDate);
    for (let i = 6; i >= 0; i--) {
      const d = new Date(base);
      d.setDate(d.getDate() - i);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      dates.push(`${y}-${m}-${day}`);
    }
    return dates;
  }, [selectedDate]);

  return (
    <div className="space-y-4 sm:space-y-5 pb-6 max-w-7xl mx-auto animate-in fade-in duration-200">
      
      {/* 1. Header & Controls Card (Crop + Vehicle + Date + Quantity) */}
      <Card hoverable={false} className="p-4 sm:p-6 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#2E7D32]/10 text-[#2E7D32] text-xs font-black mb-1.5">
              <Scale className="w-3.5 h-3.5 text-[#FFC107]" />
              <span>{i18n.language === 'mr' ? 'हातात पडणारा निखळ नफा गणित' : 'Net Payout Engine'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#1B4332] tracking-tight">
              {t('comparison.title')}
            </h1>
            <p className="text-xs sm:text-sm text-[#6B7280] font-semibold mt-1">
              {t('comparison.subtitle')}
            </p>
          </div>

          <Button
            variant={showMatrixView ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setShowMatrixView(!showMatrixView)}
            className="self-start sm:self-auto"
          >
            {showMatrixView ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4 text-[#FFC107]" />}
            <span>{showMatrixView ? 'यादी तक्ता पहा (List View)' : '7-दिवसीय तक्ता पहा (7-Day Matrix)'}</span>
          </Button>
        </div>

        {/* Crop Selector & Vehicle Selection Grid */}
        <div className="pt-4 border-t border-[#E1EBE1] grid grid-cols-1 md:grid-cols-12 gap-4">
          
          <div className="md:col-span-12 lg:col-span-6 space-y-2">
            <label className="block text-xs font-extrabold text-[#1B4332] uppercase tracking-wider">
              1. पिक निवडा (SELECT CROP):
            </label>
            <CropSelector
              selectedCrop={crop}
              onSelectCrop={(c) => setCrop(c)}
              variant="chips"
            />
          </div>

          {/* 2. Vehicle Capacity Box with Smart Auto-Selection & Override Option */}
          <div className="md:col-span-12 lg:col-span-6 space-y-2.5 bg-[#F4F9F4] p-3.5 sm:p-4 rounded-2xl border border-[#D8E6D8]">
            <div className="flex flex-wrap items-center justify-between gap-1.5">
              <label className="text-xs font-black text-[#1B4332] uppercase tracking-wider flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-[#FFB300]" />
                <span>2. वाहन व वाहतूक क्षमता (VEHICLE CAPACITY):</span>
              </label>

              {isManualVehicleOverride ? (
                <button
                  type="button"
                  onClick={handleResetToAutoVehicle}
                  className="px-2 py-0.5 bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-black rounded-lg transition-colors cursor-pointer shadow-xs flex items-center gap-1"
                >
                  <span>⚡ वजनानुसार सर्वोत्कृष्ट (Auto-Select)</span>
                </button>
              ) : (
                <span className="px-2.5 py-0.5 bg-[#1B5E20] text-white text-[11px] font-black rounded-lg shadow-xs flex items-center gap-1">
                  <span>⚡ वजनानुसार आपोआप निवडलेले (Auto-Selected)</span>
                </span>
              )}
            </div>

            {/* Currently Selected Vehicle Card Banner */}
            <div className="p-3 bg-[#FFFFFF] border-2 border-[#1B5E20]/20 rounded-xl flex items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-2xl shrink-0">{selectedVehicle.icon}</span>
                <div className="min-w-0">
                  <h4 className="text-xs sm:text-sm font-black text-[#0F291E] truncate">
                    {i18n.language === 'mr' ? selectedVehicle.nameMr : selectedVehicle.nameEn}
                  </h4>
                  <p className="text-[11px] text-[#526058] font-bold">
                    क्षमता: <strong className="text-[#1B5E20]">{selectedVehicle.capacityQuintals} क्विंटल</strong> • भाडे: ₹{selectedVehicle.costPerKm}/km
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowCustomVehicleMenu(!showCustomVehicleMenu)}
                className="px-2.5 py-1.5 bg-[#E8F5E9] hover:bg-[#C8E6C9] text-[#1B5E20] border border-[#A5D6A7] rounded-xl text-xs font-black shrink-0 transition-all cursor-pointer shadow-xs flex items-center gap-1"
              >
                <span>{showCustomVehicleMenu ? 'हीड करा (Hide)' : '✏️ बदल करा (Change)'}</span>
              </button>
            </div>

            {/* Custom Manual Vehicle Selection Controls (Dropdown + 3 Tier Buttons) */}
            {showCustomVehicleMenu && (
              <div className="space-y-2 pt-2 border-t border-[#D8E6D8] animate-in fade-in duration-200">
                <div className="flex items-center justify-between text-xs font-black text-[#1B4332]">
                  <span>वाहन श्रेणी निवडा (Capacity Tiers):</span>
                  {isManualVehicleOverride && (
                    <span className="text-amber-800 text-[11px]">हाताने बदललेले वाहन (Custom Selected)</span>
                  )}
                </div>

                {/* 3 Capacity Tier Buttons (Small | Medium | Large) */}
                <div className="grid grid-cols-3 gap-1.5">
                  {CAPACITY_TIERS.map((tier) => {
                    const isActive = selectedVehicle.categoryTier === tier.id;
                    return (
                      <button
                        key={tier.id}
                        type="button"
                        onClick={() => handleSelectTier(tier.id)}
                        className={`py-1.5 px-2 rounded-xl text-xs font-extrabold transition-all border flex items-center justify-center gap-1 cursor-pointer shadow-xs ${
                          isActive
                            ? 'bg-[#1B5E20] text-[#FFFFFF] border-[#1B5E20] ring-2 ring-[#1B5E20]/20'
                            : 'bg-[#FFFFFF] text-[#1B4332] border-[#D8E6D8] hover:bg-[#E8F5E9]'
                        }`}
                      >
                        <span>{tier.icon}</span>
                        <span>{i18n.language === 'mr' ? tier.labelMr : tier.labelEn}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Dropdown Menu */}
                <div className="relative">
                  <select
                    value={selectedVehicle.id}
                    onChange={(e) => handleManualVehicleSelect(e.target.value)}
                    className="w-full pl-3 pr-8 min-h-[44px] bg-[#FFFFFF] border-2 border-[#E1EBE1] rounded-xl text-[#1B4332] font-black text-xs sm:text-sm focus:outline-none focus:ring-3 focus:ring-[#2E7D32]/20 focus:border-[#2E7D32] transition-all cursor-pointer shadow-xs"
                  >
                    {VEHICLE_OPTIONS.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.icon} {i18n.language === 'mr' ? v.nameMr : v.nameEn} — [₹{v.costPerKm}/km]
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <p className="text-[11px] font-semibold text-[#526058] flex items-center gap-1 leading-tight pt-0.5">
              <span>💡 {i18n.language === 'mr' ? selectedVehicle.bestSuitedForMr : selectedVehicle.bestSuitedForEn}</span>
            </p>
          </div>

        </div>

        {/* Date Selector & Quantity Slider Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 pt-2">
          
          <div className="md:col-span-6 space-y-2">
            <label className="block text-xs font-extrabold text-[#1B4332] uppercase tracking-wider mb-2">
              3. तारीख निवडा (SELECT DATE):
            </label>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleStepDate(-1)}
                className="p-2.5 bg-[#FFFFFF] border-2 border-[#E1EBE1] hover:bg-[#F7FBF7] text-[#2E7D32] rounded-2xl font-bold transition-colors min-h-[50px] cursor-pointer shadow-xs"
                title="मागील दिवस (Previous Day)"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div className="relative flex-1 flex items-center">
                <CalendarIcon className="absolute left-4 w-5 h-5 text-[#FFC107] shrink-0 pointer-events-none" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full pl-11 pr-4 min-h-[50px] bg-[#FFFFFF] border-2 border-[#E1EBE1] rounded-2xl text-[#1B4332] font-extrabold text-sm focus:outline-none focus:ring-4 focus:ring-[#2E7D32]/20 focus:border-[#2E7D32] transition-all duration-300 cursor-pointer shadow-xs"
                />
              </div>

              <button
                onClick={() => handleStepDate(1)}
                disabled={isTodaySelected}
                className={`p-2.5 border-2 rounded-2xl font-bold transition-colors min-h-[50px] shadow-xs ${
                  isTodaySelected
                    ? 'bg-[#F7FBF7] text-[#9CA3AF] border-[#E1EBE1] cursor-not-allowed'
                    : 'bg-[#FFFFFF] text-[#2E7D32] border-[#E1EBE1] hover:bg-[#F7FBF7] cursor-pointer'
                }`}
                title="पुढील दिवस (Next Day)"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* 4. Quantity Input Box & Range Slider */}
          <div className="md:col-span-6 bg-[#F4F9F4] p-3.5 sm:p-4 rounded-2xl border border-[#D8E6D8] space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <label className="text-xs font-black text-[#0F291E] flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-[#FFB300]" />
                <span>4. मालाचे एकूण वजन (QUANTITY IN QUINTALS):</span>
              </label>

              {/* Direct Number Input Box */}
              <div className="flex items-center gap-1 bg-[#1B5E20] text-white px-2 py-1 rounded-xl shadow-xs">
                <input
                  type="number"
                  min="0.5"
                  max="500"
                  step="0.5"
                  value={quantity || ''}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    if (!isNaN(val) && val > 0) {
                      handleQuantityChange(val);
                    } else {
                      setQuantity(0);
                    }
                  }}
                  className="w-16 bg-white text-[#1B5E20] text-xs font-black rounded-lg px-1.5 py-0.5 text-center focus:outline-none focus:ring-2 focus:ring-[#FFB300]"
                />
                <span className="text-xs font-black px-1">क्विंटल</span>
              </div>
            </div>

            {/* Range Slider & Quick Preset Chips */}
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="1"
                max="300"
                step="1"
                value={quantity}
                onChange={(e) => handleQuantityChange(Number(e.target.value))}
                className="flex-1 accent-[#1B5E20] cursor-pointer"
              />
              
              <div className="flex flex-wrap gap-1 shrink-0">
                {[7, 15, 50, 100, 200].map((qVal) => (
                  <button
                    key={qVal}
                    type="button"
                    onClick={() => handleQuantityChange(qVal)}
                    className={`px-2 py-1 text-[11px] font-bold rounded-lg border cursor-pointer ${
                      quantity === qVal
                        ? 'bg-[#1B5E20] text-white border-[#1B5E20]'
                        : 'bg-white text-[#1B4332] border-[#D8E6D8] hover:bg-[#E8F5E9]'
                    }`}
                  >
                    {qVal}Q
                  </button>
                ))}
              </div>
            </div>

            <p className="text-[11px] text-[#526058] font-semibold">
              {quantity > selectedVehicle.capacityQuintals
                ? `⚠️ ${quantity} क्विंटल मालासाठी ${selectedVehicle.capacityQuintals} क्विंटल क्षमतेच्या वाहनाच्या ${Math.ceil(quantity / selectedVehicle.capacityQuintals)} फेऱ्या लागतील.`
                : `✅ १ फेरीत पूर्ण माल वाहतूक होईल.`}
            </p>
          </div>

        </div>
      </Card>

      {/* 4. Compare Across 7 Days Matrix View Mode */}
      {showMatrixView ? (
        <MandiDateMatrixTable
          crop={crop}
          records={DATEWISE_COMPARISON_DATA}
          datesList={last7DaysList}
        />
      ) : (
        /* Single Date List View Mode */
        <div className="space-y-4">
          
          {/* Date & Sorting Bar */}
          <Card hoverable={false} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="px-3.5 py-1 bg-[#2E7D32] text-[#FFFFFF] text-xs font-extrabold rounded-full">
                {formattedSelectedDateDisplay}
              </span>
              <span className="text-xs text-[#6B7280] font-bold flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#FFC107]" />
                कोपरगाव केंद्र स्थानावरून अंतर व वाहतूक भाडे
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-[#6B7280] font-bold flex items-center gap-1">
                <ArrowUpDown className="w-3.5 h-3.5" />
                क्रमवारी:
              </span>
              <div className="flex bg-[#F7FBF7] p-1 rounded-xl border border-[#E1EBE1] text-xs font-bold">
                <Button
                  variant={sortBy === 'netPrice' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setSortBy('netPrice')}
                  className="min-h-[36px] text-xs px-3"
                >
                  निव्वळ नफा
                </Button>
                <Button
                  variant={sortBy === 'rawPrice' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setSortBy('rawPrice')}
                  className="min-h-[36px] text-xs px-3"
                >
                  कच्चा भाव
                </Button>
                <Button
                  variant={sortBy === 'distance' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setSortBy('distance')}
                  className="min-h-[36px] text-xs px-3"
                >
                  जवळची मंडी
                </Button>
              </div>
            </div>
          </Card>

          {/* Loading Skeleton State */}
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((n) => (
                <Card key={n} hoverable={false} className="animate-pulse h-28 bg-[#F7FBF7]"></Card>
              ))}
            </div>
          ) : sortedRates.length > 0 ? (
            /* Comparison Rows List */
            <div className="space-y-4">
              {sortedRates.map((rate) => (
                <MandiComparisonRow
                  key={rate.id}
                  rate={rate}
                  isBestOption={rate.id === bestMandiId}
                  quantityQuintals={quantity}
                  onSelect={() => {
                    showToast(`🌾 ${t(`mandis.${rate.mandi}`, rate.mandi)} मंडी निवडली! विक्रीचा अंदाज व दर नकाशा लोड झाला.`, 'success');
                    navigate(`/forecast?crop=${crop}&mandi=${rate.mandi}`);
                  }}
                />
              ))}
            </div>
          ) : (
            /* Holiday / Empty State */
            <Card hoverable={false} className="p-12 text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-[#F7FBF7] text-[#FFC107] flex items-center justify-center mx-auto">
                <SearchX className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-[#2E7D32]">
                या तारखेला बाजार समित्यांमध्ये खरेदी-विक्री डेटा उपलब्ध नाही
              </h3>
              <p className="text-sm text-[#6B7280]">
                No trading data available for {formattedSelectedDateDisplay} at these mandis (Holiday or Market Closed).
              </p>
              <div className="pt-2">
                <Button
                  variant="primary"
                  onClick={() => setSelectedDate(TODAY_DATE)}
                >
                  <RefreshCw className="w-4 h-4 text-[#FFC107]" />
                  <span>आजचे भाव पहा (Go to Today's Rates)</span>
                </Button>
              </div>
            </Card>
          )}

        </div>
      )}

      <Card hoverable={false} className="p-4 bg-[#F7FBF7] text-xs text-[#6B7280] flex items-start gap-2.5">
        <Info className="w-4 h-4 text-[#FFC107] shrink-0 mt-0.5" />
        <p className="font-medium">
          टीप: वाहतूक भाडे कोपरगाव मध्यवर्ती पिकअप पॉईंटवरून स्थानिक पिकअप टेम्पो दरावर आधारित आहे.
        </p>
      </Card>
    </div>
  );
};
