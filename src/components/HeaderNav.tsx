import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Bell,
  User,
  ShieldCheck,
  Key,
  MapPin,
  Sparkles,
  LogIn,
  Sprout
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

  return (
    <header className="sticky top-0 z-30 w-full bg-[#FFFFFF]/90 backdrop-blur-xl border-b border-[#D8E6D8] shadow-xs transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          
          {/* Left: Brand Logo & Region / Platform Badges */}
          <div className="flex items-center gap-2.5 sm:gap-3.5">
            
            {/* Brand Logo Header Anchor (Clickable Home) */}
            <div 
              onClick={() => navigate('/')} 
              className="flex items-center gap-2 cursor-pointer group shrink-0"
              title={t('appName')}
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-br from-[#1B5E20] via-[#2E7D32] to-[#144919] flex items-center justify-center text-[#FFB300] shadow-md shadow-emerald-950/15 group-hover:scale-105 transition-transform duration-200">
                <Sprout className="w-5 h-5 stroke-[2.5]" />
              </div>
              <span className="text-base sm:text-lg font-black tracking-tight text-[#0F291E] hidden sm:block">
                {t('appName')}
              </span>
            </div>

            {/* Divider */}
            <div className="h-6 w-px bg-[#D8E6D8] hidden md:block" />

            {/* Region Pill Badge */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-[#F4F9F4] border border-[#D8E6D8] text-xs font-black text-[#0F291E]">
              <MapPin className="w-3.5 h-3.5 text-[#FFB300] shrink-0" />
              <span>
                {isMr ? 'कोपरगाव बाजार समिती क्षेत्र' : 'Kopargaon APMC Region'}
              </span>
            </div>

            {/* AI Platform Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-black bg-emerald-50 text-[#1B5E20] border border-emerald-200 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-[#FFB300] animate-pulse shrink-0" />
              <span>
                {isMr ? 'AI कृषी बाजार मंच' : 'AI Market Platform'}
              </span>
            </div>
          </div>

          {/* Right Controls: Live API + Notification + Language + Profile/Auth */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Take Tour Button */}
            {onStartTour && (
              <button
                onClick={() => {
                  try {
                    localStorage.removeItem('KISAN_SAARTHI_ONBOARDING_COMPLETED');
                  } catch {}
                  if (onStartTour) onStartTour();
                }}
                className="hidden lg:flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-black bg-amber-50 text-amber-950 border border-amber-300 hover:bg-amber-100 transition-colors cursor-pointer shadow-xs min-h-[44px]"
                title={isMr ? 'डॅशबोर्ड मार्गदर्शन चालू करा' : 'Start Dashboard Tour'}
              >
                <Sparkles className="w-4 h-4 text-[#FFB300]" />
                <span>{isMr ? 'मार्गदर्शन' : 'Take Tour'}</span>
              </button>
            )}

            {/* Live API Key Button */}
            <button
              onClick={onOpenApiKeyModal}
              className={`px-3.5 py-2 rounded-2xl text-xs font-extrabold flex items-center gap-1.5 border transition-all duration-300 min-h-[44px] cursor-pointer shadow-xs ${
                isLive
                  ? 'bg-emerald-50 text-emerald-950 border-emerald-300 hover:bg-emerald-100 hover:border-emerald-400'
                  : 'bg-amber-50 text-amber-950 border-amber-300 hover:bg-amber-100 hover:border-amber-400'
              }`}
              title="Agmarknet API Status"
            >
              {isLive ? (
                <>
                  <ShieldCheck className="w-4 h-4 text-[#43A047] shrink-0" />
                  <span className="hidden sm:inline">Agmarknet Live</span>
                </>
              ) : (
                <>
                  <Key className="w-4 h-4 text-[#FFC107] shrink-0" />
                  <span className="hidden sm:inline">API Key</span>
                </>
              )}
            </button>

            {/* Notification Bell Button */}
            <button
              data-tour="notification-bell"
              onClick={() => navigate('/alerts')}
              className={`relative p-2.5 rounded-2xl border transition-all duration-300 min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer shadow-xs ${
                location.pathname === '/alerts'
                  ? 'bg-[#2E7D32] text-[#FFFFFF] border-[#2E7D32]'
                  : 'bg-[#F7FBF7] text-[#1B4332] border-[#E1EBE1] hover:bg-[#E8F5E9] hover:border-[#81C784] hover:text-[#2E7D32]'
              }`}
              title={t('nav.alerts')}
            >
              <Bell className="w-5 h-5 stroke-[2.2]" />
              {activeAlertsCount > 0 && (
                <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-[#FFC107] ring-2 ring-[#FFFFFF] animate-pulse" />
              )}
            </button>

            {/* Language Selector */}
            <div data-tour="language-toggle" className="hidden sm:block">
              <LanguageToggle />
            </div>

            {/* Profile Avatar or Login Trigger Button */}
            {isLoggedIn && user ? (
              <button
                data-tour="user-profile"
                onClick={() => navigate('/profile')}
                className={`px-3.5 py-2 rounded-2xl border transition-all duration-300 min-h-[44px] cursor-pointer flex items-center gap-2 shadow-xs ${
                  location.pathname === '/profile'
                    ? 'bg-gradient-to-r from-[#2E7D32] to-[#1B4332] text-[#FFFFFF] border-[#2E7D32]'
                    : 'bg-[#FFFFFF] text-[#1B4332] border-[#E1EBE1] hover:bg-[#F7FBF7] hover:border-[#81C784]'
                }`}
                title={t('nav.profile')}
              >
                <div className="w-6 h-6 rounded-full bg-[#2E7D32]/10 text-[#2E7D32] flex items-center justify-center font-black text-xs shrink-0">
                  <User className="w-4 h-4" />
                </div>
                <span className="text-xs font-extrabold hidden md:inline truncate max-w-[120px]">
                  {user.name.split(' ')[0]}
                </span>
              </button>
            ) : (
              <button
                data-tour="user-profile"
                onClick={onOpenAuthModal}
                className="px-3.5 py-2 rounded-2xl border-2 border-[#2E7D32] bg-[#2E7D32] text-[#FFFFFF] text-xs font-black hover:bg-[#1B4332] transition-all min-h-[44px] cursor-pointer flex items-center gap-1.5 shadow-xs"
              >
                <LogIn className="w-4 h-4 text-[#FFC107]" />
                <span>लॉगिन</span>
              </button>
            )}

          </div>

        </div>
      </div>
    </header>
  );
};
