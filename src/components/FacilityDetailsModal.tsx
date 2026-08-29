import React from 'react';
import { useTranslation } from 'react-i18next';
import type { StorageFacility } from '../data/storageFacilitiesData';
import {
  X,
  MapPin,
  Phone,
  Clock,
  ShieldCheck,
  Award,
  ExternalLink,
  Thermometer,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface FacilityDetailsModalProps {
  facility: StorageFacility | null;
  onClose: () => void;
  onSelectForCalculation?: (facility: StorageFacility) => void;
}

export const FacilityDetailsModal: React.FC<FacilityDetailsModalProps> = ({
  facility,
  onClose,
  onSelectForCalculation
}) => {
  const { i18n } = useTranslation();
  const isMr = i18n.language === 'mr';

  if (!facility) return null;

  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${facility.latitude},${facility.longitude}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#FFFFFF] border border-[#D8E6D8] rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-[#F4F9F4] border-b border-[#E1EBE1] flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 bg-[#1B5E20] text-white text-xs font-black rounded-full shadow-xs">
                {isMr ? facility.typeMr : facility.typeEn}
              </span>

              {facility.sourceType === 'verified' ? (
                <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>🟢 {isMr ? 'प्रमाणित नोंदणीकृत माहिती (Verified)' : 'Live Verified'}</span>
                </span>
              ) : (
                <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 text-[11px] font-bold rounded-full flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                  <span>🟡 {isMr ? 'अंदाजित नोंदणी (Estimated)' : 'Estimated Entry'}</span>
                </span>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-[#1B4332]">
              {isMr ? facility.nameMr : facility.name}
            </h2>

            <p className="text-xs text-[#526058] font-semibold flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#FFB300] shrink-0" />
              <span>{facility.address}, {facility.district}, {facility.state}</span>
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-[#6B7280] hover:bg-[#E8F5E9] hover:text-[#1B4332] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 text-[#1B4332]">
          
          {/* Overview Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-3.5 bg-[#FAF7F2] rounded-2xl border border-[#E5DFD5] space-y-1">
              <span className="text-[11px] font-extrabold text-[#6B7280] uppercase tracking-wider block">
                {isMr ? 'एकूण क्षमता (Capacity):' : 'Total Capacity:'}
              </span>
              <p className="text-base font-black text-[#1B5E20]">
                {facility.totalCapacity} {facility.capacityUnit}
              </p>
              <p className="text-xs text-[#526058] font-semibold">
                उपलब्ध: <strong className="text-emerald-700">{facility.availableCapacity} {facility.capacityUnit}</strong>
              </p>
            </div>

            <div className="p-3.5 bg-[#FAF7F2] rounded-2xl border border-[#E5DFD5] space-y-1">
              <span className="text-[11px] font-extrabold text-[#6B7280] uppercase tracking-wider block">
                {isMr ? 'अंदाजित दर (Monthly Storage):' : 'Estimated Rate:'}
              </span>
              <p className="text-base font-black text-[#1B4332]">
                ₹{facility.storageRatePerQuintalMonth} / क्विंटल / महिना
              </p>
              <p className="text-xs text-[#526058] font-semibold">
                (~₹{(facility.storageRatePerQuintalMonth / 100).toFixed(2)}/kg/mo)
              </p>
            </div>

            <div className="p-3.5 bg-[#FAF7F2] rounded-2xl border border-[#E5DFD5] space-y-1 sm:col-span-2 lg:col-span-1">
              <span className="text-[11px] font-extrabold text-[#6B7280] uppercase tracking-wider block">
                {isMr ? 'संपर्क व वेळ (Contact & Hours):' : 'Contact & Hours:'}
              </span>
              <p className="text-xs font-black text-[#1B4332] flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#1B5E20]" />
                <span>{facility.phone}</span>
              </p>
              <p className="text-[11px] text-[#526058] font-semibold flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#FFB300]" />
                <span>{facility.openingHours} ({facility.operatingDays})</span>
              </p>
            </div>
          </div>

          {/* Suitable Crops Chips */}
          <div className="space-y-2">
            <h4 className="text-xs font-extrabold text-[#1B4332] uppercase tracking-wider">
              {isMr ? 'उपयुक्त पिके (Supported Crops):' : 'Supported Crops:'}
            </h4>
            <div className="flex flex-wrap gap-2">
              {facility.supportedCrops.map((c) => (
                <span
                  key={c}
                  className="px-3 py-1 bg-[#E8F5E9] border border-[#A5D6A7] text-[#1B5E20] text-xs font-black rounded-xl"
                >
                  ✓ {c}
                </span>
              ))}
            </div>
          </div>

          {/* Technology & Environmental Control */}
          <div className="space-y-2.5 bg-[#F4F9F4] p-4 rounded-2xl border border-[#D8E6D8]">
            <h4 className="text-xs font-extrabold text-[#1B5E20] uppercase tracking-wider flex items-center gap-1.5">
              <Thermometer className="w-4 h-4 text-[#FFB300]" />
              <span>{isMr ? 'साठवणूक तंत्रज्ञान व तापमान नियंत्रण' : 'Storage Technology & Climate Control'}</span>
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-bold">
              <div>
                <span className="text-[#6B7280] block text-[11px]">तापमान (Temperature):</span>
                <span>{facility.temperatureMin !== undefined ? `${facility.temperatureMin}°C - ${facility.temperatureMax}°C` : 'नैसर्गिक हवेशीर (Ambient)'}</span>
              </div>
              <div>
                <span className="text-[#6B7280] block text-[11px]">आद्रता नियंत्रण (Humidity):</span>
                <span>{facility.humidityControl ? facility.humidityRange || 'होय (Controlled)' : 'नाही (Standard)'}</span>
              </div>
              <div>
                <span className="text-[#6B7280] block text-[11px]">CA तंत्रज्ञान (Controlled Atmo):</span>
                <span>{facility.controlledAtmosphere ? 'उपलब्ध (Available)' : 'नाही (None)'}</span>
              </div>
              <div>
                <span className="text-[#6B7280] block text-[11px]">किमान माल (Min Weight):</span>
                <span>{facility.minimumQuantity} क्विंटल (Q)</span>
              </div>
            </div>
          </div>

          {/* Available Services Grid */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-extrabold text-[#1B4332] uppercase tracking-wider">
              {isMr ? 'सुविधा व सेवा (Available Facility Services):' : 'Available Services:'}
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs font-semibold">
              <ServiceCheck label={isMr ? 'हमाली व चढाई-उतारा' : 'Loading/Unloading'} active={facility.loadingAvailable} />
              <ServiceCheck label={isMr ? 'वजन काटा (Weighbridge)' : 'Weighing Facility'} active={facility.weighingAvailable} />
              <ServiceCheck label={isMr ? 'ग्रॅडिंग व वर्गवारी' : 'Sorting & Grading'} active={facility.sortingAvailable} />
              <ServiceCheck label={isMr ? 'पॅकिंग सुविधा' : 'Packaging Facility'} active={facility.packagingAvailable} />
              <ServiceCheck label={isMr ? 'वाहतूक मदत (Transport)' : 'Transport Assistance'} active={facility.transportAvailable} />
              <ServiceCheck label={isMr ? 'सीसीटीव्ही (CCTV Monitoring)' : '24/7 CCTV'} active={facility.cctv} />
              <ServiceCheck label={isMr ? 'जनरेटर बॅकअप' : 'Backup Power'} active={facility.backupPower} />
              <ServiceCheck label={isMr ? 'सुरक्षा रक्षक (Security)' : 'Security Guard'} active={facility.security} />
              <ServiceCheck label={isMr ? 'विमा संरक्षण (Insurance)' : 'Insurance Coverage'} active={facility.insuranceAvailable} />
            </div>
          </div>

          {/* Pricing Breakup Table */}
          <div className="space-y-2 border-t border-[#E1EBE1] pt-4">
            <h4 className="text-xs font-extrabold text-[#1B4332] uppercase tracking-wider">
              {isMr ? 'खर्च तपशील दरपत्रक (Estimated Tariff Breakup in ₹):' : 'Estimated Tariff Breakup (₹):'}
            </h4>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#FAF7F2] text-[#6B7280] uppercase font-bold border-b border-[#E5DFD5]">
                  <tr>
                    <th className="py-2 px-3">{isMr ? 'सेवा / शुल्क' : 'Service Charge'}</th>
                    <th className="py-2 px-3">{isMr ? 'दर (प्रति क्विंटल)' : 'Rate (Per Quintal)'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5DFD5] font-semibold">
                  <tr>
                    <td className="py-2 px-3">{isMr ? 'भाडे / साठवणूक शुल्क (Monthly Storage)' : 'Monthly Storage Rate'}</td>
                    <td className="py-2 px-3 font-bold text-[#1B5E20]">₹{facility.storageRatePerQuintalMonth} / क्विंटल / महिना</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3">{isMr ? 'चढाई व उतारा (Loading & Unloading)' : 'Loading & Unloading'}</td>
                    <td className="py-2 px-3">₹{facility.loadingChargePerQuintal + facility.unloadingChargePerQuintal} / क्विंटल (एकदाच)</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3">{isMr ? 'हाताळणी खर्च (Handling Fee)' : 'Handling Fee'}</td>
                    <td className="py-2 px-3">₹{facility.handlingChargePerQuintal} / क्विंटल</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3">{isMr ? 'पॅकिंग शुल्क (Packaging)' : 'Packaging Charge'}</td>
                    <td className="py-2 px-3">₹{facility.packagingChargePerQuintal} / क्विंटल</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3">{isMr ? 'विमा संरक्षण (Insurance Coverage)' : 'Insurance Premium'}</td>
                    <td className="py-2 px-3">{facility.insuranceAvailable ? `${facility.insuranceRatePct}% (मालाच्या मूल्यानुसार)` : 'माहिती उपलब्ध नाही'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 font-medium">
            💡 {isMr ? 'सूचना: अंतिम दर साठवणूक कालावधी व मोसमाच्या गर्दीनुसार बदलू शकतात. प्रत्यक्ष माल नेण्यापूर्वी दूरध्वनीवर संपर्क साधून खात्री करावी.' : 'Note: Actual rates may vary depending on storage duration & seasonal demand. Please confirm via phone before transport.'}
          </div>

        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 bg-[#F4F9F4] border-t border-[#E1EBE1] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <a
              href={`tel:${facility.phone}`}
              className="px-4 py-2.5 bg-[#1B5E20] hover:bg-[#123E1B] text-white text-xs font-black rounded-xl transition-all flex items-center gap-1.5 shadow-xs"
            >
              <Phone className="w-4 h-4 text-[#FFB300]" />
              <span>{isMr ? 'थेट कॉल करा' : 'Call Facility'}</span>
            </a>

            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 bg-[#FFFFFF] hover:bg-[#FAF7F2] text-[#1B4332] border border-[#D8E6D8] text-xs font-black rounded-xl transition-all flex items-center gap-1.5 shadow-xs"
            >
              <ExternalLink className="w-4 h-4 text-[#FFB300]" />
              <span>{isMr ? 'रस्ता मॅप पहा (Directions)' : 'Get Directions'}</span>
            </a>
          </div>

          {onSelectForCalculation && (
            <button
              onClick={() => {
                onSelectForCalculation(facility);
                onClose();
              }}
              className="px-5 py-2.5 bg-[#FFC107] hover:bg-[#FFB300] text-[#1B4332] text-xs font-black rounded-xl transition-all flex items-center gap-1.5 shadow-md cursor-pointer"
            >
              <Award className="w-4 h-4" />
              <span>{isMr ? 'या संस्थेचे नफा गणित करा' : 'Calculate Profit For This Facility'}</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

const ServiceCheck: React.FC<{ label: string; active: boolean }> = ({ label, active }) => (
  <div className={`flex items-center gap-1.5 ${active ? 'text-[#1B5E20]' : 'text-[#9CA3AF] line-through'}`}>
    <CheckCircle2 className={`w-4 h-4 shrink-0 ${active ? 'text-[#2E7D32]' : 'text-[#D1D5DB]'}`} />
    <span>{label}</span>
  </div>
);
