import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import {
  APMC_LIST,
  CROP_LIST
} from '../data/agmarknetDataset';
import { MandiDataService, type MandiCropDataResult } from '../services/mandiDataService';
import { calculateMandiForecast, type MandiForecastSummary } from '../utils/forecastEngine';
import { MandiPriceTrendChart } from '../components/MandiPriceTrendChart';
import { Card } from '../components/Card';
import { EmptyState } from '../components/EmptyState';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  AlertCircle,
  Sparkles,
  Calendar,
  Building2,
  Sprout,
  Info
} from 'lucide-react';

export interface CropMarketFactors {
  supplyFactorMr: string;
  supplyFactorEn: string;
  demandFactorMr: string;
  demandFactorEn: string;
  policyFactorMr: string;
  policyFactorEn: string;
  aiRecommendationMr: string;
  aiRecommendationEn: string;
  bullishFactorsMr: string[];
  bullishFactorsEn: string[];
  bearishFactorsMr: string[];
  bearishFactorsEn: string[];
}

export const CROP_MARKET_FACTORS: Record<string, CropMarketFactors> = {
  onion: {
    supplyFactorMr: "मान्सूनचा पावसाचा लहरीपणा आणि साठवणुकीतील कांद्याची घट यामुळे बाजारात आवक नियंत्रित आहे.",
    supplyFactorEn: "Controlled mandi arrivals due to monsoon storage decay and lower late-Kharif nursery acreage.",
    demandFactorMr: "गणेशोत्सव व आगामी सण उत्सवांमुळे देशांतर्गत हॉटेल व घरगुती मागणीत ५-८% वाढ अपेक्षित.",
    demandFactorEn: "Domestic retail and wholesale demand expected to surge 5-8% ahead of festival season.",
    policyFactorMr: "केंद्र सरकारचे निर्यात शुल्क धोरण आणि नाफेड/एनसीसीएफ कडील बफर स्टॉक विक्री दर नियंत्रणात ठेवत आहे.",
    policyFactorEn: "Government buffer stock releases via NAFED/NCCF helping check extreme price volatility.",
    aiRecommendationMr: "पुढील १५-२० दिवसांत भावात १०-१५% तेजीची शक्यता. टप्प्याटप्प्याने माल विक्रीचा सल्ला.",
    aiRecommendationEn: "Multi-AI consensus projects 10-15% price upside over 30 days. Staggered selling recommended.",
    bullishFactorsMr: ["सणासुदीची वाढती मागणी", "साठवणूक कांद्याची कमी उपलब्धता", "दक्षिण भारतातील कमी आवक"],
    bullishFactorsEn: ["Festive demand surge", "Depleting cold storage stocks", "Lower Southern arrivals"],
    bearishFactorsMr: ["नाफेडचे बफर स्टॉक रिलीज", "नवीन लाल कांद्याची लवकर आवक"],
    bearishFactorsEn: ["NAFED buffer stock intervention", "Early Kharif onion arrivals"]
  },
  soybean: {
    supplyFactorMr: "सोयाबीन पेरणी क्षेत्र समाधानकारक असून नव्या पिकाची आवक सप्टेंबर अखेरीस सुरू होईल.",
    supplyFactorEn: "Satisfactory Kharif acreage with new crop arrivals scheduled for late September.",
    demandFactorMr: "सोयापेंड (DOC) निर्यातीला आंतरराष्ट्रीय बाजारात मागणी आणि पोल्ट्री उद्योगाकडून सातत्यपूर्ण खरेदी.",
    demandFactorEn: "Strong international soyameal (DOC) export contracts & steady poultry feed intake.",
    policyFactorMr: "शासनाचा ५,३०८ रु./क्विंटल हमीभाव (MSP) आणि आयात खाद्यतेलावरील शुल्काचे रक्षण.",
    policyFactorEn: "Government MSP benchmark at ₹5,308/Q supporting floor price levels in local mandis.",
    aiRecommendationMr: "दर ५,९०० - ६,४०० दरम्यान स्थिर राहण्याचा अंदाज. हमीभावापेक्षा जास्त दर असताना विक्री योग्य.",
    aiRecommendationEn: "Prices consolidating around ₹5,900-₹6,400/Q. Good window for gradual liquidation.",
    bullishFactorsMr: ["सोयापेंड निर्यात मागणी", "आयात शुल्कात वाढीचे संकेत", "जागतिक सोयाबीन तेजी"],
    bullishFactorsEn: ["Soymeal export demand", "Import tariff protection", "Global CBOT soy strength"],
    bearishFactorsMr: ["नवीन पिकाची अपेक्षित आवक", "आयात खाद्यतेलाची मुबलक उपलब्धता"],
    bearishFactorsEn: ["Upcoming fresh harvest arrivals", "Edible oil imports volume"]
  },
  cotton: {
    supplyFactorMr: "गुलाबी बोंड अळीचा प्रादुर्भाव नियंत्रणात असून वेचणी ऑक्टोबर महिन्यात सुरू होईल.",
    supplyFactorEn: "Pest incidence under control with first-pick harvesting slated for October.",
    demandFactorMr: "टेक्स्टाईल गिरण्यांची सुत निर्मितीसाठी कच्च्या कापसाला खरेदी आणि आंतरराष्ट्रीय सूत मागणी.",
    demandFactorEn: "Spinning mills actively procuring quality lint ahead of peak yarn manufacturing cycle.",
    policyFactorMr: "CCI कडून ७,५२१ रु./क्विंटल या MSP दरावर खरेदीची पूर्वतयारी.",
    policyFactorEn: "Cotton Corporation of India (CCI) minimum support price baseline active at ₹7,521/Q.",
    aiRecommendationMr: "७,३०० ते ७,७०० रु. च्या पट्ट्यात दर राहील. दर्जेदार लांब धाग्याच्या कापसाला अधिक भाव.",
    aiRecommendationEn: "Stable trading range of ₹7,300-₹7,700/Q forecasted. Premium for long-staple quality.",
    bullishFactorsMr: ["गिरण्यांकडील कमी शिल्लक साठा", "जागतिक कापूस साठा घट", "सूत निर्यातीत सुधारणा"],
    bullishFactorsEn: ["Low mill inventory", "Global ending stock reduction", "Yarn export recovery"],
    bearishFactorsMr: ["कृत्रिम धाग्याशी (Polyester) स्पर्धा", "आयात कापसाची उपलब्धता"],
    bearishFactorsEn: ["Synthetic fiber competition", "Imported lint availability"]
  },
  wheat: {
    supplyFactorMr: "शासकीय गोदामातील बफर साठा आणि रब्बी हंगामातील गव्हाची शिल्लक आवक चांगल्या स्थितीत आहे.",
    supplyFactorEn: "Stable buffer stocks in FCI godowns with steady remaining Rabi arrivals.",
    demandFactorMr: "आटा गिरण्या (Flour Mills) आणि बिस्किट/बेकरी उद्योगाकडून नियमित व सातत्यपूर्ण मागणी.",
    demandFactorEn: "Steady institutional procurement by roller flour mills and biscuit manufacturers.",
    policyFactorMr: "गव्हाच्या खुल्या बाजार विक्री योजनेमुळे (OMSS) दरांवर नियंत्रण ठेवणारा दबाव.",
    policyFactorEn: "Open Market Sale Scheme (OMSS) releases regulating sudden price spikes.",
    aiRecommendationMr: "२,६०० ते २,९०० रु. दर स्थिर राहील. सणासुदीच्या काळात २-४% दरवाढ शक्य.",
    aiRecommendationEn: "Consistent base around ₹2,600-₹2,900/Q with slight 2-4% pre-festive appreciation.",
    bullishFactorsMr: ["बेकरी उद्योगाची वाढती मागणी", "फेस्टिवल सिझन खप", "स्थानिक बाजारात कमी आवक"],
    bullishFactorsEn: ["Bakery sector demand", "Festival processing volume", "Tighter open mandi supply"],
    bearishFactorsMr: ["FCI कडील मुबलक साठा", "OMSS गव्हाची विक्री"],
    bearishFactorsEn: ["FCI central pool reserves", "Government OMSS intervention"]
  },
  pomegranate: {
    supplyFactorMr: "मृग बहाराच्या डाळिंबाची आवक सुरू असून उत्तम रंग व आकाराच्या फळांना उच्च मागणी आहे.",
    supplyFactorEn: "Mrig Bahar harvest underway; high demand for A-grade export fruit size and color.",
    demandFactorMr: "बांग्लादेश व आखाती देशांत निर्यात आणि आगामी सणांसाठी मोठी मागणी.",
    demandFactorEn: "Robust export orders from Bangladesh & Gulf nations alongside festival demand.",
    policyFactorMr: "फलोत्पादन निर्यात अनुदान आणि APEDA कडील वाहतूक सवलतींमुळे निर्यातीला प्रोत्साहन.",
    policyFactorEn: "APEDA export transport subsidies and quality certification boosting trade value.",
    aiRecommendationMr: "उत्कृष्ट दर्जाच्या डाळिंबाला ८,५०० ते १०,००० रु. भाव मिळेल. फळांची वर्गवारी करून विक्री करा.",
    aiRecommendationEn: "Premium grades expected to command ₹8,500-₹10,000/Q. Grade-based sorting advised.",
    bullishFactorsMr: ["आखाती देशांत निर्यात मागणी", "सणासुदीचा मोठा खप", "कमी दागाचे दर्जेदार फळ"],
    bullishFactorsEn: ["Gulf export demand", "Festive fruit consumption", "High quality disease-free yield"],
    bearishFactorsMr: ["कमी दर्जाच्या फळांची जास्त आवक", "वाहतूक भाड्यात वाढ"],
    bearishFactorsEn: ["B-grade/C-grade excess supply", "High freight logistics costs"]
  },
  tomato: {
    supplyFactorMr: "पावसामुळे स्थानिक आवक विस्कळीत झाली असून जुन्या पिकाची उत्पादकता घटली आहे.",
    supplyFactorEn: "Monsoon rains disrupting local picking & transit from major growing clusters.",
    demandFactorMr: "शहरी भागात टोमॅटोची मागणी तीव्र असून हॉटेल व प्रोसेसिंग उद्योगाकडून सातत्यपूर्ण मागणी.",
    demandFactorEn: "Strong urban retail demand coupled with sauce & puree processing factory orders.",
    policyFactorMr: "जीवनावश्यक वस्तू निरीक्षण केंद्राकडून टोमॅटो दरांवर विशेष लक्ष.",
    policyFactorEn: "Essential Commodities Monitoring Cell observing price swings across metro hubs.",
    aiRecommendationMr: "पुढील १०-१५ दिवस दर १५०० ते २००० रु. दरम्यान अस्थिर राहतील. हवामान पाहून वेचणी करा.",
    aiRecommendationEn: "High volatility between ₹1,500-₹2,000/Q expected. Timely picking recommended.",
    bullishFactorsMr: ["पावसामुळे आवक विस्कळीत", "सणासुदीची मागणी", "नव्या पिकाला विलंब"],
    bullishFactorsEn: ["Rain-induced transport delays", "Festive consumer intake", "Delayed new planting"],
    bearishFactorsMr: ["इतर राज्यांतून आवक वाढल्यास मंदी", "नाशवंत पिकाचा दबाव"],
    bearishFactorsEn: ["Inter-state inflow surge", "Perishable crop distress selling"]
  },
  maize: {
    supplyFactorMr: "खरीप मका पिकाची स्थिती उत्तम असून दाणे भरण्याच्या टप्प्यात पाऊस पूरक ठरला आहे.",
    supplyFactorEn: "Kharif crop condition healthy with grain filling aided by recent monsoon showers.",
    demandFactorMr: "पोल्ट्री खाद्य उद्योग आणि स्टार्च बनवणाऱ्या कारखान्यांकडून मोठी खरेदी.",
    demandFactorEn: "Heavy buying interest from poultry feed formulators and starch manufacturers.",
    policyFactorMr: "इथेनॉल निर्मितीसाठी मक्याचा वापर वाढवण्याच्या धोरणामुळे बाजाराला भक्कम आधार.",
    policyFactorEn: "Government ethanol blending policy using maize grains providing strong price floor.",
    aiRecommendationMr: "२,३०० ते २,६०० रु. दर टिकून राहील. इथेनॉल मागणीमुळे दीर्घकाळ तेजीची शक्यता.",
    aiRecommendationEn: "Price floor secure at ₹2,300-₹2,600/Q driven by ethanol feedstock demand.",
    bullishFactorsMr: ["इथेनॉल निर्मिती मागणी", "पोल्ट्री उद्योगाचा विस्तार", "स्टार्च कारखान्यांची खरेदी"],
    bullishFactorsEn: ["Ethanol plant procurement", "Poultry industry expansion", "Starch factory demand"],
    bearishFactorsMr: ["खरीप आवक वाढण्याचा दबाव", "पर्यायी खाद्याची उपलब्धता"],
    bearishFactorsEn: ["Peak Kharif harvest arrivals", "Alternative feed grain substitutes"]
  },
  gram: {
    supplyFactorMr: "रब्बी हरभऱ्याचा साठा मर्यादित असून व्यापारी व डाळ मिल मालकांकडे साठा कमी आहे.",
    supplyFactorEn: "Tight chickpea inventory with dal processors and stockists ahead of festival season.",
    demandFactorMr: "गणेशोत्सव व दिवाळीसाठी बेसन व हरभरा डाळीची प्रचंड मागणी.",
    demandFactorEn: "Surging demand for Besan and Chana Dal processing for festival confectionery.",
    policyFactorMr: "५,४४० रु./क्विंटल MSP आणि आयातीवरील नियंत्रणामुळे दर तेजीत.",
    policyFactorEn: "Government MSP of ₹5,440/Q and duty management keeping open market strong.",
    aiRecommendationMr: "६,४०० ते ७,००० रु. दरम्यान मजबुती राहील. पुढील ३० दिवसांत ५-८% वाढीची शक्यता.",
    aiRecommendationEn: "Strong bullish bias around ₹6,400-₹7,000/Q with 5-8% upside expected.",
    bullishFactorsMr: ["बेसन मागणीत मोठी वाढ", "सणासुदीचा खप", "मर्यादित बाजार साठा"],
    bullishFactorsEn: ["Besan festive consumption", "Tight market stocks", "Strong wholesale buying"],
    bearishFactorsMr: ["पिवळा वाटाणा आयातीचा प्रभाव", "किरकोळ साठा मर्यादा"],
    bearishFactorsEn: ["Yellow pea import competition", "Stock limit enforcement"]
  },
  bajra: {
    supplyFactorMr: "नवीन खरीप बाजरीची आवक काही भागात सुरू झाली असून दाण्याचा दर्जा उत्तम आहे.",
    supplyFactorEn: "Early Kharif Bajra arrivals commencing with good grain moisture levels.",
    demandFactorMr: "हिवाळा जवळ येत असताना आणि पशुखाद्य उद्योगाकडून मागणी वाढू लागली आहे.",
    demandFactorEn: "Steady fodder and feed industry demand with upcoming winter human consumption.",
    policyFactorMr: "श्री अन्न (भरड धान्य) योजनेअंतर्गत शासकीय खरेदी केंद्र सुरू होणे अपेक्षित.",
    policyFactorEn: "Government Millets (Shree Anna) procurement initiative supporting minimum rates.",
    aiRecommendationMr: "२,३०० ते २,५५० रु. दर स्थिर राहील. शासकीय केंद्रावर हमीभावाने विक्रीचा पर्याय उत्तम.",
    aiRecommendationEn: "Stable band of ₹2,300-₹2,550/Q expected. Government MSP procurement recommended.",
    bullishFactorsMr: ["भरड धान्य योजना प्रोत्साहन", "पशुखाद्य मागणी", "हिवाळी खप"],
    bullishFactorsEn: ["Shree Anna millet push", "Feed sector buying", "Winter dietary demand"],
    bearishFactorsMr: ["नवीन आवक वाढल्यास तात्पुरती मंदी", "इतर धान्यांची स्वस्ताई"],
    bearishFactorsEn: ["Harvest peak arrival pressure", "Competing coarse grain prices"]
  },
  sugarcane: {
    supplyFactorMr: "गाळप हंगाम ऑक्टोबर-नोव्हेंबरमध्ये सुरू होत असून साखरेचा उतारा उत्तम राहण्याचा अंदाज आहे.",
    supplyFactorEn: "Crushing season commencing October-November with expected high sugar recovery.",
    demandFactorMr: "साखर कारखाने व इथेनॉल प्रकल्पांकडून पूर्ण क्षमतेने ऊस घेण्याचे नियोजन.",
    demandFactorEn: "Sugar mills and ethanol distilleries planning full-capacity crushing operations.",
    policyFactorMr: "केंद्र शासनाने ठरवून दिलेला FRP (रास्त व वाजवी भाव) ३१५ रु./क्विंटल आधारभूत आहे.",
    policyFactorEn: "Government mandated Fair and Remunerative Price (FRP) providing guaranteed payout.",
    aiRecommendationMr: "साखर कारखान्यांशी करारबद्ध पुरवठा उत्तम. थेट कारखान्यांकडून वेळेवर उचल होणे महत्त्वाचे.",
    aiRecommendationEn: "Contractual supply to local cooperative/private sugar mills recommended.",
    bullishFactorsMr: ["इथेनॉल निर्मिती प्रोत्साहन", "साखर निर्यात कोठा", "FRP दरात वाढ"],
    bullishFactorsEn: ["Ethanol diversion quota", "Sugar export allocation", "Higher FRP baseline"],
    bearishFactorsMr: ["कारखाने सुरू होण्यास विलंब", "पाण्याची टंचाई असलेल्या भागात अडचण"],
    bearishFactorsEn: ["Crushing start delays", "Regional water scarcity"]
  }
};

export const MarketTrendsPage: React.FC = () => {
  const { i18n } = useTranslation();
  const isMr = i18n.language === 'mr';

  const [searchParams, setSearchParams] = useSearchParams();

  // 1. Read APMC & Crop from URL query parameters (or fallback to defaults)
  const apmcParam = searchParams.get('apmc');
  const cropParam = searchParams.get('crop');

  const selectedApmc = useMemo(() => {
    if (apmcParam) {
      const match = APMC_LIST.find(
        (a) => a.id.toLowerCase() === apmcParam.toLowerCase() || a.nameEn.toLowerCase().includes(apmcParam.toLowerCase())
      );
      if (match) return match.id;
    }
    return 'kopargaon';
  }, [apmcParam]);

  const selectedCrop = useMemo(() => {
    if (cropParam) {
      const match = CROP_LIST.find(
        (c) => c.id.toLowerCase() === cropParam.toLowerCase() || c.nameEn.toLowerCase().includes(cropParam.toLowerCase())
      );
      if (match) return match.id;
    }
    return 'onion';
  }, [cropParam]);

  const [horizonDays, setHorizonDays] = useState<7 | 14 | 30>(7);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Update URL params when dropdown selections change
  const handleApmcChange = (newApmcId: string) => {
    setSearchParams({ apmc: newApmcId, crop: selectedCrop });
  };

  const handleCropChange = (newCropId: string) => {
    setSearchParams({ apmc: selectedApmc, crop: newCropId });
  };

  // Simulate smooth data fetch loading
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 250);
    return () => clearTimeout(timer);
  }, [selectedApmc, selectedCrop]);

  // Fetch Agmarknet data & calculate forecast
  const mandiDataResult: MandiCropDataResult = useMemo(() => {
    return MandiDataService.getMandiCropData(selectedApmc, selectedCrop);
  }, [selectedApmc, selectedCrop]);

  const forecastSummary: MandiForecastSummary | null = useMemo(() => {
    if (mandiDataResult.status !== 'SUCCESS') return null;
    return calculateMandiForecast(mandiDataResult.records, horizonDays);
  }, [mandiDataResult, horizonDays]);

  const currentApmcInfo = APMC_LIST.find((a) => a.id === selectedApmc) || APMC_LIST[0];
  const currentCropInfo = CROP_LIST.find((c) => c.id === selectedCrop) || CROP_LIST[0];

  const marketFactors = CROP_MARKET_FACTORS[selectedCrop] || CROP_MARKET_FACTORS['onion'];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans">
      
      {/* Top Header Title & Description */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#1B5E20] via-[#2E7D32] to-[#144919] p-6 sm:p-8 rounded-3xl text-[#FFFFFF] shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-[#FFB300]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFB300]/20 border border-[#FFB300]/40 text-[#FFB300] text-xs font-black uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Agmarknet Live Intelligence & Multi-AI Consensus</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-[#FFFFFF]">
            {isMr ? 'बाजार भाव कल, AI अंदाज व मुख्य घटक' : 'Mandi Price Trends & Key Market Factors'}
          </h1>

          <p className="text-sm sm:text-base text-emerald-100 font-medium max-w-2xl">
            {isMr
              ? 'महाराष्ट्रातील प्रमुख बाजार समित्यांचे दररोजचे ताजे भाव, ५-६ महिन्यांचे कल, पुढील ७-३० दिवसांचा AI अंदाज व तेजी-मंदीचे प्रमुख घटक.'
              : 'Daily APMC market prices, 7-30 day AI trend forecasts, and key fundamental drivers (Gemini + ChatGPT + Claude Synthesis).'}
          </p>
        </div>

        {/* Quick Data Sync Badge */}
        <div className="relative z-10 flex flex-col sm:flex-row md:flex-col items-start md:items-end justify-center gap-1.5 shrink-0 bg-[#FFFFFF]/10 backdrop-blur-md p-4 rounded-2xl border border-[#FFFFFF]/20 text-xs">
          <div className="flex items-center gap-1.5 font-black text-[#FFB300]">
            <ShieldCheck className="w-4 h-4" />
            <span>{isMr ? 'शासकीय Agmarknet डाटा' : 'Government Agmarknet Data'}</span>
          </div>
          <span className="text-emerald-100 font-bold">
            {isMr ? 'अद्ययावत तारीख:' : 'Data Updated:'} {mandiDataResult.lastUpdated}
          </span>
        </div>
      </div>

      {/* Selector Control Bar: Two Dropdowns (Select APMC & Select Crop) */}
      <Card hoverable={false} className="p-4 sm:p-6 bg-[#FFFFFF] border-2 border-[#D8E6D8] rounded-3xl shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
          
          {/* APMC Selector Dropdown */}
          <div className="flex-1 space-y-1.5">
            <label htmlFor="apmc-select" className="text-xs font-black uppercase tracking-wider text-[#0F291E] flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-[#1B5E20]" />
              <span>{isMr ? '१. बाजार समिती निवडा (Select APMC):' : '1. Select APMC Mandi:'}</span>
            </label>
            <div className="relative">
              <select
                id="apmc-select"
                value={selectedApmc}
                onChange={(e) => handleApmcChange(e.target.value)}
                className="w-full bg-[#F4F9F4] border-2 border-[#A5D6A7] text-[#0F291E] font-black text-sm sm:text-base rounded-2xl px-4 py-3 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#1B5E20] shadow-xs"
              >
                {APMC_LIST.map((apmc) => (
                  <option key={apmc.id} value={apmc.id}>
                    {isMr ? apmc.nameMr : apmc.nameEn} ({apmc.district})
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#1B5E20] font-black text-xs">
                ▼
              </div>
            </div>
          </div>

          {/* Crop Selector Dropdown */}
          <div className="flex-1 space-y-1.5">
            <label htmlFor="crop-select" className="text-xs font-black uppercase tracking-wider text-[#0F291E] flex items-center gap-1.5">
              <Sprout className="w-4 h-4 text-[#1B5E20]" />
              <span>{isMr ? '२. पिक निवडा (Select Crop):' : '2. Select Crop Commodity:'}</span>
            </label>
            <div className="relative">
              <select
                id="crop-select"
                value={selectedCrop}
                onChange={(e) => handleCropChange(e.target.value)}
                className="w-full bg-[#F4F9F4] border-2 border-[#A5D6A7] text-[#0F291E] font-black text-sm sm:text-base rounded-2xl px-4 py-3 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#1B5E20] shadow-xs"
              >
                {CROP_LIST.map((cropItem) => (
                  <option key={cropItem.id} value={cropItem.id}>
                    {isMr ? cropItem.nameMr : cropItem.nameEn} — [{cropItem.category}]
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#1B5E20] font-black text-xs">
                ▼
              </div>
            </div>
          </div>

        </div>

        {/* Selected Combination Info Pill */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#E2ECE2] text-xs font-bold text-[#526058]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#1B5E20]" />
            <span>
              {isMr ? 'निवडलेले संयोजन:' : 'Selected Combination:'}{' '}
              <strong className="text-[#0F291E]">
                {isMr ? currentCropInfo.nameMr : currentCropInfo.nameEn} @ {isMr ? currentApmcInfo.nameMr : currentApmcInfo.nameEn}
              </strong>
            </span>
          </div>

          <span className="text-[11px] text-[#526058] bg-[#F4F9F4] px-2.5 py-1 rounded-xl border border-[#D8E6D8]">
            🔗 Shareable URL: <code className="text-[#1B5E20] font-mono font-bold">?apmc={selectedApmc}&crop={selectedCrop}</code>
          </span>
        </div>
      </Card>

      {/* Main Data Content Section */}
      {isLoading ? (
        // Loading Skeleton State
        <Card hoverable={false} className="p-8 sm:p-12 border-2 border-[#D8E6D8] rounded-3xl bg-[#FFFFFF] space-y-6 animate-pulse">
          <div className="h-8 bg-[#E2ECE2] rounded-xl w-2/3" />
          <div className="h-64 sm:h-80 bg-[#F4F9F4] rounded-2xl w-full" />
          <div className="h-4 bg-[#E2ECE2] rounded-lg w-1/2" />
        </Card>
      ) : mandiDataResult.status === 'NO_DATA' ? (
        // Empty State: No Data for Combination
        <EmptyState
          icon={AlertCircle}
          title={
            isMr
              ? `या पिक-बाजार समिती जोडीसाठी डेटा उपलब्ध नाही`
              : `Price data for ${currentCropInfo.nameEn} at ${currentApmcInfo.nameEn} isn't available yet`
          }
          description={
            isMr
              ? `ऊस किंवा काही विशेष पिकांची खरेदी दररोजच्या बाजार लिलावाद्वारे होत नसल्याने शासकीय Agmarknet मध्ये या दर नोंदी नसतात. कृपया इतर पिक निवडा.`
              : `Sugarcane and direct-contract crops do not trade through daily open mandi auctions. Consequently, Agmarknet daily price streams are not logged for this commodity. Please select another crop.`
          }
        />
      ) : mandiDataResult.status === 'INSUFFICIENT_DATA' ? (
        // Warning State: Insufficient Data
        <Card hoverable={false} className="p-6 sm:p-8 border-2 border-amber-300 bg-amber-50/80 rounded-3xl space-y-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-amber-700 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="text-base sm:text-lg font-black text-amber-950">
                {isMr ? 'अपुरी बाजार माहिती (Insufficient Data)' : `Insufficient trade data for ${currentCropInfo.nameEn} at ${currentApmcInfo.nameEn}`}
              </h3>
              <p className="text-xs sm:text-sm text-amber-900 font-semibold leading-relaxed">
                {isMr
                  ? `या बाजार समितीत ${currentCropInfo.nameMr} पिकाच्या ३० दिवसांपेक्षा कमी दर नोंदी उपलब्ध आहेत. अचूक AI अंदाज व्यक्त करण्यासाठी किमान ३० दिवसांचा ऐतिहासिक डेटा आवश्यक असतो.`
                  : `This APMC commodity pair has fewer than 30 trade records logged on Agmarknet. A minimum of 30 historical trade days is required to generate a credible trend forecast.`
              }
              </p>
            </div>
          </div>
        </Card>
      ) : (
        // Success State: Render Trend Summary Cards + Recharts Graph + Key Factors Panel
        <div className="space-y-6">
          
          {/* Trend Summary Metric Bar Above Graph */}
          {forecastSummary && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              {/* Metric 1: Current Modal Price */}
              <Card hoverable={false} className="p-4 sm:p-5 bg-[#FFFFFF] border-2 border-[#D8E6D8] rounded-3xl shadow-xs space-y-1">
                <span className="text-xs font-bold text-[#526058] flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-[#1B5E20]" />
                  {isMr ? 'आजचा मुख्य बाजार भाव (Modal Rate)' : 'Current Modal Price'}
                </span>
                <div className="text-2xl sm:text-3xl font-black text-[#0F291E]">
                  ₹{forecastSummary.currentPrice.toLocaleString('en-IN')}{' '}
                  <span className="text-xs font-bold text-[#526058]">/क्विंटल</span>
                </div>
                <div className="text-[11px] font-bold text-[#526058]">
                  {isMr ? 'मागील नोंदीतील ताजे दर' : 'Latest logged mandi rate'}
                </div>
              </Card>

              {/* Metric 2: 7-Day Price Trend Change */}
              <Card hoverable={false} className="p-4 sm:p-5 bg-[#FFFFFF] border-2 border-[#D8E6D8] rounded-3xl shadow-xs space-y-1">
                <span className="text-xs font-bold text-[#526058] flex items-center gap-1.5">
                  <BarChart3 className="w-4 h-4 text-[#1B5E20]" />
                  {isMr ? '७ दिवसांतील भाव बदल' : '7-Day Price Movement'}
                </span>

                <div className="flex items-center gap-2">
                  <div className="text-2xl sm:text-3xl font-black text-[#0F291E]">
                    {forecastSummary.pctChange7d >= 0 ? `+${forecastSummary.pctChange7d}%` : `${forecastSummary.pctChange7d}%`}
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-xs font-black border flex items-center gap-1 ${
                    forecastSummary.isRising
                      ? 'bg-emerald-100 text-emerald-950 border-emerald-300'
                      : 'bg-rose-100 text-rose-950 border-rose-300'
                  }`}>
                    {forecastSummary.isRising ? <TrendingUp className="w-4 h-4 text-emerald-700" /> : <TrendingDown className="w-4 h-4 text-rose-700" />}
                    <span>{forecastSummary.isRising ? (isMr ? 'तेजी' : 'Up') : (isMr ? 'मंदी' : 'Down')}</span>
                  </span>
                </div>

                <div className="text-[11px] font-bold text-[#526058]">
                  {isMr ? `७ दिवसांपूर्वी: ₹${forecastSummary.price7DaysAgo}` : `7 days ago: ₹${forecastSummary.price7DaysAgo}/Q`}
                </div>
              </Card>

              {/* Metric 3: Data Freshness Status */}
              <Card hoverable={false} className="p-4 sm:p-5 bg-[#FFFFFF] border-2 border-[#D8E6D8] rounded-3xl shadow-xs space-y-1">
                <span className="text-xs font-bold text-[#526058] flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#1B5E20]" />
                  {isMr ? 'डाटा अद्ययावत तारीख' : 'Data Last Updated'}
                </span>
                <div className="text-xl sm:text-2xl font-black text-[#1B5E20] truncate">
                  {forecastSummary.lastUpdatedDate}
                </div>
                <div className="text-[11px] font-bold text-[#526058]">
                  {isMr ? 'Agmarknet शासकीय दर नोंदी' : 'Verified APMC trade stream'}
                </div>
              </Card>

            </div>
          )}

          {/* Recharts Chart Component */}
          {forecastSummary && (
            <MandiPriceTrendChart
              data={forecastSummary.chartPoints}
              cropName={isMr ? currentCropInfo.nameMr : currentCropInfo.nameEn}
              apmcName={isMr ? currentApmcInfo.nameMr : currentApmcInfo.nameEn}
              horizonDays={horizonDays}
              onHorizonChange={(d) => setHorizonDays(d)}
            />
          )}

          {/* Key Market Drivers & Multi-AI Factors Section */}
          <Card hoverable={false} className="p-6 sm:p-8 bg-[#FFFFFF] border-2 border-[#D8E6D8] rounded-3xl shadow-md space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E2ECE2]">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1B5E20]/10 text-[#1B5E20] text-xs font-black mb-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#FFB300]" />
                  <span>{isMr ? 'मल्टी-AI विश्लेषण (Gemini + ChatGPT + Claude)' : 'Multi-AI Market Synthesis'}</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-[#0F291E]">
                  {isMr
                    ? `${isMr ? currentCropInfo.nameMr : currentCropInfo.nameEn} भाव बदलाचे मुख्य घटक व बाजार विश्लेषण`
                    : `Key Market Drivers & Factors for ${currentCropInfo.nameEn}`}
                </h2>
              </div>

              <div className="px-3.5 py-1.5 bg-[#F4F9F4] border border-[#D8E6D8] rounded-2xl text-xs font-bold text-[#1B5E20] shrink-0">
                {isMr ? 'कालावधी:' : 'Horizon:'} {horizonDays} {isMr ? 'दिवस अंदाज' : 'Days Projections'}
              </div>
            </div>

            {/* 3 Grid Column Breakdown of Key Fundamental Factors */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              
              {/* Supply & Arrival Factor */}
              <div className="bg-[#F4F9F4] p-5 rounded-2xl border border-[#D8E6D8] space-y-2.5">
                <div className="flex items-center gap-2 font-black text-[#0F291E] text-sm sm:text-base">
                  <Sprout className="w-5 h-5 text-[#1B5E20]" />
                  <span>{isMr ? '१. आवक व पुरवठा घटक' : '1. Supply & Arrival Factors'}</span>
                </div>
                <p className="text-xs sm:text-sm text-[#526058] font-semibold leading-relaxed">
                  {isMr ? marketFactors.supplyFactorMr : marketFactors.supplyFactorEn}
                </p>
              </div>

              {/* Demand & Processing Factor */}
              <div className="bg-[#F4F9F4] p-5 rounded-2xl border border-[#D8E6D8] space-y-2.5">
                <div className="flex items-center gap-2 font-black text-[#0F291E] text-sm sm:text-base">
                  <TrendingUp className="w-5 h-5 text-[#FFB300]" />
                  <span>{isMr ? '२. मागणी व व्यापारी हालचाली' : '2. Demand & Commercial Factors'}</span>
                </div>
                <p className="text-xs sm:text-sm text-[#526058] font-semibold leading-relaxed">
                  {isMr ? marketFactors.demandFactorMr : marketFactors.demandFactorEn}
                </p>
              </div>

              {/* Policy & MSP Factor */}
              <div className="bg-[#F4F9F4] p-5 rounded-2xl border border-[#D8E6D8] space-y-2.5">
                <div className="flex items-center gap-2 font-black text-[#0F291E] text-sm sm:text-base">
                  <ShieldCheck className="w-5 h-5 text-[#1B5E20]" />
                  <span>{isMr ? '३. शासकीय धोरण व MSP' : '3. Government Policy & MSP'}</span>
                </div>
                <p className="text-xs sm:text-sm text-[#526058] font-semibold leading-relaxed">
                  {isMr ? marketFactors.policyFactorMr : marketFactors.policyFactorEn}
                </p>
              </div>

            </div>

            {/* Bullish vs Bearish Chips Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              
              {/* Bullish Drivers */}
              <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200 space-y-2">
                <span className="text-xs font-black uppercase text-emerald-950 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-emerald-700" />
                  {isMr ? 'तेजीचे सकारात्मक घटक (Bullish Drivers):' : 'Bullish Market Drivers:'}
                </span>
                <div className="flex flex-wrap gap-2 pt-1">
                  {(isMr ? marketFactors.bullishFactorsMr : marketFactors.bullishFactorsEn).map((factor, idx) => (
                    <span key={idx} className="px-3 py-1 bg-emerald-100/80 text-emerald-950 rounded-xl text-xs font-bold border border-emerald-300">
                      ✓ {factor}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bearish Drivers */}
              <div className="bg-rose-50/70 p-4 rounded-2xl border border-rose-200 space-y-2">
                <span className="text-xs font-black uppercase text-rose-950 flex items-center gap-1.5">
                  <TrendingDown className="w-4 h-4 text-rose-700" />
                  {isMr ? 'दबावाचे घटक (Bearish Risk Drivers):' : 'Bearish Risk Factors:'}
                </span>
                <div className="flex flex-wrap gap-2 pt-1">
                  {(isMr ? marketFactors.bearishFactorsMr : marketFactors.bearishFactorsEn).map((factor, idx) => (
                    <span key={idx} className="px-3 py-1 bg-rose-100/80 text-rose-950 rounded-xl text-xs font-bold border border-rose-300">
                      ⚠ {factor}
                    </span>
                  ))}
                </div>
              </div>

            </div>

            {/* Multi-AI Recommendation Synthesis Box */}
            <div className="bg-gradient-to-r from-[#0F291E] to-[#1B5E20] p-5 rounded-2xl text-[#FFFFFF] space-y-2">
              <div className="flex items-center gap-2 font-black text-[#FFB300] text-sm">
                <Sparkles className="w-4 h-4" />
                <span>{isMr ? 'Multi-AI सल्ला व विक्री धोरण (AI Recommendation)' : 'Multi-AI Synthesis & Advisory'}</span>
              </div>
              <p className="text-xs sm:text-sm text-emerald-100 font-semibold leading-relaxed">
                {isMr ? marketFactors.aiRecommendationMr : marketFactors.aiRecommendationEn}
              </p>
            </div>

          </Card>

          {/* Mandatory Disclaimer Footer */}
          <div className="p-4 bg-[#F4F9F4] border border-[#D8E6D8] rounded-2xl flex items-start gap-3 text-xs text-[#526058]">
            <Info className="w-4 h-4 text-[#1B5E20] shrink-0 mt-0.5" />
            <p className="font-semibold leading-relaxed">
              <strong>{isMr ? 'टीप व अस्वीकरण:' : 'Disclaimer:'}</strong>{' '}
              {isMr
                ? 'हे भाव केंद्र सरकारच्या Agmarknet (data.gov.in) प्रणालीतील शासकीय दर नोंदींवर आधारित आहेत. पुढील ७-३० दिवसांचे अंदाज हे सांख्यिकी, बहु-AI विश्लेषक मॉडेल (Gemini + ChatGPT + Claude) आणि ऐतिहासिक आलेखांवर आधारित असून ते केवळ मार्गदर्शनासाठी आहेत; प्रत्यक्ष बाजारात आवक व वातावरणावर भाव बदलू शकतात.'
                : 'Prices are based on official government mandi (Agmarknet) reported data. Price forecasts and key market drivers are synthesized via statistical models and multi-AI intelligence (Gemini, ChatGPT, Claude) for informational advisory purposes.'}
            </p>
          </div>

        </div>
      )}

    </div>
  );
};

