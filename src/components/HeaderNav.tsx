import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Bell,
  ShieldCheck,
  Key,
  MapPin,
  Sparkles,
  LogIn,
  Sprout,
  Menu
} from 'lucide-react';
import { LanguageToggle } from './LanguageToggle';
import { getStoredAlerts } from '../utils/alertManager';
import { useAuth } from '../context/AuthContext';

interface HeaderNavProps {
  isLive: boolean;
  onOpenApiKeyModal: () => void;
  onOpenAuthModal?: () => void;
  onStartTour?: () => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({ isLive, onOpenApiKeyModal, onOpenAuthModal, onStartTour }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoggedIn } = useAuth();
  const isMr = i18n.language === 'mr';

  // Active alerts count for notification badge
  const activeAlertsCount = getStoredAlerts().filter((a) => a.status === 'ACTIVE').length;

  const handleToggleSidebar = () => {
    window.dispatchEvent(new CustomEvent('TOGGLE_KISAN_SIDEBAR'));
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-[#FFFFFF]/95 backdrop-blur-xl border-b border-[#D8E6D8] shadow-xs transition-all duration-300">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 lg:h-20 gap-2 sm:gap-4">
          
          {/* Left: Mobile Menu Toggle + Brand Logo + Region Badges */}
          <div className="flex items-center gap-2 sm:gap-3.5">
            
            {/* Mobile Hamburger Toggle (Leftmost on phones/tablets) */}
            <button
              onClick={handleToggleSidebar}
              className="lg:hidden p-2 rounded-xl bg-[#F4F9F4] border border-[#D8E6D8] text-[#0F291E] hover:bg-[#E8F5E9] transition-colors cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center shadow-xs"
              aria-label="Open Navigation Menu"
            >
              <Menu className="w-5 h-5 text-[#1B5E20]" />
            </button>

            {/* Brand Logo Header Anchor (Clickable Home) */}
            <div 
              onClick={() => navigate('/')} 
              className="flex items-center gap-2 cursor-pointer group shrink-0"
              title={t('appName')}
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-br from-[#1B5E20] via-[#2E7D32] to-[#144919] flex items-center justify-center text-[#FFB300] shadow-md shadow-emerald-950/15 group-hover:scale-105 transition-transform duration-200">
                <Sprout className="w-4.5 h-4.5 sm:w-5 sm:h-5 stroke-[2.5]" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm sm:text-lg font-black tracking-tight text-[#0F291E] leading-tight">
                  {t('appName')}
                </span>
                <span className="text-[9px] font-extrabold text-[#1B5E20] lg:hidden">
                  कोपरगाव APMC
                </span>
              </div>
            </div>

            {/* Divider (Desktop / Laptop) */}
            <div className="h-6 w-px bg-[#D8E6D8] hidden md:block" />

            {/* Region Pill Badge (Laptop / Desktop) */}
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-[#F4F9F4] border border-[#D8E6D8] text-xs font-black text-[#0F291E]">
              <MapPin className="w-3.5 h-3.5 text-[#FFB300] shrink-0" />
              <span>
                {isMr ? 'कोपरगाव बाजार समिती क्षेत्र' : 'Kopargaon APMC Region'}
              </span>
            </div>

            {/* AI Platform Badge (Laptop / Desktop) */}
            <div className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-black bg-emerald-50 text-[#1B5E20] border border-emerald-200 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-[#FFB300] animate-pulse shrink-0" />
              <span>
                {isMr ? 'AI कृषी बाजार मंच' : 'AI Market Platform'}
              </span>
            </div>
          </div>

          {/* Right Controls: Tour + Live API + Notification + Language + Profile/Auth */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            
            {/* Take Tour Button (Laptop / Desktop) */}
            {onStartTour && (
              <button
                onClick={() => {
                  try {
                    localStorage.removeItem('KISAN_SAARTHI_ONBOARDING_COMPLETED');
                  } catch {}
                  if (onStartTour) onStartTour();
                }}
                className="hidden xl:flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-black bg-amber-50 text-amber-950 border border-amber-300 hover:bg-amber-100 transition-colors cursor-pointer shadow-xs min-h-[40px]"
                title={isMr ? 'डॅशबोर्ड मार्गदर्शन चालू करा' : 'Start Dashboard Tour'}
              >
                <Sparkles className="w-4 h-4 text-[#FFB300]" />
                <span>{isMr ? 'मार्गदर्शन' : 'Take Tour'}</span>
              </button>
            )}

            {/* Live API Key Button (Desktop / Tablet) */}
            <button
              onClick={onOpenApiKeyModal}
              className={`hidden sm:flex px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-2xl text-xs font-extrabold items-center gap-1.5 border transition-all duration-300 min-h-[38px] sm:min-h-[42px] cursor-pointer shadow-xs ${
                isLive
                  ? 'bg-emerald-50 text-emerald-950 border-emerald-300 hover:bg-emerald-100'
                  : 'bg-amber-50 text-amber-950 border-amber-300 hover:bg-amber-100'
              }`}
              title="Agmarknet API Status"
            >
              {isLive ? (
                <>
                  <ShieldCheck className="w-4 h-4 text-[#1B5E20] shrink-0" />
                  <span>Live चालू दर</span>
                </>
              ) : (
                <>
                  <Key className="w-4 h-4 text-[#FFB300] shrink-0" />
                  <span>API Key</span>
                </>
              )}
            </button>

            {/* Notification Bell Button */}
            <button
              data-tour="notification-bell"
              onClick={() => navigate('/alerts')}
              className={`relative p-2 sm:p-2.5 rounded-2xl border transition-all duration-300 min-h-[38px] min-w-[38px] sm:min-h-[42px] sm:min-w-[42px] flex items-center justify-center cursor-pointer shadow-xs ${
                location.pathname === '/alerts'
                  ? 'bg-[#1B5E20] text-[#FFFFFF] border-[#1B5E20]'
                  : 'bg-[#F4F9F4] text-[#0F291E] border-[#D8E6D8] hover:bg-[#E8F5E9] hover:text-[#1B5E20]'
              }`}
              title={t('nav.alerts')}
            >
              <Bell className="w-4.5 h-4.5 sm:w-5 sm:h-5 stroke-[2.2]" />
              {activeAlertsCount > 0 && (
                <span className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-[#FFB300] ring-2 ring-[#FFFFFF] animate-pulse" />
              )}
            </button>

            {/* Language Selector (Always visible on all screens!) */}
            <div data-tour="language-toggle" className="shrink-0">
              <LanguageToggle />
            </div>

            {/* User Profile / Login Avatar */}
            <div data-tour="user-profile" className="shrink-0">
              {isLoggedIn ? (
                <button
                  onClick={() => navigate('/profile')}
                  className="flex items-center gap-2 p-1 sm:px-3 sm:py-1.5 rounded-2xl bg-[#F4F9F4] border border-[#D8E6D8] hover:bg-[#E8F5E9] transition-all cursor-pointer shadow-xs"
                >
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-br from-[#1B5E20] to-[#2E7D32] flex items-center justify-center text-[#FFFFFF] font-black text-xs">
                    {user?.name?.charAt(0) || 'K'}
                  </div>
                  <div className="hidden lg:block text-left">
                    <div className="text-xs font-black text-[#0F291E] leading-tight truncate max-w-[90px]">
                      {user?.name || 'शेतकरी'}
                    </div>
                    <div className="text-[10px] text-[#526058] font-bold">
                      {user?.phone || 'कोपरगाव'}
                    </div>
                  </div>
                </button>
              ) : (
                <button
                  onClick={onOpenAuthModal}
                  className="px-3 py-1.5 sm:py-2 rounded-2xl text-xs font-black bg-gradient-to-r from-[#1B5E20] to-[#2E7D32] text-[#FFFFFF] hover:opacity-95 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs min-h-[38px] sm:min-h-[42px]"
                >
                  <LogIn className="w-4 h-4 text-[#FFB300]" />
                  <span className="hidden sm:inline">{isMr ? 'लॉगिन' : 'Login'}</span>
                </button>
              )}
            </div>

          </div>

        </div>
      </div>
    </header>
  );
};
