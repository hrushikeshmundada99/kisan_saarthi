import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { PriceCard } from '../components/PriceCard';
import { REAL_DASHBOARD_CARDS } from '../data/realData';
import {
  Sprout,
  LineChart,
  Scale,
  Calculator,
  ArrowRight,
  ShieldCheck,
  MapPin,
  Sparkles,
  Smartphone,
  Compass,
  TrendingUp,
  Award
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const isMr = i18n.language === 'mr';

  const LIVE_TICKER_ITEMS = [
    { crop: isMr ? 'कांदा (Onion)' : 'Onion', mandi: isMr ? 'लासलगाव' : 'Lasalgaon', price: '₹२,१२०', trend: '+₹१६०' },
    { crop: isMr ? 'कांदा (Onion)' : 'Onion', mandi: isMr ? 'कोपरगाव' : 'Kopargaon', price: '₹१,८५०', trend: '+₹६०' },
    { crop: isMr ? 'सोयाबीन (Soybean)' : 'Soybean', mandi: isMr ? 'कोपरगाव' : 'Kopargaon', price: '₹४,६२०', trend: '+₹११०' },
    { crop: isMr ? 'कापूस (Cotton)' : 'Cotton', mandi: isMr ? 'श्रीरामपूर' : 'Shrirampur', price: '₹७,२४०', trend: '+₹१५०' },
    { crop: isMr ? 'डाळिंब (Pomegranate)' : 'Pomegranate', mandi: isMr ? 'राहाता' : 'Rahata', price: '₹८,५००', trend: '+₹२५०' },
  ];

  // Duplicate for seamless infinite scroll
  const allTickerItems = [...LIVE_TICKER_ITEMS, ...LIVE_TICKER_ITEMS];

  const mandisData = [
    { name: isMr ? 'कोपरगाव बाजार समिती' : 'Kopargaon APMC', dist: isMr ? 'मुख्य केंद्र (0 km)' : 'Main Hub (0 km)', highlight: true },
    { name: isMr ? 'लासलगाव बाजार समिती' : 'Lasalgaon APMC', dist: isMr ? 'कांदा हब (50 km)' : 'Onion Hub (50 km)', highlight: true },
    { name: isMr ? 'राहाता बाजार समिती' : 'Rahata APMC', dist: isMr ? '20 km अंतर' : '20 km away', highlight: false },
    { name: isMr ? 'श्रीरामपूर बाजार समिती' : 'Shrirampur APMC', dist: isMr ? '42 km अंतर' : '42 km away', highlight: false },
    { name: isMr ? 'येवला बाजार समिती' : 'Yeola APMC', dist: isMr ? '19 km अंतर' : '19 km away', highlight: false },
    { name: isMr ? 'संगमनेर बाजार समिती' : 'Sangamner APMC', dist: isMr ? '52 km अंतर' : '52 km away', highlight: false },
    { name: isMr ? 'नाशिक बाजार समिती' : 'Nashik APMC', dist: isMr ? '90 km अंतर' : '90 km away', highlight: false },
    { name: isMr ? 'अहिल्यानगर बाजार समिती' : 'Ahilyanagar APMC', dist: isMr ? '100 km अंतर' : '100 km away', highlight: false }
  ];

  return (
    <div className="space-y-6 sm:space-y-8 pb-10 animate-in fade-in duration-300">
      
      {/* Continuous Scrolling Live Market Rates Ticker - Like News Headline */}
      <div className="overflow-hidden rounded-2xl bg-[#FFFFFF] border border-[#D8E6D8] p-2.5 shadow-xs flex items-center gap-3">
        <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-950 rounded-xl text-xs font-black shrink-0">
          <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
          <span>{isMr ? 'थेट बाजार' : 'LIVE'}</span>
        </div>

        {/* Marquee wrapper clips content and scrolls infinitely */}
        <div className="flex-1 overflow-hidden relative">
          <div className="animate-ticker-marquee">
            {allTickerItems.map((item, idx) => (
              <div key={idx} className="flex items-center gap-1.5 shrink-0 px-3 py-0.5 mx-2 rounded-lg bg-[#F4F9F4] border border-[#D8E6D8]">
                <span className="text-[#526058] text-xs font-black whitespace-nowrap">{item.crop} ({item.mandi}):</span>
                <span className="text-[#1B5E20] font-black text-xs whitespace-nowrap">{item.price}</span>
                <span className="text-emerald-700 text-[10px] flex items-center font-bold whitespace-nowrap">
                  <TrendingUp className="w-3 h-3 mr-0.5" />{item.trend}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Hero Section Card with Farm Background Image */}
      <section className="relative overflow-hidden border-2 border-[#A5D6A7]/70 rounded-3xl shadow-md shadow-emerald-950/5 text-center">
        
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/images/hero_bg.png')" }}
        />
        {/* Overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/88 via-[#F4F9F4]/82 to-[#E8F5E9]/90" />

        {/* Glow Accents */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 p-6 sm:p-10 lg:p-12 space-y-6">
          <div className="max-w-4xl mx-auto space-y-5">

            {/* Location Pill Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FFFFFF]/80 border border-[#A5D6A7] text-[#1B5E20] text-xs sm:text-sm font-black shadow-xs">
              <MapPin className="w-4 h-4 text-[#FFB300] shrink-0" />
              <span>
                {isMr
                  ? 'कोपरगाव • लासलगाव • राहाता • श्रीरामपूर • येवला • संगमनेर • नाशिक • अहिल्यानगर'
                  : 'Kopargaon • Lasalgaon • Rahata • Shrirampur • Yeola • Sangamner • Nashik • Ahilyanagar'}
              </span>
            </div>

            {/* Main Hero Title */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0F291E] tracking-tight leading-tight">
              {t('landing.heroTitle')}
            </h1>

            {/* Hero Subtitle */}
            <p className="text-sm sm:text-base text-[#526058] max-w-2xl mx-auto leading-relaxed font-semibold">
              {t('landing.heroSub')}
            </p>

            {/* Action CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Button
                variant="primary"
                size="lg"
                onClick={() => {
                  try {
                    localStorage.removeItem('KISAN_SAARTHI_ONBOARDING_COMPLETED');
                  } catch {}
                  navigate('/dashboard');
                }}
                className="w-full sm:w-auto text-sm font-black shadow-lg shadow-emerald-900/20"
              >
                <span>{t('landing.getStartedBtn')}</span>
                <ArrowRight className="w-4.5 h-4.5 text-[#FFB300]" />
              </Button>

              <Button
                variant="secondary"
                size="lg"
                onClick={() => {
                  try {
                    localStorage.removeItem('KISAN_SAARTHI_ONBOARDING_COMPLETED');
                  } catch {}
                  navigate('/dashboard');
                }}
                className="w-full sm:w-auto text-sm font-black border-2"
              >
                <Compass className="w-4.5 h-4.5 text-[#1B5E20]" />
                <span>{t('landing.continueToDashboardBtn')}</span>
              </Button>
            </div>

            {/* Trust badges strip */}
            <div className="pt-4 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-[#526058] font-bold border-t border-[#D8E6D8] max-w-2xl mx-auto">
              <span className="flex items-center gap-1.5 text-[#1B5E20]">
                <ShieldCheck className="w-4 h-4 text-[#2E7D32]" />
                {isMr ? 'Agmarknet मान्यताप्राप्त डेटा' : 'Agmarknet Verified Data'}
              </span>
              <span className="flex items-center gap-1.5 text-[#0F291E]">
                <Sparkles className="w-4 h-4 text-[#FFB300]" />
                {isMr ? '७, १४ व ३० दिवसांचे AI अंदाज' : 'AI Forecasts: 7, 14 & 30 Days'}
              </span>
              <span className="flex items-center gap-1.5 text-emerald-800">
                <Smartphone className="w-4 h-4 text-emerald-600" />
                {isMr ? 'थेट मोबाईल SIM SMS अलर्ट' : 'Direct Mobile SIM SMS Alerts'}
              </span>
            </div>

          </div>
        </div>
      </section>

      {/* Live Market Rates Section directly on Homepage */}
      <section className="space-y-4 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-gradient-to-r from-[#F4F9F4] via-[#FFFFFF] to-[#E8F5E9] border-2 border-[#D8E6D8] rounded-3xl shadow-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping"></div>
              <h2 className="text-xl sm:text-2xl font-black text-[#0F291E] tracking-tight">
                {isMr ? '🌾 आजचे ताजे बाजार भाव (Daily Live Market Prices)' : '🌾 Today’s Live APMC Market Rates'}
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#526058] font-bold">
              {isMr ? 'कोपरगाव, लासलगाव, राहाता, श्रीरामपूर, येवला या सर्व बाजार समित्यांचे आजचे थेट भाव' : 'Live real-time rates across Kopargaon, Lasalgaon, Rahata, Shrirampur & Yeola'}
            </p>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/dashboard')}
            className="self-start sm:self-auto text-xs font-black min-h-[42px]"
          >
            <span>{isMr ? 'संपूर्ण डॅशबोर्ड उघडा' : 'Open Full Dashboard'}</span>
            <ArrowRight className="w-4 h-4 text-[#FFB300]" />
          </Button>
        </div>

        {/* Live Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {REAL_DASHBOARD_CARDS.slice(0, 6).map((card) => (
            <PriceCard
              key={card.id}
              card={card}
              onCompareClick={(c, m) => navigate(`/comparison?crop=${c}&mandi=${m}`)}
              onForecastClick={(c, m) => navigate(`/forecast?crop=${c}&mandi=${m}`)}
            />
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center pt-2">
          <Button
            variant="secondary"
            size="md"
            onClick={() => navigate('/dashboard')}
            className="text-xs font-black border-2 min-h-[44px]"
          >
            <span>{isMr ? `सर्व १० पिकांचे (${REAL_DASHBOARD_CARDS.length} मंड्या) भाव डॅशबोर्डवर पहा ➔` : `View All ${REAL_DASHBOARD_CARDS.length} Live Rates on Dashboard ➔`}</span>
          </Button>
        </div>
      </section>

      {/* 4 Key Strategic Features Grid */}
      <section className="space-y-4 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto space-y-1">
          <span className="text-xs font-black text-[#FFB300] tracking-wider uppercase">
            {t('landing.smartIntelligence')}
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-[#0F291E]">
            {t('landing.howItHelps')}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Feature 1: Crop Recommendation */}
          <Card
            hoverable
            onClick={() => navigate('/recommendation')}
            className="cursor-pointer p-5 space-y-3 rounded-2xl border-2 border-[#D8E6D8] hover:border-[#2E7D32] bg-[#FFFFFF] group transition-all"
          >
            <div className="w-11 h-11 rounded-2xl bg-amber-100 text-[#FFB300] flex items-center justify-center font-black shadow-xs group-hover:scale-110 transition-transform">
              <Compass className="w-6 h-6 text-[#D97706]" />
            </div>
            <h3 className="text-lg font-black text-[#0F291E]">
              {t('landing.propCropTitle')}
            </h3>
            <p className="text-xs text-[#526058] font-semibold leading-relaxed">
              {t('landing.propCropDesc')}
            </p>
            <div className="pt-1 flex items-center text-xs font-black text-[#1B5E20] group-hover:translate-x-1 transition-transform">
              <span>{t('landing.checkRecBtn')}</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1 text-[#FFB300]" />
            </div>
          </Card>

          {/* Feature 2: Price Forecast */}
          <Card
            hoverable
            onClick={() => navigate('/forecast')}
            className="cursor-pointer p-5 space-y-3 rounded-2xl border-2 border-[#D8E6D8] hover:border-[#2E7D32] bg-[#FFFFFF] group transition-all"
          >
            <div className="w-11 h-11 rounded-2xl bg-[#E8F5E9] text-[#1B5E20] flex items-center justify-center font-black shadow-xs group-hover:scale-110 transition-transform">
              <LineChart className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-[#0F291E]">
              {t('landing.prop1Title')}
            </h3>
            <p className="text-xs text-[#526058] font-semibold leading-relaxed">
              {t('landing.prop1Desc')}
            </p>
            <div className="pt-1 flex items-center text-xs font-black text-[#1B5E20] group-hover:translate-x-1 transition-transform">
              <span>{t('landing.checkForecastBtn')}</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1 text-[#FFB300]" />
            </div>
          </Card>

          {/* Feature 3: Market Comparison */}
          <Card
            hoverable
            onClick={() => navigate('/comparison')}
            className="cursor-pointer p-5 space-y-3 rounded-2xl border-2 border-[#D8E6D8] hover:border-[#2E7D32] bg-[#FFFFFF] group transition-all"
          >
            <div className="w-11 h-11 rounded-2xl bg-amber-100 text-[#D97706] flex items-center justify-center font-black shadow-xs group-hover:scale-110 transition-transform">
              <Scale className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-[#0F291E]">
              {t('landing.prop2Title')}
            </h3>
            <p className="text-xs text-[#526058] font-semibold leading-relaxed">
              {t('landing.prop2Desc')}
            </p>
            <div className="pt-1 flex items-center text-xs font-black text-[#1B5E20] group-hover:translate-x-1 transition-transform">
              <span>{t('landing.compareBtn')}</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1 text-[#FFB300]" />
            </div>
          </Card>

          {/* Feature 4: Profit Calculator */}
          <Card
            hoverable
            onClick={() => navigate('/calculator')}
            className="cursor-pointer p-5 space-y-3 rounded-2xl border-2 border-[#D8E6D8] hover:border-[#2E7D32] bg-[#FFFFFF] group transition-all"
          >
            <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-[#1B5E20] flex items-center justify-center font-black shadow-xs group-hover:scale-110 transition-transform">
              <Calculator className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-[#0F291E]">
              {t('landing.prop3Title')}
            </h3>
            <p className="text-xs text-[#526058] font-semibold leading-relaxed">
              {t('landing.prop3Desc')}
            </p>
            <div className="pt-1 flex items-center text-xs font-black text-[#1B5E20] group-hover:translate-x-1 transition-transform">
              <span>{t('landing.calcBtn')}</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1 text-[#FFB300]" />
            </div>
          </Card>

        </div>
      </section>

      {/* APMC / Bazar Samiti Chips Strip */}
      <Card hoverable={false} className="p-5 space-y-3 bg-[#FFFFFF] border-2 border-[#D8E6D8] rounded-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#D8E6D8] pb-3">
          <h3 className="text-base font-black text-[#0F291E] flex items-center gap-2">
            <Sprout className="w-5 h-5 text-[#2E7D32]" />
            <span>{t('landing.includedMandis')}</span>
          </h3>
          <span className="text-xs font-black text-[#1B5E20] bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            {t('landing.mandisCount')}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-black">
          {mandisData.map((mandi, idx) => (
            <div
              key={idx}
              onClick={() => navigate('/comparison')}
              className={`p-3 rounded-xl border transition-all cursor-pointer ${
                mandi.highlight
                  ? 'bg-gradient-to-r from-amber-50 to-[#FFFFFF] border-amber-300 text-[#0F291E] shadow-xs'
                  : 'bg-[#F4F9F4] border-[#D8E6D8] text-[#526058] hover:border-[#2E7D32]'
              }`}
            >
              <div className="text-xs font-black text-[#0F291E] flex items-center gap-1">
                {mandi.highlight && <Award className="w-3.5 h-3.5 text-[#FFB300]" />}
                {mandi.name}
              </div>
              <div className="text-[11px] text-[#526058] font-bold mt-0.5">{mandi.dist}</div>
            </div>
          ))}
        </div>
      </Card>

    </div>
  );
};
