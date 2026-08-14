import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { REAL_DASHBOARD_CARDS, type MandiPriceCardItem } from '../data/realData';
import { getStoredAlerts, evaluateAlertStatus } from '../utils/alertManager';
import { useToast } from '../components/Toast';
import { PriceCard } from '../components/PriceCard';
import { PriceRow } from '../components/PriceRow';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { OnboardingTour } from '../components/OnboardingTour';
import { TodaySuggestionsCounter } from '../components/TodaySuggestionsCounter';
import {
  LineChart,
  Scale,
  ArrowRight,
  Filter,
  ArrowUpDown,
  Sparkles,
  RefreshCw,
  Sprout,
  SearchX,
  List,
  Grid,
  TrendingUp,
  Award,
  Compass
} from 'lucide-react';

const ALL_CROPS = ['Onion', 'Soybean', 'Cotton', 'Sugarcane', 'Pomegranate', 'Wheat', 'Tomato', 'Maize', 'Gram', 'Bajra'];

const CROP_EMOJIS: Record<string, string> = {
  Onion: '🧅',
  Soybean: '🌱',
  Cotton: '☁️',
  Sugarcane: '🎋',
  Pomegranate: '🍎',
  Wheat: '🌾',
  Tomato: '🍅',
  Maize: '🌽',
  Gram: '🧆',
  Bajra: '🌾'
};

interface DashboardPageProps {
  liveCards?: MandiPriceCardItem[];
  isLive?: boolean;
  isFetchingLive?: boolean;
  onRefreshLive?: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  liveCards = REAL_DASHBOARD_CARDS,
  isLive = true,
  isFetchingLive = false,
  onRefreshLive
}) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { showToast } = useToast();

  // Read stored alerts & evaluate
  const storedAlerts = useMemo(() => {
    return getStoredAlerts();
  }, []);

  const evaluatedAlerts = useMemo(() => {
    return storedAlerts
      .map((alt) => {
        const ev = evaluateAlertStatus(alt);
        return {
          ...alt,
          currentPrice: ev.currentPrice,
          distanceToTarget: ev.distanceToTarget,
          isTriggered: ev.isTriggered,
          evaluatedStatus: ev.status
        };
      })
      .filter((alt) => alt.evaluatedStatus !== 'DISABLED');
  }, [storedAlerts]);

  // Onboarding Tour auto launch state for first time users
  const [runTour, setRunTour] = useState<boolean>(() => {
    try {
      return localStorage.getItem('KISAN_SAARTHI_ONBOARDING_COMPLETED') !== 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const handleTriggerTour = () => {
      setRunTour(true);
    };
    window.addEventListener('START_KISAN_TOUR', handleTriggerTour);
    return () => {
      window.removeEventListener('START_KISAN_TOUR', handleTriggerTour);
    };
  }, []);

  // View format toggle: 'grid' (attractive visual cards) or 'row'
  const [viewMode, setViewMode] = useState<'grid' | 'row'>('grid');

  // Selected crops filter array ('ALL' means show all crops)
  const [selectedCrops, setSelectedCrops] = useState<string[]>(['ALL']);

  // Sort state: price_desc, price_asc, distance_asc
  const [sortBy, setSortBy] = useState<'price_desc' | 'price_asc' | 'distance_asc'>('price_desc');

  // Toggle crop chip selection
  const toggleCrop = (crop: string) => {
    if (crop === 'ALL') {
      setSelectedCrops(['ALL']);
      return;
    }

    setSelectedCrops((prev) => {
      if (prev.includes('ALL')) {
        return [crop];
      }
      if (prev.includes(crop)) {
        const next = prev.filter((c) => c !== crop);
        return next.length === 0 ? ['ALL'] : next;
      } else {
        return [...prev, crop];
      }
    });
  };

  // Source cards: Use live API cards when available, fallback to real dataset
  const sourceCards: MandiPriceCardItem[] = useMemo(() => {
    if (liveCards && liveCards.length > 0) {
      return liveCards;
    }
    return REAL_DASHBOARD_CARDS;
  }, [liveCards]);

  // Filter & Sort Price Cards
  const filteredAndSortedCards = useMemo(() => {
    let result: MandiPriceCardItem[] = sourceCards;

    // If 'ALL' is not selected, filter specifically by chosen crops
    if (!selectedCrops.includes('ALL') && selectedCrops.length > 0) {
      result = result.filter((card: MandiPriceCardItem) => selectedCrops.includes(card.crop));
    }

    return [...result].sort((a, b) => {
      if (sortBy === 'price_desc') {
        return b.modalPrice - a.modalPrice;
      }
      if (sortBy === 'price_asc') {
        return a.modalPrice - b.modalPrice;
      }
      if (sortBy === 'distance_asc') {
        return a.distanceFromKopargaon - b.distanceFromKopargaon;
      }
      return 0;
    });
  }, [sourceCards, selectedCrops, sortBy]);

  const handleRefreshClick = () => {
    if (onRefreshLive) {
      onRefreshLive();
      showToast('आजचे ताजे बाजार भाव अपडेट झाले! (Live Rates Updated)', 'success');
    }
  };

  // Best Price Card
  const bestRateCard = useMemo(() => {
    if (filteredAndSortedCards.length === 0) return null;
    return [...filteredAndSortedCards].sort((a, b) => b.modalPrice - a.modalPrice)[0];
  }, [filteredAndSortedCards]);

  return (
    <div className="space-y-4 sm:space-y-5 pb-6 max-w-7xl mx-auto animate-in fade-in duration-200 px-1 sm:px-2">
      
      {/* Onboarding Guided Tour Modal Component */}
      <OnboardingTour isOpen={runTour} onClose={() => setRunTour(false)} />

      {/* 1. Welcoming Hero Banner */}
      <Card data-tour="dashboard-hero" hoverable={false} className="p-4 sm:p-6 lg:p-7 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-br from-[#FFFFFF] via-[#F4F9F4] to-[#E8F5E9] border-2 border-[#A5D6A7]/80 rounded-3xl shadow-sm">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-[#1B5E20] text-[#FFFFFF] shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-[#FFB300]" />
              रामराम शेतकरी दादा! (कोपरगाव व परिसर)
            </span>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-950 border border-emerald-300">
              <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-emerald-600 animate-pulse' : 'bg-amber-500'}`}></span>
              {isLive ? 'थेट Agmarknet लाइव्ह दर' : 'ऑफलाईन डेटा'}
            </span>
          </div>
          
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#0F291E] tracking-tight">
            {t('dashboard.title')}
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-[#526058]">
            कोपरगाव, लासलगाव, राहाता, श्रीरामपूर व परिसरातील आजचे ताजे बाजार भाव व नफा विश्लेषण
          </p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:flex sm:flex-wrap items-center gap-2 w-full md:w-auto">
          {onRefreshLive && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefreshClick}
              disabled={isFetchingLive}
              className="border-2 border-[#FFB300] bg-amber-50 text-[#0F291E] font-black rounded-2xl min-h-[40px] justify-center text-xs"
            >
              <RefreshCw className={`w-4 h-4 text-[#D97706] ${isFetchingLive ? 'animate-spin' : ''}`} />
              <span>ताजे दर रीफ्रेश करा</span>
            </Button>
          )}

          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/forecast')}
            className="rounded-2xl min-h-[40px] font-black justify-center text-xs"
          >
            <LineChart className="w-4 h-4 text-[#FFB300]" />
            <span>{t('dashboard.viewFullForecast')}</span>
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/comparison')}
            className="rounded-2xl min-h-[40px] font-black border-2 justify-center text-xs"
          >
            <Scale className="w-4 h-4 text-[#1B5E20]" />
            <span>{t('dashboard.compareMandis')}</span>
          </Button>
        </div>
      </Card>

      {/* Active Alert Notification Banner */}
      {evaluatedAlerts.length > 0 && (
        <div 
          data-tour="active-alert-banner"
          onClick={() => navigate('/alerts')}
          className="p-3 bg-amber-50 border-2 border-amber-300 rounded-2xl flex items-center justify-between text-xs font-black text-amber-950 shadow-xs cursor-pointer hover:bg-amber-100 transition-colors"
        >
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#FFB300] animate-ping" />
            <span>
              {i18n.language === 'mr'
                ? `सक्रिय भाव अलर्ट: ${t(`crops.${evaluatedAlerts[0].crop}`, evaluatedAlerts[0].crop)} भावाची नोंद लक्ष्य ₹${evaluatedAlerts[0].targetPrice} जवळ पोहोचत आहे`
                : `Active Alert: ${evaluatedAlerts[0].crop} price target ₹${evaluatedAlerts[0].targetPrice} active`}
            </span>
          </div>
          <ArrowRight className="w-4 h-4 text-[#D97706]" />
        </div>
      )}

      {/* Today Suggestions Counter (Placed directly below active alert) */}
      <TodaySuggestionsCounter />

      {/* 2. Highlight Strip (Best Mandi in Area) */}
      {bestRateCard && (
        <div data-tour="key-metrics" className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 bg-gradient-to-r from-amber-50 via-[#FFFFFF] to-amber-50 rounded-2xl border-2 border-amber-300 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#FFB300] text-[#0F291E] flex items-center justify-center font-black shrink-0">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[#526058] font-bold block">{i18n.language === 'mr' ? 'सर्वाधिक भाव देणारी बाजार समिती:' : 'Highest Paying Mandi:'}</span>
                <span className="font-black text-[#0F291E] text-sm">{t(`mandis.${bestRateCard.mandiName}`, bestRateCard.mandiName)}</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-base font-black text-[#1B5E20]">₹{bestRateCard.modalPrice}</span>
              <span className="text-[10px] text-[#526058] block font-bold">/क्विंटल</span>
            </div>
          </div>

          <div className="p-3.5 bg-[#FFFFFF] rounded-2xl border-2 border-[#D8E6D8] flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-[#1B5E20] flex items-center justify-center font-black shrink-0">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[#526058] font-bold block">आजचा बाजार कल:</span>
                <span className="font-black text-[#1B5E20] text-sm">+३.४% भाव वाढ</span>
              </div>
            </div>
            <span className="text-xs font-black text-emerald-800 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200">
              मागणी वाढली
            </span>
          </div>

          <div
            onClick={() => navigate('/recommendation')}
            className="p-3.5 bg-[#FFFFFF] rounded-2xl border-2 border-[#D8E6D8] hover:border-[#1B5E20] flex items-center justify-between shadow-xs cursor-pointer group transition-all"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-black shrink-0 group-hover:scale-110 transition-transform">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[#526058] font-bold block">पिक निवड सल्लागार:</span>
                <span className="font-black text-[#0F291E] text-sm">कांदा / सोयाबीन निवडा</span>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-[#FFB300] group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      )}

      {/* 3. Crop Selection Filter Chips */}
      <Card data-tour="crop-filters" hoverable={false} className="p-4 bg-[#FFFFFF] border-2 border-[#D8E6D8] rounded-3xl shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-black text-[#0F291E] uppercase tracking-wider">
            <Filter className="w-4 h-4 text-[#FFB300]" />
            <span>पिक निवडा (Crop Filter):</span>
          </div>
          <span className="text-[11px] font-bold text-[#526058]">
            {selectedCrops.length} निवडले
          </span>
        </div>

        {/* Chips */}
        <div className="flex flex-wrap items-center gap-2">
          {/* All Crops Button */}
          <button
            type="button"
            onClick={() => toggleCrop('ALL')}
            className={`px-3.5 py-2 rounded-2xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer min-h-[42px] ${
              selectedCrops.includes('ALL')
                ? 'bg-gradient-to-r from-[#1B5E20] to-[#2E7D32] text-[#FFFFFF] shadow-md shadow-emerald-950/20 scale-[1.03]'
                : 'bg-[#F4F9F4] text-[#0F291E] border border-[#D8E6D8] hover:border-[#1B5E20]'
            }`}
          >
            <span className="text-base">🌾</span>
            <span>{i18n.language === 'mr' ? 'सर्व पिके' : 'All Crops'}</span>
          </button>

          {ALL_CROPS.map((cropKey) => {
            const isSelected = !selectedCrops.includes('ALL') && selectedCrops.includes(cropKey);
            const emoji = CROP_EMOJIS[cropKey] || '🌱';
            const cropName = t(`crops.${cropKey}`, cropKey);

            return (
              <button
                key={cropKey}
                type="button"
                onClick={() => toggleCrop(cropKey)}
                className={`px-3.5 py-2 rounded-2xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer min-h-[42px] ${
                  isSelected
                    ? 'bg-gradient-to-r from-[#1B5E20] to-[#2E7D32] text-[#FFFFFF] shadow-md shadow-emerald-950/20 scale-[1.03]'
                    : 'bg-[#F4F9F4] text-[#0F291E] border border-[#D8E6D8] hover:border-[#1B5E20]'
                }`}
              >
                <span className="text-base">{emoji}</span>
                <span>{cropName}</span>
              </button>
            );
          })}
        </div>
      </Card>

      {/* 4. Toolbar: Sort & View Toggle */}
      <div data-tour="market-sort-controls" className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
        <div className="flex items-center gap-2 text-xs font-black text-[#0F291E]">
          <Sprout className="w-4 h-4 text-[#1B5E20]" />
          <span>उपलब्ध बाजार भाव ({filteredAndSortedCards.length}):</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 bg-[#FFFFFF] border-2 border-[#D8E6D8] px-3 py-1.5 rounded-2xl shadow-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-[#FFB300]" />
            <span className="text-xs font-bold text-[#526058]">क्रम:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-xs font-black text-[#0F291E] focus:outline-none cursor-pointer"
            >
              <option value="price_desc">सर्वाधिक भाव प्रथम (Highest Price)</option>
              <option value="price_asc">कमीत कमी भाव प्रथम (Lowest Price)</option>
              <option value="distance_asc">जवळचे बाजार प्रथम (Closest Mandi)</option>
            </select>
          </div>

          {/* Grid vs Row Mode */}
          <div className="flex items-center bg-[#F4F9F4] border border-[#D8E6D8] p-1 rounded-2xl">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-[#1B5E20] text-[#FFFFFF] shadow-xs' : 'text-[#526058]'}`}
              title="Grid View"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('row')}
              className={`p-1.5 rounded-xl transition-all ${viewMode === 'row' ? 'bg-[#1B5E20] text-[#FFFFFF] shadow-xs' : 'text-[#526058]'}`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 5. Display Cards or Rows */}
      {filteredAndSortedCards.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {filteredAndSortedCards.map((card) => (
              <PriceCard
                key={card.id}
                card={card}
                onCompareClick={(c, m) => navigate(`/comparison?crop=${c}&mandi=${m}`)}
                onForecastClick={(c, m) => navigate(`/forecast?crop=${c}&mandi=${m}`)}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredAndSortedCards.map((card) => (
              <PriceRow
                key={card.id}
                card={card}
                onCompareClick={(c, m) => navigate(`/comparison?crop=${c}&mandi=${m}`)}
                onForecastClick={(c, m) => navigate(`/forecast?crop=${c}&mandi=${m}`)}
              />
            ))}
          </div>
        )
      ) : (
        <Card hoverable={false} className="p-8 text-center space-y-3 rounded-3xl border-2 border-[#D8E6D8]">
          <SearchX className="w-12 h-12 text-[#526058] mx-auto" />
          <h3 className="text-lg font-black text-[#0F291E]">या पिकाचे दर उपलब्ध नाहीत</h3>
          <p className="text-xs text-[#526058] font-semibold">कृपया वरील फिल्टरमधून दुसरे पिक निवडा.</p>
        </Card>
      )}

    </div>
  );
};
