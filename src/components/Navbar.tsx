import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import { LanguageToggle } from './LanguageToggle';
import { ApiKeyModal } from './ApiKeyModal';
import { Sprout, LayoutDashboard, LineChart, Scale, BarChart3, Calculator, Bell, User, Key, ShieldCheck } from 'lucide-react';

interface NavbarProps {
  isLive: boolean;
  onKeyUpdated: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ isLive, onKeyUpdated }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', path: '/dashboard', label: t('nav.dashboard'), icon: LayoutDashboard },
    { id: 'forecast', path: '/forecast', label: t('nav.forecast'), icon: LineChart },
    { id: 'comparison', path: '/comparison', label: t('nav.comparison'), icon: Scale },
    { id: 'trends', path: '/trends', label: t('nav.trends'), icon: BarChart3 },
    { id: 'calculator', path: '/calculator', label: t('nav.calculator'), icon: Calculator },
    { id: 'alerts', path: '/alerts', label: t('nav.alerts'), icon: Bell }
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#FFFFFF]/90 backdrop-blur-xl border-b border-[#E2ECE2] shadow-sm shadow-emerald-950/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            
            {/* Left: Logo & Brand */}
            <div 
              onClick={() => navigate('/')} 
              className="flex items-center gap-3.5 cursor-pointer group shrink-0"
            >
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#2E7D32] to-[#1B4332] flex items-center justify-center text-[#FFC107] shadow-md shadow-emerald-900/20 group-hover:scale-105 transition-transform duration-300">
                <Sprout className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl sm:text-2xl font-black tracking-tight text-[#1B4332] font-heading">
                    {t('appName')}
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-black bg-[#FFC107]/20 text-[#1B4332] border border-[#FFC107]/40">
                    {i18n.language === 'mr' ? 'कोपरगाव बाजार समिती' : 'Kopargaon APMC'}
                  </span>
                </div>
                <p className="text-xs text-[#6B7280] font-semibold hidden sm:block">
                  {t('appTagline')}
                </p>
              </div>
            </div>

            {/* Center: Nav links (Desktop SaaS Sidebar/Bar) */}
            <nav className="hidden lg:flex items-center gap-1 xl:gap-2 bg-[#F6FAF6] p-1.5 rounded-2xl border border-[#E2ECE2]">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <button
                    key={item.id}
                    onClick={() => navigate(item.path)}
                    className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 min-h-[44px] cursor-pointer ${
                      isActive
                        ? 'bg-[#2E7D32] text-[#FFFFFF] shadow-md shadow-emerald-900/20 scale-102'
                        : 'text-[#1B4332] hover:bg-[#FFFFFF] hover:text-[#2E7D32]'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#FFC107]' : 'text-[#6B7280]'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Right: API key + Language + Profile */}
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => setApiKeyModalOpen(true)}
                className={`px-3.5 py-2 rounded-2xl text-xs font-bold flex items-center gap-1.5 border transition-all min-h-[44px] cursor-pointer shadow-xs ${
                  isLive
                    ? 'bg-emerald-50 text-emerald-950 border-emerald-300 hover:bg-emerald-100'
                    : 'bg-amber-50 text-amber-950 border-amber-300 hover:bg-amber-100'
                }`}
                title="data.gov.in API Key"
              >
                {isLive ? (
                  <>
                    <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span className="hidden sm:inline">Agmarknet Live</span>
                  </>
                ) : (
                  <>
                    <Key className="w-4 h-4 text-[#FFC107] shrink-0" />
                    <span className="hidden sm:inline">API Key</span>
                  </>
                )}
              </button>

              <LanguageToggle />

              <button
                onClick={() => navigate('/profile')}
                className={`p-2.5 rounded-2xl border transition-all min-h-[44px] cursor-pointer flex items-center gap-2 shadow-xs ${
                  location.pathname === '/profile'
                    ? 'bg-[#2E7D32] text-[#FFFFFF] border-[#2E7D32]'
                    : 'bg-[#FFFFFF] text-[#1B4332] border-[#E2ECE2] hover:bg-[#F6FAF6]'
                }`}
                title={t('nav.profile')}
              >
                <User className="w-4.5 h-4.5" />
                <span className="text-xs font-bold hidden xl:inline">प्रोफाईल</span>
              </button>
            </div>

          </div>
        </div>
      </header>

      <ApiKeyModal
        isOpen={apiKeyModalOpen}
        onClose={() => setApiKeyModalOpen(false)}
        onKeySaved={() => {
          onKeyUpdated();
        }}
        isLive={isLive}
      />
    </>
  );
};
