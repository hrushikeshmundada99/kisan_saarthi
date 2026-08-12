import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, ChevronRight } from 'lucide-react';

export const Breadcrumb: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const path = location.pathname;

  if (path === '/') return null;

  const pageNames: Record<string, string> = {
    '/dashboard': t('nav.dashboard'),
    '/forecast': t('nav.forecast'),
    '/comparison': t('nav.comparison'),
    '/trends': t('nav.trends'),
    '/calculator': t('nav.calculator'),
    '/alerts': t('nav.alerts'),
    '/profile': t('nav.profile')
  };

  const currentPageName = pageNames[path] || 'माहिती';

  return (
    <nav className="flex items-center gap-1.5 text-xs text-[#4B5563] font-medium mb-4">
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-1 hover:text-[#2D5016] transition-colors cursor-pointer"
      >
        <Home className="w-3.5 h-3.5 text-[#2D5016]" />
        <span>मुखपृष्ठ (Home)</span>
      </button>

      <ChevronRight className="w-3.5 h-3.5 text-[#E5DFD5]" />

      <span className="font-bold text-[#2D5016] bg-[#2D5016]/10 px-2.5 py-0.5 rounded-md border border-[#2D5016]/20">
        {currentPageName}
      </span>
    </nav>
  );
};
