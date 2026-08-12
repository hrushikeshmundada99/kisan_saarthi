import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
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

  const LIVE_TICKER_ITEMS = [
    { crop: 'कांदा (Onion)', mandi: 'लासलगाव', price: '₹२,१२०', trend: '+₹१६०' },
    { crop: 'कांदा (Onion)', mandi: 'कोपरगाव', price: '₹१,८५०', trend: '+₹६०' },
    { crop: 'सोयाबीन (Soybean)', mandi: 'कोपरगाव', price: '₹४,६२०', trend: '+₹११०' },
    { crop: 'कापूस (Cotton)', mandi: 'श्रीरामपूर', price: '₹७,२४०', trend: '+₹१५०' },
    { crop: 'डाळिंब (Pomegranate)', mandi: 'राहाता', price: '₹८,५००', trend: '+₹२५०' }
  ];

  return (
    <div className="space-y-6 sm:space-y-8 pb-10 animate-in fade-in duration-300">
      
      {/* Live Market Rates Horizontal Ticker Bar */}
      <div className="overflow-hidden rounded-2xl bg-[#FFFFFF] border border-[#D8E6D8] p-2.5 shadow-xs flex items-center gap-3">
        <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-950 rounded-xl text-xs font-black shrink-0">
          <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
          <span>{i18n.language === 'mr' ? 'थेट बाजार' : 'LIVE'}</span>
        </div>

        <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto text-xs font-black text-[#0F291E] no-scrollbar py-0.5">
          {LIVE_TICKER_ITEMS.map((item, idx) => (
            <div key={idx} className="flex items-center gap-1.5 shrink-0 px-2 py-0.5 rounded-lg bg-[#F4F9F4] border border-[#D8E6D8]">
              <span className="text-[#526058]">{item.crop} ({item.mandi}):</span>
              <span className="text-[#1B5E20] font-black">{item.price}</span>
              <span className="text-emerald-700 text-[10px] flex items-center font-bold">
                <TrendingUp className="w-3 h-3" /> {item.trend}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Hero Section Card with Radial Glow and Visual Badges */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#FFFFFF] via-[#F4F9F4] to-[#E8F5E9] border-2 border-[#A5D6A7]/70 rounded-3xl p-6 sm:p-10 lg:p-12 shadow-md shadow-emerald-950/5 text-center space-y-6">
        
        {/* Background Decorative Rings */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-amber-500/10 blur-3xl pointer-events-none"></div>

        <div className="max-w-4xl mx-auto space-y-5 relative z-10">
          
          {/* Location Pill Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FFFFFF] border border-[#A5D6A7] text-[#1B5E20] text-xs sm:text-sm font-black shadow-xs">
            <MapPin className="w-4 h-4 text-[#FFB300] shrink-0" />
            <span>कोपरगाव • लासलगाव • राहाता • श्रीरामपूर • येवला • संगमनेर • नाशिक • अहमदनगर</span>
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
              onClick={() => navigate('/dashboard')}
              className="w-full sm:w-auto text-sm font-black shadow-lg shadow-emerald-900/20"
            >
              <span>{t('landing.checkPriceBtn')}</span>
              <ArrowRight className="w-4.5 h-4.5 text-[#FFB300]" />
            </Button>

            <Button
              variant="secondary"
              size="lg"
              onClick={() => navigate('/recommendation')}
              className="w-full sm:w-auto text-sm font-black border-2"
            >
              <Compass className="w-4.5 h-4.5 text-[#1B5E20]" />
              <span>{i18n.language === 'mr' ? 'पिक निवड सल्लागार' : 'Crop Recommendation'}</span>
            </Button>
          </div>

          {/* Trust badges strip */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-[#526058] font-bold border-t border-[#D8E6D8] max-w-2xl mx-auto">
            <span className="flex items-center gap-1.5 text-[#1B5E20]">
              <ShieldCheck className="w-4 h-4 text-[#2E7D32]" />
              Agmarknet मान्यताप्राप्त डेटा
            </span>
            <span className="flex items-center gap-1.5 text-[#0F291E]">
              <Sparkles className="w-4 h-4 text-[#FFB300]" />
              ७, १४ व ३० दिवसांचे AI अंदाज
            </span>
            <span className="flex items-center gap-1.5 text-emerald-800">
              <Smartphone className="w-4 h-4 text-emerald-600" />
              थेट मोबाईल SIM SMS अलर्ट
            </span>
          </div>

        </div>
      </section>

      {/* 4 Key Strategic Features Grid */}
      <section className="space-y-4 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto space-y-1">
          <span className="text-xs font-black text-[#FFB300] tracking-wider uppercase">
            शेतकऱ्यांसाठी स्मार्ट बुद्धिमत्ता
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-[#0F291E]">
            किसान सारथी तुम्हाला कशी मदत करतो?
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
              पिक निवड सल्लागार
            </h3>
            <p className="text-xs text-[#526058] font-semibold leading-relaxed">
              ज्या पिकाला बाजारात सर्वाधिक भाव मिळणार आहे तेच निवडा आणि दर एकरी निव्वळ नफा वाढवा.
            </p>
            <div className="pt-1 flex items-center text-xs font-black text-[#1B5E20] group-hover:translate-x-1 transition-transform">
              <span>शिफारस तपासा</span>
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
              <span>अंदाज तपासा</span>
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
              <span>तुलना करा</span>
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
              <span>नफा मोजा</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1 text-[#FFB300]" />
            </div>
          </Card>

        </div>
      </section>

      {/* APMC Mandis Chips Strip */}
      <Card hoverable={false} className="p-5 space-y-3 bg-[#FFFFFF] border-2 border-[#D8E6D8] rounded-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#D8E6D8] pb-3">
          <h3 className="text-base font-black text-[#0F291E] flex items-center gap-2">
            <Sprout className="w-5 h-5 text-[#2E7D32]" />
            <span>समाविष्ट प्रमुख कृषी उत्पन्न बाजार समित्या</span>
          </h3>
          <span className="text-xs font-black text-[#1B5E20] bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            ८ प्रमुख बाजारपेठा थेट जोडल्या
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-black">
          {[
            { name: 'कोपरगाव APMC', dist: 'मुख्य केंद्र (0 km)', highlight: true },
            { name: 'लासलगाव APMC', dist: 'कांदा हब (42 km)', highlight: true },
            { name: 'राहाता APMC', dist: '14 km अंतर', highlight: false },
            { name: 'श्रीरामपूर APMC', dist: '22 km अंतर', highlight: false },
            { name: 'येवला APMC', dist: '28 km अंतर', highlight: false },
            { name: 'संगमनेर APMC', dist: '38 km अंतर', highlight: false },
            { name: 'नाशिक APMC', dist: '85 km अंतर', highlight: false },
            { name: 'अहमदनगर APMC', dist: '95 km अंतर', highlight: false }
          ].map((mandi, idx) => (
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
