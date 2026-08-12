import React from 'react';
import { useTranslation } from 'react-i18next';
import { Store, ChevronDown } from 'lucide-react';

interface MandiSelectorProps {
  selectedMandi: string;
  onSelectMandi: (mandi: string) => void;
  mandis?: string[];
}

const DEFAULT_MANDIS = ['Kopargaon', 'Rahata', 'Shrirampur', 'Yeola', 'Sangamner', 'Nashik', 'Ahilyanagar'];

export const MandiSelector: React.FC<MandiSelectorProps> = ({
  selectedMandi,
  onSelectMandi,
  mandis = DEFAULT_MANDIS
}) => {
  const { t } = useTranslation();

  return (
    <div className="relative">
      <label className="block text-xs font-extrabold text-[#1B4332] uppercase tracking-wider mb-2">
        {t('forecast.selectMandi')}
      </label>
      <div className="relative flex items-center">
        <Store className="absolute left-4 w-5 h-5 text-[#FFC107] shrink-0 pointer-events-none" />
        <select
          value={selectedMandi}
          onChange={(e) => onSelectMandi(e.target.value)}
          className="w-full pl-11 pr-10 min-h-[50px] bg-[#FFFFFF] border-2 border-[#E1EBE1] rounded-2xl text-[#1B4332] font-extrabold text-sm focus:outline-none focus:ring-4 focus:ring-[#2E7D32]/20 focus:border-[#2E7D32] transition-all duration-300 cursor-pointer shadow-xs appearance-none"
        >
          {mandis.map((mandi) => (
            <option key={mandi} value={mandi} className="font-bold py-1">
              📍 {t(`mandis.${mandi}`, mandi)}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-4 w-5 h-5 text-[#6B7280] shrink-0 pointer-events-none" />
      </div>
    </div>
  );
};
