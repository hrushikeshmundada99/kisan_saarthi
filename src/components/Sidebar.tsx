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
  ChevronRight,
  Sparkles,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';


interface SidebarProps {
  isLive: boolean;
  onOpenApiKeyModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isLive, onOpenApiKeyModal }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('SIDEBAR_COLLAPSED') === 'true';
    } catch {
      return false;
    }
  });

  const isMr = i18n.language === 'mr';

  const toggleCollapse = () => {
    const next = !isCollapsed;
    setIsCollapsed(next);
    try {
      localStorage.setItem('SIDEBAR_COLLAPSED', String(next));
    } catch {}
  };

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
      <header className="lg:hidden sticky top-0 z-40 bg-[#FFFFFF]/90 backdrop-blur-xl border-b border-[#D8E6D8] px-4 py-3 flex items-center justify-between shadow-xs">
        <div 
          onClick={() => handleNavigate('/')} 
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#1B5E20] to-[#2E7D32] flex items-center justify-center text-[#FFB300] shadow-md shadow-emerald-950/20 group-hover:scale-105 transition-transform">
            <Sprout className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <span className="text-lg font-black tracking-tight text-[#0F291E]">
              {t('appName')}
            </span>
            <span className="ml-1.5 px-1.5 py-0.5 rounded text-[10px] font-black bg-[#FFB300]/20 text-[#0F291E]">
              {isMr ? 'बाजार समिती' : 'APMC'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-xl bg-[#F4F9F4] border border-[#D8E6D8] text-[#0F291E] hover:bg-[#E8F5E9] transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center shadow-xs"
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

      {/* Modern Vertical Retractable Sidebar */}
      <aside
        data-tour="sidebar-nav"
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen bg-[#FFFFFF]/95 backdrop-blur-xl border-r border-[#D8E6D8] flex flex-col justify-between p-3 sm:p-4 transition-all duration-300 ease-in-out shadow-lg lg:shadow-none ${
          isCollapsed ? 'lg:w-20' : 'w-64 xl:w-72'
        } ${
          mobileOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="space-y-4">
          
          {/* Sidebar Top Brand Header + Retract/Expand Button */}
          {isCollapsed ? (
            /* Collapsed Mode Top Header */
            <div className="flex flex-col items-center gap-3 pb-3 border-b border-[#D8E6D8]">
              <div
                onClick={() => handleNavigate('/')}
                className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#1B5E20] via-[#2E7D32] to-[#144919] flex items-center justify-center text-[#FFB300] shadow-md shadow-emerald-950/20 hover:scale-105 transition-transform duration-300 cursor-pointer shrink-0"
                title={t('appName')}
              >
                <Sprout className="w-5 h-5 stroke-[2.5]" />
              </div>

              {/* Desktop Expand Button */}
              <button
                onClick={toggleCollapse}
                className="hidden lg:flex p-2 rounded-xl bg-[#F4F9F4] border border-[#D8E6D8] text-[#1B5E20] hover:bg-[#E8F5E9] hover:border-[#2E7D32] transition-all cursor-pointer shadow-xs"
                title={isMr ? 'मेनू विस्तृत करा' : 'Expand Sidebar'}
              >
                <PanelLeftOpen className="w-5 h-5" />
              </button>
            </div>
          ) : (
            /* Expanded Mode Top Header */
            <div className="flex items-center justify-between pb-3 border-b border-[#D8E6D8]">
              <div
                onClick={() => handleNavigate('/')}
                className="flex items-center gap-2.5 cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#1B5E20] via-[#2E7D32] to-[#144919] flex items-center justify-center text-[#FFB300] shadow-md shadow-emerald-950/20 group-hover:scale-105 transition-transform duration-300 shrink-0">
                  <Sprout className="w-5 h-5 stroke-[2.5]" />
                </div>
                
                <div className="animate-in fade-in duration-200">
                  <div className="flex items-center gap-1.5">
                    <span className="text-lg font-black tracking-tight text-[#0F291E]">
                      {t('appName')}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-[#526058] flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-[#FFB300]" />
                    {isMr ? 'कोपरगाव बाजार समिती Intelligence' : 'Kopargaon APMC Intelligence'}
                  </span>
                </div>
              </div>

              {/* Desktop Retract Button */}
              <button
                onClick={toggleCollapse}
                className="hidden lg:flex p-1.5 rounded-xl text-[#526058] hover:bg-[#E8F5E9] hover:text-[#1B5E20] transition-colors cursor-pointer"
                title={isMr ? 'मेनू लहान करा' : 'Retract Sidebar'}
              >
                <PanelLeftClose className="w-5 h-5" />
              </button>

              {/* Mobile Close Button */}
              <button
                onClick={() => setMobileOpen(false)}
                className="lg:hidden p-1.5 rounded-xl text-[#526058] hover:bg-[#F4F9F4]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Section Label */}
          {!isCollapsed && (
            <div className="text-[10px] font-black text-[#526058] uppercase tracking-wider px-2">
              {isMr ? 'मुख्य मेनू' : 'Main Menu'}
            </div>
          )}

          {/* Vertical Menu Navigation List */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <button
                  key={item.id}
                  data-tour={`nav-${item.id}`}
                  onClick={() => handleNavigate(item.path)}
                  title={item.label}
                  className={`w-full flex items-center ${isCollapsed ? 'lg:justify-center px-2 py-2.5' : 'justify-between px-3.5 py-2.5'} rounded-2xl text-xs sm:text-sm font-black transition-all duration-200 cursor-pointer group min-h-[44px] ${
                    isActive
                      ? 'bg-gradient-to-r from-[#1B5E20] to-[#2E7D32] text-[#FFFFFF] shadow-md shadow-emerald-950/20 scale-[1.02]'
                      : 'text-[#0F291E] hover:bg-[#E8F5E9] hover:text-[#1B5E20] hover:translate-x-1'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-[#FFB300]' : 'text-[#526058]'}`} />
                    {!isCollapsed && <span>{item.label}</span>}
                  </div>

                  {!isCollapsed && (
                    <ChevronRight className={`w-4 h-4 transition-transform ${isActive ? 'text-[#FFB300] opacity-100' : 'text-[#526058] opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5'}`} />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Widget */}
        <div className="space-y-2 pt-3 border-t border-[#D8E6D8]">
          
          {/* API Key Status Pill */}
          <button
            onClick={() => {
              onOpenApiKeyModal();
              setMobileOpen(false);
            }}
            title={isLive ? 'Agmarknet Live' : 'API Key'}
            className={`w-full p-2 rounded-2xl text-xs font-black flex items-center ${isCollapsed ? 'lg:justify-center' : 'justify-between'} border transition-all min-h-[40px] cursor-pointer shadow-xs ${
              isLive
                ? 'bg-emerald-50 text-emerald-950 border-emerald-300 hover:bg-emerald-100'
                : 'bg-amber-50 text-amber-950 border-amber-300 hover:bg-amber-100'
            }`}
          >
            <div className="flex items-center gap-2">
              {isLive ? <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" /> : <Key className="w-4 h-4 text-[#FFB300] shrink-0" />}
              {!isCollapsed && <span>{isLive ? 'Agmarknet Live' : 'API Key सेट करा'}</span>}
            </div>
            {!isCollapsed && <span className="text-[10px] underline">बदला</span>}
          </button>

        </div>

      </aside>
    </>
  );
};

