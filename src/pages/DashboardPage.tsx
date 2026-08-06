import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { MOCK_DASHBOARD_CARDS, type MandiPriceCardItem } from '../data/mockData';
import { getStoredAlerts, evaluateAlertStatus } from '../utils/alertManager';
import { useToast } from '../components/Toast';
import { PriceCard } from '../components/PriceCard';
import { PriceRow } from '../components/PriceRow';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import {
  Bell,
  LineChart,
  Scale,
  Calculator,
  ArrowRight,
  Filter,
  ArrowUpDown,
  Sparkles,
  RefreshCw,
  Sprout,
  SearchX,
  List,
  Grid,
  ShieldCheck
} from 'lucide-react';

const ALL_CROPS = ['Onion', 'Soybean', 'Cotton', 'Sugarcane', 'Pomegranate', 'Wheat', 'Tomato'];

interface DashboardPageProps {
  liveCards?: MandiPriceCardItem[];
  isLive?: boolean;
  isFetchingLive?: boolean;
  onRefreshLive?: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  liveCards = MOCK_DASHBOARD_CARDS,
  isLive = true,
  isFetchingLive = false,
  onRefreshLive
}) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { showToast } = useToast();

  // View format toggle: 'row' (default for farmers) or 'grid'
  const [viewMode, setViewMode] = useState<'row' | 'grid'>('row');

  // Crop filter chips state initialized from localStorage
  const [selectedCrops, setSelectedCrops] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('SELECTED_CROPS_FILTER');
      return saved ? JSON.parse(saved) : ['Onion'];
    } catch {
      return ['Onion'];
    }
  });

  // Persist crop filter selection to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('SELECTED_CROPS_FILTER', JSON.stringify(selectedCrops));
    } catch (e) {
      console.warn('Failed to save crop filter selection:', e);
    }
  }, [selectedCrops]);

  // Sort state: price_desc, price_asc, distance_asc
  const [sortBy, setSortBy] = useState<'price_desc' | 'price_asc' | 'distance_asc'>('price_desc');

  // Loading skeleton simulation state
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 250);
    return () => clearTimeout(timer);
  }, []);

  // Read live stored alerts from localStorage
  const storedAlerts = useMemo(() => {
    return getStoredAlerts();
  }, []);

  // Filter active alerts & evaluate status
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

  // Find nearest active alert
  const nearestAlert = useMemo(() => {
    if (evaluatedAlerts.length === 0) return null;
    const sorted = [...evaluatedAlerts].sort((a, b) => a.distanceToTarget - b.distanceToTarget);
    return sorted[0];
  }, [evaluatedAlerts]);

  // Toggle crop chip selection
  const toggleCrop = (crop: string) => {
    setSelectedCrops((prev) => {
      if (prev.includes(crop)) {
        return prev.filter((c) => c !== crop);
      } else {
        return [...prev, crop];
      }
    });
  };

  // Source cards: Use live API cards when available, fallback to mock
  const sourceCards = useMemo(() => {
    if (liveCards && liveCards.length > 0) {
      return liveCards;
    }
    return MOCK_DASHBOARD_CARDS;
  }, [liveCards]);

  // Filter & Sort Price Cards
  const filteredAndSortedCards = useMemo(() => {
    let result = sourceCards;

    // Filter by selected crops (if empty, show all crops by default)
    if (selectedCrops.length > 0) {
      result = result.filter((card) => selectedCrops.includes(card.crop));
    }

    // Sort cards
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
      showToast('data.gov.in Agmarknet वरून ताजे बाजार भाव जोडले जात आहेत...', 'info');
    }
  };

  return (
    <div className="space-y-6 pb-8 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-3 duration-300 px-2 sm:px-4">
      
      {/* 1. Dashboard Header Card with Warm Welcoming Farmer Persona */}
      <Card hoverable={false} className="p-4 sm:p-6 lg:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#FFFFFF] via-[#F7FBF7] to-[#FFFFFF] border-2 border-[#2E7D32] rounded-2xl shadow-sm">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-[#2E7D32] text-[#FFFFFF]">
              <Sparkles className="w-4 h-4 text-[#FFC107]" />
              रामराम शेतकरी दादा! (Kopargaon Region)
            </span>

            {isLive ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-950 border border-emerald-300">
                <ShieldCheck className="w-4 h-4 text-[#43A047]" />
                Agmarknet Live API Data
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-amber-100 text-amber-950 border border-amber-300">
                <RefreshCw className="w-3.5 h-3.5 text-[#FFC107]" />
                डेमो मोड डेटा (Demo Rates Active)
              </span>
            )}
          </div>
          
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#1B4332] tracking-tight">
            {t('dashboard.title')}
          </h1>
          <p className="text-sm font-medium text-[#6B7280] mt-1">
            आपल्या शेतातील पिकांचे कोपरगाव व परिसरातील आजचे ताजे बाजार भाव
          </p>
        </div>

        {/* Quick-Access Responsive Buttons */}
        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2.5">
          {onRefreshLive && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefreshClick}
              disabled={isFetchingLive}
              className="border border-[#FFC107] bg-amber-50 text-amber-950 font-extrabold"
            >
              <RefreshCw className={`w-4 h-4 text-[#FFC107] ${isFetchingLive ? 'animate-spin' : ''}`} />
              <span>ताजे दर रीफ्रेश करा</span>
            </Button>
          )}

          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/forecast')}
          >
            <LineChart className="w-4 h-4 text-[#FFC107]" />
            <span>{t('dashboard.viewFullForecast')}</span>
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/comparison')}
          >
            <Scale className="w-4 h-4 text-[#2E7D32]" />
            <span>{t('dashboard.compareMandis')}</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/calculator')}
            className="border border-[#E1EBE1] bg-[#FFFFFF]"
          >
            <Calculator className="w-4 h-4 text-[#2E7D32]" />
            <span>{t('dashboard.calcProfit')}</span>
          </Button>
        </div>
      </Card>

      {/* Active Alerts Summary Strip */}
      <div 
        onClick={() => navigate('/alerts')}
        className="bg-gradient-to-r from-[#FFC107]/15 via-[#FFC107]/5 to-[#F7FBF7] border border-[#FFC107]/40 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:border-[#FFC107] hover:shadow-md transition-all group"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#FFC107] text-[#1B4332] flex items-center justify-center shrink-0 shadow-xs">
            <Bell className="w-5 h-5 animate-bounce stroke-[2.5]" />
          </div>
          <div>
            <div className="text-xs font-black text-[#1B4332] uppercase tracking-wide flex items-center gap-1.5">
              <span>सक्रिय भाव अलर्ट्स ({evaluatedAlerts.length})</span>
            </div>
            {nearestAlert ? (
              <p className="text-sm font-extrabold text-[#1B4332] mt-0.5">
                {t(`crops.${nearestAlert.crop}`, nearestAlert.crop)} अलर्ट ({nearestAlert.mandi === 'ANY' ? (i18n.language === 'mr' ? 'जवळची मंडी' : 'Nearby Mandi') : t(`mandis.${nearestAlert.mandi}`, nearestAlert.mandi)}): तुमच्या ₹{nearestAlert.targetPrice.toLocaleString('en-IN')} लक्ष्यापासून फक्त ₹{nearestAlert.distanceToTarget} दूर
              </p>
            ) : (
              <p className="text-sm font-medium text-[#6B7280]">
                {t('dashboard.alertStrip')}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 text-xs font-black text-[#2E7D32] group-hover:translate-x-1 transition-transform shrink-0 self-end sm:self-auto">
          <span>अलर्ट्स पहा</span>
          <ArrowRight className="w-4 h-4" />
        </div>
      </div>

      {/* 1. Crop Filter Chips Section */}
      <Card hoverable={false} className="p-4 sm:p-6 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold text-[#1B4332] uppercase tracking-wider flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-[#2E7D32]" />
            {t('dashboard.selectCrops')} (पिकावर क्लिक करा):
          </span>
          <div className="flex items-center gap-2">
            {selectedCrops.length > 0 && (
              <button
                onClick={() => setSelectedCrops([])}
                className="text-xs font-extrabold text-[#2E7D32] hover:underline cursor-pointer"
              >
                सर्व पिके (Reset)
              </button>
            )}
            <span className="text-xs text-[#6B7280] font-bold hidden sm:inline">
              {selectedCrops.length === 0
                ? 'सर्व पिके दाखवत आहे'
                : `निवडलेले (${selectedCrops.length}): ${selectedCrops.map(c => t(`crops.${c}`, c)).join(', ')}`}
            </span>
          </div>
        </div>

        {/* Clickable Chips */}
        <div className="flex flex-wrap items-center gap-2">
          {ALL_CROPS.map((crop) => {
            const isSelected = selectedCrops.includes(crop);
            return (
              <button
                key={crop}
                onClick={() => toggleCrop(crop)}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold transition-all duration-300 cursor-pointer min-h-[44px] ${
                  isSelected
                    ? 'bg-[#2E7D32] text-[#FFFFFF] shadow-md scale-102'
                    : 'bg-[#F7FBF7] text-[#2E7D32] border-2 border-[#81C784] hover:bg-[#E8F5E9]'
                }`}
              >
                <Sprout className={`w-4 h-4 ${isSelected ? 'text-[#FFC107]' : 'text-[#2E7D32]'}`} />
                <span>{t(`crops.${crop}`, crop)}</span>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Today's Price Header, View Mode Toggle & Sort Dropdown */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-black text-[#1B4332]">
              {t('dashboard.todaysRates')}
            </h2>
            <p className="text-xs font-medium text-[#6B7280]">
              {selectedCrops.length === 0
                ? 'सर्व पिकांचे आजचे ताजे मंडी भाव'
                : `निवडलेल्या पिकांचे ${filteredAndSortedCards.length} मंडी भाव`}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* View Mode Toggle: Row vs Grid */}
            <div className="flex bg-[#F7FBF7] p-1 rounded-2xl border border-[#E1EBE1] text-xs font-bold shadow-xs">
              <button
                onClick={() => setViewMode('row')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer min-h-[36px] ${
                  viewMode === 'row' ? 'bg-[#2E7D32] text-[#FFFFFF] shadow-xs' : 'text-[#6B7280] hover:text-[#2E7D32]'
                }`}
                title="ओळ / तक्ता स्वरूप (Row List)"
              >
                <List className="w-4 h-4" />
                <span>ओळ (Rows)</span>
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer min-h-[36px] ${
                  viewMode === 'grid' ? 'bg-[#2E7D32] text-[#FFFFFF] shadow-xs' : 'text-[#6B7280] hover:text-[#2E7D32]'
                }`}
                title="कार्ड स्वरूप (Grid Cards)"
              >
                <Grid className="w-4 h-4" />
                <span>कार्ड (Cards)</span>
              </button>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 bg-[#FFFFFF] border-2 border-[#E1EBE1] p-2 rounded-2xl shadow-xs w-full sm:w-auto">
              <ArrowUpDown className="w-4 h-4 text-[#FFC107] shrink-0" />
              <span className="text-xs font-extrabold text-[#6B7280]">क्रमवारी:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-xs font-black text-[#1B4332] focus:outline-none cursor-pointer w-full pr-2"
              >
                <option value="price_desc">भाव: जास्त ते कमी (Price High-Low)</option>
                <option value="price_asc">भाव: कमी ते जास्त (Price Low-High)</option>
                <option value="distance_asc">अंतर: जवळची मंडी (Nearest First)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loading Skeleton State */}
        {isLoading || isFetchingLive ? (
          <div className="space-y-3">
            {[1, 2, 3].map((n) => (
              <Card key={n} hoverable={false} className="animate-pulse h-24 bg-[#F7FBF7]"></Card>
            ))}
          </div>
        ) : filteredAndSortedCards.length > 0 ? (
          /* Render in selected View Mode: 'row' (default) or 'grid' */
          viewMode === 'row' ? (
            <div className="space-y-3">
              {filteredAndSortedCards.map((card) => (
                <PriceRow
                  key={card.id}
                  card={card}
                  onCompareClick={(c) => navigate(`/comparison?crop=${c}`)}
                  onForecastClick={(c, m) => navigate(`/forecast?crop=${c}&mandi=${m}`)}
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredAndSortedCards.map((card) => (
                <PriceCard
                  key={card.id}
                  card={card}
                  onCompareClick={(c) => navigate(`/comparison?crop=${c}`)}
                  onForecastClick={(c, m) => navigate(`/forecast?crop=${c}&mandi=${m}`)}
                />
              ))}
            </div>
          )
        ) : (
          /* Empty State */
          <Card hoverable={false} className="p-8 sm:p-12 text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-[#F7FBF7] text-[#FFC107] flex items-center justify-center mx-auto">
              <SearchX className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-[#2E7D32]">
              निवडलेल्या पिकासाठी कोणतेही मंडी भाव उपलब्ध नाहीत
            </h3>
            <p className="text-sm text-[#6B7280]">
              No price data available for this crop filter. Try resetting your crop filter.
            </p>
            <div className="pt-2">
              <Button
                variant="primary"
                onClick={() => setSelectedCrops([])}
              >
                <RefreshCw className="w-4 h-4 text-[#FFC107]" />
                <span>सर्व पिकांचे भाव पहा (Reset Filter)</span>
              </Button>
            </div>
          </Card>
        )}
      </div>

    </div>
  );
};
