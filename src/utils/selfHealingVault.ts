// Self-Healing Shadow Vault & Auto-Recovery Manager for Kisan Saarthi
// Handles "The Blackout" scenario by persisting local shadow backups of farmer profiles & alerts,
// and automatically re-hydrating (restoring) Supabase cloud tables if they are wiped or corrupted mid-operation.

import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

const SUPABASE_URL = 'https://mlthjtespbgnfxxtyfpl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1sdGhqdGVzcGJnbmZ4eHR5ZnBsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgwMDY2MjcsImV4cCI6MjEwMzU4MjYyN30.cXAFfj4cGbMat-ZXHo8vDfs2SwO90NgMDbW1mPrub0g';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const VAULT_PROFILE_KEY = 'KS_SHADOW_VAULT_PROFILE';
const VAULT_ALERTS_KEY = 'KS_SHADOW_VAULT_ALERTS';
const VAULT_RECOVERY_LOG_KEY = 'KS_SHADOW_VAULT_RECOVERY_LOG';

export interface RecoveryLogItem {
  id: string;
  timestamp: string;
  type: 'PROFILE_RESTORED' | 'ALERTS_RESTORED' | 'FULL_HEAL';
  message: string;
  itemCount: number;
}

/**
 * Save / Update Profile in Local Shadow Vault
 */
export function saveProfileToShadowVault(farmer: any) {
  if (!farmer) return;
  try {
    localStorage.setItem(VAULT_PROFILE_KEY, JSON.stringify({
      ...farmer,
      _vaultSavedAt: new Date().toISOString()
    }));
  } catch (err) {
    console.warn('[Shadow Vault Save Profile Exception]:', err);
  }
}

/**
 * Get Profile from Local Shadow Vault
 */
export function getProfileFromShadowVault(): any | null {
  try {
    const raw = localStorage.getItem(VAULT_PROFILE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Save / Update Price Alerts in Local Shadow Vault
 */
export function saveAlertsToShadowVault(alerts: any[]) {
  if (!Array.isArray(alerts)) return;
  try {
    localStorage.setItem(VAULT_ALERTS_KEY, JSON.stringify({
      alerts,
      _vaultSavedAt: new Date().toISOString()
    }));
  } catch (err) {
    console.warn('[Shadow Vault Save Alerts Exception]:', err);
  }
}

/**
 * Get Price Alerts from Local Shadow Vault
 */
export function getAlertsFromShadowVault(): any[] {
  try {
    const raw = localStorage.getItem(VAULT_ALERTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed.alerts) ? parsed.alerts : [];
  } catch {
    return [];
  }
}

/**
 * Get Last Self-Healing Log
 */
export function getLatestRecoveryLog(): RecoveryLogItem | null {
  try {
    const raw = localStorage.getItem(VAULT_RECOVERY_LOG_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Record a Self-Healing Action in Log
 */
function recordRecoveryLog(log: Omit<RecoveryLogItem, 'id' | 'timestamp'>) {
  const fullLog: RecoveryLogItem = {
    id: `rec-${Date.now()}`,
    timestamp: new Date().toLocaleTimeString('mr-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    ...log
  };
  try {
    localStorage.setItem(VAULT_RECOVERY_LOG_KEY, JSON.stringify(fullLog));
    // Dispatch custom event for real-time banner update
    window.dispatchEvent(new CustomEvent('ks-self-healing-event', { detail: fullLog }));
  } catch (err) {
    console.warn('[Shadow Vault Log Exception]:', err);
  }
  return fullLog;
}

/**
 * Core Self-Healing Engine
 * Checks Supabase DB vs Shadow Vault. If primary DB records were wiped/corrupted,
 * automatically re-hydrates Supabase and returns the recovery status.
 */
export async function runSelfHealingEngine(): Promise<{ healed: boolean; log: RecoveryLogItem | null }> {
  const shadowProfile = getProfileFromShadowVault();
  const shadowAlerts = getAlertsFromShadowVault();

  let profileHealed = false;
  let alertsHealedCount = 0;

  // 1. Check & Heal Farmer Profile in Supabase
  if (shadowProfile && (shadowProfile.mobile || shadowProfile.phone)) {
    const mobileNum = shadowProfile.mobile || shadowProfile.phone;
    try {
      const { data, error } = await supabase
        .from('farmers')
        .select('id')
        .eq('mobile', mobileNum);

      if (!error && (!data || data.length === 0)) {
        console.warn(`[Self-Healing Engine]: Database wipe detected for farmer mobile ${mobileNum}. Re-hydrating profile to Supabase...`);

        const insertRecord = {
          mobile: mobileNum,
          password_hash: shadowProfile.password_hash || shadowProfile.passwordHash || 'hashed_default',
          name: shadowProfile.name || 'बळीराजा शेतकरी',
          email: shadowProfile.email || null,
          location: shadowProfile.location || 'कोपरगाव, अहिल्यानगर',
          land_size: shadowProfile.landSize || '5 एकर',
          primary_crop: shadowProfile.primaryCrop || 'Onion',
          preferred_mandis: Array.isArray(shadowProfile.preferredMandis) ? shadowProfile.preferredMandis : ['Kopargaon', 'Rahata', 'Yeola']
        };

        const { error: insertErr } = await supabase.from('farmers').insert([insertRecord]);
        if (!insertErr) {
          profileHealed = true;
        }
      }
    } catch (err: any) {
      console.error('[Self-Healing Profile Exception]:', err.message);
    }
  }

  // 2. Check & Heal Price Alerts in Supabase
  if (shadowAlerts.length > 0) {
    try {
      const farmerEmail = shadowProfile?.email || shadowAlerts[0]?.farmerEmail || shadowAlerts[0]?.farmer_email;
      if (farmerEmail) {
        const { data, error } = await supabase
          .from('price_alerts')
          .select('id')
          .eq('farmer_email', farmerEmail);

        if (!error && (!data || data.length === 0)) {
          console.warn(`[Self-Healing Engine]: Database wipe detected for price alerts of ${farmerEmail}. Re-hydrating ${shadowAlerts.length} alerts...`);

          const alertsToInsert = shadowAlerts.map(a => ({
            farmer_email: farmerEmail,
            crop: a.crop || a.cropName || 'Onion',
            mandi: a.mandi || a.mandiName || 'Kopargaon',
            condition: a.condition || 'ABOVE',
            target_price: Number(a.targetPrice || a.target_price || 2000),
            status: a.status || 'ACTIVE',
            notification_methods: Array.isArray(a.notificationMethods) ? a.notificationMethods : ['Email', 'In-App']
          }));

          const { error: alertsErr } = await supabase.from('price_alerts').insert(alertsToInsert);
          if (!alertsErr) {
            alertsHealedCount = shadowAlerts.length;
          }
        }
      }
    } catch (err: any) {
      console.error('[Self-Healing Alerts Exception]:', err.message);
    }
  }

  if (profileHealed || alertsHealedCount > 0) {
    const log = recordRecoveryLog({
      type: profileHealed && alertsHealedCount > 0 ? 'FULL_HEAL' : profileHealed ? 'PROFILE_RESTORED' : 'ALERTS_RESTORED',
      message: `डेटाबेस रीकव्हरी: ${profileHealed ? 'प्रोफाईल' : ''} ${alertsHealedCount > 0 ? `${alertsHealedCount} भाव अलर्ट्स` : ''} शैडो व्हॉल्टमधून स्वयंचलित री-हायड्रेट केले!`,
      itemCount: (profileHealed ? 1 : 0) + alertsHealedCount
    });
    return { healed: true, log };
  }

  return { healed: false, log: null };
}

/**
 * Self-Healing Trigger for Login
 * If a farmer's credentials were wiped from Supabase, re-hash password and re-insert into Supabase
 */
export async function healFarmerOnLogin(phoneInput: string, passwordInput: string): Promise<boolean> {
  const shadowProfile = getProfileFromShadowVault();
  const digits = phoneInput.replace(/\D/g, '').slice(-10);

  if (!digits || digits.length !== 10) return false;

  try {
    // 1. Check if row exists in Supabase
    const { data } = await supabase.from('farmers').select('id').eq('mobile', digits);
    if (data && data.length > 0) {
      return false; // Row already exists in DB
    }

    console.warn(`[Self-Healing Login Engine]: Mobile ${digits} was deleted from Supabase! Auto-recreating account from Shadow Vault...`);

    // 2. Hash password with bcrypt so login authentication succeeds
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(passwordInput, salt);

    const newFarmerRecord = {
      mobile: digits,
      password_hash: passwordHash,
      name: shadowProfile?.name || 'बळीराजा शेतकरी',
      email: shadowProfile?.email || null,
      location: shadowProfile?.location || 'कोपरगाव, अहिल्यानगर',
      land_size: shadowProfile?.landSize || '5 एकर',
      primary_crop: shadowProfile?.primaryCrop || 'Onion',
      preferred_mandis: Array.isArray(shadowProfile?.preferredMandis) ? shadowProfile.preferredMandis : ['Kopargaon', 'Rahata', 'Yeola']
    };

    const { error } = await supabase.from('farmers').insert([newFarmerRecord]);
    if (!error) {
      recordRecoveryLog({
        type: 'PROFILE_RESTORED',
        message: `खाते रीकव्हरी: मोबाईल ${digits} साठी डेटाबेस खाते स्वयंचलित री-हायड्रेट करण्यात आले!`,
        itemCount: 1
      });
      return true;
    } else {
      console.error('[Self-Healing Insert Error]:', error.message);
    }
  } catch (err: any) {
    console.error('[Self-Healing Login Exception]:', err.message);
  }
  return false;
}

/**
 * Demo Blackout Simulator Trigger
 * Deletes all rows for the active test account from Supabase, then triggers self-healing!
 */
export async function simulateBlackoutAndHeal(farmerMobile: string, farmerEmail?: string) {
  console.log('🧪 [Blackout Simulator]: Initiating simulated database wipe...');
  let wipedCount = 0;

  try {
    if (farmerMobile) {
      const { data } = await supabase.from('farmers').delete().eq('mobile', farmerMobile).select();
      wipedCount += (data?.length || 1);
    }

    if (farmerEmail) {
      const { data } = await supabase.from('price_alerts').delete().eq('farmer_email', farmerEmail).select();
      wipedCount += (data?.length || 1);
    }

    console.warn('⚡ [Blackout Simulator]: Primary database table wiped. Launching self-healing recovery...');

    // Wait 400ms for demo effect, then run self-healing engine
    await new Promise(r => setTimeout(r, 400));
    const healResult = await runSelfHealingEngine();

    return {
      success: true,
      wipedCount,
      healResult
    };
  } catch (err: any) {
    console.error('[Blackout Simulator Error]:', err.message);
    return {
      success: false,
      error: err.message
    };
  }
}
