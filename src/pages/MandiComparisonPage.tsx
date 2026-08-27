import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  DATEWISE_COMPARISON_DATA,
  MANDIS
} from '../data/mandiComparisonData';
import { MANDI_LOCATIONS, REAL_DASHBOARD_CARDS } from '../data/realData';
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

  const initialCrop = searchParams.get('crop') || 'Onion';
  const TODAY_DATE = getTodayDateStr();

  const [crop, setCrop] = useState<string>(initialCrop);
  const [selectedDate, setSelectedDate] = useState<string>(TODAY_DATE);
  const [quantity, setQuantity] = useState<number>(20);
  const [sortBy, setSortBy] = useState<'netPrice' | 'distance' | 'rawPrice'>('netPrice');
  const [showMatrixView, setShowMatrixView] = useState<boolean>(false);

  // Loading skeleton state for simulated fetching
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 200);
    return () => clearTimeout(timer);
  }, [crop, selectedDate]);

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

  // Filter records for selected crop & selected date (Matching BOTH crop and commodity)
  const filteredRecordsForDate = useMemo(() => {
    // If today is selected, always pull directly from REAL_DASHBOARD_CARDS for highest live accuracy
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
          // Realistic regional variance for mandis without explicit single card
          if (mandi === 'Lasalgaon' && crop === 'Onion') modal = 4250;
          else if (mandi === 'Ahilyanagar' && crop === 'Onion') modal = 4350;
          else if (mandi === 'Nashik' && crop === 'Onion') modal = 4050;
          else if (mandi === 'Yeola' && crop === 'Onion') modal = 4000;
          else if (mandi === 'Rahata' && crop === 'Onion') modal = 3850;
          else if (mandi === 'Sangamner' && crop === 'Onion') modal = 3800;
          else if (mandi === 'Shrirampur' && crop === 'Onion') modal = 3900;
        }

        const minP = liveCard ? liveCard.minPrice : Math.round(modal * 0.89);
        const maxP = liveCard ? liveCard.maxPrice : Math.round(modal * 1.11);

        return {
          date: selectedDate,
          formattedDate: formattedSelectedDateDisplay,
          mandiName: mandi,
          crop: crop,
          commodity: crop,
          modalPrice: modal,
          minPrice: minP,
          maxPrice: maxP,
          distanceFromKopargaon: dist,
          arrivalsQuantity: 2450
        };
      });
    }

    const matches = DATEWISE_COMPARISON_DATA.filter(
      (r) => (r.crop === crop || r.commodity === crop) && r.date === selectedDate
    );

    // Fallback: If date was selected dynamically outside generated dataset array, generate rows for target mandis
    if (matches.length === 0) {
      const basePrices: Record<string, number> = {
        Onion: 4050, Soybean: 5850, Cotton: 7350, Sugarcane: 3140, Pomegranate: 8500,
        Wheat: 2650, Tomato: 1560, Maize: 2350, Gram: 6180, Bajra: 2410
      };
      const base = basePrices[crop] || 3950;

      return MANDIS.map((mandi) => {
        const dist = MANDI_LOCATIONS[mandi]?.distanceKm ?? (mandi === 'Kopargaon' ? 0 : 25);
        const modal = base + (mandi === 'Nashik' ? 180 : mandi === 'Kopargaon' ? 0 : mandi === 'Sangamner' ? -30 : 50);
        return {
          date: selectedDate,
          formattedDate: formattedSelectedDateDisplay,
          mandiName: mandi,
          crop: crop,
          commodity: crop,
          modalPrice: modal,
          minPrice: Math.round(modal * 0.9),
          maxPrice: Math.round(modal * 1.1),
          distanceFromKopargaon: dist,
          arrivalsQuantity: 2100
        };
      });
    }

    return matches;
  }, [crop, selectedDate, formattedSelectedDateDisplay, isTodaySelected]);

  // Process transport & net prices
  const processedRates = useMemo(() => {
    return filteredRecordsForDate.map((rate) => {
      const loc = MANDI_LOCATIONS[rate.mandiName] || {
        distanceKm: rate.distanceFromKopargaon,
        estFreightRatePerQ: rate.distanceFromKopargaon * 1.3
      };
      const transportPerQ = Math.round(loc.estFreightRatePerQ);
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
        distanceKm: rate.distanceFromKopargaon,
        dailyChange: 0,
        dailyChangePct: 0,
        transportPerQ,
        netPerQ
      };
    });
  }, [filteredRecordsForDate]);

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

  // Get last 7 days list for Matrix View
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
      
      {/* 1. Header & Controls Card (Crop + Date Selector) */}
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

          {/* 4. Matrix / Single Date Toggle Button */}
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

        {/* 1. Crop Selector & Date Picker Bar */}
        <div className="pt-4 border-t border-[#E1EBE1] grid grid-cols-1 md:grid-cols-12 gap-4">
          
          {/* Crop Chips Column */}
          <div className="md:col-span-7">
            <label className="block text-xs font-extrabold text-[#1B4332] uppercase tracking-wider mb-2">
              1. पिक निवडा (SELECT CROP):
            </label>
            <CropSelector
              selectedCrop={crop}
              onSelectCrop={(c) => setCrop(c)}
              variant="chips"
            />
          </div>

          {/* 1. Date Selector + Prev/Next Arrows Column */}
          <div className="md:col-span-5 space-y-2">
            <label className="block text-xs font-extrabold text-[#1B4332] uppercase tracking-wider mb-2">
              2. तारीख निवडा (SELECT DATE):
            </label>
            
            <div className="flex items-center gap-2">
              {/* Previous Day Button */}
              <button
                onClick={() => handleStepDate(-1)}
                className="p-2.5 bg-[#FFFFFF] border-2 border-[#E1EBE1] hover:bg-[#F7FBF7] text-[#2E7D32] rounded-2xl font-bold transition-colors min-h-[50px] cursor-pointer shadow-xs"
                title="मागील दिवस (Previous Day)"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {/* Date Input Picker */}
              <div className="relative flex-1 flex items-center">
                <CalendarIcon className="absolute left-4 w-5 h-5 text-[#FFC107] shrink-0 pointer-events-none" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full pl-11 pr-4 min-h-[50px] bg-[#FFFFFF] border-2 border-[#E1EBE1] rounded-2xl text-[#1B4332] font-extrabold text-sm focus:outline-none focus:ring-4 focus:ring-[#2E7D32]/20 focus:border-[#2E7D32] transition-all duration-300 cursor-pointer shadow-xs"
                />
              </div>

              {/* Next Day Button */}
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

        </div>

        {/* Quantity Slider Box */}
        <div className="bg-[#F4F9F4] p-3.5 sm:p-4 rounded-2xl border border-[#D8E6D8] flex flex-col sm:flex-row items-center justify-between gap-3 pt-3">
          <div className="space-y-0.5 text-center sm:text-left w-full sm:w-auto">
            <label className="text-xs sm:text-sm font-black text-[#0F291E] flex items-center gap-1.5 justify-center sm:justify-start">
              <Truck className="w-4 h-4 text-[#FFB300]" />
              तुमच्या मालाचे एकूण वजन (क्विंटल):
            </label>
            <p className="text-[11px] sm:text-xs text-[#526058] font-semibold">
              वाहतूक खर्च वजनानुसार आपोआप मोजला जाईल
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <input
              type="range"
              min="5"
              max="100"
              step="5"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="flex-1 sm:w-48 accent-[#1B5E20] cursor-pointer"
            />
            <span className="px-3.5 py-1.5 bg-[#1B5E20] text-[#FFFFFF] text-xs sm:text-sm font-black rounded-xl shrink-0 shadow-xs">
              {quantity} क्विंटल
            </span>
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
