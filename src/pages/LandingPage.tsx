import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Sprout, LineChart, Scale, Calculator, ArrowRight, ShieldCheck, MapPin, Sparkles, PhoneCall } from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-300">
      {/* Hero Section Card */}
      <section className="relative overflow-hidden bg-[#FFFFFF] border border-[#E5DFD5] rounded-xl p-6 sm:p-12 shadow-sm text-center space-y-6">
        <div className="max-w-4xl mx-auto space-y-6 relative z-10">
          
          {/* Location Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#2D5016]/10 border border-[#2D5016]/20 text-[#2D5016] text-sm font-semibold">
            <MapPin className="w-4 h-4 text-[#D97706]" />
            <span>कोपरगाव, राहाता, श्रीरामपूर, संगमनेर, येवला, नाशिक, अहमदनगर</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-2xl sm:text-4xl font-extrabold text-[#2D5016] tracking-tight leading-tight font-heading">
            {t('landing.heroTitle')}
          </h1>

          {/* Subtitle */}
          <p className="text-base text-[#4B5563] max-w-2xl mx-auto leading-relaxed font-medium">
            {t('landing.heroSub')}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate('/dashboard')}
              className="w-full sm:w-auto"
            >
              <span>{t('landing.checkPriceBtn')}</span>
              <ArrowRight className="w-5 h-5 text-[#D97706]" />
            </Button>

            <Button
              variant="secondary"
              size="lg"
              onClick={() => navigate('/comparison')}
              className="w-full sm:w-auto"
            >
              <Scale className="w-5 h-5 text-[#D97706]" />
              <span>मंडी निखळ नफा तुलना</span>
            </Button>
          </div>

          {/* Trust badges strip */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-sm text-[#4B5563] font-semibold border-t border-[#E5DFD5] max-w-xl mx-auto">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#2D5016]" />
              Agmarknet मान्यताप्राप्त डेटा
            </span>
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#D97706]" />
              7-दिवसीय AI अंदाज
            </span>
            <span className="flex items-center gap-1.5">
              <PhoneCall className="w-4 h-4 text-emerald-600" />
              WhatsApp अलर्ट सुविधा
            </span>
          </div>

        </div>
      </section>

      {/* 3 Key Value Props */}
      <section className="space-y-6 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto space-y-1">
          <span className="text-xs font-bold text-[#D97706] tracking-wider uppercase">
            शेतकऱ्यांसाठी खास वैशिष्ट्ये
          </span>
          <h2 className="text-2xl font-bold text-[#2D5016]">
            किसान सारथी तुम्हाला कशी मदत करतो?
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <Card
            onClick={() => navigate('/forecast')}
            className="cursor-pointer space-y-4 group"
          >
            <div className="w-12 h-12 rounded-xl bg-[#2D5016]/10 text-[#2D5016] flex items-center justify-center group-hover:bg-[#2D5016] group-hover:text-[#D97706] transition-colors">
              <LineChart className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#2D5016]">
              {t('landing.prop1Title')}
            </h3>
            <p className="text-sm text-[#4B5563] leading-relaxed">
              {t('landing.prop1Desc')}
            </p>
            <div className="pt-2 flex items-center text-sm font-bold text-[#D97706] group-hover:translate-x-1 transition-transform">
              <span>अंदाज तपासा</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </Card>

          <Card
            onClick={() => navigate('/comparison')}
            className="cursor-pointer space-y-4 group"
          >
            <div className="w-12 h-12 rounded-xl bg-[#D97706]/10 text-[#D97706] flex items-center justify-center group-hover:bg-[#D97706] group-hover:text-[#FFFFFF] transition-colors">
              <Scale className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#2D5016]">
              {t('landing.prop2Title')}
            </h3>
            <p className="text-sm text-[#4B5563] leading-relaxed">
              {t('landing.prop2Desc')}
            </p>
            <div className="pt-2 flex items-center text-sm font-bold text-[#2D5016] group-hover:translate-x-1 transition-transform">
              <span>तुलना करा</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </Card>

          <Card
            onClick={() => navigate('/calculator')}
            className="cursor-pointer space-y-4 group"
          >
            <div className="w-12 h-12 rounded-xl bg-[#2D5016]/10 text-[#2D5016] flex items-center justify-center group-hover:bg-[#2D5016] group-hover:text-[#D97706] transition-colors">
              <Calculator className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#2D5016]">
              {t('landing.prop3Title')}
            </h3>
            <p className="text-sm text-[#4B5563] leading-relaxed">
              {t('landing.prop3Desc')}
            </p>
            <div className="pt-2 flex items-center text-sm font-bold text-[#D97706] group-hover:translate-x-1 transition-transform">
              <span>नफा मोजा</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </Card>

        </div>
      </section>

      {/* Kopargaon Mandis List Preview Card */}
      <Card hoverable={false} className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-[#2D5016] flex items-center gap-2">
              <Sprout className="w-5 h-5 text-[#2D5016]" />
              <span>जिल्ह्यातील समाविष्ट प्रमुख बाजार समित्या</span>
            </h3>
            <p className="text-sm text-[#4B5563] mt-1">
              अहमदनगर व लगतच्या नाशिक जिल्ह्यातील 7 प्रमुख मंड्यांचे थेट अपडेट्स
            </p>
          </div>
          <Button variant="primary" size="sm" onClick={() => navigate('/dashboard')}>
            सर्व बाजार भाव पहा
          </Button>
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          {['कोपरगाव (Kopargaon)', 'राहाता (Rahata)', 'श्रीरामपूर (Shrirampur)', 'संगमनेर (Sangamner)', 'येवला (Yeola)', 'नाशिक (Nashik)', 'अहमदनगर (Ahmednagar)'].map((mandi) => (
            <span
              key={mandi}
              className="px-3.5 py-1.5 bg-[#FAF7F2] border border-[#E5DFD5] rounded-xl text-xs font-semibold text-[#2D5016]"
            >
              📍 {mandi}
            </span>
          ))}
        </div>
      </Card>
    </div>
  );
};
