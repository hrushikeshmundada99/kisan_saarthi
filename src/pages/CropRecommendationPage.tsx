import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import {
  MOCK_CROP_RECOMMENDATIONS,
  type CropRecommendationItem
} from '../data/mockWeatherAndRecommendationData';
import {
  Sparkles,
  Award,
  TrendingUp,
  CloudRain,
  Droplets,
  Layers,
  ArrowRight,
  Calculator,
  Compass
} from 'lucide-react';

export const CropRecommendationPage: React.FC = () => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();

  // Filters State
  const [selectedSoil, setSelectedSoil] = useState<'ALL' | 'BLACK' | 'LOAMY' | 'SANDY'>('ALL');
  const [selectedSeason, setSelectedSeason] = useState<'ALL' | 'KHARIF' | 'RABBI' | 'SUMMER'>('ALL');
  const [selectedWater, setSelectedWater] = useState<'ALL' | 'LOW' | 'MEDIUM' | 'HIGH'>('ALL');

  // Filtered & Ranked Recommendations
  const filteredCrops: CropRecommendationItem[] = useMemo(() => {
    return MOCK_CROP_RECOMMENDATIONS.filter((item) => {
      if (selectedSoil !== 'ALL' && !item.suitableSoil.includes(selectedSoil)) return false;
      if (selectedSeason !== 'ALL' && !item.suitableSeasons.includes(selectedSeason)) return false;
      if (selectedWater !== 'ALL' && item.waterRequirement !== selectedWater) return false;
      return true;
    }).sort((a, b) => b.expectedProfitPerAcre - a.expectedProfitPerAcre);
  }, [selectedSoil, selectedSeason, selectedWater]);

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-3 duration-300">
      
      {/* Page Header Card */}
      <Card hoverable={false} className="p-6 sm:p-8 space-y-4 border border-[#E1EBE1] rounded-2xl shadow-sm bg-gradient-to-r from-[#FFFFFF] via-[#F7FBF7] to-[#E8F5E9]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#2E7D32]/10 text-[#2E7D32] text-xs font-black">
              <Compass className="w-4 h-4 text-[#FFC107]" />
              <span>पिक निवड व नफा सल्लागार (AI Crop Recommendation Engine)</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-[#1B4332] tracking-tight">
              {i18n.language === 'mr'
                ? 'योग्य पिक निवडा, जास्त नफा मिळवा!'
                : 'Grow What Will Actually Pay!'}
            </h1>
            
            <p className="text-sm font-extrabold text-[#2E7D32]">
              "नेहमीप्रमाणे तेच पिक घेण्याऐवजी, बाजारात ज्या पिकाला सर्वाधिक भाव मिळणार आहे तेच पिक घ्या."
            </p>
          </div>

          <Button
            variant="primary"
            size="md"
            onClick={() => navigate('/calculator')}
            className="shrink-0 self-start sm:self-auto"
          >
            <Calculator className="w-4 h-4 text-[#FFC107]" />
            <span>लागवड खर्च व नफा मोजा</span>
          </Button>
        </div>

        {/* Input Selector Filters: Soil + Season + Water */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-[#E1EBE1]">
          
          {/* Soil Filter */}
          <div>
            <label className="block text-xs font-extrabold text-[#1B4332] uppercase tracking-wider mb-2 flex items-center gap-1">
              <Layers className="w-4 h-4 text-[#2E7D32]" />
              <span>१. जमिनीचा प्रकार (Soil Type):</span>
            </label>
            <select
              value={selectedSoil}
              onChange={(e) => setSelectedSoil(e.target.value as any)}
              className="w-full min-h-[48px] px-4 bg-[#FFFFFF] border-2 border-[#E1EBE1] rounded-2xl text-xs font-extrabold text-[#1B4332] focus:ring-4 focus:ring-[#2E7D32]/20 cursor-pointer"
            >
              <option value="ALL">सर्व जमिनीचे प्रकार (All Soil Types)</option>
              <option value="BLACK">काळी जमीन (Deep Black Soil)</option>
              <option value="LOAMY">मुरमाड / मध्यम जमीन (Medium Loamy Soil)</option>
              <option value="SANDY">रेतीली / हलकी जमीन (Sandy Light Soil)</option>
            </select>
          </div>

          {/* Season Filter */}
          <div>
            <label className="block text-xs font-extrabold text-[#1B4332] uppercase tracking-wider mb-2 flex items-center gap-1">
              <Sparkles className="w-4 h-4 text-[#FFC107]" />
              <span>२. हंगाम (Crop Season):</span>
            </label>
            <select
              value={selectedSeason}
              onChange={(e) => setSelectedSeason(e.target.value as any)}
              className="w-full min-h-[48px] px-4 bg-[#FFFFFF] border-2 border-[#E1EBE1] rounded-2xl text-xs font-extrabold text-[#1B4332] focus:ring-4 focus:ring-[#2E7D32]/20 cursor-pointer"
            >
              <option value="ALL">सर्व हंगाम (All Seasons)</option>
              <option value="KHARIF">खरीप (Kharif - पावसाळा)</option>
              <option value="RABBI">रब्बी (Rabbi - हिवाळा)</option>
              <option value="SUMMER">उन्हाळी (Summer)</option>
            </select>
          </div>

          {/* Water Availability Filter */}
          <div>
            <label className="block text-xs font-extrabold text-[#1B4332] uppercase tracking-wider mb-2 flex items-center gap-1">
              <Droplets className="w-4 h-4 text-blue-600" />
              <span>३. पाण्याची उपलब्धता (Water Supply):</span>
            </label>
            <select
              value={selectedWater}
              onChange={(e) => setSelectedWater(e.target.value as any)}
              className="w-full min-h-[48px] px-4 bg-[#FFFFFF] border-2 border-[#E1EBE1] rounded-2xl text-xs font-extrabold text-[#1B4332] focus:ring-4 focus:ring-[#2E7D32]/20 cursor-pointer"
            >
              <option value="ALL">सर्व पाणी पातळी (All Water Levels)</option>
              <option value="LOW">कमी पाणी (Low Water Requirement)</option>
              <option value="MEDIUM">मध्यम पाणी (Medium Water)</option>
              <option value="HIGH">भरपूर पाणी (High Irrigation)</option>
            </select>
          </div>

        </div>
      </Card>

      {/* Ranked Crop Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredCrops.map((item, idx) => {
          const isTopRanked = idx === 0;

          return (
            <Card
              key={item.id}
              hoverable
              className={`p-6 space-y-5 rounded-2xl border-2 transition-all relative overflow-hidden ${
                isTopRanked
                  ? 'border-[#FFC107] bg-gradient-to-br from-amber-500/10 via-[#FFFFFF] to-[#F7FBF7] shadow-lg ring-2 ring-[#FFC107]/30'
                  : 'border-[#E1EBE1] bg-[#FFFFFF] hover:border-[#81C784]'
              }`}
            >
              {/* Top Rank Badge */}
              {isTopRanked && (
                <div className="absolute top-0 right-0 bg-[#FFC107] text-[#1B4332] text-xs font-black px-4 py-1.5 rounded-bl-2xl shadow-xs flex items-center gap-1">
                  <Award className="w-4 h-4 text-[#1B4332]" />
                  <span>#1 सर्वाधिक नफा देणारे पिक</span>
                </div>
              )}

              {/* Crop Header */}
              <div className="flex items-start justify-between gap-4 pt-2">
                <div>
                  <span className="text-xs font-black text-[#2E7D32] uppercase tracking-wider">
                    क्रमांक {idx + 1} शिफारस
                  </span>
                  <h3 className="text-2xl font-black text-[#1B4332] mt-0.5">
                    {i18n.language === 'mr' ? item.cropNameMr : item.cropNameEn}
                  </h3>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs text-[#6B7280] font-extrabold block">अपेक्षित दर एकरी निव्वळ नफा:</span>
                  <span className="text-2xl font-black text-[#2E7D32]">
                    ₹{item.expectedProfitPerAcre.toLocaleString('en-IN')}
                    <span className="text-xs font-bold text-[#6B7280]"> / एकर</span>
                  </span>
                </div>
              </div>

              {/* AI Reason Highlight Quote Box */}
              <div className="border-l-4 border-[#2E7D32] bg-[#F7FBF7] p-4 rounded-r-2xl border border-[#E1EBE1]">
                <p className="text-sm font-extrabold text-[#1B4332] leading-relaxed">
                  "{i18n.language === 'mr' ? item.headlineReasonMr : item.headlineReasonEn}"
                </p>
              </div>

              {/* Market Demand vs Climate Risk Indicators */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-[#FFFFFF] border border-[#E1EBE1] rounded-2xl space-y-1">
                  <div className="text-[#6B7280] font-extrabold flex items-center justify-between">
                    <span>बाजार मागणी (Demand):</span>
                    <TrendingUp className="w-4 h-4 text-[#43A047]" />
                  </div>
                  <div className="text-lg font-black text-[#2E7D32]">
                    {item.marketDemandScore} / 100
                  </div>
                  <div className="w-full bg-[#E1EBE1] h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-[#2E7D32] h-full rounded-full"
                      style={{ width: `${item.marketDemandScore}%` }}
                    />
                  </div>
                </div>

                <div className="p-3 bg-[#FFFFFF] border border-[#E1EBE1] rounded-2xl space-y-1">
                  <div className="text-[#6B7280] font-extrabold flex items-center justify-between">
                    <span>हवामान धोका (Climate Risk):</span>
                    <CloudRain className="w-4 h-4 text-[#D97706]" />
                  </div>
                  <div className="text-lg font-black text-[#D97706]">
                    {item.climateRiskScore}% (कमी धोका)
                  </div>
                  <div className="w-full bg-[#E1EBE1] h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-[#FFC107] h-full rounded-full"
                      style={{ width: `${item.climateRiskScore}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Crop Specs Chips & Action Button */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#E1EBE1]">
                <div className="flex flex-wrap gap-2 text-xs font-bold">
                  <span className="px-3 py-1 bg-[#F7FBF7] border border-[#E1EBE1] text-[#1B4332] rounded-xl">
                    ⏱️ {item.growingPeriodDays} दिवस
                  </span>
                  <span className="px-3 py-1 bg-[#F7FBF7] border border-[#E1EBE1] text-[#2E7D32] rounded-xl">
                    💧 पाणी: {item.waterRequirement}
                  </span>
                </div>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate(`/forecast?crop=${item.crop}`)}
                  className="w-full sm:w-auto"
                >
                  <span>दर अंदाज व बाजार पहा</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>

            </Card>
          );
        })}
      </div>

    </div>
  );
};
