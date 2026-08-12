import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, LineChart, Scale, Bell, User } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const bottomItems = [
    { id: 'dashboard', path: '/dashboard', label: t('nav.dashboard'), icon: LayoutDashboard },
    { id: 'forecast', path: '/forecast', label: t('nav.forecast'), icon: LineChart },
    { id: 'comparison', path: '/comparison', label: t('nav.comparison'), icon: Scale },
    { id: 'alerts', path: '/alerts', label: t('nav.alerts'), icon: Bell },
    { id: 'profile', path: '/profile', label: t('nav.profile'), icon: User }
  ];

  return (
    <div className="lg:hidden fixed bottom-3 left-3 right-3 z-50 bg-[#FFFFFF]/95 backdrop-blur-xl border border-[#E2ECE2] rounded-3xl shadow-xl shadow-emerald-950/10 pb-safe">
      <div className="flex items-center justify-around px-2 py-2 min-h-[60px]">
        {bottomItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-2xl transition-all duration-200 cursor-pointer min-w-[60px] min-h-[48px] ${
                isActive
                  ? 'text-[#2E7D32] font-black scale-105'
                  : 'text-[#6B7280] hover:text-[#2E7D32]'
              }`}
            >
              <div
                className={`p-2 rounded-xl transition-all ${
                  isActive ? 'bg-[#2E7D32] text-[#FFC107] shadow-md shadow-emerald-900/20' : 'bg-transparent'
                }`}
              >
                <Icon className="w-5 h-5 stroke-[2.5]" />
              </div>
              <span className="text-[10px] font-bold tracking-tight mt-1 text-center leading-tight truncate max-w-[64px]">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
