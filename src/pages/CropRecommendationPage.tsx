import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import {
  CROP_RECOMMENDATIONS,
  type CropRecommendationItem
} from '../data/weatherAndRecommendationData';
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
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  // Filters State
  const [selectedSoil, setSelectedSoil] = useState<'ALL' | 'BLACK' | 'LOAMY' | 'SANDY'>('ALL');
  const [selectedSeason, setSelectedSeason] = useState<'ALL' | 'KHARIF' | 'RABBI' | 'SUMMER'>('ALL');
  const [selectedWater, setSelectedWater] = useState<'ALL' | 'LOW' | 'MEDIUM' | 'HIGH'>('ALL');

  // Filtered & Ranked Recommendations
  const filteredCrops: CropRecommendationItem[] = useMemo(() => {
    return CROP_RECOMMENDATIONS.filter((item) => {
      if (selectedSoil !== 'ALL' && !item.suitableSoil.includes(selectedSoil)) return false;
      if (selectedSeason !== 'ALL' && !item.suitableSeasons.includes(selectedSeason)) return false;
      if (selectedWater !== 'ALL' && item.waterRequirement !== selectedWater) return false;
      return true;
    }).sort((a, b) => b.expectedProfitPerAcre - a.expectedProfitPerAcre);
  }, [selectedSoil, selectedSeason, selectedWater]);

  return (
    <div className="space-y-4 sm:space-y-5 pb-6 max-w-7xl mx-auto animate-in fade-in duration-200">
      
      {/* Page Header Card */}
      <Card hoverable={false} className="p-4 sm:p-6 space-y-3 border border-[#E1EBE1] rounded-2xl shadow-sm bg-gradient-to-r from-[#FFFFFF] via-[#F7FBF7] to-[#E8F5E9]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#2E7D32]/10 text-[#2E7D32] text-xs font-black">
              <Compass className="w-4 h-4 text-[#FFC107]" />
              <span>{t('nav.recommendation')}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#1B4332] tracking-tight">
              {t('recommendation.title')}
            </h1>
            
            <p className="text-xs sm:text-sm font-extrabold text-[#2E7D32]">
              "{t('recommendation.subtitle')}"
            </p>
          </div>

          <Button
            variant="primary"
            size="md"
            onClick={() => navigate('/calculator')}
            className="shrink-0 self-start sm:self-auto"
          >
            <Calculator className="w-4 h-4 text-[#FFC107]" />
            <span>{t('recommendation.calcProfitBtn')}</span>
          </Button>
        </div>

        {/* Input Selector Filters: Soil + Season + Water */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-[#E1EBE1]">
          
          {/* Soil Filter */}
          <div>
            <label className="block text-xs font-extrabold text-[#1B4332] uppercase tracking-wider mb-2 flex items-center gap-1">
              <Layers className="w-4 h-4 text-[#2E7D32]" />
              <span>{t('recommendation.soilType')}</span>
            </label>
            <select
              value={selectedSoil}
              onChange={(e) => setSelectedSoil(e.target.value as any)}
              className="w-full min-h-[48px] px-4 bg-[#FFFFFF] border-2 border-[#E1EBE1] rounded-2xl text-xs font-extrabold text-[#1B4332] focus:ring-4 focus:ring-[#2E7D32]/20 cursor-pointer"
            >
              <option value="ALL">{t('recommendation.allSoils')}</option>
              <option value="BLACK">{t('recommendation.blackSoil')}</option>
              <option value="LOAMY">{t('recommendation.loamySoil')}</option>
              <option value="SANDY">{t('recommendation.sandySoil')}</option>
            </select>
          </div>

          {/* Season Filter */}
          <div>
            <label className="block text-xs font-extrabold text-[#1B4332] uppercase tracking-wider mb-2 flex items-center gap-1">
              <Sparkles className="w-4 h-4 text-[#FFC107]" />
              <span>{t('recommendation.season')}</span>
            </label>
            <select
              value={selectedSeason}
              onChange={(e) => setSelectedSeason(e.target.value as any)}
              className="w-full min-h-[48px] px-4 bg-[#FFFFFF] border-2 border-[#E1EBE1] rounded-2xl text-xs font-extrabold text-[#1B4332] focus:ring-4 focus:ring-[#2E7D32]/20 cursor-pointer"
            >
              <option value="ALL">{t('recommendation.allSeasons')}</option>
              <option value="KHARIF">{t('recommendation.kharif')}</option>
              <option value="RABBI">{t('recommendation.rabbi')}</option>
              <option value="SUMMER">{t('recommendation.summer')}</option>
            </select>
          </div>

          {/* Water Availability Filter */}
          <div>
            <label className="block text-xs font-extrabold text-[#1B4332] uppercase tracking-wider mb-2 flex items-center gap-1">
              <Droplets className="w-4 h-4 text-blue-600" />
              <span>{t('recommendation.waterSupply')}</span>
            </label>
            <select
              value={selectedWater}
              onChange={(e) => setSelectedWater(e.target.value as any)}
              className="w-full min-h-[48px] px-4 bg-[#FFFFFF] border-2 border-[#E1EBE1] rounded-2xl text-xs font-extrabold text-[#1B4332] focus:ring-4 focus:ring-[#2E7D32]/20 cursor-pointer"
            >
              <option value="ALL">{t('recommendation.allWater')}</option>
              <option value="LOW">{t('recommendation.lowWater')}</option>
              <option value="MEDIUM">{t('recommendation.mediumWater')}</option>
              <option value="HIGH">{t('recommendation.highWater')}</option>
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
                  <span>{t('recommendation.topRankedBadge')}</span>
                </div>
              )}

              {/* Crop Header */}
              <div className="flex items-start justify-between gap-4 pt-2">
                <div>
                  <span className="text-xs font-black text-[#2E7D32] uppercase tracking-wider">
                    {i18n.language === 'mr' ? `क्रमांक ${idx + 1} शिफारस` : `Rank #${idx + 1} Recommendation`}
                  </span>
                  <h3 className="text-2xl font-black text-[#1B4332] mt-0.5">
                    {i18n.language === 'mr' ? item.cropNameMr : item.cropNameEn}
                  </h3>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs text-[#6B7280] font-extrabold block">{t('recommendation.expectedProfit')}</span>
                  <span className="text-2xl font-black text-[#2E7D32]">
                    ₹{item.expectedProfitPerAcre.toLocaleString('en-IN')}
                    <span className="text-xs font-bold text-[#6B7280]">{t('recommendation.perAcre')}</span>
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
                    <span>{t('recommendation.demand')}</span>
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
                    <span>{t('recommendation.climateRisk')}</span>
                    <CloudRain className="w-4 h-4 text-[#D97706]" />
                  </div>
                  <div className="text-lg font-black text-[#D97706]">
                    {item.climateRiskScore}% ({t('recommendation.lowRiskText')})
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
                    ⏱️ {item.growingPeriodDays} {t('recommendation.days')}
                  </span>
                  <span className="px-3 py-1 bg-[#F7FBF7] border border-[#E1EBE1] text-[#2E7D32] rounded-xl">
                    💧 {t('recommendation.waterReq')} {item.waterRequirement}
                  </span>
                </div>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate(`/forecast?crop=${item.crop}`)}
                  className="w-full sm:w-auto"
                >
                  <span>{t('recommendation.viewForecastBtn')}</span>
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
