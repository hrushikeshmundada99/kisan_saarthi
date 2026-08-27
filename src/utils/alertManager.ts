import { REAL_DASHBOARD_CARDS } from '../data/realData';

export interface PriceAlertItem {
  id: string;
  crop: string;
  mandi: string; // "ANY" or specific mandi name
  condition: 'ABOVE' | 'BELOW';
  targetPrice: number;
  farmerPhone?: string;
  farmerEmail?: string;
  notificationMethods: Array<'SMS' | 'Email' | 'In-App'>;
  status: 'ACTIVE' | 'TRIGGERED' | 'DISABLED';
  createdAt: string;
  lastSmsSentAt?: string;
  lastEmailSentAt?: string;
}

export interface SmsDispatchResult {
  success: boolean;
  phone: string;
  message: string;
  timestamp: string;
  method: 'NATIVE_SIM' | 'CLOUD_GATEWAY';
  operator?: string;
}

const STORAGE_KEY = 'KISAN_SAARTHI_PRICE_ALERTS';
const SMS_HISTORY_KEY = 'KISAN_SAARTHI_SMS_HISTORY';

// Default initial alerts for farmers
const INITIAL_ALERTS: PriceAlertItem[] = [
  {
    id: "alt-101",
    crop: "Onion",
    mandi: "Lasalgaon",
    condition: "ABOVE",
    targetPrice: 2100,
    farmerPhone: "9822154321",
    notificationMethods: ["SMS", "In-App"],
    status: "ACTIVE",
    createdAt: "2026-08-01"
  },
  {
    id: "alt-102",
    crop: "Soybean",
    mandi: "Kopargaon",
    condition: "ABOVE",
    targetPrice: 4700,
    farmerPhone: "9822154321",
    notificationMethods: ["SMS", "In-App"],
    status: "ACTIVE",
    createdAt: "2026-07-28"
  },
  {
    id: "alt-103",
    crop: "Onion",
    mandi: "Kopargaon",
    condition: "ABOVE",
    targetPrice: 3950,
    farmerPhone: "9822154321",
    notificationMethods: ["SMS", "In-App"],
    status: "TRIGGERED",
    createdAt: "2026-07-25"
  }
];

// Helper to find current modal price for crop + mandi
export const getCurrentPriceForAlert = (crop: string, mandi: string): number => {
  if (mandi === 'ANY') {
    const matching = REAL_DASHBOARD_CARDS.filter((c) => c.crop === crop);
    if (matching.length === 0) return crop === 'Onion' ? 3950 : 4620;
    return Math.max(...matching.map((m) => m.modalPrice));
  } else {
    const match = REAL_DASHBOARD_CARDS.find((c) => c.crop === crop && c.mandiName === mandi);
    return match ? match.modalPrice : (crop === 'Onion' ? 3950 : 4620);
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

// Marathi Crop Names map for SMS
const MARATHI_CROPS: Record<string, string> = {
  Onion: 'कांदा',
  Soybean: 'सोयाबीन',
  Cotton: 'कापूस',
  Sugarcane: 'ऊस',
  Pomegranate: 'डाळिंब',
  Wheat: 'गहू',
  Tomato: 'टोमॅटो'
};

// Generate Simple, Direct SMS Text in Marathi
export const generateSmsAlertText = (
  alert: PriceAlertItem,
  farmerName = 'शेतकरी'
): string => {
  const ev = evaluateAlertStatus(alert);
  const cropMr = MARATHI_CROPS[alert.crop] || alert.crop;
  const mandiStr = alert.mandi === 'ANY' ? 'जवळच्या बाजार समिती' : `${alert.mandi} बाजार समिती`;

  if (ev.isTriggered) {
    return `रामराम ${farmerName} दादा! किसान सारथी अलर्ट: आज ${mandiStr}त ${cropMr}चा भाव ₹${ev.currentPrice.toLocaleString('en-IN')}/क्विंटल झाला आहे. तुम्ही ठरवलेला लक्ष्य भाव ₹${alert.targetPrice.toLocaleString('en-IN')} गाठला आहे. माल विक्रीचा विचार करा! - किसान सारथी`;
  } else {
    return `रामराम ${farmerName} दादा! किसान सारथी अलर्ट: ${mandiStr}त ${cropMr}चा सध्याचा भाव ₹${ev.currentPrice.toLocaleString('en-IN')}/क्विंटल आहे. तुमच्या लक्ष्य भावापासून (₹${alert.targetPrice.toLocaleString('en-IN')}) फक्त ₹${ev.distanceToTarget} दूर आहे. - किसान सारथी`;
  }
};

// Direct Mobile SIM SMS URL (sms:phone?body=message)
export const generateSmsDirectUrl = (
  alert: PriceAlertItem,
  farmerPhone = '9822154321',
  farmerName = 'शेतकरी'
): string => {
  const cleanPhone = (alert.farmerPhone || farmerPhone).replace(/\D/g, '').slice(-10);
  const smsBody = generateSmsAlertText(alert, farmerName);
  
  // Standard RFC 5724 SMS URI for mobile browsers / SIM messaging
  return `sms:${cleanPhone}?body=${encodeURIComponent(smsBody)}`;
};

// Dispatch SMS Function (Supports Native SIM Trigger & Simulated Fast2SMS Cloud Dispatch)
export const dispatchSmsToFarmer = async (
  alert: PriceAlertItem,
  farmerPhone = '9822154321',
  farmerName = 'शेतकरी'
): Promise<SmsDispatchResult> => {
  const cleanPhone = (alert.farmerPhone || farmerPhone).replace(/\D/g, '').slice(-10);
  const smsText = generateSmsAlertText(alert, farmerName);
  const now = new Date();
  const timestampStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

  // 1. Try launching native SIM SMS app if supported
  const isMobile = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile/i.test(navigator.userAgent);
  if (isMobile) {
    const smsUrl = `sms:${cleanPhone}?body=${encodeURIComponent(smsText)}`;
    window.location.href = smsUrl;
  }

  // 2. Log and track SMS dispatch in local storage
  const result: SmsDispatchResult = {
    success: true,
    phone: cleanPhone,
    message: smsText,
    timestamp: timestampStr,
    method: isMobile ? 'NATIVE_SIM' : 'CLOUD_GATEWAY',
    operator: 'Jio / Airtel SIM Network'
  };

  try {
    const existingLogs = JSON.parse(localStorage.getItem(SMS_HISTORY_KEY) || '[]');
    localStorage.setItem(SMS_HISTORY_KEY, JSON.stringify([result, ...existingLogs.slice(0, 19)]));
  } catch (e) {
    console.warn('Could not save SMS history:', e);
  }

  return result;
};
