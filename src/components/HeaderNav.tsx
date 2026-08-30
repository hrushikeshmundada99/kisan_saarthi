import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Bell,
  LogIn,
  Sprout,
  Menu
} from 'lucide-react';
import { LanguageToggle } from './LanguageToggle';
import { getStoredAlerts } from '../utils/alertManager';
import { useAuth } from '../context/AuthContext';

interface HeaderNavProps {
  isLive?: boolean;
  onOpenApiKeyModal?: () => void;
  onOpenAuthModal?: () => void;
  onStartTour?: () => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({ onOpenAuthModal, onStartTour: _onStartTour }) => {
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
    <header className="sticky top-0 z-40 w-full bg-[#FFFFFF]/95 backdrop-blur-xl border-b border-[#D8E6D8] shadow-xs transition-all duration-300">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 lg:h-20 gap-1 sm:gap-4 overflow-hidden">
          
          {/* Left: Mobile Menu Toggle + Brand Logo */}
          <div className="flex items-center gap-1.5 sm:gap-3.5 shrink-0 min-w-0">
            
            {/* Mobile Hamburger Toggle */}
            <button
              onClick={handleToggleSidebar}
              className="lg:hidden p-1.5 sm:p-2 rounded-xl sm:rounded-2xl bg-[#F4F9F4] border border-[#D8E6D8] text-[#0F291E] hover:bg-[#E8F5E9] transition-colors cursor-pointer min-h-[36px] min-w-[36px] sm:min-h-[40px] sm:min-w-[40px] flex items-center justify-center shadow-xs shrink-0"
              aria-label="Open Navigation Menu"
            >
              <Menu className="w-5 h-5 text-[#1B5E20]" />
            </button>

            {/* Brand Logo Header Anchor */}
            <div 
              onClick={() => navigate('/')} 
              className="lg:hidden flex items-center gap-1.5 sm:gap-2.5 cursor-pointer group shrink min-w-0"
              title={t('appName')}
            >
              <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#1B5E20] via-[#2E7D32] to-[#144919] flex items-center justify-center text-[#FFB300] shadow-md shadow-emerald-950/15 group-hover:scale-105 transition-transform duration-200 shrink-0">
                <Sprout className="w-4.5 h-4.5 sm:w-6 sm:h-6 stroke-[2.5]" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs xs:text-sm sm:text-lg lg:text-xl font-black tracking-tight text-[#0F291E] leading-tight truncate max-w-[85px] xs:max-w-[120px] sm:max-w-none">
                  {t('appName')}
                </span>
                <span className="text-[10px] font-extrabold text-[#1B5E20] hidden sm:block">
                  कोपरगाव APMC Intelligence
                </span>
              </div>
            </div>

          </div>

          {/* Right Controls: Notification + Language + Profile/Auth */}
          <div className="flex items-center gap-1 sm:gap-3 shrink-0">

            {/* Notification Bell Button */}
            <button
              data-tour="notification-bell"
              onClick={() => navigate('/alerts')}
              className={`relative p-2 rounded-xl sm:rounded-2xl border transition-all duration-300 min-h-[36px] min-w-[36px] sm:min-h-[40px] sm:min-w-[40px] flex items-center justify-center cursor-pointer shadow-xs shrink-0 ${
                location.pathname === '/alerts'
                  ? 'bg-[#1B5E20] text-[#FFFFFF] border-[#1B5E20]'
                  : 'bg-[#F4F9F4] text-[#0F291E] border-[#D8E6D8] hover:bg-[#E8F5E9] hover:text-[#1B5E20]'
              }`}
              title={t('nav.alerts')}
            >
              <Bell className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[2.2]" />
              {activeAlertsCount > 0 && (
                <span className="absolute top-1 right-1 sm:top-1.5 sm:right-1.5 w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#FFB300] ring-2 ring-[#FFFFFF] animate-pulse" />
              )}
            </button>

            {/* Language Selector */}
            <div data-tour="language-toggle" className="shrink-0 flex items-center">
              <LanguageToggle />
            </div>

            {/* User Profile / Login Button */}
            <div data-tour="user-profile" className="shrink-0">
              {isLoggedIn ? (
                <button
                  onClick={() => navigate('/profile')}
                  className="flex items-center gap-1.5 p-1 sm:px-3 sm:py-1.5 rounded-xl sm:rounded-2xl bg-[#F4F9F4] border border-[#D8E6D8] hover:bg-[#E8F5E9] transition-all cursor-pointer shadow-xs min-h-[36px] sm:min-h-[40px] shrink-0"
                >
                  <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-gradient-to-br from-[#1B5E20] to-[#2E7D32] flex items-center justify-center text-[#FFFFFF] font-black text-xs">
                    {user?.name?.charAt(0) || 'K'}
                  </div>
                  <div className="hidden lg:block text-left pr-1">
                    <div className="text-xs font-black text-[#0F291E] leading-tight truncate max-w-[100px]">
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
                  className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl text-[11px] sm:text-xs font-black bg-gradient-to-r from-[#1B5E20] to-[#2E7D32] text-[#FFFFFF] hover:opacity-95 transition-all flex items-center gap-1 sm:gap-1.5 cursor-pointer shadow-xs min-h-[36px] sm:min-h-[40px] whitespace-nowrap shrink-0"
                >
                  <LogIn className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#FFB300]" />
                  <span>{isMr ? 'लॉगिन' : 'Login'}</span>
                </button>
              )}
            </div>

          </div>

        </div>
      </div>
    </header>
  );
};
