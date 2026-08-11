import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Sprout,
  LayoutDashboard,
  LineChart,
  Scale,
  BarChart3,
  Calculator,
  Bell,
  User,
  Menu,
  X,
  ShieldCheck,
  Key,
  ChevronRight
} from 'lucide-react';
import { LanguageToggle } from './LanguageToggle';

interface SidebarProps {
  isLive: boolean;
  onOpenApiKeyModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isLive, onOpenApiKeyModal }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);

  const navItems = [
    { id: 'dashboard', path: '/dashboard', label: t('nav.dashboard'), icon: LayoutDashboard },
    { id: 'recommendation', path: '/recommendation', label: t('nav.recommendation'), icon: Sprout },
    { id: 'forecast', path: '/forecast', label: t('nav.forecast'), icon: LineChart },
    { id: 'comparison', path: '/comparison', label: t('nav.comparison'), icon: Scale },
    { id: 'trends', path: '/trends', label: t('nav.trends'), icon: BarChart3 },
    { id: 'calculator', path: '/calculator', label: t('nav.calculator'), icon: Calculator },
    { id: 'alerts', path: '/alerts', label: t('nav.alerts'), icon: Bell },
    { id: 'profile', path: '/profile', label: t('nav.profile'), icon: User }
  ];

  const handleNavigate = (path: string) => {
    navigate(path);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Sticky Top Header with Hamburger Toggle */}
      <header className="lg:hidden sticky top-0 z-40 bg-[#FFFFFF]/95 backdrop-blur-xl border-b border-[#E1EBE1] px-4 py-3 flex items-center justify-between shadow-sm">
        <div 
          onClick={() => handleNavigate('/')} 
          className="flex items-center gap-2.5 cursor-pointer"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#2E7D32] to-[#1B4332] flex items-center justify-center text-[#FFC107] shadow-xs">
            <Sprout className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <span className="text-lg font-black tracking-tight text-[#1B4332]">
              {t('appName')}
            </span>
            <span className="ml-1.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#FFC107]/20 text-[#1B4332]">
              APMC
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <LanguageToggle />
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-xl bg-[#F7FBF7] border border-[#E1EBE1] text-[#1B4332] hover:bg-[#E8F5E9] transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Toggle Navigation Menu"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="lg:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200"
        />
      )}

      {/* Modern Vertical Sidebar (Desktop Sidebar + Mobile Collapsible Drawer) */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-64 xl:w-72 bg-[#FFFFFF] border-r border-[#E1EBE1] flex flex-col justify-between p-5 transition-transform duration-300 ease-in-out shadow-lg lg:shadow-none ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="space-y-6">
          
          {/* Sidebar Top Brand Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[#E1EBE1]">
            <div
              onClick={() => handleNavigate('/')}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#2E7D32] to-[#1B4332] flex items-center justify-center text-[#FFC107] shadow-md shadow-emerald-900/20 group-hover:scale-105 transition-transform duration-300">
                <Sprout className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xl font-black tracking-tight text-[#1B4332]">
                    {t('appName')}
                  </span>
                </div>
                <span className="text-[11px] font-bold text-[#6B7280]">
                  कोपरगाव APMC Intelligence
                </span>
              </div>
            </div>

            {/* Mobile Close Button */}
            <button
              onClick={() => setMobileOpen(false)}
              className="lg:hidden p-1.5 rounded-xl text-[#6B7280] hover:bg-[#F7FBF7]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Section Label */}
          <div className="text-[11px] font-extrabold text-[#6B7280] uppercase tracking-wider px-3">
            मुख्य नेव्हिगेशन (Main Menu)
          </div>

          {/* Vertical Menu Navigation List */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigate(item.path)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-300 cursor-pointer group min-h-[48px] ${
                    isActive
                      ? 'bg-[#2E7D32] text-[#FFFFFF] shadow-md shadow-emerald-900/20 scale-102'
                      : 'text-[#1B4332] hover:bg-[#E8F5E9] hover:text-[#2E7D32] hover:translate-x-1'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${isActive ? 'text-[#FFC107]' : 'text-[#6B7280]'}`} />
                    <span>{item.label}</span>
                  </div>

                  <ChevronRight className={`w-4 h-4 transition-transform ${isActive ? 'text-[#FFC107] opacity-100' : 'text-[#6B7280] opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5'}`} />
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Widget (API Key + Language + Profile Info) */}
        <div className="space-y-3 pt-4 border-t border-[#E1EBE1]">
          
          {/* API Key Status Pill */}
          <button
            onClick={() => {
              onOpenApiKeyModal();
              setMobileOpen(false);
            }}
            className={`w-full p-3 rounded-2xl text-xs font-extrabold flex items-center justify-between border transition-all min-h-[44px] cursor-pointer shadow-xs ${
              isLive
                ? 'bg-emerald-50 text-emerald-950 border-emerald-300 hover:bg-emerald-100'
                : 'bg-amber-50 text-amber-950 border-amber-300 hover:bg-amber-100'
            }`}
          >
            <div className="flex items-center gap-2">
              {isLive ? <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" /> : <Key className="w-4 h-4 text-[#FFC107] shrink-0" />}
              <span>{isLive ? 'Agmarknet Live' : 'API Key सेट करा'}</span>
            </div>
            <span className="text-[10px] underline">बदला</span>
          </button>

          {/* Desktop Language Toggle Container */}
          <div className="flex items-center justify-between px-3 py-2 bg-[#F7FBF7] rounded-2xl border border-[#E1EBE1]">
            <span className="text-xs font-bold text-[#6B7280]">भाषा (Language):</span>
            <LanguageToggle />
          </div>

        </div>

      </aside>
    </>
  );
};
