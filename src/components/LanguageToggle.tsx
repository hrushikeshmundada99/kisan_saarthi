import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

export const LanguageToggle: React.FC = () => {
  const { i18n } = useTranslation();
  const currentLang = i18n.language;

  const toggleLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  return (
    <div className="inline-flex items-center p-1 bg-[#F4EFE6] border border-[#E5DFD3] rounded-full shadow-inner">
      <div className="flex items-center gap-1 px-2 py-0.5 text-xs text-[#55634F] font-medium">
        <Globe className="w-3.5 h-3.5 text-[#D97706]" />
      </div>
      <button
        onClick={() => toggleLanguage('mr')}
        className={`px-3 py-1 text-xs font-bold rounded-full transition-all duration-200 cursor-pointer ${
          currentLang === 'mr'
            ? 'bg-[#2D5016] text-[#FDFBF7] shadow-sm scale-105'
            : 'text-[#4A5844] hover:text-[#2D5016]'
        }`}
        aria-label="Switch to Marathi"
      >
        मराठी
      </button>
      <button
        onClick={() => toggleLanguage('en')}
        className={`px-3 py-1 text-xs font-bold rounded-full transition-all duration-200 cursor-pointer ${
          currentLang === 'en'
            ? 'bg-[#2D5016] text-[#FDFBF7] shadow-sm scale-105'
            : 'text-[#4A5844] hover:text-[#2D5016]'
        }`}
        aria-label="Switch to English"
      >
        English
      </button>
    </div>
  );
};
