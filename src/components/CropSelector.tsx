import React from 'react';
import { useTranslation } from 'react-i18next';
import { Sprout, ChevronDown } from 'lucide-react';

interface CropSelectorProps {
  selectedCrop: string;
  onSelectCrop: (crop: string) => void;
  crops?: string[];
  variant?: 'chips' | 'dropdown';
}

const DEFAULT_CROPS = ['Onion', 'Soybean', 'Cotton', 'Sugarcane', 'Pomegranate', 'Wheat', 'Tomato'];

const CROP_EMOJIS: Record<string, string> = {
  Onion: '🧅',
  Soybean: '🌱',
  Cotton: '☁️',
  Sugarcane: '🎋',
  Pomegranate: '🍎',
  Wheat: '🌾',
  Tomato: '🍅'
};

const CROP_COLOR_STYLES: Record<string, { bg: string; text: string; border: string; activeBg: string }> = {
  Onion: { bg: 'bg-purple-50', text: 'text-purple-950', border: 'border-purple-200', activeBg: 'bg-gradient-to-r from-purple-700 to-indigo-800' },
  Soybean: { bg: 'bg-emerald-50', text: 'text-emerald-950', border: 'border-emerald-200', activeBg: 'bg-gradient-to-r from-emerald-700 to-teal-800' },
  Cotton: { bg: 'bg-sky-50', text: 'text-sky-950', border: 'border-sky-200', activeBg: 'bg-gradient-to-r from-sky-700 to-blue-800' },
  Sugarcane: { bg: 'bg-lime-50', text: 'text-lime-950', border: 'border-lime-300', activeBg: 'bg-gradient-to-r from-lime-700 to-emerald-800' },
  Pomegranate: { bg: 'bg-rose-50', text: 'text-rose-950', border: 'border-rose-200', activeBg: 'bg-gradient-to-r from-rose-700 to-red-800' },
  Wheat: { bg: 'bg-amber-50', text: 'text-amber-950', border: 'border-amber-200', activeBg: 'bg-gradient-to-r from-amber-600 to-orange-700' },
  Tomato: { bg: 'bg-red-50', text: 'text-red-950', border: 'border-red-200', activeBg: 'bg-gradient-to-r from-red-700 to-rose-800' }
};

export const CropSelector: React.FC<CropSelectorProps> = ({
  selectedCrop,
  onSelectCrop,
  crops = DEFAULT_CROPS,
  variant = 'chips'
}) => {
  const { t } = useTranslation();

  if (variant === 'dropdown') {
    return (
      <div className="relative">
        <label className="block text-xs font-extrabold text-[#1B4332] uppercase tracking-wider mb-2">
          {t('forecast.selectCrop')}
        </label>
        <div className="relative flex items-center">
          <Sprout className="absolute left-4 w-5 h-5 text-[#2E7D32] shrink-0 pointer-events-none" />
          <select
            value={selectedCrop}
            onChange={(e) => onSelectCrop(e.target.value)}
            className="w-full pl-11 pr-10 min-h-[50px] bg-[#FFFFFF] border-2 border-[#E1EBE1] rounded-2xl text-[#1B4332] font-extrabold text-sm focus:outline-none focus:ring-4 focus:ring-[#2E7D32]/20 focus:border-[#2E7D32] transition-all duration-300 cursor-pointer shadow-xs appearance-none"
          >
            {crops.map((crop) => (
              <option key={crop} value={crop} className="font-bold py-1">
                {CROP_EMOJIS[crop] || '🌱'} {t(`crops.${crop}`, crop)}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-4 w-5 h-5 text-[#6B7280] shrink-0 pointer-events-none" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      {crops.map((crop) => {
        const isSelected = crop === selectedCrop;
        const emoji = CROP_EMOJIS[crop] || '🌱';
        const colorStyle = CROP_COLOR_STYLES[crop] || CROP_COLOR_STYLES.Onion;

        return (
          <button
            key={crop}
            onClick={() => onSelectCrop(crop)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-extrabold transition-all duration-300 cursor-pointer min-h-[48px] shadow-xs ${
              isSelected
                ? `${colorStyle.activeBg} text-[#FFFFFF] shadow-md scale-105 ring-2 ring-[#2E7D32]/30`
                : `${colorStyle.bg} ${colorStyle.text} border-2 ${colorStyle.border} hover:scale-102 hover:shadow-sm`
            }`}
          >
            <span className="text-lg">{emoji}</span>
            <span>{t(`crops.${crop}`, crop)}</span>
          </button>
        );
      })}
    </div>
  );
};
