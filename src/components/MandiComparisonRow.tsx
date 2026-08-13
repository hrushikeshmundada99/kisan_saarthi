import React from 'react';
import { useTranslation } from 'react-i18next';
import { MANDI_LOCATIONS } from '../data/realData';
import { Card } from './Card';
import { Button } from './Button';
import { Award, MapPin, Truck, ArrowRight } from 'lucide-react';

interface MandiComparisonRowProps {
  rate: {
    id: string;
    commodity: string;
    mandi: string;
    minPrice: number;
    maxPrice: number;
    modalPrice: number;
    arrivalDate: string;
    arrivalsQuantity: number;
    distanceKm: number;
    transportPerQ: number;
    netPerQ: number;
  };
  isBestOption: boolean;
  quantityQuintals?: number;
  onSelect?: () => void;
}

export const MandiComparisonRow: React.FC<MandiComparisonRowProps> = ({
  rate,
  isBestOption,
  quantityQuintals = 10,
  onSelect
}) => {
  const { t, i18n } = useTranslation();

  const todayStr = new Date().toISOString().split('T')[0];
  const isToday = rate.arrivalDate === todayStr;
  const locationInfo = MANDI_LOCATIONS[rate.mandi] || { distanceKm: rate.distanceKm, estFreightRatePerQ: rate.distanceKm * 1.3 };
  const transportCostPerQ = Math.round(locationInfo.estFreightRatePerQ);
  const totalTransportCost = transportCostPerQ * quantityQuintals;
  const netPricePerQ = rate.modalPrice - transportCostPerQ;
  const totalNetPayout = netPricePerQ * quantityQuintals;

  // Dynamic badge label
  const bestBadgeLabel = isToday
    ? (i18n.language === 'mr' ? '🌾 आज विकण्यासाठी सर्वाधिक नफा देणारी मंडी' : '🌾 Best mandi to sell today (Highest Net Profit)')
    : (i18n.language === 'mr' ? 'या तारखेस विकण्यासाठी सर्वोत्तम मंडी' : 'Best mandi to sell on this date');

  return (
    <Card
      hoverable
      className={`relative overflow-hidden transition-all duration-300 rounded-3xl p-5 sm:p-6 shadow-xs border-2 ${
        isBestOption
          ? 'border-[#1B5E20] bg-gradient-to-br from-emerald-500/10 via-[#F7FBF7] to-[#FFFFFF] shadow-md ring-2 ring-[#1B5E20]/30'
          : 'border-[#D8E6D8] hover:border-[#1B5E20] bg-[#FFFFFF]'
      }`}
    >
      {/* Best Market Badge */}
      {isBestOption && (
        <div className="absolute top-0 right-0 bg-gradient-to-r from-[#1B5E20] to-[#2E7D32] text-[#FFFFFF] text-xs font-black px-4 py-1.5 rounded-bl-2xl shadow-xs flex items-center gap-1.5 z-10">
          <Award className="w-4 h-4 text-[#FFB300]" />
          <span>{bestBadgeLabel}</span>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 pt-1">
        
        {/* Mandi & Location info */}
        <div className="flex items-start gap-3.5">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-sm shrink-0 shadow-xs ${
            isBestOption ? 'bg-[#1B5E20] text-[#FFB300]' : 'bg-[#E8F5E9] text-[#1B5E20] border border-[#A5D6A7]'
          }`}>
            <MapPin className="w-6 h-6 stroke-[2.5]" />
          </div>

          <div className="space-y-1">
            <h3 className="text-xl font-black text-[#0F291E]">
              {t(`mandis.${rate.mandi}`, rate.mandi)}
            </h3>

            {/* Badges Row: Distance Badge & Transport Badge & Range */}
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold pt-0.5">
              {/* Distance Badge */}
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-[#F4F9F4] text-[#0F291E] border border-[#D8E6D8]">
                <MapPin className="w-3.5 h-3.5 text-[#FFB300]" />
                {rate.distanceKm === 0 
                  ? (i18n.language === 'mr' ? 'कोपरगाव (0 km)' : 'Kopargaon (0 km)') 
                  : (i18n.language === 'mr' ? `${rate.distanceKm} km अंतर` : `${rate.distanceKm} km away`)}
              </span>

              {/* Transport Cost Badge */}
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-rose-50 text-rose-950 border border-rose-200">
                <Truck className="w-3.5 h-3.5 text-[#DC2626]" />
                {i18n.language === 'mr' ? `भाडे: ₹${transportCostPerQ}/क्विंटल` : `Freight: ₹${transportCostPerQ}/q`}
              </span>

              {/* Min Max text */}
              <span className="text-[11px] text-[#526058] font-bold">
                (किमान: ₹{rate.minPrice} • कमाल: ₹{rate.maxPrice})
              </span>
            </div>
          </div>
        </div>

        {/* Price Matrix & Net Profit Card Box */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 bg-[#F4F9F4] p-3.5 rounded-2xl border border-[#D8E6D8] text-center md:text-right shadow-xs">
          {/* Raw Market Price */}
          <div>
            <div className="text-[11px] font-black text-[#526058] uppercase tracking-wider">
              {t('comparison.tableRawPrice')}
            </div>
            <div className="text-xl font-black text-[#0F291E] mt-0.5">
              ₹{rate.modalPrice.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-[#1B5E20] font-black">
              ₹{(rate.modalPrice / 100).toFixed(1)}/किलो
            </div>
          </div>

          {/* Transport Deductions */}
          <div>
            <div className="text-[11px] font-black text-rose-700 uppercase tracking-wider">
              - {t('comparison.tableTransport')}
            </div>
            <div className="text-xl font-black text-rose-600 mt-0.5">
              ₹{transportCostPerQ}
            </div>
            <div className="text-[11px] text-rose-700 font-bold">
              {i18n.language === 'mr' ? `एकूण ₹${totalTransportCost} (${quantityQuintals}q)` : `Total ₹${totalTransportCost} (${quantityQuintals}q)`}
            </div>
          </div>

          {/* Net Profit Card Highlight */}
          <div className="border-l border-[#D8E6D8] pl-2 sm:pl-3">
            <div className="text-[11px] font-black text-[#1B5E20] uppercase tracking-wider">
              {t('comparison.tableNetPrice')}
            </div>
            <div className="text-2xl font-black text-[#1B5E20] mt-0.5">
              ₹{netPricePerQ.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] font-black text-[#D97706]">
              {i18n.language === 'mr' ? `एकूण ₹${totalNetPayout.toLocaleString('en-IN')}` : `Total ₹${totalNetPayout.toLocaleString('en-IN')}`}
            </div>
          </div>
        </div>

        {/* Select Action */}
        {onSelect && (
          <div className="shrink-0 flex md:flex-col justify-end">
            <Button
              variant={isBestOption ? 'primary' : 'secondary'}
              size="sm"
              onClick={onSelect}
              className="w-full md:w-auto text-xs font-extrabold"
            >
              <span>{t('comparison.actionSellHere')}</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        )}

      </div>
    </Card>
  );
};
