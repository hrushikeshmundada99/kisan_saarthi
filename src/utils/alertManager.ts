import { saveAlertsToShadowVault } from './selfHealingVault';
import { REAL_DASHBOARD_CARDS } from '../data/realData';

export interface PriceAlertItem {
  id: string;
  crop: string;
  mandi: string; // "ANY" or specific mandi name
  condition: 'ABOVE' | 'BELOW';
  targetPrice: number;
  farmerEmail?: string;
  notificationMethods: Array<'Email' | 'In-App'>;
  status: 'ACTIVE' | 'TRIGGERED' | 'DISABLED';
  createdAt: string;
  lastEmailSentAt?: string;
}

const STORAGE_KEY = 'KISAN_SAARTHI_PRICE_ALERTS';

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
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.warn('Failed to load stored alerts:', e);
  }
  return [];
};

// Save alerts to localStorage & shadow vault
export const saveStoredAlerts = (alerts: PriceAlertItem[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(alerts));
    saveAlertsToShadowVault(alerts);
  } catch (e) {
    console.warn('Failed to save alerts:', e);
  }
};

// Sync new alert to Supabase / Backend database
export const syncAlertToSupabase = async (alert: PriceAlertItem): Promise<void> => {
  try {
    await fetch('/api/alerts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(alert)
    });
  } catch (err) {
    console.warn('[Supabase Alert Sync Note]: Offline or backend unavailable, using local cache.', err);
  }
};

// Toggle alert status in Supabase
export const toggleAlertInSupabase = async (id: string, status: 'ACTIVE' | 'DISABLED'): Promise<void> => {
  try {
    await fetch('/api/alerts', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status })
    });
  } catch (err) {
    console.warn('[Supabase Alert Toggle Note]:', err);
  }
};

// Delete alert in Supabase
export const deleteAlertFromSupabase = async (id: string): Promise<void> => {
  try {
    await fetch(`/api/alerts?id=${encodeURIComponent(id)}`, {
      method: 'DELETE'
    });
  } catch (err) {
    console.warn('[Supabase Alert Delete Note]:', err);
  }
};
