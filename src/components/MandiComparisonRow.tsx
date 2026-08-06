import React from 'react';
import { useTranslation } from 'react-i18next';
import { MANDI_LOCATIONS } from '../data/mockData';
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

  const isToday = rate.arrivalDate === '2026-07-26';
  const locationInfo = MANDI_LOCATIONS[rate.mandi] || { distanceKm: rate.distanceKm, estFreightRatePerQ: rate.distanceKm * 1.3 };
  const transportCostPerQ = Math.round(locationInfo.estFreightRatePerQ);
  const totalTransportCost = transportCostPerQ * quantityQuintals;
  const netPricePerQ = rate.modalPrice - transportCostPerQ;
  const totalNetPayout = netPricePerQ * quantityQuintals;

  // Dynamic badge label
  const bestBadgeLabel = isToday
    ? (i18n.language === 'mr' ? 'आज विकण्यासाठी सर्वोत्तम मंडी' : 'Best mandi to sell today')
    : (i18n.language === 'mr' ? 'या तारखेस विकण्यासाठी सर्वोत्तम मंडी' : 'Best mandi to sell on this date');

  return (
    <Card
      hoverable
      className={`relative overflow-hidden transition-all duration-300 rounded-2xl p-6 shadow-sm border-2 ${
        isBestOption
          ? 'border-[#FFC107] bg-gradient-to-br from-amber-500/10 via-[#F7FBF7] to-[#FFFFFF] shadow-md ring-2 ring-[#FFC107]/40'
          : 'border-[#E1EBE1] hover:border-[#81C784] bg-[#FFFFFF]'
      }`}
    >
      {/* Best Market Badge */}
      {isBestOption && (
        <div className="absolute top-0 right-0 bg-[#FFC107] text-[#1B4332] text-xs font-black px-4 py-1.5 rounded-bl-2xl shadow-xs flex items-center gap-1.5 z-10">
          <Award className="w-4 h-4 text-[#1B4332]" />
          <span>{bestBadgeLabel}</span>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 pt-1">
        
        {/* Mandi & Location info */}
        <div className="flex items-start gap-3.5">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-sm shrink-0 shadow-xs ${
            isBestOption ? 'bg-[#FFC107] text-[#1B4332]' : 'bg-[#E8F5E9] text-[#2E7D32] border border-[#81C784]/40'
          }`}>
            <MapPin className="w-6 h-6 stroke-[2.5]" />
          </div>

          <div className="space-y-1">
            <h3 className="text-xl font-black text-[#1B4332]">
              {t(`mandis.${rate.mandi}`, rate.mandi)}
            </h3>

            {/* Badges Row: Distance Badge & Transport Badge */}
            <div className="flex flex-wrap items-center gap-2 text-xs font-extrabold pt-0.5">
              {/* Distance Badge */}
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-extrabold bg-[#E8F5E9] text-[#2E7D32] border border-[#81C784]/40">
                <MapPin className="w-3.5 h-3.5 text-[#FFC107]" />
                {rate.distanceKm === 0 ? 'कोपरगाव (0 km)' : `${rate.distanceKm} km अंतर`}
              </span>

              {/* Transport Cost Badge */}
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-extrabold bg-rose-50 text-rose-950 border border-rose-200">
                <Truck className="w-3.5 h-3.5 text-[#E53935]" />
                भाडे: ₹{transportCostPerQ}/क्विंटल
              </span>
            </div>
          </div>
        </div>

        {/* Price Matrix & Net Profit Card Box */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 bg-[#F7FBF7] p-4 rounded-2xl border border-[#E1EBE1] text-center md:text-right shadow-xs">
          {/* Raw Market Price */}
          <div>
            <div className="text-xs font-extrabold text-[#6B7280] uppercase tracking-wider">
              {t('comparison.tableRawPrice')}
            </div>
            <div className="text-xl font-black text-[#1B4332] mt-0.5">
              ₹{rate.modalPrice.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-[#6B7280] font-semibold">रु/क्विंटल</div>
          </div>

          {/* Transport Deductions */}
          <div>
            <div className="text-xs font-extrabold text-[#E53935] uppercase tracking-wider">
              - {t('comparison.tableTransport')}
            </div>
            <div className="text-xl font-black text-[#E53935] mt-0.5">
              ₹{transportCostPerQ}
            </div>
            <div className="text-[11px] text-rose-700 font-bold">कुल ₹{totalTransportCost} ({quantityQuintals}q)</div>
          </div>

          {/* Net Profit Card Highlight */}
          <div className="border-l border-[#E1EBE1] pl-2 sm:pl-3">
            <div className="text-xs font-extrabold text-[#2E7D32] uppercase tracking-wider">
              {t('comparison.tableNetPrice')}
            </div>
            <div className="text-2xl font-black text-[#2E7D32] mt-0.5">
              ₹{netPricePerQ.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] font-black text-[#D97706]">
              एकूण ₹{totalNetPayout.toLocaleString('en-IN')}
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
