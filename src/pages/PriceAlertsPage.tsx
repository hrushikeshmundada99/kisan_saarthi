import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  type PriceAlertItem,
  getStoredAlerts,
  saveStoredAlerts,
  evaluateAlertStatus
} from '../utils/alertManager';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { AlertCard } from '../components/AlertCard';
import { EmptyState } from '../components/EmptyState';
import { CropSelector } from '../components/CropSelector';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import {
  Bell,
  Plus,
  Sparkles,
  ArrowUpDown,
  Store,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Mail
} from 'lucide-react';

const MANDIS_WITH_ANY = ['ANY', 'Kopargaon', 'Rahata', 'Shrirampur', 'Yeola', 'Lasalgaon', 'Sangamner', 'Nashik', 'Ahilyanagar'];

export const PriceAlertsPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { showToast } = useToast();
  const formRef = useRef<HTMLDivElement>(null);

  // Read initial alerts from localStorage
  const [alerts, setAlerts] = useState<PriceAlertItem[]>(getStoredAlerts);

  // Form State
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [crop, setCrop] = useState<string>('Onion');
  const [mandi, setMandi] = useState<string>('Lasalgaon');
  const [condition, setCondition] = useState<'ABOVE' | 'BELOW'>('ABOVE');
  const [targetPrice, setTargetPrice] = useState<number>(2200);
  const cachedEmail = typeof window !== 'undefined' ? localStorage.getItem('KISAN_SAARTHI_USER_EMAIL') || 'farmer@gmail.com' : 'farmer@gmail.com';
  const [farmerEmail, setFarmerEmail] = useState<string>((user?.email || cachedEmail).replace('example.com', 'gmail.com'));

  // Sync logged in user email
  useEffect(() => {
    if (user?.email) setFarmerEmail(user.email);
    else {
      const cached = localStorage.getItem('KISAN_SAARTHI_USER_EMAIL');
      if (cached) setFarmerEmail(cached);
    }
  }, [user]);

  // Filter & Sort State
  const [filterTab, setFilterTab] = useState<'ALL' | 'ACTIVE' | 'TRIGGERED'>('ALL');
  const [sortBy, setSortBy] = useState<'closest' | 'newest'>('closest');

  // Persist alerts to localStorage on change
  useEffect(() => {
    saveStoredAlerts(alerts);
  }, [alerts]);

  // Target price validation
  const isTargetPriceValid = targetPrice > 0;
  const isEmailValid = farmerEmail.includes('@') && farmerEmail.includes('.');

  // Add New Alert
  const handleAddAlert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isTargetPriceValid) {
      showToast('कृपया योग्य लक्ष्य भाव प्रविष्ट करा', 'error');
      return;
    }
    if (!isEmailValid) {
      showToast('कृपया योग्य ई-मेल पत्ता प्रविष्ट करा', 'error');
      return;
    }

    const newAlert: PriceAlertItem = {
      id: `alt-${Date.now()}`,
      crop,
      mandi,
      condition,
      targetPrice,
      farmerEmail,
      notificationMethods: ['Email', 'In-App'],
      status: 'ACTIVE',
      createdAt: new Date().toISOString().split('T')[0]
    };

    setAlerts([newAlert, ...alerts]);
    setShowAddForm(false);
    showToast(`ई-मेल अलर्ट सेट झाला! (${farmerEmail})`, 'success');
  };

  // Toggle Alert Status (Enable / Pause)
  const handleToggleStatus = (id: string) => {
    setAlerts((prev) =>
      prev.map((alt) => {
        if (alt.id === id) {
          const nextStatus = alt.status === 'DISABLED' ? 'ACTIVE' : 'DISABLED';
          showToast(nextStatus === 'DISABLED' ? 'अलर्ट थांबवला (Alert Paused)' : 'अलर्ट पुन्हा सुरू केला (Alert Active)', 'info');
          return { ...alt, status: nextStatus };
        }
        return alt;
      })
    );
  };

  // Delete Alert
  const handleDeleteAlert = (id: string) => {
    setAlerts((prev) => prev.filter((alt) => alt.id !== id));
    showToast('अलर्ट हटवला गेला (Alert Deleted)', 'error');
  };

  // Filter & Sort Alerts List (Triggered placed at top)
  const processedAlertsList = useMemo(() => {
    let result = alerts;

    if (filterTab === 'ACTIVE') {
      result = result.filter((alt) => {
        const ev = evaluateAlertStatus(alt);
        return ev.status === 'ACTIVE';
      });
    } else if (filterTab === 'TRIGGERED') {
      result = result.filter((alt) => {
        const ev = evaluateAlertStatus(alt);
        return ev.status === 'TRIGGERED';
      });
    }

    return [...result].sort((a, b) => {
      const evA = evaluateAlertStatus(a);
      const evB = evaluateAlertStatus(b);

      if (evA.isTriggered && !evB.isTriggered) return -1;
      if (!evA.isTriggered && evB.isTriggered) return 1;

      if (sortBy === 'closest') {
        return evA.distanceToTarget - evB.distanceToTarget;
      } else {
        return b.createdAt.localeCompare(a.createdAt);
      }
    });
  }, [alerts, filterTab, sortBy]);

  // Scroll to Form Focus
  const handleFocusForm = () => {
    setShowAddForm(true);
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  return (
    <div className="space-y-4 sm:space-y-5 pb-6 max-w-7xl mx-auto animate-in fade-in duration-200">
      
      {/* 1. Header Card */}
      <Card hoverable={false} className="p-4 sm:p-6 bg-gradient-to-br from-[#FFFFFF] via-[#F7FBF7] to-[#E8F5E9] border-2 border-[#81C784]/60 rounded-2xl shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#2E7D32]/10 text-[#2E7D32] text-xs font-black">
              <Mail className="w-4 h-4 text-[#FFC107]" />
              <span>{i18n.language === 'mr' ? 'ई-मेल भाव अलर्ट प्रणाली' : 'Email Price Alert System'}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#1B4332] tracking-tight">
              {i18n.language === 'mr' ? 'ई-मेल भाव अलर्ट' : 'Email Price Alerts'}
            </h1>
            
            <p className="text-xs sm:text-sm font-semibold text-[#6B7280]">
              {i18n.language === 'mr'
                ? 'तुमचा अपेक्षित भाव बाजारात येताच थेट तुमच्या ई-मेलवर अलर्ट येईल.'
                : 'Get an email alert directly when the market price hits your target.'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:flex sm:items-center gap-2 w-full sm:w-auto shrink-0">
            <Button
              variant="primary"
              size="md"
              onClick={() => setShowAddForm(!showAddForm)}
              className="shadow-md shadow-emerald-900/15 min-h-[44px] justify-center"
            >
              <Plus className="w-4 h-4 text-[#FFB300]" />
              <span>{i18n.language === 'mr' ? 'नवीन भाव अलर्ट सेट करा' : 'Set New Price Alert'}</span>
            </Button>
          </div>
        </div>

        {/* 3-Step How It Works Strip for Farmers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 border-t border-[#E1EBE1] text-xs">
          <div className="p-3 bg-[#FFFFFF] rounded-xl border border-[#E1EBE1] flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#E8F5E9] text-[#2E7D32] flex items-center justify-center font-black shrink-0">
              १
            </div>
            <div>
              <span className="font-extrabold text-[#1B4332] block">पिक व बाजार निवडा</span>
              <span className="text-[#6B7280] font-medium">कांदा, सोयाबीन व बाजार समिती</span>
            </div>
          </div>

          <div className="p-3 bg-[#FFFFFF] rounded-xl border border-[#E1EBE1] flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-amber-100 text-[#D97706] flex items-center justify-center font-black shrink-0">
              २
            </div>
            <div>
              <span className="font-extrabold text-[#1B4332] block">अपेक्षित भाव टाका</span>
              <span className="text-[#6B7280] font-medium">उदा. ₹२,२००/क्विंटल</span>
            </div>
          </div>

          <div className="p-3 bg-[#FFFFFF] rounded-xl border border-[#E1EBE1] flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-[#2E7D32] flex items-center justify-center font-black shrink-0">
              ३
            </div>
            <div>
              <span className="font-extrabold text-[#1B4332] block">ई-मेल अलर्ट मिळवा</span>
              <span className="text-[#6B7280] font-medium">भाव येताच थेट ई-मेलवर सूचना</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Set New Alert Form Card */}
      {showAddForm && (
        <div ref={formRef}>
          <form onSubmit={handleAddAlert}>
            <Card hoverable={false} className="p-5 sm:p-6 border-2 border-[#2E7D32] rounded-2xl space-y-4 animate-in slide-in-from-top-2 duration-200 bg-[#FFFFFF] shadow-md">
              <div className="flex items-center justify-between border-b border-[#E1EBE1] pb-3">
                <h3 className="text-lg font-black text-[#1B4332] flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#FFC107]" />
                  <span>{i18n.language === 'mr' ? 'नवीन भाव अलर्ट नोंदवा' : 'Set New Price Alert'}</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="text-xs font-black text-[#6B7280] hover:text-[#E53935] min-h-[40px] px-3 cursor-pointer"
                >
                  {i18n.language === 'mr' ? 'रद्द करा (Cancel)' : 'Cancel'}
                </button>
              </div>

              {/* Crop & Mandi Selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-[#1B4332] uppercase tracking-wider mb-2">
                    १. पिक निवडा:
                  </label>
                  <CropSelector selectedCrop={crop} onSelectCrop={(c) => setCrop(c)} variant="chips" />
                </div>

                <div>
                  <label className="block text-xs font-black text-[#1B4332] uppercase tracking-wider mb-2">
                    २. बाजार समिती:
                  </label>
                  <div className="relative flex items-center">
                    <Store className="absolute left-3.5 w-4.5 h-4.5 text-[#2E7D32]" />
                    <select
                      value={mandi}
                      onChange={(e) => setMandi(e.target.value)}
                      className="w-full pl-10 pr-4 min-h-[48px] bg-[#FFFFFF] border-2 border-[#E1EBE1] rounded-2xl text-[#1B4332] font-black text-sm focus:outline-none focus:ring-4 focus:ring-[#2E7D32]/20 cursor-pointer shadow-xs"
                    >
                      {MANDIS_WITH_ANY.map((mItem) => (
                        <option key={mItem} value={mItem} className="font-bold py-1">
                          {mItem === 'ANY'
                            ? (i18n.language === 'mr' ? '📍 कोणतीही जवळची बाजार समिती' : '📍 Any nearby market')
                            : `📍 ${t(`mandis.${mItem}`, mItem)}`}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Condition, Target Price, Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-3 border-t border-[#E1EBE1]">
                
                {/* Condition Radio Toggle */}
                <div>
                  <label className="block text-xs font-black text-[#1B4332] uppercase tracking-wider mb-2">
                    ३. अट निवडा:
                  </label>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setCondition('ABOVE')}
                      className={`p-3 rounded-2xl border-2 text-xs font-black flex items-center justify-center gap-1 min-h-[48px] cursor-pointer transition-all ${
                        condition === 'ABOVE'
                          ? 'bg-[#2E7D32] text-[#FFFFFF] border-[#2E7D32] shadow-xs'
                          : 'bg-[#F7FBF7] text-[#1B4332] border-[#E1EBE1]'
                      }`}
                    >
                      <TrendingUp className="w-3.5 h-3.5 text-[#FFC107]" />
                      <span>भाव वाढल्यावर</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setCondition('BELOW')}
                      className={`p-3 rounded-2xl border-2 text-xs font-black flex items-center justify-center gap-1 min-h-[48px] cursor-pointer transition-all ${
                        condition === 'BELOW'
                          ? 'bg-[#2E7D32] text-[#FFFFFF] border-[#2E7D32] shadow-xs'
                          : 'bg-[#F7FBF7] text-[#1B4332] border-[#E1EBE1]'
                      }`}
                    >
                      <TrendingDown className="w-3.5 h-3.5 text-[#E53935]" />
                      <span>भाव कमी झाल्यावर</span>
                    </button>
                  </div>
                </div>

                {/* Target Price Input */}
                <div>
                  <label className="block text-xs font-black text-[#1B4332] uppercase tracking-wider mb-2">
                    ४. लक्ष्य भाव (₹/क्विंटल):
                  </label>
                  <input
                    type="number"
                    step="50"
                    min="100"
                    value={targetPrice}
                    onChange={(e) => setTargetPrice(Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-[#FFFFFF] border-2 border-[#E1EBE1] rounded-2xl text-base font-black text-[#1B4332] focus:ring-4 focus:ring-[#2E7D32]/20 min-h-[48px] shadow-xs"
                    required
                  />
                </div>

                {/* Farmer Email Address for Email Alert */}
                <div>
                  <label className="block text-xs font-black text-[#1B4332] uppercase tracking-wider mb-2 flex items-center justify-between">
                    <span>५. ई-मेल पत्ता:</span>
                    <span className="text-[10px] text-[#2E7D32] font-black">अनिवार्य</span>
                  </label>
                  <div className="relative flex items-center">
                    <Mail className="absolute left-3.5 w-4.5 h-4.5 text-[#2E7D32]" />
                    <input
                      type="email"
                      value={farmerEmail}
                      onChange={(e) => setFarmerEmail(e.target.value)}
                      placeholder="farmer@example.com"
                      className="w-full pl-10 pr-4 py-2.5 bg-[#FFFFFF] border-2 border-[#E1EBE1] rounded-2xl text-sm font-black text-[#1B4332] focus:ring-4 focus:ring-[#2E7D32]/20 min-h-[48px] shadow-xs"
                      required
                    />
                  </div>
                </div>

              </div>

              {/* Email Guarantee Info Strip */}
              <div className="p-3 bg-[#F7FBF7] rounded-xl border border-[#E1EBE1] flex items-center gap-2 text-xs font-bold text-[#2E7D32]">
                <CheckCircle2 className="w-4 h-4 text-[#43A047] shrink-0" />
                <span>हा भाव बाजारात येताच {farmerEmail || 'तुमच्या ई-मेलवर'} अलर्ट नोटिफिकेशन पाठवले जाईल.</span>
              </div>

              {/* Submit Button */}
              <div className="pt-2 flex justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={!isTargetPriceValid || !isEmailValid}
                >
                  <Bell className="w-4 h-4 text-[#FFC107]" />
                  <span>{i18n.language === 'mr' ? 'ई-मेल अलर्ट सुरू करा' : 'Activate Email Alert'}</span>
                </Button>
              </div>
            </Card>
          </form>
        </div>
      )}

      {/* Filter Tabs & Sort Toolbar */}
      <Card hoverable={false} className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Filter Tabs */}
        <div className="flex items-center gap-1 bg-[#F7FBF7] p-1 rounded-2xl border border-[#E1EBE1] text-xs font-bold">
          {(
            [
              { id: 'ALL', labelMr: `सर्व अलर्ट (${alerts.length})`, labelEn: `All (${alerts.length})` },
              { id: 'ACTIVE', labelMr: 'सक्रिय (Active)', labelEn: 'Active' },
              { id: 'TRIGGERED', labelMr: 'भाव आलेले (Triggered)', labelEn: 'Triggered' }
            ] as const
          ).map((tab) => {
            const isActive = filterTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setFilterTab(tab.id)}
                className={`px-3.5 py-1.5 rounded-xl transition-all min-h-[36px] cursor-pointer font-black ${
                  isActive
                    ? 'bg-[#2E7D32] text-[#FFFFFF] shadow-xs'
                    : 'text-[#6B7280] hover:text-[#2E7D32] hover:bg-[#FFFFFF]'
                }`}
              >
                {i18n.language === 'mr' ? tab.labelMr : tab.labelEn}
              </button>
            );
          })}
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2 bg-[#FFFFFF] border border-[#E1EBE1] p-2 rounded-2xl shadow-xs self-start sm:self-auto">
          <ArrowUpDown className="w-4 h-4 text-[#2E7D32]" />
          <span className="text-xs font-bold text-[#6B7280]">क्रमवारी:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-transparent text-xs font-black text-[#1B4332] focus:outline-none cursor-pointer pr-2"
          >
            <option value="closest">लक्ष्याच्या सर्वात जवळ (Closest to Target)</option>
            <option value="newest">नवीनतम प्रथम (Newest First)</option>
          </select>
        </div>
      </Card>

      {/* Active & Triggered Alerts List */}
      {processedAlertsList.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          {processedAlertsList.map((alt) => (
            <AlertCard
              key={alt.id}
              alert={alt}
              onToggleStatus={handleToggleStatus}
              onDelete={handleDeleteAlert}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <EmptyState
          title={i18n.language === 'mr' ? 'कोणतेही भाव अलर्ट्स सेट केलेले नाहीत' : 'No Price Alerts Set Yet'}
          description={i18n.language === 'mr' ? 'कांदा, सोयाबीन किंवा कापसाचा अपेक्षित भाव बाजारात येताच ई-मेलवर सूचना मिळवण्यासाठी नवीन अलर्ट जोडा.' : 'Set an alert to get an email notification when crop price hits your target.'}
          actionLabel={i18n.language === 'mr' ? 'नवीन भाव अलर्ट सेट करा' : 'Set New Price Alert'}
          onAction={handleFocusForm}
        />
      )}

    </div>
  );
};
