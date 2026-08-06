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
      appTagline: "कोपरगाव व परिसरातील शेतकर्‍यांसाठी स्मार्ट बाजार भाव बुद्धिमत्ता",
      landing: {
        heroTitle: "योग्य वेळी, योग्य बाजारात विका. मिळवा जास्तीत जास्त नफा!",
        heroSub: "कोपरगाव, राहाता, श्रीरामपूर, संगमनेर, येवला, नाशिक आणि अहमदनगर मंडीचे अचूक दर, भविष्यातील अंदाज आणि वाहतूक खर्च वजा करून निव्वळ नफा जाणून घ्या.",
        checkPriceBtn: "आजचे बाजार भाव पहा",
        learnMore: "वैशिष्ट्ये जाणून घ्या",
        prop1Title: "AI दर अंदाज (7, 14, 30 दिवस)",
        prop1Desc: "कृषी उत्पन्न बाजार समितीच्या ऐतिहासिक डेटा आणि आवकीवर आधारित भविष्यातील दरांचा अचूक अंदाज.",
        prop2Title: "मंडी तुलना आणि वाहतूक नफा",
        prop2Desc: "तुमच्या गावापासून अंतर आणि वाहतूक खर्च वजा करून कोणत्या मंडीत सर्वाधिक निखळ भाव मिळेल हे पहा.",
        prop3Title: "नफा गणित आणि अलर्ट",
        prop3Desc: "लागवड खर्चाच्या तुलनेत मिळणारा नफा मोजा आणि इच्छित भाव आल्यावर त्वरित SMS/WhatsApp अलर्ट मिळवा."
      },
      nav: {
        home: "मुख्य पृष्ठ",
        dashboard: "डॅशबोर्ड",
        forecast: "दर अंदाज",
        comparison: "मंडी तुलना",
        trends: "बाजार ट्रेंड्स",
        calculator: "नफा कॅल्क्युलेटर",
        alerts: "भाव अलर्ट्स",
        profile: "माझे प्रोफाईल"
      },
      dashboard: {
        title: "कोपरगाव बाजार भाव डॅशबोर्ड",
        subtitle: "तुमच्या पिकांचे आजचे ताजे मंडी भाव व 7 दिवसांचा कल",
        selectCrops: "निवडलेली पिके:",
        todaysRates: "आजचे मंडी दर (रु/क्विंटल)",
        distanceFromKopargaon: "कोपरगावपासून अंतर",
        modalPrice: "सरासरी भाव",
        minMax: "किमान - कमाल भाव",
        dailyChange: "कालच्या तुलनेत",
        forecastSparkline: "7-दिवसीय अंदाज कल",
        alertStrip: "सक्रिय अलर्ट: कांदा ₹2,100 च्या वर गेल्यास WhatsApp वर मेसेज येईल.",
        quickActions: "जलद सेवा",
        viewFullForecast: "संपूर्ण अंदाज पहा",
        compareMandis: "मंडी तुलना करा",
        calcProfit: "नफा मोजा"
      },
      forecast: {
        title: "पिक दर अंदाज आणि विश्लेषण",
        subtitle: "कृत्रिम बुद्धिमत्ता आधारित 7, 14 व 30 दिवसांचे बाजार भाव अंदाज",
        selectCrop: "पिक निवडा",
        selectMandi: "मंडी निवडा",
        horizon: "अंदाज कालावधी",
        days7: "7 दिवस",
        days14: "14 दिवस",
        days30: "30 दिवस",
        historical: "ऐतिहासिक भाव",
        predicted: "अंदाजित भाव",
        confidenceRange: "अंदाजित संभाव्य कक्षा (Confidence Band)",
        insightTitle: "कृषी तज्ज्ञ सल्ला:",
        insightText: "पुढील आठवड्यात कांद्याची आवक घटण्याची शक्यता असल्याने दर सुमारे 8% वाढू शकतात. शक्य असल्यास माल 5-7 दिवस थांबवून विकावा.",
        currentPrice: "आजचा दर",
        expectedPeak: "अंदाजित उच्चांक",
        expectedLow: "अंदाजित नीचांक"
      },
      comparison: {
        title: "मंडी दर तुलना व वाहतूक गणित",
        subtitle: "वाहतूक खर्च वजा करून खरोखर हातात पडणारा निखळ दर (Net Payout)",
        bestMandiBadge: "आज माल विकण्यासाठी सर्वोत्तम मंडी!",
        tableMandi: "मंडी (बाजार)",
        tableDistance: "अंतर (किमी)",
        tableRawPrice: "बाजार भाव",
        tableTransport: "वाहतूक खर्च",
        tableNetPrice: "निव्वळ हातात मिळणारा भाव",
        actionSellHere: "येथे विक्री करा",
        farmerVillage: "तुमचे गाव: कोपरगाव",
        transportRate: "वाहतूक दर: ₹15 / क्विंटल / 10 किमी"
      },
      trends: {
        title: "बाजार कल आणि आवक विश्लेषण",
        subtitle: "मंडीतील माल आवक (Arrivals) आणि भावातील परस्पर संबंध",
        priceVsArrivals: "दर विरुद्ध आवक (Recharts Dual-Axis Chart)",
        arrivalsQuintal: "आवक (क्विंटल)",
        pricePerQuintal: "भाव (रु/क्विंटल)",
        seasonalTitle: "महिनानिहाय हंगामी भाव कल (Seasonal Pattern)",
        peakMonths: "कांदा भावाचा सर्वोच्च काळ: ऑक्टोबर - नोव्हेंबर"
      },
      calculator: {
        title: "शेतकरी नफा कॅल्क्युलेटर",
        subtitle: "उत्पादन खर्च आणि विविध मंडींमधील निव्वळ नफा मोजा",
        landSize: "जमीन क्षेत्र (एकड)",
        cropChoice: "पिक",
        seedFertilizerCost: "बियाणे व खते खर्च (₹)",
        laborCost: "मजुरी व नांगरणी खर्च (₹)",
        expectedYield: "एकूण अपेक्षित उत्पादन (क्विंटल)",
        targetMandi: "प्राधान्य मंडी",
        calculateBtn: "नफ्याची गणना करा",
        totalCost: "एकूण लागवड खर्च",
        totalRevenue: "एकूण उत्पन्न",
        netProfit: "निखळ निव्वळ नफा",
        profitPerQuintal: "प्रति क्विंटल निव्वळ नफा",
        mandiComparisonResult: "विविध मंडींमधील निव्वळ नफा तुलना"
      },
      alerts: {
        title: "किंमत सूचना अलर्ट्स (Price Alerts)",
        subtitle: "तुमच्या इच्छित भावाची नोंद करा, भाव गाठताच लगेच संदेश मिळवा",
        setAlertTitle: "नवीन अलर्ट सेट करा",
        thresholdPrice: "लक्ष्य भाव (₹/क्विंटल)",
        notifyVia: "सूचना माध्यम",
        whatsapp: "WhatsApp मेसेज",
        sms: "SMS मेसेज",
        addAlertBtn: "अलर्ट सक्रिय करा",
        activeAlerts: "तुमचे सक्रिय अलर्ट्स",
        triggeredAlerts: "झालेले अलर्ट्स",
        emptyStateTitle: "कोणतेही भाव अलर्ट्स सेट केलेले नाहीत",
        emptyStateDesc: "जेव्हा कांदा किंवा सोयाबीनचा भाव तुमच्या अपेक्षेप्रमाणे येईल तेव्हा लगेच फोनवर संदेश मिळवण्यासाठी नवीन अलर्ट जोडा.",
        statusActive: "सक्रिय (Active)",
        statusTriggered: "प्राप्त (Triggered)"
      },
      profile: {
        title: "शेतकरी प्रोफाईल",
        subtitle: "तुमची माहिती, जमीन आणि जतन केलेली पिके",
        name: "रमेश गणपत काळे",
        location: "मु. पो. कोपरगाव, जि. अहमदनगर",
        landDetails: "जमीन क्षेत्र: 5 एकर (बागायती)",
        savedCrops: "जतन केलेली पिके",
        preferredMandis: "पसंतीच्या मंड्या",
        alertLog: "मागील अलर्ट इतिहास"
      },
      crops: {
        Onion: "कांदा (Onion)",
        Sugarcane: "ऊस (Sugarcane)",
        Soybean: "सोयाबीन (Soybean)",
        Cotton: "कापूस (Cotton)",
        Pomegranate: "डाळिंब (Pomegranate)",
        Wheat: "गहू (Wheat)",
        Tomato: "टोमॅटो (Tomato)"
      },
      mandis: {
        Kopargaon: "कोपरगाव (Kopargaon)",
        Rahata: "राहाता (Rahata)",
        Shrirampur: "श्रीरामपूर (Shrirampur)",
        Sangamner: "संगमनेer)",
        Yeola: "येवला (Yeola)",
        Nashik: "नाशिक (Nashik)",
        Ahmednagar: "अहमदनगर (Ahmednagar)"
      }
    }
  },
  en: {
    translation: {
      appName: "Kisan Saarthi",
      appTagline: "Smart Market Intelligence for Farmers in Kopargaon & Region",
      landing: {
        heroTitle: "Sell at the Right Time, at the Best Mandi. Maximize Your Profit!",
        heroSub: "Accurate mandi rates, AI price predictions, and net payout calculation after transport for Kopargaon, Rahata, Shrirampur, Sangamner, Yeola, Nashik & Ahmednagar.",
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
        forecast: "Price Forecast",
        comparison: "Mandi Compare",
        trends: "Market Trends",
        calculator: "Profit Calculator",
        alerts: "Price Alerts",
        profile: "My Profile"
      },
      dashboard: {
        title: "Kopargaon Market Intelligence Dashboard",
        subtitle: "Today's live mandi prices and 7-day trend sparklines for your selected crops",
        selectCrops: "Selected Crops:",
        todaysRates: "Today's Mandi Rates (₹/Quintal)",
        distanceFromKopargaon: "Distance from Kopargaon",
        modalPrice: "Modal Price",
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
        currentPrice: "Current Price",
        expectedPeak: "Expected Peak",
        expectedLow: "Expected Low"
      },
      comparison: {
        title: "Mandi Comparison & Transport Payout",
        subtitle: "Net price in your hands after subtracting transport costs from Kopargaon",
        bestMandiBadge: "Best Mandi to Sell Today!",
        tableMandi: "Mandi (Market)",
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
        Kopargaon: "Kopargaon",
        Rahata: "Rahata",
        Shrirampur: "Shrirampur",
        Sangamner: "Sangamner",
        Yeola: "Yeola",
        Nashik: "Nashik",
        Ahmednagar: "Ahmednagar"
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
