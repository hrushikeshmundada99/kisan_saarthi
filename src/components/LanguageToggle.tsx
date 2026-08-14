import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

export const LanguageToggle: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { i18n } = useTranslation();
  const currentLang = i18n.language;

  const toggleLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  const handleSingleClickToggle = () => {
    i18n.changeLanguage(currentLang === 'mr' ? 'en' : 'mr');
  };

  // If explicitly compact or small container
  if (compact) {
    return (
      <button
        onClick={handleSingleClickToggle}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#F4F9F4] border border-[#D8E6D8] text-xs font-black text-[#0F291E] hover:bg-[#E8F5E9] transition-all shadow-xs cursor-pointer min-h-[36px]"
        title="Switch Language (भाषा बदला)"
      >
        <Globe className="w-3.5 h-3.5 text-[#1B5E20]" />
        <span>{currentLang === 'mr' ? 'मराठी' : 'EN'}</span>
      </button>
    );
  }

  return (
    <div className="inline-flex items-center p-0.5 bg-[#F4F9F4] border border-[#D8E6D8] rounded-2xl shadow-xs">
      <button
        onClick={() => toggleLanguage('mr')}
        className={`px-2 sm:px-2.5 py-1 text-[11px] sm:text-xs font-black rounded-xl transition-all duration-200 cursor-pointer ${
          currentLang === 'mr'
            ? 'bg-[#1B5E20] text-[#FFFFFF] shadow-xs'
            : 'text-[#526058] hover:text-[#0F291E]'
        }`}
        aria-label="Switch to Marathi"
      >
        मराठी
      </button>
      <button
        onClick={() => toggleLanguage('en')}
        className={`px-2 sm:px-2.5 py-1 text-[11px] sm:text-xs font-black rounded-xl transition-all duration-200 cursor-pointer ${
          currentLang === 'en'
            ? 'bg-[#1B5E20] text-[#FFFFFF] shadow-xs'
            : 'text-[#526058] hover:text-[#0F291E]'
        }`}
        aria-label="Switch to English"
      >
        <span className="hidden sm:inline">English</span>
        <span className="sm:hidden">EN</span>
      </button>
    </div>
  );
};
