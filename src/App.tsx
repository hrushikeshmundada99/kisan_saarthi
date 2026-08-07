import { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './components/Toast';
import { AuthProvider } from './context/AuthContext';
import { Breadcrumb } from './components/Breadcrumb';
import { Sidebar } from './components/Sidebar';
import { HeaderNav } from './components/HeaderNav';
import { ApiKeyModal } from './components/ApiKeyModal';
import { AuthModal } from './components/AuthModal';
import { LoadingSkeleton } from './components/LoadingSkeleton';
import { fetchLiveMandiRates } from './services/apiService';
import type { MandiPriceCardItem } from './data/mockData';
import { MOCK_DASHBOARD_CARDS } from './data/mockData';
import { Sprout, Heart } from 'lucide-react';

// Code Splitting & Performance Optimization: Lazy Load Heavy Page Routes
const LandingPage = lazy(() => import('./pages/LandingPage').then((m) => ({ default: m.LandingPage })));
const DashboardPage = lazy(() => import('./pages/DashboardPage').then((m) => ({ default: m.DashboardPage })));
const PriceForecastPage = lazy(() => import('./pages/PriceForecastPage').then((m) => ({ default: m.PriceForecastPage })));
const CropRecommendationPage = lazy(() => import('./pages/CropRecommendationPage').then((m) => ({ default: m.CropRecommendationPage })));
const MandiComparisonPage = lazy(() => import('./pages/MandiComparisonPage').then((m) => ({ default: m.MandiComparisonPage })));
const MarketTrendsPage = lazy(() => import('./pages/MarketTrendsPage').then((m) => ({ default: m.MarketTrendsPage })));
const ProfitabilityCalculatorPage = lazy(() => import('./pages/ProfitabilityCalculatorPage').then((m) => ({ default: m.ProfitabilityCalculatorPage })));
const PriceAlertsPage = lazy(() => import('./pages/PriceAlertsPage').then((m) => ({ default: m.PriceAlertsPage })));
const FarmerProfilePage = lazy(() => import('./pages/FarmerProfilePage').then((m) => ({ default: m.FarmerProfilePage })));

function AppContent() {
  const [isLive, setIsLive] = useState<boolean>(false);
  const [liveCards, setLiveCards] = useState<MandiPriceCardItem[]>(MOCK_DASHBOARD_CARDS);
  const [isFetchingLive, setIsFetchingLive] = useState<boolean>(false);
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState<boolean>(false);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);

  const loadRates = useCallback(async () => {
    setIsFetchingLive(true);
    const res = await fetchLiveMandiRates();
    setIsLive(res.isLive);
    if (res.cards && res.cards.length > 0) {
      setLiveCards(res.cards);
    }
    setIsFetchingLive(false);
  }, []);

  useEffect(() => {
    loadRates();
  }, [loadRates]);

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#F7FBF7] text-[#1B4332]">
      {/* Modern Vertical Sidebar (Desktop Sticky + Mobile Collapsible Drawer) */}
      <Sidebar isLive={isLive} onOpenApiKeyModal={() => setApiKeyModalOpen(true)} />

      {/* Main Content Area with Sticky Glassmorphism HeaderNav */}
      <div className="flex-1 flex flex-col min-w-0">
        <HeaderNav
          isLive={isLive}
          onOpenApiKeyModal={() => setApiKeyModalOpen(true)}
          onOpenAuthModal={() => setAuthModalOpen(true)}
        />

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
          <Breadcrumb />
          
          <Suspense fallback={<LoadingSkeleton type="card" count={3} />}>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route
                path="/dashboard"
                element={
                  <DashboardPage
                    liveCards={liveCards}
                    isLive={isLive}
                    isFetchingLive={isFetchingLive}
                    onRefreshLive={loadRates}
                  />
                }
              />
              <Route path="/forecast" element={<PriceForecastPage />} />
              <Route path="/recommendation" element={<CropRecommendationPage />} />
              <Route path="/comparison" element={<MandiComparisonPage />} />
              <Route path="/trends" element={<MarketTrendsPage />} />
              <Route path="/calculator" element={<ProfitabilityCalculatorPage />} />
              <Route path="/alerts" element={<PriceAlertsPage />} />
              <Route path="/profile" element={<FarmerProfilePage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </main>

        <footer className="bg-[#FFFFFF] border-t border-[#E1EBE1] py-6 text-center text-xs text-[#6B7280]">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 font-bold text-[#2E7D32]">
              <Sprout className="w-5 h-5 text-[#FFC107]" />
              <span>किसान सारथी (Kisan Saarthi) - कोपरगाव कृषी बाजार बुद्धिमत्ता</span>
            </div>

            <div className="flex items-center gap-6 text-[#6B7280] font-semibold">
              <span>कोपरगाव • राहाता • श्रीरामपूर • संगमनेर • येवला • नाशिक • अहमदनगर</span>
            </div>

            <div className="flex items-center gap-1 text-[#6B7280] font-semibold">
              <span>महाराष्ट्रातील बळीराजासाठी समर्पित</span>
              <Heart className="w-3.5 h-3.5 text-rose-600 fill-rose-600" />
            </div>
          </div>
        </footer>
      </div>

      {/* Global API Key Modal */}
      <ApiKeyModal
        isOpen={apiKeyModalOpen}
        onClose={() => setApiKeyModalOpen(false)}
        onKeySaved={loadRates}
        isLive={isLive}
      />

      {/* Global Farmer Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />
    </div>
  );
}

export function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
