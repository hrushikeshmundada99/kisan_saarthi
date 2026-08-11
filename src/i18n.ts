import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const SAVED_LNG_KEY = 'KISAN_SAARTHI_LANGUAGE';

const getInitialLanguage = (): string => {
  try {
    const saved = localStorage.getItem(SAVED_LNG_KEY);
    if (saved === 'mr' || saved === 'en') return saved;
  } catch (e) {
    console.warn('Failed to read language preference:', e);
  }
  return 'mr'; // Default Marathi
};

const resources = {
  mr: {
    translation: {
      appName: "किसान सारथी",
      appTagline: "कोपरगाव व परिसरातील शेतकरी बांधवांसाठी स्मार्ट बाजार भाव व नफा सल्लागार",
      landing: {
        heroTitle: "योग्य वेळी, योग्य बाजारात माल विका. मिळवा जास्तीत जास्त नफा!",
        heroSub: "कोपरगाव, राहाता, श्रीरामपूर, येवला, लासलगाव, संगमनेर, नाशिक आणि अहमदनगर बाजार समित्यांचे आजचे ताजे दर, पुढील भाव अंदाज आणि वाहतूक खर्च वजा करून मिळणारा निखळ नफा पहा.",
        checkPriceBtn: "आजचे बाजार भाव पहा",
        learnMore: "वैशिष्ट्ये जाणून घ्या",
        prop1Title: "AI द्वारे ७, १४ व ३० दिवसांचे भाव अंदाज",
        prop1Desc: "बाजार समितीतील आवक आणि जुन्या नोंदींवर आधारित पुढील दिवसांत भाव वाढणार की कमी होणार याचा अचूक अंदाज.",
        prop2Title: "बाजार तुलना आणि वाहतूक नफा",
        prop2Desc: "आपल्या गावापासूनचे अंतर आणि वाहतूक खर्च वजा करून कोणत्या बाजारात माल नेल्यास जास्त पैसे हातात पडतील ते पहा.",
        prop3Title: "लागवड नफा गणित आणि व्हॉट्सॲप अलर्ट",
        prop3Desc: "लागवड खर्च वजा करून एकरी निखळ नफा मोजा आणि इच्छित भाव येताच थेट WhatsApp वर मेसेज मिळवा."
      },
      nav: {
        home: "मुख्य पृष्ठ",
        dashboard: "डॅशबोर्ड",
        recommendation: "पिक निवड सल्लागार",
        forecast: "दर अंदाज",
        comparison: "बाजार तुलना",
        trends: "बाजार ट्रेंड्स",
        calculator: "नफा कॅल्क्युलेटर",
        alerts: "भाव अलर्ट्स",
        profile: "माझे प्रोफाईल"
      },
      recommendation: {
        title: "योग्य पिक निवडा, जास्त नफा मिळवा!",
        subtitle: "नेहमीप्रमाणे तेच पिक लावण्याऐवजी, बाजारात ज्या पिकाला सर्वाधिक भाव मिळणार आहे तेच पिक निवडा.",
        calcProfitBtn: "लागवड खर्च व नफा मोजा",
        soilType: "१. जमिनीचा प्रकार:",
        season: "२. हंगाम:",
        waterSupply: "३. पाण्याची उपलब्धता:",
        allSoils: "सर्व जमिनीचे प्रकार",
        blackSoil: "काळी कसदार जमीन",
        loamySoil: "मुरमाड व मध्यम जमीन",
        sandySoil: "हलकी व रेतीली जमीन",
        allSeasons: "सर्व हंगाम",
        kharif: "खरीप (पावसाळी)",
        rabbi: "रब्बी (हिवाळी)",
        summer: "उन्हाळी",
        allWater: "सर्व पाणी पातळी",
        lowWater: "कमी पाणी",
        mediumWater: "मध्यम पाणी",
        highWater: "भरपूर पाणी",
        topRankedBadge: "#1 सर्वाधिक नफा देणारे पिक",
        expectedProfit: "अपेक्षित दर एकरी निव्वळ नफा:",
        perAcre: " / एकर",
        demand: "बाजार मागणी:",
        climateRisk: "हवामान जोखीम:",
        lowRiskText: "कमी जोखीम",
        days: "दिवस",
        waterReq: "पाणी:",
        viewForecastBtn: "दर अंदाज व बाजार पहा"
      },
      dashboard: {
        title: "कोपरगाव व परिसर बाजार भाव डॅशबोर्ड",
        subtitle: "तुमच्या पिकांचे आजचे ताजे बाजार भाव आणि ७ दिवसांतील भावाचा कल",
        selectCrops: "निवडलेली पिके:",
        todaysRates: "आजचे बाजार दर (रु/क्विंटल)",
        distanceFromKopargaon: "अंतर",
        minPrice: "कमीत कमी भाव",
        modalPrice: "सरासरी भाव",
        maxPrice: "जास्तीत जास्त भाव",
        minMax: "कमीत कमी - जास्तीत जास्त भाव",
        dailyChange: "कालच्या तुलनेत बदल",
        forecastSparkline: "७ दिवसांचा भाव कल",
        alertStrip: "सक्रिय अलर्ट: कांद्याचा भाव ₹२,१०० च्या पुढे जाताच WhatsApp वर थेट मेसेज येईल.",
        quickActions: "जलद सेवा",
        viewFullForecast: "संपूर्ण अंदाज पहा",
        compareMandis: "बाजार तुलना करा",
        calcProfit: "नफा मोजा"
      },
      forecast: {
        title: "पिक दर अंदाज आणि विश्लेषण",
        subtitle: "पुढील ७, १४ व ३० दिवसांत कोणत्या पिकाला काय भाव मिळेल याचा AI अंदाज",
        selectCrop: "पिक निवडा",
        selectMandi: "बाजार समिती निवडा",
        horizon: "अंदाज कालावधी",
        days7: "७ दिवस",
        days14: "१४ दिवस",
        days30: "३० दिवस",
        historical: "मागील भाव",
        predicted: "अंदाजित भाव",
        confidenceRange: "संभाव्य भाव कक्षा",
        insightTitle: "कृषी तज्ज्ञ सल्ला:",
        insightText: "पुढील आठवड्यात कांद्याची आवक कमी राहण्याची शक्यता असल्याने भाव सुमारे ८% वाढू शकतात. साठवणुकीची सोय असल्यास माल ५ ते ७ दिवस थांबवून विकावा.",
        currentPrice: "आजचा सरासरी भाव",
        expectedPeak: "अंदाजित उच्चांक",
        expectedLow: "अंदाजित नीचांक"
      },
      comparison: {
        title: "बाजार दर तुलना व वाहतूक गणित",
        subtitle: "वाहतूक खर्च वजा करून खरोखर हातात पडणारा निखळ भाव (Net Payout)",
        bestMandiBadge: "आज माल विकण्यासाठी सर्वोत्तम बाजार समिती!",
        tableMandi: "कृषी उत्पन्न बाजार समिती (APMC)",
        tableDistance: "अंतर (किमी)",
        tableRawPrice: "बाजार भाव",
        tableTransport: "वाहतूक खर्च",
        tableNetPrice: "हातात मिळणारा निखळ भाव",
        actionSellHere: "येथे विक्री करा",
        farmerVillage: "तुमचे गाव: कोपरगाव",
        transportRate: "वाहतूक दर: ₹१५ / क्विंटल / १० किमी"
      },
      trends: {
        title: "बाजार कल आणि आवक विश्लेषण",
        subtitle: "बाजारातील आवक आणि भावातील चढ-उतार",
        priceVsArrivals: "दर आणि आवक तुलना",
        arrivalsQuintal: "आवक (क्विंटल)",
        pricePerQuintal: "भाव (रु/क्विंटल)",
        seasonalTitle: "महिनानिहाय हंगामी भाव कल",
        peakMonths: "कांदा भावाचा सर्वोच्च काळ: ऑक्टोबर - नोव्हेंबर"
      },
      calculator: {
        title: "शेतकरी नफा कॅल्क्युलेटर",
        subtitle: "लागवड खर्च आणि विविध बाजारांमधील निव्वळ नफा मोजा",
        landSize: "जमीन क्षेत्र (एकड)",
        cropChoice: "पिक",
        seedFertilizerCost: "बियाणे व खते खर्च (₹)",
        laborCost: "मजुरी व मशागत खर्च (₹)",
        expectedYield: "एकूण अपेक्षित उत्पादन (क्विंटल)",
        targetMandi: "पसंतीची बाजार समिती",
        calculateBtn: "नफ्याची गणना करा",
        totalCost: "एकूण लागवड खर्च",
        totalRevenue: "एकूण उत्पन्न",
        netProfit: "निखळ निव्वळ नफा",
        profitPerQuintal: "प्रति क्विंटल निव्वळ नफा",
        mandiComparisonResult: "विविध बाजारांमधील निव्वळ नफा तुलना"
      },
      alerts: {
        title: "किंमत सूचना अलर्ट्स",
        subtitle: "तुमच्या इच्छित भावाची नोंद करा, तो भाव येताच थेट फोनवर मेसेज मिळवा",
        setAlertTitle: "नवीन भाव अलर्ट सेट करा",
        thresholdPrice: "लक्ष्य भाव (₹/क्विंटल)",
        notifyVia: "मेसेज माध्यम",
        whatsapp: "WhatsApp मेसेज",
        sms: "SMS मेसेज",
        addAlertBtn: "अलर्ट सक्रिय करा",
        activeAlerts: "तुमचे सक्रिय अलर्ट्स",
        triggeredAlerts: "झालेले अलर्ट्स",
        emptyStateTitle: "कोणतेही भाव अलर्ट्स सेट केलेले नाहीत",
        emptyStateDesc: "कांदा, सोयाबीन किंवा कापसाचा भाव तुमच्या अपेक्षेप्रमाणे आल्यावर थेट फोनवर सूचना मिळवण्यासाठी नवीन अलर्ट जोडा.",
        statusActive: "सक्रिय",
        statusTriggered: "प्राप्त"
      },
      profile: {
        title: "शेतकरी प्रोफाईल",
        subtitle: "तुमची माहिती, जमीन आणि जतन केलेली पिके",
        name: "रमेश गणपत काळे",
        location: "मु. पो. कोपरगाव, जि. अहमदनगर",
        landDetails: "जमीन क्षेत्र: ५ एकर (बागायती)",
        savedCrops: "जतन केलेली पिके",
        preferredMandis: "पसंतीच्या बाजार समित्या",
        alertLog: "मागील अलर्ट इतिहास"
      },
      crops: {
        Onion: "कांदा",
        Sugarcane: "ऊस",
        Soybean: "सोयाबीन",
        Cotton: "कापूस",
        Pomegranate: "डाळिंब",
        Wheat: "गहू",
        Tomato: "टोमॅटो"
      },
      mandis: {
        Kopargaon: "कोपरगाव कृषी उत्पन्न बाजार समिती (Kopargaon APMC)",
        Rahata: "राहाता कृषी उत्पन्न बाजार समिती (Rahata APMC)",
        Shrirampur: "श्रीरामपूर कृषी उत्पन्न बाजार समिती (Shrirampur APMC)",
        Yeola: "येवला कृषी उत्पन्न बाजार समिती (Yeola APMC)",
        Lasalgaon: "लासलगाव कृषी उत्पन्न बाजार समिती (Lasalgaon APMC)",
        Sangamner: "संगमनेर कृषी उत्पन्न बाजार समिती (Sangamner APMC)",
        Nashik: "नाशिक कृषी उत्पन्न बाजार समिती (Nashik APMC)",
        Ahmednagar: "अहमदनगर कृषी उत्पन्न बाजार समिती (Ahmednagar APMC)"
      }
    }
  },
  en: {
    translation: {
      appName: "Kisan Saarthi",
      appTagline: "Smart Market Intelligence for Farmers in Kopargaon & Region",
      landing: {
        heroTitle: "Sell at the Right Time, at the Best Mandi. Maximize Your Profit!",
        heroSub: "Accurate mandi rates, AI price predictions, and net payout calculation after transport for Kopargaon, Rahata, Shrirampur, Yeola, Lasalgaon, Sangamner, Nashik & Ahmednagar.",
        checkPriceBtn: "Check Today's Prices",
        learnMore: "Explore Features",
        prop1Title: "AI Price Forecast (7, 14, 30 Days)",
        prop1Desc: "ML-driven price forecast based on historical Agmarknet mandi trends and arrival volumes.",
        prop2Title: "Mandi Comparison & Net Payout",
        prop2Desc: "Calculate real net price in your pocket after subtracting transport costs from your village.",
        prop3Title: "Profit Calculator & Price Alerts",
        prop3Desc: "Track your cultivation ROI and get instant WhatsApp/SMS alerts when target prices are reached."
      },
      nav: {
        home: "Home",
        dashboard: "Dashboard",
        recommendation: "Crop Recommendation",
        forecast: "Price Forecast",
        comparison: "Mandi Compare",
        trends: "Market Trends",
        calculator: "Profit Calculator",
        alerts: "Price Alerts",
        profile: "My Profile"
      },
      recommendation: {
        title: "Grow What Will Actually Pay!",
        subtitle: "Grow what will actually pay, not just what you've always grown.",
        calcProfitBtn: "Calculate Cultivation ROI",
        soilType: "1. Soil Type:",
        season: "2. Crop Season:",
        waterSupply: "3. Water Supply:",
        allSoils: "All Soil Types",
        blackSoil: "Deep Black Soil",
        loamySoil: "Medium Loamy Soil",
        sandySoil: "Light Sandy Soil",
        allSeasons: "All Seasons",
        kharif: "Kharif (Monsoon)",
        rabbi: "Rabbi (Winter)",
        summer: "Summer",
        allWater: "All Water Levels",
        lowWater: "Low Water Requirement",
        mediumWater: "Medium Water",
        highWater: "High Irrigation",
        topRankedBadge: "#1 Top Paying Crop",
        expectedProfit: "Expected Net Profit / Acre:",
        perAcre: " / Acre",
        demand: "Market Demand:",
        climateRisk: "Climate Risk:",
        lowRiskText: "Low Risk",
        days: "Days",
        waterReq: "Water:",
        viewForecastBtn: "View Price Forecast"
      },
      dashboard: {
        title: "Kopargaon Market Intelligence Dashboard",
        subtitle: "Today's live mandi prices and 7-day trend sparklines for your selected crops",
        selectCrops: "Selected Crops:",
        todaysRates: "Today's Mandi Rates (₹/Quintal)",
        distanceFromKopargaon: "Distance from Kopargaon",
        minPrice: "Min Price",
        modalPrice: "Modal / Average Price",
        maxPrice: "Max Price",
        minMax: "Min - Max Range",
        dailyChange: "vs Yesterday",
        forecastSparkline: "7-Day Trend Preview",
        alertStrip: "Active Alert: You will receive WhatsApp msg when Onion crosses ₹2,100.",
        quickActions: "Quick Services",
        viewFullForecast: "View Full Forecast",
        compareMandis: "Compare Mandis",
        calcProfit: "Calculate Profit"
      },
      forecast: {
        title: "Crop Price Forecast & Analytics",
        subtitle: "AI-powered 7, 14, and 30 day market price predictions",
        selectCrop: "Select Crop",
        selectMandi: "Select Mandi",
        horizon: "Forecast Horizon",
        days7: "7 Days",
        days14: "14 Days",
        days30: "30 Days",
        historical: "Historical Price",
        predicted: "Predicted Price",
        confidenceRange: "Forecast Confidence Band",
        insightTitle: "Agronomist Insight:",
        insightText: "Prices expected to rise ~8% over next week due to reduced arrivals in regional mandis. Consider holding stock for 5-7 days if storage allows.",
        currentPrice: "Current Modal Price",
        expectedPeak: "Expected Peak",
        expectedLow: "Expected Low"
      },
      comparison: {
        title: "Mandi Comparison & Transport Payout",
        subtitle: "Net price in your hands after subtracting transport costs from Kopargaon",
        bestMandiBadge: "Best Mandi to Sell Today!",
        tableMandi: "Agricultural Produce Market Committee (APMC)",
        tableDistance: "Distance (km)",
        tableRawPrice: "Mandi Price",
        tableTransport: "Est. Transport",
        tableNetPrice: "Net Price Received",
        actionSellHere: "Sell Here",
        farmerVillage: "Your Location: Kopargaon",
        transportRate: "Transport rate: ₹15 / quintal / 10 km"
      },
      trends: {
        title: "Market Trends & Arrivals Analysis",
        subtitle: "Correlation between mandi arrival volumes and price movements",
        priceVsArrivals: "Price vs Arrival Volume (Dual-Axis Chart)",
        arrivalsQuintal: "Arrivals (Quintals)",
        pricePerQuintal: "Price (₹/Quintal)",
        seasonalTitle: "Month-by-Month Seasonal Price Pattern",
        peakMonths: "Peak Onion Price Period: October - November"
      },
      calculator: {
        title: "Farmer Profitability Calculator",
        subtitle: "Calculate total cultivation cost and net profit across different mandis",
        landSize: "Land Size (Acres)",
        cropChoice: "Crop",
        seedFertilizerCost: "Seed & Fertilizer Cost (₹)",
        laborCost: "Labor & Tillage Cost (₹)",
        expectedYield: "Expected Yield (Quintals)",
        targetMandi: "Preferred Mandi",
        calculateBtn: "Calculate Profitability",
        totalCost: "Total Cultivation Cost",
        totalRevenue: "Total Expected Revenue",
        netProfit: "Net Pure Profit",
        profitPerQuintal: "Net Profit / Quintal",
        mandiComparisonResult: "Net Profit Comparison across Mandis"
      },
      alerts: {
        title: "Price Alerts & Notifications",
        subtitle: "Set target prices and receive instant alerts via WhatsApp or SMS",
        setAlertTitle: "Set New Price Alert",
        thresholdPrice: "Target Price (₹/Quintal)",
        notifyVia: "Notification Channel",
        whatsapp: "WhatsApp Message",
        sms: "SMS Text",
        addAlertBtn: "Activate Alert",
        activeAlerts: "Your Active Alerts",
        triggeredAlerts: "Triggered History",
        emptyStateTitle: "No Price Alerts Set Yet",
        emptyStateDesc: "Set an alert for Onion or Soybean to get instantly notified on your phone when prices hit your target.",
        statusActive: "Active",
        statusTriggered: "Triggered"
      },
      profile: {
        title: "Farmer Profile",
        subtitle: "Your profile details, land area, and saved preferences",
        name: "Ramesh Ganpat Kale",
        location: "Kopargaon, Dist. Ahmednagar, Maharashtra",
        landDetails: "Land Area: 5 Acres (Irrigated)",
        savedCrops: "Saved Crops",
        preferredMandis: "Preferred Mandis",
        alertLog: "Past Notification History"
      },
      crops: {
        Onion: "Onion",
        Sugarcane: "Sugarcane",
        Soybean: "Soybean",
        Cotton: "Cotton",
        Pomegranate: "Pomegranate",
        Wheat: "Wheat",
        Tomato: "Tomato"
      },
      mandis: {
        Kopargaon: "Kopargaon Agricultural Produce Market Committee (APMC)",
        Rahata: "Rahata Agricultural Produce Market Committee (APMC)",
        Shrirampur: "Shrirampur Agricultural Produce Market Committee (APMC)",
        Yeola: "Yeola Agricultural Produce Market Committee (APMC)",
        Lasalgaon: "Lasalgaon Agricultural Produce Market Committee (APMC)",
        Sangamner: "Sangamner Agricultural Produce Market Committee (APMC)",
        Nashik: "Nashik Agricultural Produce Market Committee (APMC)",
        Ahmednagar: "Ahmednagar Agricultural Produce Market Committee (APMC)"
      }
    }
  }
};

i18n.use(initReactI18next).init({
  resources,
  lng: getInitialLanguage(),
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false
  }
});

i18n.on('languageChanged', (lng) => {
  try {
    localStorage.setItem(SAVED_LNG_KEY, lng);
  } catch (e) {
    console.warn('Failed to save language preference:', e);
  }
});

export default i18n;
