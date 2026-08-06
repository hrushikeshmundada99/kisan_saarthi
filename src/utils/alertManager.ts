import { MOCK_DASHBOARD_CARDS } from '../data/mockData';

export interface PriceAlertItem {
  id: string;
  crop: string;
  mandi: string; // "ANY" or specific mandi name
  condition: 'ABOVE' | 'BELOW';
  targetPrice: number;
  notificationMethods: Array<'In-App' | 'SMS' | 'WhatsApp' | 'Email'>;
  status: 'ACTIVE' | 'TRIGGERED' | 'DISABLED';
  createdAt: string;
}

const STORAGE_KEY = 'KISAN_SAARTHI_PRICE_ALERTS';

// Default initial alerts if localStorage is empty
const INITIAL_ALERTS: PriceAlertItem[] = [
  {
    id: "alt-101",
    crop: "Onion",
    mandi: "Kopargaon",
    condition: "ABOVE",
    targetPrice: 2000,
    notificationMethods: ["In-App", "WhatsApp"],
    status: "ACTIVE",
    createdAt: "2026-07-25"
  },
  {
    id: "alt-102",
    crop: "Soybean",
    mandi: "Sangamner",
    condition: "ABOVE",
    targetPrice: 4800,
    notificationMethods: ["SMS"],
    status: "ACTIVE",
    createdAt: "2026-07-22"
  },
  {
    id: "alt-103",
    crop: "Onion",
    mandi: "Yeola",
    condition: "ABOVE",
    targetPrice: 1950,
    notificationMethods: ["In-App", "WhatsApp"],
    status: "TRIGGERED",
    createdAt: "2026-07-18"
  }
];

// Helper to find current modal price for crop + mandi
export const getCurrentPriceForAlert = (crop: string, mandi: string): number => {
  if (mandi === 'ANY') {
    const matching = MOCK_DASHBOARD_CARDS.filter((c) => c.crop === crop);
    if (matching.length === 0) return 1850;
    return Math.max(...matching.map((m) => m.modalPrice));
  } else {
    const match = MOCK_DASHBOARD_CARDS.find((c) => c.crop === crop && c.mandiName === mandi);
    return match ? match.modalPrice : 1850;
  }
};

// Evaluate alert status and distance to target
export const evaluateAlertStatus = (alert: PriceAlertItem): {
  status: 'ACTIVE' | 'TRIGGERED' | 'DISABLED';
  currentPrice: number;
  distanceToTarget: number;
  isTriggered: boolean;
} => {
  const currentPrice = getCurrentPriceForAlert(alert.crop, alert.mandi);
  let isTriggered = false;

  if (alert.status !== 'DISABLED') {
    if (alert.condition === 'ABOVE' && currentPrice >= alert.targetPrice) {
      isTriggered = true;
    } else if (alert.condition === 'BELOW' && currentPrice <= alert.targetPrice) {
      isTriggered = true;
    }
  }

  const distanceToTarget = Math.abs(alert.targetPrice - currentPrice);
  const finalStatus = alert.status === 'DISABLED' ? 'DISABLED' : isTriggered ? 'TRIGGERED' : 'ACTIVE';

  return {
    status: finalStatus,
    currentPrice,
    distanceToTarget,
    isTriggered
  };
};

// Load alerts from localStorage with initial fallback
export const getStoredAlerts = (): PriceAlertItem[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn('Failed to load stored alerts:', e);
  }
  return INITIAL_ALERTS;
};

// Save alerts to localStorage
export const saveStoredAlerts = (alerts: PriceAlertItem[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(alerts));
  } catch (e) {
    console.warn('Failed to save alerts:', e);
  }
};

// WhatsApp Direct URL Generator
export const generateWhatsAppAlertUrl = (
  alert: PriceAlertItem,
  farmerPhone = '9822154321',
  farmerName = 'शेतकरी'
): string => {
  const ev = evaluateAlertStatus(alert);
  const mandiStr = alert.mandi === 'ANY' ? 'कोणतीही जवळची मंडी (Any Nearby Mandi)' : alert.mandi;

  let conditionMsg = alert.condition === 'ABOVE' ? `भाव ₹${alert.targetPrice} च्या वर गेल्यास` : `भाव ₹${alert.targetPrice} च्या खाली आल्यास`;
  let statusText = ev.isTriggered ? '🚨 ट्रिगर झाले! (Target Reached)' : '⏳ मूळ लक्ष्यापासून ₹' + ev.distanceToTarget + ' दूर';
  
  let recommendation = ev.isTriggered 
    ? 'भावाने तुमचे दिलेले लक्ष्य गाठले आहे. आजच मंडीत माल विक्रीचा विचार करा!' 
    : 'बाजारातील भावावर लक्ष ठेवा. AI अंदाजानुसार ५-७ दिवसांत आणखी दरवाढ शक्य आहे.';

  const cleanPhone = farmerPhone.replace(/\D/g, '').slice(-10);
  const finalPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : '919822154321';

  const messageText = `🚩 *किसान सारथी - कृषी भाव व्हॉट्सॲप अलर्ट* 🚩

मा. *${farmerName}* दादा,
तुमच्या शेतातील पिकाचा भाव अलर्ट अपडेट खालीलप्रमाणे:

🌾 पिक: *${alert.crop}*
📍 मंडी: *${mandiStr}*
💰 चालू बाजार भाव: *₹${ev.currentPrice.toLocaleString('en-IN')} / क्विंटल*
🎯 लक्ष्य भाव: *₹${alert.targetPrice.toLocaleString('en-IN')} / क्विंटल* (${conditionMsg})
📊 अलर्ट स्थिती: *${statusText}*

💡 *AI कृषी सल्ला:* ${recommendation}

📲 अधिक ताजे भाव पाहण्यासाठी भेट द्या: https://kisan-saarthi.app/alerts
- किसान सारथी (बळीराजाचा विश्वासू सोबती)`;

  return `https://api.whatsapp.com/send?phone=${finalPhone}&text=${encodeURIComponent(messageText)}`;
};
