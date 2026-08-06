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
  LogIn
} from 'lucide-react';
import { LanguageToggle } from './LanguageToggle';
import { getStoredAlerts } from '../utils/alertManager';
import { useAuth } from '../context/AuthContext';

interface HeaderNavProps {
  isLive: boolean;
  onOpenApiKeyModal: () => void;
  onOpenAuthModal?: () => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({ isLive, onOpenApiKeyModal, onOpenAuthModal }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoggedIn } = useAuth();

  // Active alerts count for notification badge
  const activeAlertsCount = getStoredAlerts().filter((a) => a.status === 'ACTIVE').length;

  return (
    <header className="sticky top-0 z-30 w-full bg-[#FFFFFF]/85 backdrop-blur-xl border-b border-[#E1EBE1] shadow-sm shadow-emerald-950/5 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          
          {/* Left: Region & Quick Search Bar */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-[#F7FBF7] border border-[#E1EBE1] text-xs font-extrabold text-[#1B4332]">
              <MapPin className="w-4 h-4 text-[#FFC107] shrink-0" />
              <span>कोपरगाव APMC (Kopargaon Region)</span>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-black bg-gradient-to-r from-emerald-50 to-teal-50 text-[#2E7D32] border border-[#81C784]/40">
              <Sparkles className="w-3.5 h-3.5 text-[#FFC107] animate-pulse" />
              <span>AI Market Platform</span>
            </div>
          </div>

          {/* Right Controls: Live API + Notification + Language + Profile/Auth */}
          <div className="flex items-center gap-2 sm:gap-3">
            
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
            <div className="hidden sm:block">
              <LanguageToggle />
            </div>

            {/* Profile Avatar or Login Trigger Button */}
            {isLoggedIn && user ? (
              <button
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
